import { NextRequest } from "next/server";
import { z } from "zod";
import { adminRoute, ApiError, check, checkRow, logActivity, readJson } from "@/lib/adminApi";
import { questionsSchema } from "@/lib/feedback";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const formSchema = z.object({
  title: z.string().trim().min(2).max(120),
  event_slug: z.union([z.string().regex(/^[a-z0-9-]{1,80}$/), z.literal("")]).transform((v) => v || null),
  description: z.string().trim().max(1000),
  questions: questionsSchema,
  is_open: z.boolean(),
});

export const POST = adminRoute(async (session, req) => {
  const body = formSchema.parse(await readJson(req));
  const form = checkRow(await supabaseAdmin().from("feedback_forms").insert({ ...body, created_by: session.email }).select("id").single());
  await logActivity(session, "feedback.create", { type: "feedback_form", id: form.id }, { title: body.title });
  return { id: form.id };
});

export const PATCH = adminRoute(async (session, req) => {
  const body = z
    .object({ id: z.uuid() })
    .and(z.union([formSchema, z.object({ is_open: z.boolean() })])) // full edit first; union keeps the first match
    .parse(await readJson(req));
  const { id, ...update } = body;
  const rows = check(await supabaseAdmin().from("feedback_forms").update(update).eq("id", id).select("title"));
  if (!rows?.length) throw new ApiError(404, "Form not found");
  const action = "questions" in update ? "feedback.update" : update.is_open ? "feedback.open" : "feedback.close";
  await logActivity(session, action, { type: "feedback_form", id }, { title: rows[0].title });
  return { success: true };
});

export const DELETE = adminRoute(
  async (session, req) => {
    const id = z.uuid().parse((req as NextRequest).nextUrl.searchParams.get("id"));
    const rows = check(await supabaseAdmin().from("feedback_forms").delete().eq("id", id).select("title"));
    if (!rows?.length) throw new ApiError(404, "Form not found");
    await logActivity(session, "feedback.delete", { type: "feedback_form", id }, { title: rows[0].title });
    return { success: true };
  },
  { owner: true }
);
