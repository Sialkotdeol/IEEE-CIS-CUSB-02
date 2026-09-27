import { NextResponse } from "next/server";
import { z } from "zod";
import { validateAnswers, type Question } from "@/lib/feedback";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.union([z.email().trim().toLowerCase(), z.literal("")]).optional(),
  answers: z.record(z.string(), z.unknown()),
});

// Public: submit a response to an open feedback form.
export async function POST(req: Request, ctx: Ctx) {
  const id = z.uuid().safeParse((await ctx.params).id);
  if (!id.success) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid submission" }, { status: 400 });

  const db = supabaseAdmin();
  const { data: form } = await db.from("feedback_forms").select("questions, is_open").eq("id", id.data).maybeSingle();
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });
  if (!form.is_open) return NextResponse.json({ error: "This feedback form is closed." }, { status: 403 });

  const result = validateAnswers(form.questions as Question[], parsed.data.answers);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const { error } = await db.from("feedback_responses").insert({
    form_id: id.data,
    respondent_name: parsed.data.name || null,
    respondent_email: parsed.data.email || null,
    answers: result.answers,
  });
  if (error) {
    console.error("❌ Feedback insert failed:", error);
    return NextResponse.json({ error: "Could not save your response. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ success: true }, { status: 201 });
}
