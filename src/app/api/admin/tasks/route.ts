import { NextRequest } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { adminRoute, ApiError, check, checkRow, logActivity, readJson } from "@/lib/adminApi";
import { siteOrigin } from "@/lib/badges";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DOC_TYPE_KEYS, DOC_TYPES, PRIORITIES, TASK_STATUSES } from "@/lib/workShared";

const FROM = process.env.PORTAL_FROM_EMAIL || "IEEE CIS CUSB Portal <portal@ieeeciscusb.site>";
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const base = {
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000),
  event_slug: z.union([z.string().regex(/^[a-z0-9-]{1,80}$/), z.literal(""), z.null()]).transform((v) => v || null),
  assignee_email: z.union([z.email().trim().toLowerCase(), z.literal(""), z.null()]).transform((v) => v || null),
  due_date: z.union([z.iso.date(), z.literal(""), z.null()]).transform((v) => v || null),
  priority: z.enum(PRIORITIES),
  deliverable: z.union([z.enum(DOC_TYPE_KEYS), z.literal(""), z.null()]).transform((v) => v || null),
};
const fields = z.object({ ...base, description: base.description.default(""), priority: base.priority.default("normal") });
// Edits carry only the fields that changed — no defaults, so a status change touches nothing else.
const editFields = z.object(base).partial();

async function assertTeamMember(email: string | null) {
  if (!email) return;
  const { data } = await supabaseAdmin().from("admin_users").select("email").eq("email", email).eq("disabled", false).maybeSingle();
  if (!data) throw new ApiError(400, "Assignee must be an active member of the admin team");
}

async function notifyAssignee(task: z.infer<typeof fields> & { id: string }, assignedBy: string, eventTitle: string | null) {
  if (!process.env.RESEND_API_KEY || !task.assignee_email) return false;
  const url = `${await siteOrigin()}/admin/tasks`;
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: FROM,
    to: task.assignee_email,
    subject: `New task: ${task.title}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;color:#0f172a">
<p>${escapeHtml(assignedBy)} assigned you a task in the IEEE CIS CUSB portal:</p>
<h2 style="margin:8px 0">${escapeHtml(task.title)}</h2>
${task.description ? `<p style="white-space:pre-wrap">${escapeHtml(task.description)}</p>` : ""}
<p>${eventTitle ? `<b>Event:</b> ${escapeHtml(eventTitle)}<br/>` : ""}${task.due_date ? `<b>Due:</b> ${task.due_date}<br/>` : ""}${
      task.deliverable ? `<b>Deliverable:</b> ${DOC_TYPES[task.deliverable]} (upload it under Documents to complete the task)<br/>` : ""
    }<b>Priority:</b> ${task.priority}</p>
<p><a href="${url}" style="background:#00629b;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Open my tasks</a></p>
</div>`,
  });
  return !error;
}

export const POST = adminRoute(async (session, req) => {
  const body = fields.extend({ notify: z.boolean().default(true), event_title: z.string().max(160).optional() }).parse(await readJson(req));
  const { notify, event_title, ...task } = body;
  await assertTeamMember(task.assignee_email);
  const row = checkRow(await supabaseAdmin().from("admin_tasks").insert({ ...task, created_by: session.email }).select("id").single());
  const emailed = notify && task.assignee_email && task.assignee_email !== session.email
    ? await notifyAssignee({ ...task, id: row.id }, session.name || session.email, event_title || null).catch(() => false)
    : false;
  await logActivity(session, "task.create", { type: "task", id: row.id }, { title: task.title, assignee: task.assignee_email, event: task.event_slug, emailed });
  return { id: row.id, emailed };
});

// Change status or edit fields. Any team member can move a task; editing is for the creator, assignee or owners.
export const PATCH = adminRoute(async (session, req) => {
  const body = z
    .object({ id: z.uuid(), status: z.enum(TASK_STATUSES).optional() })
    .and(editFields)
    .parse(await readJson(req));
  const { id, status, ...rest } = body;
  const edit = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)) as Partial<z.infer<typeof fields>>;
  const db = supabaseAdmin();
  const task = check(await db.from("admin_tasks").select("title, created_by, assignee_email, status").eq("id", id).maybeSingle());
  if (!task) throw new ApiError(404, "Task not found");

  const editing = Object.keys(edit).length > 0;
  if (editing && ![task.created_by, task.assignee_email].includes(session.email) && session.role !== "owner") {
    throw new ApiError(403, "Only the creator, the assignee or an owner can edit this task");
  }
  if ("assignee_email" in edit) await assertTeamMember(edit.assignee_email ?? null);

  const update: Record<string, unknown> = { ...edit };
  if (status) {
    update.status = status;
    update.completed_at = status === "done" ? new Date().toISOString() : null;
  }
  check(await db.from("admin_tasks").update(update).eq("id", id));
  await logActivity(session, status && !editing ? `task.${status}` : "task.update", { type: "task", id }, { title: task.title, ...update });
  return { success: true };
});

export const DELETE = adminRoute(async (session, req) => {
  const id = z.uuid().parse((req as NextRequest).nextUrl.searchParams.get("id"));
  const db = supabaseAdmin();
  const task = check(await db.from("admin_tasks").select("title, created_by").eq("id", id).maybeSingle());
  if (!task) throw new ApiError(404, "Task not found");
  if (task.created_by !== session.email && session.role !== "owner") throw new ApiError(403, "Only the creator or an owner can delete this task");
  check(await db.from("admin_tasks").delete().eq("id", id));
  await logActivity(session, "task.delete", { type: "task", id }, { title: task.title });
  return { success: true };
});
