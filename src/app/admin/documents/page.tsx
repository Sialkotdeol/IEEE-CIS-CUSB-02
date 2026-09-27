import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { requirePageAdmin } from "@/lib/adminAuth";
import { getAllEventOptions } from "@/lib/siteContent";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DOC_TYPES, GENERAL, REQUIRED_DOCS, type DocType } from "@/lib/workShared";
import { Card, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  await requirePageAdmin();
  const db = supabaseAdmin();
  const [events, { data: docs, error }, { data: tasks }] = await Promise.all([
    getAllEventOptions(),
    db.from("event_documents").select("event_slug, doc_type"),
    db.from("admin_tasks").select("event_slug, deliverable").neq("status", "done").not("deliverable", "is", null),
  ]);

  const have = new Map<string, Set<DocType>>();
  const total = new Map<string, number>();
  for (const d of docs || []) {
    const k = d.event_slug || GENERAL;
    if (!have.has(k)) have.set(k, new Set());
    have.get(k)!.add(d.doc_type as DocType);
    total.set(k, (total.get(k) || 0) + 1);
  }
  const pending = new Set((tasks || []).map((t) => `${t.event_slug || GENERAL}:${t.deliverable}`));
  const rows = events.filter((e) => e.status !== "upcoming");
  const missing = rows.reduce((n, e) => n + REQUIRED_DOCS.filter((d) => !have.get(e.slug)?.has(d)).length, 0);

  return (
    <>
      <PageHeader
        title="Event documents"
        description={`Reports, minutes of meetings (M2M), attendance and more, collected per event. ${missing} required document${missing === 1 ? " is" : "s are"} still missing.`}
      />
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">Couldn&apos;t load documents: {error.message}. Re-run supabase/admin_portal.sql.</div>}

      <Link href={`/admin/documents/${GENERAL}`}>
        <Card className="p-4 mb-4 flex items-center justify-between hover:border-primary/40 transition-colors">
          <div>
            <p className="font-bold">General / core-team documents</p>
            <p className="text-xs text-slate-500">Core meeting M2Ms, annual reports and anything not tied to one event</p>
          </div>
          <span className="text-sm text-slate-500">{total.get(GENERAL) || 0} files</span>
        </Card>
      </Link>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Event</th>
              {REQUIRED_DOCS.map((d) => (
                <th key={d} className="px-3 py-3 text-center whitespace-nowrap">
                  {d === "m2m" ? "M2M" : DOC_TYPES[d].split(" ")[0]}
                </th>
              ))}
              <th className="px-4 py-3 text-right">All files</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((e) => (
              <tr key={e.slug} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/documents/${e.slug}`} className="font-semibold hover:text-primary">
                    {e.title}
                  </Link>
                  <span className="ml-2 text-[10px] uppercase font-bold text-slate-400">{e.status}</span>
                </td>
                {REQUIRED_DOCS.map((d) => {
                  const ok = have.get(e.slug)?.has(d);
                  const asked = pending.has(`${e.slug}:${d}`);
                  return (
                    <td key={d} className="px-3 py-3 text-center">
                      {ok ? (
                        <Check className="w-4 h-4 text-emerald-600 inline" aria-label="Collected" />
                      ) : asked ? (
                        <span className="text-[10px] font-bold uppercase text-amber-600">Assigned</span>
                      ) : (
                        <Minus className="w-4 h-4 text-slate-300 inline" aria-label="Missing" />
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right text-slate-500">{total.get(e.slug) || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-slate-400 mt-3">Upcoming events are hidden until they&apos;re live. Open an event to upload files or assign someone to collect what&apos;s missing.</p>
    </>
  );
}
