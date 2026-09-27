import { NextRequest } from "next/server";
import { z } from "zod";
import { adminRoute, ApiError, check, checkRow, logActivity, readJson } from "@/lib/adminApi";
import { CERT_BUCKET } from "@/lib/certificate";
import { defaultFields, fieldsSchema } from "@/lib/certificateTemplate";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Certificate designs and signature images. Files go straight from the browser to the
// private certificate-assets bucket with one-time signed upload URLs.

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg" };
const templatePath = z.string().regex(/^templates\/[a-z0-9-]+\.(png|jpg)$/);

const postSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("sign"), kind: z.enum(["template", "signature"]), contentType: z.enum(["image/png", "image/jpeg"]) }),
  z.object({
    action: z.literal("create"),
    name: z.string().trim().min(2).max(80),
    file_path: templatePath,
    file_type: z.enum(["image/png", "image/jpeg"]),
    width: z.number().int().min(300).max(12000),
    height: z.number().int().min(300).max(12000),
  }),
]);

export const POST = adminRoute(async (session, req) => {
  const body = postSchema.parse(await readJson(req));
  const db = supabaseAdmin();

  if (body.action === "sign") {
    const folder = body.kind === "template" ? "templates" : "signatures";
    const path = `${folder}/${crypto.randomUUID()}.${EXT[body.contentType]}`;
    const { data, error } = await db.storage.from(CERT_BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new ApiError(502, error?.message || "Could not create upload URL — is the certificate-assets bucket set up?");
    return { path: data.path, token: data.token };
  }

  const row = checkRow(
    await db
      .from("certificate_templates")
      .insert({ ...body, action: undefined, fields: defaultFields(), created_by: session.email })
      .select("id")
      .single()
  );
  await logActivity(session, "certificate_template.create", { type: "certificate_template", id: row.id }, { name: body.name });
  return { id: row.id };
});

// Save field positions (and optionally rename).
export const PATCH = adminRoute(async (session, req) => {
  const body = z
    .object({ id: z.uuid(), name: z.string().trim().min(2).max(80).optional(), fields: fieldsSchema })
    .parse(await readJson(req));
  const rows = check(
    await supabaseAdmin()
      .from("certificate_templates")
      .update({ fields: body.fields, ...(body.name && { name: body.name }), updated_at: new Date().toISOString() })
      .eq("id", body.id)
      .select("name")
  );
  if (!rows?.length) throw new ApiError(404, "Template not found");
  await logActivity(session, "certificate_template.update", { type: "certificate_template", id: body.id }, { name: rows[0].name, fields: body.fields.length });
  return { success: true };
});

// Delete a design and its files. Refused once certificates were issued with it,
// so those can still be re-downloaded exactly as sent.
export const DELETE = adminRoute(async (session, req) => {
  const id = z.uuid().parse((req as NextRequest).nextUrl.searchParams.get("id"));
  const db = supabaseAdmin();
  const { count } = await db.from("certificates").select("id", { count: "exact", head: true }).eq("template_id", id);
  if (count) throw new ApiError(409, `${count} certificate(s) were issued with this design, so it's kept for re-downloads.`);

  const tpl = check(await db.from("certificate_templates").select("name, file_path, fields").eq("id", id).maybeSingle());
  if (!tpl) throw new ApiError(404, "Template not found");
  const files = [tpl.file_path, ...((tpl.fields || []) as { image_path?: string }[]).map((f) => f.image_path).filter((p): p is string => Boolean(p))];
  await db.storage.from(CERT_BUCKET).remove(files);
  check(await db.from("certificate_templates").delete().eq("id", id));
  await logActivity(session, "certificate_template.delete", { type: "certificate_template", id }, { name: tpl.name });
  return { success: true };
});
