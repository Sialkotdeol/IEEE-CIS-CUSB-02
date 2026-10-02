import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePageAdmin } from "@/lib/adminAuth";
import { logActivity } from "@/lib/adminApi";
import { summarizeScores, type Application, type Score } from "@/lib/adminData";
import { getPositions } from "@/lib/siteContent";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Card, PageHeader, ScorePill, StatusBadge } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const session = await requirePageAdmin();
  const ids = ((await searchParams).ids || "").split(",").filter((id) => UUID.test(id)).slice(0, 6);

  const db = supabaseAdmin();
  const [apps, scores, positions] = await Promise.all([
    ids.length ? db.from("position_applications").select("*").in("id", ids) : Promise.resolve({ data: [] }),
    ids.length ? db.from("application_scores").select("*").in("application_id", ids) : Promise.resolve({ data: [] }),
    getPositions({ includeInactive: true }),
  ]);
  const roles = Object.fromEntries(positions.map((p) => [p.id, p.title]));
  const rows = ((apps.data || []) as Application[])
    .map((a) => ({ ...a, s: summarizeScores(((scores.data || []) as Score[]).filter((x) => x.application_id === a.id)) }))
    .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  if (rows.length) await logActivity(session, "application.compare", { type: "application" }, { ids: rows.map((r) => r.id) });

  // Highlight the best value in each score row.
  const best = (key: "overall" | "communication" | "skills" | "commitment") => Math.max(...rows.map((r) => r.s[key] ?? -1));

  const scoreRow = (label: string, key: "overall" | "communication" | "skills" | "commitment") => (
    <tr>
      <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 sticky left-0">{label}</th>
      {rows.map((r) => (
        <td key={r.id} className={`px-4 py-3 ${r.s[key] !== null && r.s[key] === best(key) && rows.length > 1 ? "bg-emerald-50" : ""}`}>
          {key === "overall" ? <ScorePill value={r.s.overall} count={r.s.count} /> : <span className="font-bold tabular-nums">{r.s[key]?.toFixed(1) ?? "—"}</span>}
        </td>
      ))}
    </tr>
  );

  const textRow = (label: string, render: (a: (typeof rows)[number]) => React.ReactNode) => (
    <tr>
      <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 sticky left-0 align-top">{label}</th>
      {rows.map((r) => (
        <td key={r.id} className="px-4 py-3 align-top text-slate-700">
          {render(r)}
        </td>
      ))}
    </tr>
  );

  return (
    <>
      <Link href="/admin/applications" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> All applicants
      </Link>
      <PageHeader title="Compare applicants" description="Best score in each row is highlighted green." />

      {rows.length < 2 ? (
        <Card className="p-8 text-center text-sm text-slate-500">Pick at least two applicants on the board to compare.</Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="text-sm min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="bg-slate-50 sticky left-0 w-40" />
                {rows.map((r) => (
                  <th key={r.id} className="px-4 py-4 text-left min-w-[240px] align-top">
                    <Link href={`/admin/applications/${r.id}`} className="font-black text-base text-slate-900 hover:text-primary">
                      {r.full_name}
                    </Link>
                    <p className="text-xs font-normal text-slate-500 mt-0.5">
                      {r.uid} · {r.year_of_study}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={r.status} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scoreRow("Overall", "overall")}
              {scoreRow("Communication", "communication")}
              {scoreRow("Skills", "skills")}
              {scoreRow("Commitment", "commitment")}
              {textRow("1st preference", (r) => roles[r.first_preference] || r.first_preference)}
              {textRow("2nd preference", (r) => (r.second_preference ? roles[r.second_preference] || r.second_preference : "—"))}
              {textRow("Department", (r) => r.department)}
              {textRow("IEEE member", (r) => (r.is_ieee_member ? "Yes" : "No"))}
              {textRow("Hours / week", (r) => r.hours_per_week)}
              {textRow("Why this role", (r) => <p className="whitespace-pre-wrap text-xs leading-relaxed max-h-56 overflow-y-auto">{r.why_this_role}</p>)}
              {textRow("Experience", (r) => <p className="whitespace-pre-wrap text-xs leading-relaxed max-h-56 overflow-y-auto">{r.relevant_experience}</p>)}
              {textRow("Links", (r) => (
                <div className="flex flex-col gap-1 text-xs">
                  {[
                    ["LinkedIn", r.linkedin_url],
                    ["Portfolio", r.portfolio_url],

                  ]
                    .filter(([, u]) => u)
                    .map(([l, u]) => (
                      <a key={l} href={u!} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {l}
                      </a>
                    ))}
                </div>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
