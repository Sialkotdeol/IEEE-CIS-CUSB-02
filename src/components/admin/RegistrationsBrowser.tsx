"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Search } from "lucide-react";
import { api, Button, Card, EmptyState, inputClass, PageHeader } from "@/components/admin/ui";

const HIDDEN = new Set(["password", "password_hash", "token"]);

export default function RegistrationsBrowser({ sources }: { sources: { table: string; label: string }[] }) {
  const [table, setTable] = useState(sources[0]?.table || "");
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!table) return;
    let cancelled = false;
    api<{ rows: Record<string, unknown>[] }>(`/api/admin/data?table=${table}`)
      .then((d) => !cancelled && setRows(d.rows))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [table]);

  const columns = useMemo(() => {
    const cols = Array.from(new Set((rows || []).slice(0, 50).flatMap((r) => Object.keys(r)))).filter((c) => !HIDDEN.has(c));
    return cols.sort((a, b) => (a === "created_at" ? 1 : b === "created_at" ? -1 : 0));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!rows || !q) return rows || [];
    return rows.filter((r) => columns.some((c) => String(r[c] ?? "").toLowerCase().includes(q)));
  }, [rows, query, columns]);

  const show = (v: unknown) => {
    if (v === null || v === undefined || v === "") return <span className="text-slate-300">—</span>;
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return s.length > 80 ? <span title={s}>{s.slice(0, 80)}…</span> : s;
  };

  return (
    <>
      <PageHeader
        title="Registrations"
        description="Browse and export sign-ups for each event. Opening or exporting a table is recorded in the activity log."
        actions={
          <a href={`/api/admin/data?table=${table}&format=csv`}>
            <Button disabled={!rows?.length}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </a>
        }
      />
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-white p-0.5">
          {sources.map((s) => (
            <button key={s.table} onClick={() => {
                if (s.table === table) return;
                setTable(s.table);
                setRows(null);
                setError("");
              }} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${table === s.table ? "bg-primary/10 text-primary" : "text-slate-500 hover:text-slate-800"}`}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className={`${inputClass} pl-9`} />
        </div>
      </div>
      <Card className="overflow-hidden">
        {error ? (
          <EmptyState title="Couldn't load this table">{error}</EmptyState>
        ) : rows === null ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !filtered.length ? (
          <EmptyState title={rows.length ? "No matches" : "No registrations yet"} />
        ) : (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left font-bold uppercase tracking-wider text-slate-500 sticky top-0">
                <tr>
                  {columns.map((c) => (
                    <th key={c} className="px-3 py-2.5 whitespace-nowrap">
                      {c.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r, i) => (
                  <tr key={String(r.id ?? i)} className="hover:bg-slate-50/60">
                    {columns.map((c) => (
                      <td key={c} className="px-3 py-2 whitespace-nowrap text-slate-700">
                        {show(r[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {rows && <p className="text-xs text-slate-400 mt-3">{filtered.length} of {rows.length} rows</p>}
    </>
  );
}
