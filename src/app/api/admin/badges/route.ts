import { NextRequest } from "next/server";
import { z } from "zod";
import { adminRoute, ApiError, check, checkRow, logActivity, readJson } from "@/lib/adminApi";
import { BADGE_BUCKET } from "@/lib/badges";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const imagePath = z.string().regex(/^posters\/[a-z0-9-]+\.(png|jpg)$/);
const frac = z.number().min(0).max(1);

const fields = z.object({
  title: z.string().trim().min(2).max(80),
  event_slug: z.union([z.string().regex(/^[a-z0-9-]{1,80}$/), z.literal("")]).transform((v) => v || null),
  description: z.string().trim().max(500),
  image_path: imagePath.nullable().optional(),
  focus_x: frac,
  focus_y: frac,
  zoom: z.number().min(1).max(3),
});

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
const publicUrl = (path: string) => supabaseAdmin().storage.from(BADGE_BUCKET).getPublicUrl(path).data.publicUrl;

export const POST = adminRoute(async (session, req) => {
  const body = z
    .discriminatedUnion("action", [
      z.object({ action: z.literal("sign"), contentType: z.enum(["image/png", "image/jpeg"]) }),
      fields.extend({ action: z.literal("create") }),
    ])
    .parse(await readJson(req));
  const db = supabaseAdmin();

  if (body.action === "sign") {
    const path = `posters/${crypto.randomUUID()}.${body.contentType === "image/png" ? "png" : "jpg"}`;
    const { data, error } = await db.storage.from(BADGE_BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new ApiError(502, error?.message || "Could not create upload URL — is the badges bucket set up?");
    return { path: data.path, token: data.token, url: publicUrl(data.path) };
  }

  const { action: _a, ...rest } = body;
  void _a;
  let slug = slugify(rest.title) || "badge";
  const { data: clash } = await db.from("badges").select("id").eq("slug", slug).maybeSingle();
  if (clash) slug = `${slug}-${crypto.randomUUID().slice(0, 4)}`;
  const badge = checkRow(
    await db
      .from("badges")
      .insert({ ...rest, slug, image_url: rest.image_path ? publicUrl(rest.image_path) : null, created_by: session.email })
      .select("id")
      .single()
  );
  await logActivity(session, "badge.create", { type: "badge", id: badge.id }, { title: rest.title });
  return { id: badge.id };
});

export const PATCH = adminRoute(async (session, req) => {
  const body = fields.extend({ id: z.uuid() }).parse(await readJson(req));
  const { id, ...rest } = body;
  const update = { ...rest, ...(rest.image_path !== undefined && { image_url: rest.image_path ? publicUrl(rest.image_path) : null }) };
  const rows = check(await supabaseAdmin().from("badges").update(update).eq("id", id).select("title"));
  if (!rows?.length) throw new ApiError(404, "Badge not found");
  await logActivity(session, "badge.update", { type: "badge", id }, { title: rows[0].title });
  return { success: true };
});

// Deleting a badge removes it from every wallet.
export const DELETE = adminRoute(
  async (session, req) => {
    const id = z.uuid().parse((req as NextRequest).nextUrl.searchParams.get("id"));
    const db = supabaseAdmin();
    const badge = check(await db.from("badges").select("title, image_path").eq("id", id).maybeSingle());
    if (!badge) throw new ApiError(404, "Badge not found");
    check(await db.from("badges").delete().eq("id", id));
    if (badge.image_path) await db.storage.from(BADGE_BUCKET).remove([badge.image_path]);
    await logActivity(session, "badge.delete", { type: "badge", id }, { title: badge.title });
    return { success: true };
  },
  { owner: true }
);
