import { Download } from "lucide-react";
import { requirePageAdmin } from "@/lib/adminAuth";
import { logActivity } from "@/lib/adminApi";
import { getRepeatParticipants } from "@/lib/adminData";
import { Button, Card, EmptyState, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage({ searchParams }: { searchParams: Promise<{ min?: string }> }) {
  const session = await requirePageAdmin();
  const min = Math.min(Math.max(Number((await searchParams).min) || 2, 2), 10);
  const { participants, errors } = await getRepeatParticipants(min);
  await logActivity(session, "participants.view", { type: "participants" }, { min, rows: participants.length });

  return (
    <>
      <PageHeader
        title="Repeat participants"
        description="Students who joined several events or earned several badges: a good place to spot future leaders. Matched by email, then UID."
        actions={
          <a href="/api/admin/participants">
            <Button>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </a>
        }
      />
      <div className="flex gap-2 mb-4 text-sm">
        {[2, 3, 4].map((n) => (
          <a
            key={n}
            href={`/admin/participants?min=${n}`}
            className={`px-3 py-1.5 rounded-lg border font-semibold ${min === n ? "bg-primary/10 text-primary border-primary/30" : "bg-white border-slate-200 text-slate-600"}`}
          >
            {n}+ events or badges
          </a>
        ))}
      </div>
      {errors.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-xs">
          Some sources couldn&apos;t be read: {errors.join(" · ")}
        </div>
      )}
      <Card className="overflow-x-auto">
        {!participants.length ? (
          <EmptyState title={`Nobody has ${min}+ events or badges yet`} />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3 text-center">Events</th>
                <th className="px-4 py-3 text-center">Badges</th>
                <th className="px-4 py-3">Took part in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {participants.map((p) => (
                <tr key={p.key}>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{p.name || "—"}</p>
                    <p className="text-xs text-slate-500">
                      {[p.uid, p.email].filter(Boolean).join(" · ")}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-black">{p.count}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-700 font-black">{p.badges.length}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.events.map((e) => (
                        <span key={e} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-600">
                          {e}
                        </span>
                      ))}
                      {p.badges.map((b) => (
                        <span key={`b-${b}`} className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800">
                          🏅 {b}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      <p className="text-xs text-slate-400 mt-3">
        {participants.length} student{participants.length === 1 ? "" : "s"}. Sources: event registration tables, Call for Positions, feedback responses that include an email, and badges.
      </p>
    </>
  );
}
