import Link from "next/link";
import { requirePageAdmin } from "@/lib/adminAuth";
import { APPLICATION_STATUSES, getApplicationsWithScores } from "@/lib/adminData";
import { getManagedEvents, getRecruitmentSettings } from "@/lib/siteContent";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isApplicationWindowOpen } from "@/data/positions";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { formatDateTime, timeAgo } from "@/lib/format";
import { isOverdue, type Task } from "@/lib/workShared";

export const dynamic = "force-dynamic";

export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const session = await requirePageAdmin();
  const { denied } = await searchParams;

  const [{ applications, error }, settings, events, activity, unscored, myTasks] = await Promise.all([
    getApplicationsWithScores(),
    getRecruitmentSettings(),
    getManagedEvents(),
    session.role === "owner"
      ? supabaseAdmin().from("admin_activity").select("created_at, actor_email, action, target_type, target_id").order("created_at", { ascending: false }).limit(8)
      : Promise.resolve({ data: null }),
    supabaseAdmin().from("application_scores").select("application_id").eq("reviewer_email", session.email),
    supabaseAdmin()
      .from("admin_tasks")
      .select("id, title, due_date, status, event_slug")
      .eq("assignee_email", session.email)
      .neq("status", "done")
      .order("due_date", { ascending: true, nullsFirst: false }),
  ]);
  const openTasks = (myTasks.data || []) as Pick<Task, "id" | "title" | "due_date" | "status" | "event_slug">[];

  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, applications.filter((a) => a.status === s).length]));
  const scoredByMe = new Set((unscored.data || []).map((r) => r.application_id));
  const toReview = applications.filter((a) => !scoredByMe.has(a.id) && a.status !== "rejected");
  const open = isApplicationWindowOpen(settings);

  return (
    <>
      <PageHeader title={`Hi${session.name ? `, ${session.name.split(" ")[0]}` : ""} 👋`} description="Here's what's happening across recruitment and events." />

      {denied && <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">That page is for owners only.</div>}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Couldn&apos;t load applications: {error}. Have you run <code>supabase/call_for_positions.sql</code> and <code>supabase/admin_portal.sql</code>?
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <Card className="p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Applications</p>
          <p className="text-3xl font-black tabular-nums mt-1">{applications.length}</p>
        </Card>
        {APPLICATION_STATUSES.map((s) => (
          <Link key={s} href={`/admin/applications?status=${s}`}>
            <Card className="p-4 hover:border-primary/40 transition-colors h-full">
              <StatusBadge status={s} />
              <p className="text-3xl font-black tabular-nums mt-2">{counts[s]}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Applications window</p>
          <p className={`text-xl font-black ${open ? "text-emerald-600" : "text-slate-500"}`}>{open ? "Open" : "Closed"}</p>
          <p className="text-sm text-slate-500 mt-1">
            Tenure {settings.tenure} · {settings.deadline ? `deadline ${formatDateTime(settings.deadline)}` : "no deadline"}
          </p>
          <Link href="/admin/recruitment" className="inline-block mt-4 text-sm font-bold text-primary hover:underline">
            Manage roles & window →
          </Link>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Waiting for your score</p>
          <p className="text-xl font-black">{toReview.length}</p>
          <ul className="mt-2 space-y-1">
            {toReview.slice(0, 4).map((a) => (
              <li key={a.id}>
                <Link href={`/admin/applications/${a.id}`} className="text-sm text-slate-600 hover:text-primary">
                  {a.full_name} <span className="text-slate-400">· {a.first_preference}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/admin/applications" className="inline-block mt-3 text-sm font-bold text-primary hover:underline">
            Open the board →
          </Link>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Portal events</p>
          <p className="text-xl font-black">
            {events.filter((e) => e.status !== "past").length} <span className="text-sm font-semibold text-slate-500">live or upcoming</span>
          </p>
          <p className="text-sm text-slate-500 mt-1">{events.filter((e) => e.status === "past").length} archived from the portal</p>
          <Link href="/admin/events" className="inline-block mt-4 text-sm font-bold text-primary hover:underline">
            Manage events →
          </Link>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Your tasks</p>
          <Link href="/admin/tasks" className="text-sm font-bold text-primary hover:underline">
            All tasks →
          </Link>
        </div>
        {openTasks.length ? (
          <ul className="divide-y divide-slate-100">
            {openTasks.slice(0, 6).map((t) => (
              <li key={t.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                <span className="truncate">{t.title}</span>
                <span className={`text-xs shrink-0 ${isOverdue(t) ? "text-red-600 font-bold" : "text-slate-400"}`}>
                  {t.due_date ? `${isOverdue(t) ? "Overdue · " : "Due "}${new Date(`${t.due_date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "No due date"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Nothing assigned to you right now 🎉</p>
        )}
      </Card>

      {activity.data && (
        <Card className="mt-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold">Recent activity</h2>
            <Link href="/admin/activity" className="text-sm font-bold text-primary hover:underline">
              Full log →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {activity.data.map((a, i) => (
              <li key={i} className="px-5 py-3 flex items-center justify-between gap-4 text-sm">
                <span className="min-w-0 truncate">
                  <span className="font-semibold">{a.actor_email}</span> <span className="text-slate-500">{a.action}</span>{" "}
                  {a.target_id && <span className="text-slate-400">· {a.target_id}</span>}
                </span>
                <span className="text-xs text-slate-400 shrink-0">{timeAgo(a.created_at)}</span>
              </li>
            ))}
            {!activity.data.length && <li className="px-5 py-6 text-sm text-slate-500">No activity yet.</li>}
          </ul>
        </Card>
      )}
    </>
  );
}
