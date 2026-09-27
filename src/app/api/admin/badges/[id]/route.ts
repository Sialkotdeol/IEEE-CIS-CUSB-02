import { NextRequest } from "next/server";
import { z } from "zod";
import { adminRoute, ApiError, check, logActivity, readJson } from "@/lib/adminApi";
import { awardBadge, ensureHolder, sendBadgeEmail, siteOrigin } from "@/lib/badges";
import type { Badge } from "@/lib/badgeShared";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Ctx = { params: Promise<{ id: string }> };
const MAX_PER_REQUEST = 20; // the portal sends recipients in batches

const awardSchema = z.object({
  recipients: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(100),
        uid: z.string().trim().max(30).optional().transform((v) => (v ? v.toUpperCase() : null)),
        email: z.email().trim().toLowerCase(),
      })
    )
    .min(1)
    .max(MAX_PER_REQUEST),
  send_email: z.boolean(),
});

// Award this badge to people (creating their wallet on first badge), optionally emailing them.
export const POST = adminRoute<Ctx>(async (session, req, ctx) => {
  const id = z.uuid().parse((await ctx.params).id);
  const body = awardSchema.parse(await readJson(req));
  if (body.send_email && !process.env.RESEND_API_KEY) throw new ApiError(500, "RESEND_API_KEY is not set");
  const db = supabaseAdmin();
  const badge = check(await db.from("badges").select("*").eq("id", id).maybeSingle()) as Badge | null;
  if (!badge) throw new ApiError(404, "Badge not found");
  const origin = await siteOrigin();

  const results: { email: string; status: "awarded" | "already" | "failed"; error?: string }[] = [];
  for (const r of body.recipients) {
    try {
      const holder = await ensureHolder(r);
      const { awardId, created } = await awardBadge(id, holder.id, session.email);
      if (!created) {
        results.push({ email: r.email, status: "already" });
        continue;
      }
      if (body.send_email) {
        await sendBadgeEmail({ to: r.email, name: r.name, badge, awardId, walletSlug: holder.wallet_slug, manageToken: holder.manage_token, origin });
        await db.from("badge_awards").update({ emailed_at: new Date().toISOString() }).eq("id", awardId);
        await new Promise((res) => setTimeout(res, 550)); // Resend: 2 requests/second
      }
      results.push({ email: r.email, status: "awarded" });
    } catch (err) {
      results.push({ email: r.email, status: "failed", error: err instanceof Error ? err.message : "Failed" });
    }
  }

  await logActivity(session, "badge.award", { type: "badge", id }, {
    title: badge.title,
    awarded: results.filter((r) => r.status === "awarded").length,
    already: results.filter((r) => r.status === "already").length,
    failed: results.filter((r) => r.status === "failed").length,
    emailed: body.send_email,
  });
  return { results };
});

// Revoke one award.
export const DELETE = adminRoute<Ctx>(async (session, req, ctx) => {
  const id = z.uuid().parse((await ctx.params).id);
  const awardId = z.uuid().parse((req as NextRequest).nextUrl.searchParams.get("awardId"));
  const rows = check(await supabaseAdmin().from("badge_awards").delete().eq("id", awardId).eq("badge_id", id).select("holder_id"));
  if (!rows?.length) throw new ApiError(404, "Award not found");
  await logActivity(session, "badge.revoke", { type: "badge", id }, { award_id: awardId });
  return { success: true };
});
