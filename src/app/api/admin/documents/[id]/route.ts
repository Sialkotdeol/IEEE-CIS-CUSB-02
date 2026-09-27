import { NextResponse } from "next/server";
import { z } from "zod";
import { adminRoute, ApiError, check, logActivity } from "@/lib/adminApi";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Ctx = { params: Promise<{ id: string }> };

// Opens a document: redirects to a 5-minute signed link (files) or to the saved link.
export const GET = adminRoute<Ctx>(async (session, _req, ctx) => {
  const id = z.uuid().parse((await ctx.params).id);
  const db = supabaseAdmin();
  const doc = check(await db.from("event_documents").select("title, file_path, file_name, link_url, event_slug").eq("id", id).maybeSingle());
  if (!doc) throw new ApiError(404, "Document not found");
  await logActivity(session, "document.view", { type: "event", id: doc.event_slug || "general" }, { title: doc.title });
  if (!doc.file_path) return NextResponse.redirect(doc.link_url!);
  const { data, error } = await db.storage.from("event-docs").createSignedUrl(doc.file_path, 300, { download: doc.file_name || true });
  if (error || !data) throw new ApiError(502, error?.message || "Could not open file");
  return NextResponse.redirect(data.signedUrl);
});
