import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { requirePageAdmin } from "@/lib/adminAuth";
import { logActivity } from "@/lib/adminApi";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { FeedbackForm } from "@/lib/feedback";
import { formatDateTime } from "@/lib/format";
import { Button, Card, PageHeader } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function FeedbackResults({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePageAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const db = supabaseAdmin();
  const [{ data: form }, { data: responses }] = await Promise.all([
    db.from("feedback_forms").select("*").eq("id", id).maybeSingle(),
    db.from("feedback_responses").select("*").eq("form_id", id).order("created_at", { ascending: false }),
  ]);
  if (!form) notFound();
  const f = form as FeedbackForm;
  const rows = (responses || []) as { id: string; created_at: string; respondent_name: string | null; answers: Record<string, string | number> }[];
  await logActivity(session, "feedback.view", { type: "feedback_form", id }, { responses: rows.length });

  return (
    <>
      <Link href="/admin/feedback" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> All forms
      </Link>
      <PageHeader
        title={f.title}
        description={`${rows.length} response${rows.length === 1 ? "" : "s"} · ${f.is_open ? "accepting responses" : "closed"}`}
        actions={
          <>
            <a href={`/feedback/${f.id}`} target="_blank" rel="noopener noreferrer">
              <Button>
                Open form <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
            <a href={`/api/admin/feedback/${f.id}`}>
              <Button>
                <Download className="w-4 h-4" /> Export CSV
              </Button>
            </a>
          </>
        }
      />

      <div className="grid md:grid-cols-2 gap-4">
        {f.questions.map((q) => {
          const answers = rows.map((r) => r.answers[q.id]).filter((v) => v !== undefined && v !== "");
          if (q.type === "rating") {
            const nums = answers.map(Number);
            const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
            return (
              <Card key={q.id} className="p-5">
                <p className="font-semibold text-sm mb-1">{q.label}</p>
                <p className="text-3xl font-black tabular-nums">
                  {avg?.toFixed(1) ?? "—"}
                  <span className="text-sm font-semibold text-slate-400"> / 5 · {nums.length} answers</span>
                </p>
                <div className="mt-3 space-y-1">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const c = nums.filter((x) => x === n).length;
                    return (
                      <div key={n} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-slate-500 tabular-nums">{n}</span>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: nums.length ? `${(c / nums.length) * 100}%` : 0 }} />
                        </div>
                        <span className="w-6 text-right text-slate-500 tabular-nums">{c}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          }
          if (q.type === "choice") {
            return (
              <Card key={q.id} className="p-5">
                <p className="font-semibold text-sm mb-3">{q.label}</p>
                <div className="space-y-2">
                  {(q.options || []).map((o) => {
                    const c = answers.filter((a) => a === o).length;
                    const pct = answers.length ? Math.round((c / answers.length) * 100) : 0;
                    return (
                      <div key={o}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="font-medium">{o}</span>
                          <span className="text-slate-500 tabular-nums">
                            {c} · {pct}%
                          </span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          }
          return (
            <Card key={q.id} className="p-5 md:col-span-2">
              <p className="font-semibold text-sm mb-3">
                {q.label} <span className="text-slate-400 font-normal">· {answers.length} answers</span>
              </p>
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {rows
                  .filter((r) => r.answers[q.id])
                  .map((r) => (
                    <li key={r.id} className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      <p className="text-slate-800 whitespace-pre-wrap">{String(r.answers[q.id])}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {r.respondent_name || "Anonymous"} · {formatDateTime(r.created_at)}
                      </p>
                    </li>
                  ))}
                {!answers.length && <li className="text-sm text-slate-400">No answers yet.</li>}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}
