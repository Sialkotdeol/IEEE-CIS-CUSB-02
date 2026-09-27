import { NextRequest } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { adminRoute, ApiError, check, checkRow, logActivity, readJson } from "@/lib/adminApi";
import { renderCertificate, renderTemplateCertificate } from "@/lib/certificate";
import type { CertificateTemplate } from "@/lib/certificateTemplate";
import { awardBadge, badgeEmailBlock, ensureHolder, siteOrigin } from "@/lib/badges";
import type { Badge } from "@/lib/badgeShared";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const FROM = process.env.CERTIFICATE_FROM_EMAIL || "IEEE CIS CUSB <certificates@ieeeciscusb.site>";
const MAX_PER_REQUEST = 10; // the portal sends recipients in batches so no request runs long

// With an uploaded template (template_id) the signatures are part of the design;
// with the built-in design, 1–3 signatories are required.
const details = z
  .object({
    template_id: z.uuid().optional(),
    event_title: z.string().trim().min(2).max(120),
    event_date: z.string().trim().min(2).max(60),
    kind: z.string().trim().min(2).max(40),
    signatories: z
      .array(z.object({ name: z.string().trim().min(1).max(60), title: z.string().trim().min(1).max(60) }))
      .max(3)
      .default([]),
  })
  .refine((d) => d.template_id || d.signatories.length > 0, { message: "Add at least one signatory", path: ["signatories"] });

const recipientSchema = z.object({
  name: z.string().trim().min(1).max(100),
  uid: z.string().trim().max(30).optional().transform((v) => v || null),
  email: z.email().trim().toLowerCase(),
});

const issueSchema = details.and(
  z.object({
    recipients: z.array(recipientSchema).min(1).max(MAX_PER_REQUEST),
    send_email: z.boolean(),
    badge_id: z.uuid().optional(), // also award this badge to everyone who gets a certificate
  })
);

async function loadTemplate(id: string): Promise<CertificateTemplate> {
  const tpl = check(await supabaseAdmin().from("certificate_templates").select("*").eq("id", id).maybeSingle());
  if (!tpl) throw new ApiError(404, "Certificate template not found");
  return tpl as CertificateTemplate;
}

/** Renders with the uploaded template if there is one, otherwise the built-in design. */
async function render(
  opts: { template: CertificateTemplate | null; id: string; name: string; uid: string | null; event: string; date: string; kind: string; signatories: { name: string; title: string }[] },
  origin: string
) {
  if (opts.template) {
    return renderTemplateCertificate(opts.template, { name: opts.name, uid: opts.uid || "", event: opts.event, date: opts.date, certid: opts.id });
  }
  return renderCertificate(
    { id: opts.id, recipientName: opts.name, eventTitle: opts.event, eventDate: opts.date, kind: opts.kind, signatories: opts.signatories },
    origin
  );
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const originOf = (req: Request) => new URL(req.url).origin;

// ?id=… re-downloads an issued certificate; otherwise renders a preview that is not saved or emailed.
export const GET = adminRoute(async (_session, req) => {
  const params = (req as NextRequest).nextUrl.searchParams;

  const certId = params.get("id");
  if (certId) {
    const row = check(await supabaseAdmin().from("certificates").select("*").eq("id", z.uuid().parse(certId)).maybeSingle());
    if (!row) throw new ApiError(404, "Certificate not found");
    const pdf = await render(
      {
        template: row.template_id ? await loadTemplate(row.template_id) : null,
        id: row.id,
        name: row.recipient_name,
        uid: row.recipient_uid,
        event: row.event_title,
        date: row.event_date,
        kind: row.kind,
        signatories: row.signatories || [],
      },
      originOf(req)
    );
    return new Response(Buffer.from(pdf), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `inline; filename="certificate-${row.id}.pdf"` },
    });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(params.get("d") || "{}");
  } catch {
    throw new ApiError(400, "Invalid certificate details");
  }
  const input = details.parse(raw);
  const pdf = await render(
    {
      template: input.template_id ? await loadTemplate(input.template_id) : null,
      id: "PREVIEW",
      name: params.get("name") || "Participant Name",
      uid: params.get("uid") || "23BCS10001",
      event: input.event_title,
      date: input.event_date,
      kind: input.kind,
      signatories: input.signatories,
    },
    originOf(req)
  );
  return new Response(Buffer.from(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="certificate-preview.pdf"' },
  });
});

// Issue: save each certificate, render it, and (optionally) email it as an attachment.
export const POST = adminRoute(async (session, req) => {
  const body = issueSchema.parse(await readJson(req));
  if (body.send_email && !process.env.RESEND_API_KEY) throw new ApiError(500, "RESEND_API_KEY is not set");
  const resend = body.send_email ? new Resend(process.env.RESEND_API_KEY) : null;
  const db = supabaseAdmin();
  const origin = originOf(req);
  const template = body.template_id ? await loadTemplate(body.template_id) : null;
  let badge: Badge | null = null;
  if (body.badge_id) {
    badge = check(await db.from("badges").select("*").eq("id", body.badge_id).maybeSingle()) as Badge | null;
    if (!badge) throw new ApiError(404, "Badge not found");
  }
  const siteUrl = badge ? await siteOrigin() : origin;

  const results: { email: string; ok: boolean; id?: string; badge?: "awarded" | "already"; error?: string }[] = [];
  for (const r of body.recipients) {
    try {
      const row = checkRow(
        await db
          .from("certificates")
          .insert({
            recipient_name: r.name,
            recipient_email: r.email,
            recipient_uid: r.uid,
            template_id: template?.id ?? null,
            event_title: body.event_title,
            event_date: body.event_date,
            kind: body.kind,
            signatories: body.signatories,
            issued_by: session.email,
          })
          .select("id")
          .single()
      );
      const pdf = await render(
        { template, id: row.id, name: r.name, uid: r.uid, event: body.event_title, date: body.event_date, kind: body.kind, signatories: body.signatories },
        origin
      );

      // Award the badge alongside the certificate (skipped quietly if they already have it).
      let badgeHtml = "";
      let badgeStatus: "awarded" | "already" | undefined;
      let awardId: string | null = null;
      if (badge) {
        const holder = await ensureHolder({ name: r.name, email: r.email, uid: r.uid });
        const award = await awardBadge(badge.id, holder.id, session.email);
        awardId = award.awardId;
        badgeStatus = award.created ? "awarded" : "already";
        badgeHtml = `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
<p><strong>🏅 You also earned the ${escapeHtml(badge.title)} badge!</strong></p>
${badgeEmailBlock({ badge, awardId, walletSlug: holder.wallet_slug, manageToken: holder.manage_token, origin: siteUrl })}`;
      }

      if (resend) {
        const { error } = await resend.emails.send({
          from: FROM,
          to: r.email,
          subject: `Your certificate — ${body.event_title}`,
          html: `<p>Hi ${escapeHtml(r.name)},</p>
<p>Thank you for being part of <strong>${escapeHtml(body.event_title)}</strong>. Your certificate of ${escapeHtml(body.kind.toLowerCase())} is attached.</p>
<p>Certificate ID: <code>${row.id}</code></p>
${badgeHtml}
<p>— Team IEEE CIS CUSB</p>`,
          attachments: [{ filename: `Certificate - ${body.event_title}.pdf`.replace(/[^\w .-]/g, ""), content: Buffer.from(pdf) }],
        });
        if (error) throw new Error(error.message);
        await db.from("certificates").update({ emailed_at: new Date().toISOString() }).eq("id", row.id);
        if (awardId && badgeStatus === "awarded") await db.from("badge_awards").update({ emailed_at: new Date().toISOString() }).eq("id", awardId);
        await new Promise((res) => setTimeout(res, 550)); // stay under Resend's 2 requests/second limit
      }
      results.push({ email: r.email, ok: true, id: row.id, badge: badgeStatus });
    } catch (err) {
      results.push({ email: r.email, ok: false, error: err instanceof Error ? err.message : "Failed" });
    }
  }

  await logActivity(session, body.send_email ? "certificates.email" : "certificates.issue", { type: "event", id: body.event_title }, {
    kind: body.kind,
    template: template?.name ?? "built-in",
    badge: badge?.title ?? null,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
  });
  return { results };
});
