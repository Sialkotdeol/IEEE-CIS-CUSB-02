import { z } from "zod";
import { adminRoute, check, logActivity, readJson } from "@/lib/adminApi";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Ctx = { params: Promise<{ id: string }> };

const rating = z.number().int().min(1).max(5);
const schema = z.object({
  communication: rating,
  skills: rating,
  commitment: rating,
  comment: z.string().trim().max(1000).optional().transform((v) => v || null),
});

// Each reviewer has one score per applicant; submitting again replaces it.
export const PUT = adminRoute<Ctx>(async (session, req, ctx) => {
  const { id } = await ctx.params;
  z.uuid().parse(id);
  const score = schema.parse(await readJson(req));
  check(
    await supabaseAdmin()
      .from("application_scores")
      .upsert({ application_id: id, reviewer_email: session.email, ...score, updated_at: new Date().toISOString() })
  );
  await logActivity(session, "application.score", { type: "application", id }, score);
  return { success: true };
});

export const DELETE = adminRoute<Ctx>(async (session, _req, ctx) => {
  const { id } = await ctx.params;
  z.uuid().parse(id);
  check(await supabaseAdmin().from("application_scores").delete().eq("application_id", id).eq("reviewer_email", session.email));
  await logActivity(session, "application.score_removed", { type: "application", id });
  return { success: true };
});
