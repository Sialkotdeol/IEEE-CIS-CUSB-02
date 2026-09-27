import { z } from "zod";
import { adminRoute, ApiError, check, logActivity } from "@/lib/adminApi";
import { csvResponse, toCsv } from "@/lib/csv";
import type { Question } from "@/lib/feedback";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Ctx = { params: Promise<{ id: string }> };

// CSV export of all responses to one form, one column per question.
export const GET = adminRoute<Ctx>(async (session, _req, ctx) => {
  const id = z.uuid().parse((await ctx.params).id);
  const db = supabaseAdmin();
  const form = check(await db.from("feedback_forms").select("title, questions").eq("id", id).maybeSingle());
  if (!form) throw new ApiError(404, "Form not found");
  const responses = check(await db.from("feedback_responses").select("*").eq("form_id", id).order("created_at")) || [];
  const questions = form.questions as Question[];
  const rows = responses.map((r) => ({
    submitted_at: r.created_at,
    name: r.respondent_name,
    email: r.respondent_email,
    ...Object.fromEntries(questions.map((q) => [q.label, (r.answers as Record<string, unknown>)[q.id] ?? ""])),
  }));
  await logActivity(session, "feedback.export", { type: "feedback_form", id }, { rows: rows.length });
  return csvResponse(toCsv(rows, ["submitted_at", "name", "email", ...questions.map((q) => q.label)]), `feedback-${form.title}.csv`);
});
