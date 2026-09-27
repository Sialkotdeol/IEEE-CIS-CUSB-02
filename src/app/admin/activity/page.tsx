import Link from "next/link";
import { Download } from "lucide-react";
import { requirePageAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { formatDateTime } from "@/lib/format";
import { Button, Card, EmptyState, inputClass, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const PAGE = 100;
const GROUPS = ["login", "logout", "application", "applications", "registrations", "position", "recruitment", "event", "certificates", "feedback", "team", "sessions", "account", "participants", "activity"];

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ actor?: string; action?: string; page?: string }> }) {
  await requirePageAdmin({ owner: true });
  const { actor = "", action = "", page: pageParam } = await searchParams;
  const page = Math.max(Number(pageParam) || 1, 1);

  const db = supabaseAdmin();
  let q = db
    .from("admin_activity")
    .select("id, created_at, actor_email, action, target_type, target_id, details, ip", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (actor) q = q.eq("actor_email", actor);
  if (action && GROUPS.includes(action)) q = q.like("action", `${action}%`);
  const [{ data, count, error }, admins] = await Promise.all([q, db.from("admin_users").select("email").order("email")]);

  const qs = (p: number) => `?${new URLSearchParams({ ...(actor && { actor }), ...(action && { action }), page: String(p) })}`;
  const csv = `/api/admin/activity?${new URLSearchParams({ ...(actor && { actor }), ...(action && { action }) })}`;

  return (
    <>
      <PageHeader
        title="Activity log"
        description="Who viewed, exported or changed what. Entries can't be edited or deleted from the portal."
        actions={
          <a href={csv}>
            <Button>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </a>
        }
      />
      <form className="flex flex-wrap gap-2 mb-4">
        <select name="actor" defaultValue={actor} className={`${inputClass} w-auto`}>
          <option value="">Everyone</option>
          {(admins.data || []).map((a) => (
            <option key={a.email} value={a.email}>
              {a.email}
            </option>
          ))}
        </select>
        <select name="action" defaultValue={action} className={`${inputClass} w-auto`}>
          <option value="">All actions</option>
          {GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <Button type="submit">Filter</Button>
        {(actor || action) && (
          <Link href="/admin/activity">
            <Button type="button" variant="ghost">
              Clear
            </Button>
          </Link>
        )}
      </form>

      <Card className="overflow-x-auto">
        {error ? (
          <EmptyState title="Couldn't load the log">{error.message}</EmptyState>
        ) : !data?.length ? (
          <EmptyState title="No activity matches" />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Who</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((a) => (
                <tr key={a.id} className="align-top">
                  <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">{formatDateTime(a.created_at)}</td>
                  <td className="px-4 py-2.5 text-xs font-semibold">{a.actor_email}</td>
                  <td className="px-4 py-2.5">
                    <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{a.action}</code>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-600">
                    {a.target_type === "application" && a.target_id ? (
                      <Link href={`/admin/applications/${a.target_id}`} className="text-primary hover:underline">
                        applicant
                      </Link>
                    ) : (
                      [a.target_type, a.target_id].filter(Boolean).join(" · ")
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 max-w-xs truncate" title={JSON.stringify(a.details)}>
                    {Object.keys(a.details || {}).length ? JSON.stringify(a.details) : ""}
                    {a.ip && <span className="block text-slate-400">{a.ip}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-slate-500">{count ?? 0} entries</span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={qs(page - 1)}>
              <Button size="sm">Newer</Button>
            </Link>
          )}
          {count !== null && page * PAGE < count && (
            <Link href={qs(page + 1)}>
              <Button size="sm">Older</Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
