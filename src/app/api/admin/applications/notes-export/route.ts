import { adminRoute, ApiError, logActivity } from "@/lib/adminApi";
import { fetchAll, getApplicationsWithScores, type Application } from "@/lib/adminData";
import { csvResponse, toCsv } from "@/lib/csv";

interface Note {
  id: string;
  application_id: string;
  author_email: string;
  author_name: string | null;
  body: string;
  created_at: string;
}

// CSV export of every applicant with their personal notes.
// Each row = one applicant. All notes for that applicant are concatenated into a single cell.
export const GET = adminRoute(async (session) => {
  const [{ applications, error }, notesResult] = await Promise.all([
    getApplicationsWithScores(),
    fetchAll<Note>("application_notes", "*", "created_at"),
  ]);
  if (error) throw new ApiError(502, error);

  // Group notes by application_id
  const notesByApp = new Map<string, Note[]>();
  for (const n of notesResult.rows) {
    const list = notesByApp.get(n.application_id) || [];
    list.push(n);
    notesByApp.set(n.application_id, list);
  }

  const rows = applications.map(({ scores, ...a }) => {
    const appNotes = notesByApp.get(a.id) || [];
    // Each note formatted as: "[Author] note text (date)"
    const notesText = appNotes
      .map((n) => {
        const author = n.author_name || n.author_email;
        const date = new Date(n.created_at).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        return `[${author}] ${n.body} (${date})`;
      })
      .join(" | ");

    return {
      full_name: a.full_name,
      uid: a.uid,
      email: a.email,
      phone: a.phone,
      department: a.department,
      year_of_study: a.year_of_study,
      first_preference: a.first_preference,
      second_preference: a.second_preference ?? "",
      status: a.status,
      reviews: scores.count,
      avg_overall: scores.overall,
      avg_communication: scores.communication,
      avg_skills: scores.skills,
      avg_commitment: scores.commitment,
      why_this_role: a.why_this_role,
      relevant_experience: a.relevant_experience,
      hours_per_week: a.hours_per_week,
      notes_count: appNotes.length,
      notes: notesText,
      applied_on: new Date(a.created_at).toLocaleDateString("en-IN"),
    };
  });

  await logActivity(session, "applications.notes_export", { type: "application" }, { rows: rows.length });
  return csvResponse(toCsv(rows), `applicants-with-notes-${new Date().toISOString().slice(0, 10)}.csv`);
});
