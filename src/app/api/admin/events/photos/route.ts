import { NextRequest } from "next/server";
import { z } from "zod";
import { adminRoute, ApiError, check, logActivity, readJson, revalidatePublic } from "@/lib/adminApi";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Photo uploads go straight from the browser to Supabase Storage with a one-time
// signed URL (so large files don't pass through the serverless function), then the
// browser confirms and we record the photo.

const BUCKET = "event-photos";
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
};
const slug = z.string().regex(/^[a-z0-9-]{1,80}$/);

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("sign"), slug, contentType: z.string() }),
  z.object({ action: z.literal("confirm"), slug, path: z.string(), caption: z.string().trim().max(200).optional() }),
]);

export const POST = adminRoute(async (session, req) => {
  const body = schema.parse(await readJson(req));
  const storage = supabaseAdmin().storage.from(BUCKET);

  if (body.action === "sign") {
    const ext = TYPES[body.contentType];
    if (!ext) throw new ApiError(400, "Only JPG, PNG, WEBP, GIF or HEIC images");
    const path = `${body.slug}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { data, error } = await storage.createSignedUploadUrl(path);
    if (error || !data) throw new ApiError(502, error?.message || "Could not create upload URL — is the event-photos bucket set up?");
    return { path: data.path, token: data.token };
  }

  if (!body.path.startsWith(`${body.slug}/`) || body.path.includes("..")) throw new ApiError(400, "Invalid path");
  const url = storage.getPublicUrl(body.path).data.publicUrl;
  const photo = check(
    await supabaseAdmin()
      .from("event_photos")
      .insert({ event_slug: body.slug, storage_path: body.path, url, caption: body.caption || null, uploaded_by: session.email })
      .select("*")
      .single()
  );
  await logActivity(session, "event.photo_upload", { type: "event", id: body.slug }, { path: body.path });
  revalidatePublic("/past-events", "/past-events/[slug]");
  return { photo };
});

export const DELETE = adminRoute(async (session, req) => {
  const id = z.uuid().parse((req as NextRequest).nextUrl.searchParams.get("id"));
  const db = supabaseAdmin();
  const photo = check(await db.from("event_photos").select("storage_path, event_slug").eq("id", id).maybeSingle());
  if (!photo) throw new ApiError(404, "Photo not found");
  await db.storage.from(BUCKET).remove([photo.storage_path]);
  check(await db.from("event_photos").delete().eq("id", id));
  await logActivity(session, "event.photo_delete", { type: "event", id: photo.event_slug }, { path: photo.storage_path });
  revalidatePublic("/past-events", "/past-events/[slug]");
  return { success: true };
});
