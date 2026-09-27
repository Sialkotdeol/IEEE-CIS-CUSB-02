import { z } from "zod";
import { adminRoute, check, logActivity, readJson } from "@/lib/adminApi";
import { APPLICATION_STATUSES } from "@/lib/adminData";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Moves an applicant between Kanban columns.
const schema = z.object({ id: z.uuid(), status: z.enum(APPLICATION_STATUSES) });

export const PATCH = adminRoute(async (session, req) => {
  const { id, status } = schema.parse(await readJson(req));
  const rows = check(
    await supabaseAdmin().from("position_applications").update({ status }).eq("id", id).select("full_name, status")
  );
  if (!rows?.length) return Response.json({ error: "Applicant not found" }, { status: 404 });
  await logActivity(session, "application.status", { type: "application", id }, { status, name: rows[0].full_name });
  return { success: true };
});
