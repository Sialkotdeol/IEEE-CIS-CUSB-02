import { adminRoute, ApiError, logActivity } from "@/lib/adminApi";
import { getApplicationsWithScores } from "@/lib/adminData";
import { csvResponse, toCsv } from "@/lib/csv";

// CSV export of every application with its average review scores.
export const GET = adminRoute(async (session) => {
  const { applications, error } = await getApplicationsWithScores();
  if (error) throw new ApiError(502, error);
  const rows = applications.map(({ scores, ...a }) => ({
    ...a,
    reviews: scores.count,
    avg_overall: scores.overall,
    avg_communication: scores.communication,
    avg_skills: scores.skills,
    avg_commitment: scores.commitment,
  }));
  await logActivity(session, "applications.export", { type: "application" }, { rows: rows.length });
  return csvResponse(toCsv(rows), `position-applications-${new Date().toISOString().slice(0, 10)}.csv`);
});
