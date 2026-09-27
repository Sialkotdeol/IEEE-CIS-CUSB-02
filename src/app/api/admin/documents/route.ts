import { NextRequest } from "next/server";
import { z } from "zod";
import { adminRoute, ApiError, check, checkRow, logActivity, readJson } from "@/lib/adminApi";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ALLOWED_EXTENSIONS, DOC_TYPE_KEYS, MAX_DOC_BYTES } from "@/lib/workShared";

// Event documents (reports, M2M, attendance…). Files go straight from the browser to the
// private event-docs bucket with a one-time signed upload URL; links (e.g. Google Drive) are stored as-is.

const BUCKET = "event-docs";
const eventSlug = z.union([z.string().regex(/^[a-z0-9-]{1,80}$/), z.literal(""), z.null()]).transform((v) => v || null);
const extOf = (name: string) => (name.split(".").pop() || "").toLowerCase();

const postSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("sign"), event_slug: eventSlug, file_name: z.string().min(1).max(200), size: z.number().int().positive() }),
  z.object({
    action: z.literal("create"),
    event_slug: eventSlug,
    doc_type: z.enum(DOC_TYPE_KEYS),
    title: z.string().trim().min(1).max(160),
    notes: z.string().trim().max(1000).default(""),
    file_path: z.string().regex(/^[a-z0-9-]+\/[0-9a-f-]{36}\.[a-z0-9]{2,5}$/).optional(),
    file_name: z.string().max(200).optional(),
    file_size: z.number().int().positive().max(MAX_DOC_BYTES).optional(),
    link_url: z.url({ protocol: /^https$/ }).optional(),
  }),
]);

export const POST = adminRoute(async (session, req) => {
  const body = postSchema.parse(await readJson(req));
  const db = supabaseAdmin();

  if (body.action === "sign") {
    const ext = extOf(body.file_name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) throw new ApiError(400, `.${ext} files aren't allowed. Use PDF, Word, Excel, PowerPoint, CSV, images or ZIP.`);
    if (body.size > MAX_DOC_BYTES) throw new ApiError(400, "File is over 25 MB — upload it to Google Drive and add the link instead");
    const path = `${body.event_slug || "general"}/${crypto.randomUUID()}.${ext}`;
    const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new ApiError(502, error?.message || "Could not create upload URL — is the event-docs bucket set up?");
    return { path: data.path, token: data.token };
  }

  if (!body.file_path && !body.link_url) throw new ApiError(400, "Upload a file or add a link");
  if (body.file_path && !body.file_path.startsWith(`${body.event_slug || "general"}/`)) throw new ApiError(400, "Invalid file path");
  const { action: _a, ...doc } = body;
  void _a;
  const row = checkRow(await db.from("event_documents").insert({ ...doc, uploaded_by: session.email }).select("id").single());

  // Complete open tasks that were waiting for this document.
  let completedQ = db
    .from("admin_tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("deliverable", doc.doc_type)
    .neq("status", "done");
  completedQ = doc.event_slug ? completedQ.eq("event_slug", doc.event_slug) : completedQ.is("event_slug", null);
  const { data: completed } = await completedQ.select("id, title");

  await logActivity(session, "document.add", { type: "event", id: doc.event_slug || "general" }, {
    doc_type: doc.doc_type,
    title: doc.title,
    kind: doc.file_path ? "file" : "link",
    tasks_completed: (completed || []).map((t) => t.title),
  });
  return { id: row.id, completedTasks: (completed || []).length };
});

// Uploader or owners can delete.
export const DELETE = adminRoute(async (session, req) => {
  const id = z.uuid().parse((req as NextRequest).nextUrl.searchParams.get("id"));
  const db = supabaseAdmin();
  const doc = check(await db.from("event_documents").select("title, uploaded_by, file_path, event_slug").eq("id", id).maybeSingle());
  if (!doc) throw new ApiError(404, "Document not found");
  if (doc.uploaded_by !== session.email && session.role !== "owner") throw new ApiError(403, "Only the uploader or an owner can delete this");
  check(await db.from("event_documents").delete().eq("id", id));
  if (doc.file_path) await db.storage.from(BUCKET).remove([doc.file_path]);
  await logActivity(session, "document.delete", { type: "event", id: doc.event_slug || "general" }, { title: doc.title });
  return { success: true };
});
