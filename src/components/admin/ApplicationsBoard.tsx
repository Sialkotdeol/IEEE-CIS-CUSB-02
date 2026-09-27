"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, GitCompare, KanbanSquare, List, Search, X } from "lucide-react";
import { api, Button, Card, EmptyState, inputClass, PageHeader, ScorePill, StatusBadge, STATUS_STYLES } from "@/components/admin/ui";

interface Row {
  id: string;
  created_at: string;
  full_name: string;
  uid: string;
  email: string;
  department: string;
  year_of_study: string;
  first_preference: string;
  second_preference: string | null;
  hours_per_week: string;
  status: string;
  scores: { count: number; overall: number | null };
}

const COLUMN_HINTS: Record<string, string> = {
  pending: "New applications",
  shortlisted: "Worth a conversation",
  interview: "Interview scheduled",
  selected: "Offer the role",
  rejected: "Not this time",
};

export default function ApplicationsBoard({
  applications,
  roles,
  statuses,
  initialStatus,
  loadError,
}: {
  applications: Row[];
  roles: Record<string, string>;
  statuses: string[];
  initialStatus?: string;
  loadError: string | null;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(applications);
  const [view, setView] = useState<"board" | "list">(initialStatus ? "list" : "board");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus && statuses.includes(initialStatus) ? initialStatus : "");
  const [sort, setSort] = useState<"newest" | "score">("newest");
  const [selected, setSelected] = useState<string[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => !role || r.first_preference === role || r.second_preference === role)
      .filter((r) => !statusFilter || r.status === statusFilter)
      .filter((r) => !q || [r.full_name, r.uid, r.email, r.department].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) =>
        sort === "score" ? (b.scores.overall ?? -1) - (a.scores.overall ?? -1) : b.created_at.localeCompare(a.created_at)
      );
  }, [rows, query, role, statusFilter, sort]);

  const move = async (id: string, status: string) => {
    const before = rows.find((r) => r.id === id);
    if (!before || before.status === status) return;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await api("/api/admin/status", { method: "PATCH", body: { id, status } });
      toast.success(`${before.full_name} → ${status}`);
      router.refresh();
    } catch (err) {
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: before.status } : r)));
      toast.error(err instanceof Error ? err.message : "Could not move applicant");
    }
  };

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const roleLabel = (id: string | null) => (id ? roles[id] || id : "—");

  const card = (r: Row) => (
    <div
      key={r.id}
      draggable
      onDragStart={(e) => {
        setDragging(r.id);
        e.dataTransfer.setData("text/plain", r.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={() => {
        setDragging(null);
        setOverColumn(null);
      }}
      className={`group bg-white border rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing transition ${
        dragging === r.id ? "opacity-40" : ""
      } ${selected.includes(r.id) ? "border-primary ring-2 ring-primary/20" : "border-slate-200 hover:border-slate-300"}`}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={selected.includes(r.id)}
          onChange={() => toggle(r.id)}
          aria-label={`Select ${r.full_name} to compare`}
          className="mt-1 accent-[#00629b]"
        />
        <div className="min-w-0 flex-1">
          <Link href={`/admin/applications/${r.id}`} className="font-bold text-sm text-slate-900 hover:text-primary block truncate">
            {r.full_name}
          </Link>
          <p className="text-xs text-slate-500 truncate">
            {r.uid} · {r.year_of_study}
          </p>
        </div>
      </div>
      <p className="text-xs text-slate-700 mt-2 truncate">
        <span className="font-semibold">1.</span> {roleLabel(r.first_preference)}
      </p>
      {r.second_preference && (
        <p className="text-xs text-slate-500 truncate">
          <span className="font-semibold">2.</span> {roleLabel(r.second_preference)}
        </p>
      )}
      <div className="flex items-center justify-between mt-2">
        <ScorePill value={r.scores.overall} count={r.scores.count} />
        {/* Keyboard / touch alternative to dragging */}
        <select
          value={r.status}
          onChange={(e) => move(r.id, e.target.value)}
          aria-label={`Move ${r.full_name}`}
          className="text-[11px] border border-slate-200 rounded-md px-1 py-0.5 bg-white text-slate-600 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Applicants"
        description="Drag cards between columns to move applicants through selection. Tick two or more to compare them side by side."
        actions={
          <>
            <a href="/api/admin/applications" className="inline-flex">
              <Button>
                <Download className="w-4 h-4" /> Export CSV
              </Button>
            </a>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button onClick={() => setView("board")} className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 ${view === "board" ? "bg-primary/10 text-primary" : "text-slate-500"}`}>
                <KanbanSquare className="w-4 h-4" /> Board
              </button>
              <button onClick={() => setView("list")} className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 ${view === "list" ? "bg-primary/10 text-primary" : "text-slate-500"}`}>
                <List className="w-4 h-4" /> List
              </button>
            </div>
          </>
        }
      />

      {loadError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">Couldn&apos;t load applications: {loadError}</div>}

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, UID, email…" className={`${inputClass} pl-9`} />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className={`${inputClass} w-auto`}>
          <option value="">All roles</option>
          {Object.entries(roles).map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
        {view === "list" && (
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputClass} w-auto`}>
            <option value="">All stages</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        <select value={sort} onChange={(e) => setSort(e.target.value as "newest" | "score")} className={`${inputClass} w-auto`}>
          <option value="newest">Newest first</option>
          <option value="score">Highest score first</option>
        </select>
      </div>

      {selected.length > 0 && (
        <div className="sticky top-16 lg:top-4 z-30 mb-4 flex flex-wrap items-center gap-3 bg-slate-900 text-white rounded-xl px-4 py-2.5 shadow-lg">
          <span className="text-sm font-semibold">{selected.length} selected</span>
          <Button
            variant="primary"
            size="sm"
            disabled={selected.length < 2}
            onClick={() => router.push(`/admin/applications/compare?ids=${selected.join(",")}`)}
          >
            <GitCompare className="w-3.5 h-3.5" /> Compare {selected.length < 2 ? "(pick 2+)" : ""}
          </Button>
          <button onClick={() => setSelected([])} className="ml-auto text-slate-300 hover:text-white" aria-label="Clear selection">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {view === "board" ? (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-4">
          <div className="grid grid-flow-col auto-cols-[minmax(250px,1fr)] gap-3 min-w-max xl:min-w-0">
            {statuses.map((s) => {
              const items = filtered.filter((r) => r.status === s);
              return (
                <div
                  key={s}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverColumn(s);
                  }}
                  onDragLeave={() => setOverColumn((c) => (c === s ? null : c))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setOverColumn(null);
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) move(id, s);
                  }}
                  className={`rounded-2xl border p-2.5 min-h-[300px] transition-colors ${
                    overColumn === s ? "bg-primary/5 border-primary/40" : "bg-slate-100/70 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between px-1 mb-2.5">
                    <div>
                      <span className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[s]}`}>{s}</span>
                      <p className="text-[11px] text-slate-400 mt-1">{COLUMN_HINTS[s]}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-500 tabular-nums">{items.length}</span>
                  </div>
                  <div className="space-y-2">{items.map(card)}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState title="No applicants match these filters" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 w-8" />
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Roles</th>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} aria-label={`Select ${r.full_name}`} className="accent-[#00629b]" />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/applications/${r.id}`} className="font-semibold text-slate-900 hover:text-primary">
                          {r.full_name}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {r.uid} · {r.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p>{roleLabel(r.first_preference)}</p>
                        {r.second_preference && <p className="text-slate-500">{roleLabel(r.second_preference)}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{r.year_of_study}</td>
                      <td className="px-4 py-3">
                        <ScorePill value={r.scores.overall} count={r.scores.count} />
                      </td>
                      <td className="px-4 py-3">
                        <select value={r.status} onChange={(e) => move(r.id, e.target.value)} className="text-xs border border-slate-200 rounded-md px-1.5 py-1 bg-white">
                          {statuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
      <p className="text-xs text-slate-400 mt-3">
        Showing {filtered.length} of {rows.length} applicants. <StatusBadge status="rejected" /> applicants stay on record; nothing is deleted.
      </p>
    </>
  );
}
