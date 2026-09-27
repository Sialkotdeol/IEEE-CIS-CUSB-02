import { z } from "zod";

// Feedback form definitions, shared by the portal builder, the public form and the API.

export const questionSchema = z.object({
  id: z.string().regex(/^q[a-z0-9]{1,12}$/),
  type: z.enum(["rating", "text", "choice"]),
  label: z.string().trim().min(1).max(200),
  required: z.boolean(),
  options: z.array(z.string().trim().min(1).max(80)).max(10).optional(),
});

export type Question = z.infer<typeof questionSchema>;

export const questionsSchema = z
  .array(questionSchema)
  .min(1, "Add at least one question")
  .max(25)
  .refine((qs) => qs.every((q) => q.type !== "choice" || (q.options && q.options.length >= 2)), "Choice questions need at least 2 options");

export interface FeedbackForm {
  id: string;
  title: string;
  event_slug: string | null;
  description: string;
  questions: Question[];
  is_open: boolean;
  created_at: string;
}

export const DEFAULT_QUESTIONS: Question[] = [
  { id: "qoverall", type: "rating", label: "How would you rate the event overall?", required: true },
  { id: "qcontent", type: "rating", label: "How useful was the content?", required: true },
  { id: "qspeaker", type: "rating", label: "How engaging were the speakers / mentors?", required: false },
  { id: "qagain", type: "choice", label: "Would you attend another IEEE CIS event?", required: true, options: ["Yes", "Maybe", "No"] },
  { id: "qliked", type: "text", label: "What did you like the most?", required: false },
  { id: "qimprove", type: "text", label: "What should we improve?", required: false },
];

/** Validates submitted answers against a form's questions. Returns cleaned answers or an error message. */
export function validateAnswers(questions: Question[], answers: Record<string, unknown>): { answers: Record<string, string | number> } | { error: string } {
  const clean: Record<string, string | number> = {};
  for (const q of questions) {
    const v = answers[q.id];
    const empty = v === undefined || v === null || v === "";
    if (empty) {
      if (q.required) return { error: `Please answer: ${q.label}` };
      continue;
    }
    if (q.type === "rating") {
      const n = Number(v);
      if (!Number.isInteger(n) || n < 1 || n > 5) return { error: `Invalid rating for: ${q.label}` };
      clean[q.id] = n;
    } else if (q.type === "choice") {
      if (typeof v !== "string" || !q.options?.includes(v)) return { error: `Invalid choice for: ${q.label}` };
      clean[q.id] = v;
    } else {
      if (typeof v !== "string") return { error: `Invalid answer for: ${q.label}` };
      clean[q.id] = v.trim().slice(0, 2000);
    }
  }
  return { answers: clean };
}
