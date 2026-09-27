import { notFound } from "next/navigation";
import { requirePageAdmin } from "@/lib/adminAuth";
import { logActivity } from "@/lib/adminApi";
import { APPLICATION_STATUSES, summarizeScores, type Application, type Score } from "@/lib/adminData";
import { getPositions } from "@/lib/siteContent";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ApplicationDetail from "@/components/admin/ApplicationDetail";

export const dynamic = "force-dynamic";

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePageAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const db = supabaseAdmin();
  const [app, scores, notes, positions, reviewers] = await Promise.all([
    db.from("position_applications").select("*").eq("id", id).maybeSingle(),
    db.from("application_scores").select("*").eq("application_id", id).order("updated_at"),
    db.from("application_notes").select("*").eq("application_id", id).order("created_at"),
    getPositions({ includeInactive: true }),
    db.from("admin_users").select("email, name"),
  ]);
  if (!app.data) notFound();

  await logActivity(session, "application.view", { type: "application", id }, { name: app.data.full_name });

  const names = Object.fromEntries((reviewers.data || []).map((r) => [r.email, r.name]));
  const scoreRows = (scores.data || []) as Score[];

  return (
    <ApplicationDetail
      app={app.data as Application}
      roles={Object.fromEntries(positions.map((p) => [p.id, p.title]))}
      statuses={[...APPLICATION_STATUSES]}
      scores={scoreRows.map((s) => ({ ...s, reviewer_name: names[s.reviewer_email] || "" }))}
      summary={summarizeScores(scoreRows)}
      notes={notes.data || []}
      me={{ email: session.email, role: session.role }}
    />
  );
}
