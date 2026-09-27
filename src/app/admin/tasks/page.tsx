import { requirePageAdmin } from "@/lib/adminAuth";
import { getAllEventOptions } from "@/lib/siteContent";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Task } from "@/lib/workShared";
import TaskBoard from "@/components/admin/TaskBoard";

export const dynamic = "force-dynamic";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ event?: string; new?: string; deliverable?: string }> }) {
  const session = await requirePageAdmin();
  const db = supabaseAdmin();
  const [{ data: tasks, error }, { data: team }, events, sp] = await Promise.all([
    db.from("admin_tasks").select("*").order("created_at", { ascending: false }),
    db.from("admin_users").select("email, name").eq("disabled", false).order("name"),
    getAllEventOptions(),
    searchParams,
  ]);
  return (
    <TaskBoard
      tasks={(tasks || []) as Task[]}
      team={team || []}
      events={events.map((e) => ({ slug: e.slug, title: e.title }))}
      me={{ email: session.email, role: session.role }}
      emailConfigured={Boolean(process.env.RESEND_API_KEY)}
      prefill={sp.new ? { event_slug: sp.event || "", deliverable: sp.deliverable || "" } : null}
      loadError={error?.message || null}
    />
  );
}
