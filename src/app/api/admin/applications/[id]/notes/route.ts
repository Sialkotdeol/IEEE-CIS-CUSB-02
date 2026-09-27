import { NextRequest } from "next/server";
import { z } from "zod";
import { adminRoute, ApiError, check, logActivity, readJson } from "@/lib/adminApi";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Ctx = { params: Promise<{ id: string }> };

// Team-only notes on an applicant. Never shown on the public site.
export const POST = adminRoute<Ctx>(async (session, req, ctx) => {
  const { id } = await ctx.params;
  z.uuid().parse(id);
  const { body } = z.object({ body: z.string().trim().min(1).max(4000) }).parse(await readJson(req));
  const note = check(
    await supabaseAdmin()
      .from("application_notes")
      .insert({ application_id: id, author_email: session.email, author_name: session.name || null, body })
      .select("*")
      .single()
  );
  await logActivity(session, "application.note", { type: "application", id });
  return { note };
});

// Authors can delete their own notes; owners can delete any.
export const DELETE = adminRoute<Ctx>(async (session, req, ctx) => {
  const { id } = await ctx.params;
  const noteId = z.uuid().parse((req as NextRequest).nextUrl.searchParams.get("noteId"));
  const db = supabaseAdmin();
  const note = check(await db.from("application_notes").select("author_email").eq("id", noteId).eq("application_id", id).maybeSingle());
  if (!note) throw new ApiError(404, "Note not found");
  if (note.author_email !== session.email && session.role !== "owner") throw new ApiError(403, "You can only delete your own notes");
  check(await db.from("application_notes").delete().eq("id", noteId));
  await logActivity(session, "application.note_deleted", { type: "application", id }, { note_id: noteId });
  return { success: true };
});
