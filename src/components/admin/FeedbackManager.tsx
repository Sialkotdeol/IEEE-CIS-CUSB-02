"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, BarChart3, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { api, Button, Card, EmptyState, Field, inputClass, PageHeader, run } from "@/components/admin/ui";
import { DEFAULT_QUESTIONS, type FeedbackForm, type Question } from "@/lib/feedback";

type Draft = { id?: string; title: string; event_slug: string; description: string; questions: Question[]; is_open: boolean };

const newId = () => `q${Math.random().toString(36).slice(2, 10)}`;
const TYPE_LABEL = { rating: "Rating (1–5)", choice: "Multiple choice", text: "Text answer" };

export default function FeedbackManager({
  forms,
  counts,
  events,
  isOwner,
  loadError,
}: {
  forms: FeedbackForm[];
  counts: Record<string, number>;
  events: { slug: string; title: string }[];
  isOwner: boolean;
  loadError: string | null;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);

  const publicUrl = (id: string) => `${window.location.origin}/feedback/${id}`;

  const updateQ = (i: number, patch: Partial<Question>) =>
    setDraft((d) => d && { ...d, questions: d.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)) });

  const moveQ = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      if (!d) return d;
      const qs = [...d.questions];
      const j = i + dir;
      if (j < 0 || j >= qs.length) return d;
      [qs[i], qs[j]] = [qs[j], qs[i]];
      return { ...d, questions: qs };
    });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const { id, ...body } = draft;
    const questions = body.questions.map((q) => (q.type === "choice" ? { ...q, options: (q.options || []).map((o) => o.trim()).filter(Boolean) } : { ...q, options: undefined }));
    const ok = await run(
      () => api(id ? "/api/admin/feedback" : "/api/admin/feedback", { method: id ? "PATCH" : "POST", body: id ? { id, ...body, questions } : { ...body, questions } }),
      id ? "Form saved" : "Form created"
    );
    if (ok) {
      setDraft(null);
      router.refresh();
    }
  };

  const toggleOpen = async (f: FeedbackForm) => {
    const ok = await run(() => api("/api/admin/feedback", { method: "PATCH", body: { id: f.id, is_open: !f.is_open } }), f.is_open ? "Form closed" : "Form reopened");
    if (ok) router.refresh();
  };

  const remove = async (f: FeedbackForm) => {
    if (!window.confirm(`Delete "${f.title}" and all ${counts[f.id] || 0} responses?`)) return;
    const ok = await run(() => api(`/api/admin/feedback?id=${f.id}`, { method: "DELETE" }), "Form deleted");
    if (ok) router.refresh();
  };

  const copyLink = async (id: string) => {
    try {
      await navigator.clipboard.writeText(publicUrl(id));
      toast.success("Link copied — share it with participants");
    } catch {
      toast.message(publicUrl(id));
    }
  };

  return (
    <>
      <PageHeader
        title="Feedback forms"
        description="Build a short survey for an event, share the link with participants, and see the results here."
        actions={
          <Button variant="primary" onClick={() => setDraft({ title: "", event_slug: "", description: "", questions: DEFAULT_QUESTIONS.map((q) => ({ ...q })), is_open: true })}>
            <Plus className="w-4 h-4" /> New form
          </Button>
        }
      />

      {loadError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">Couldn&apos;t load forms: {loadError}</div>}

      {draft && (
        <Card className="p-5 mb-6 border-primary/40">
          <form onSubmit={save} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Form title">
                <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputClass} placeholder="Agent Craft — feedback" />
              </Field>
              <Field label="Event">
                <select value={draft.event_slug} onChange={(e) => setDraft({ ...draft, event_slug: e.target.value })} className={inputClass}>
                  <option value="">Not linked to an event</option>
                  {events.map((ev) => (
                    <option key={ev.slug} value={ev.slug}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Intro text">
              <textarea rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={inputClass} placeholder="Thanks for attending! This takes under a minute." />
            </Field>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Questions</p>
              {draft.questions.map((q, i) => (
                <div key={q.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/60">
                  <div className="flex flex-col md:flex-row gap-2">
                    <input value={q.label} onChange={(e) => updateQ(i, { label: e.target.value })} className={`${inputClass} flex-1`} placeholder="Question" required />
                    <select
                      value={q.type}
                      onChange={(e) => updateQ(i, { type: e.target.value as Question["type"], options: e.target.value === "choice" ? q.options || ["", ""] : undefined })}
                      className={`${inputClass} md:w-48`}
                    >
                      {Object.entries(TYPE_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-2">
                        <input type="checkbox" checked={q.required} onChange={(e) => updateQ(i, { required: e.target.checked })} className="accent-[#00629b]" />
                        Required
                      </label>
                      <Button type="button" size="sm" variant="ghost" onClick={() => moveQ(i, -1)} aria-label="Move up">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => moveQ(i, 1)} aria-label="Move down">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={() => setDraft({ ...draft, questions: draft.questions.filter((_, j) => j !== i) })} aria-label="Remove question">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  {q.type === "choice" && (
                    <input
                      value={(q.options || []).join(", ")}
                      onChange={(e) => updateQ(i, { options: e.target.value.split(",").map((o) => o.trimStart()) })}
                      className={`${inputClass} mt-2`}
                      placeholder="Options, comma-separated (e.g. Yes, Maybe, No)"
                    />
                  )}
                </div>
              ))}
              <Button type="button" size="sm" onClick={() => setDraft({ ...draft, questions: [...draft.questions, { id: newId(), type: "rating", label: "", required: false }] })}>
                <Plus className="w-3.5 h-3.5" /> Add question
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={draft.is_open} onChange={(e) => setDraft({ ...draft, is_open: e.target.checked })} className="accent-[#00629b]" />
                Accepting responses
              </label>
              <div className="flex gap-2">
                <Button type="button" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {draft.id ? "Save form" : "Create form"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <Card className="divide-y divide-slate-100">
        {forms.length === 0 && <EmptyState title="No feedback forms yet">Create one after your next event.</EmptyState>}
        {forms.map((f) => (
          <div key={f.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{f.title}</p>
                <span className={`text-[11px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${f.is_open ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {f.is_open ? "Open" : "Closed"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {counts[f.id] || 0} responses · {f.questions.length} questions
                {f.event_slug ? ` · ${events.find((e) => e.slug === f.event_slug)?.title || f.event_slug}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Link href={`/admin/feedback/${f.id}`}>
                <Button size="sm" variant="primary">
                  <BarChart3 className="w-3.5 h-3.5" /> Results
                </Button>
              </Link>
              <Button size="sm" onClick={() => copyLink(f.id)}>
                <Copy className="w-3.5 h-3.5" /> Copy link
              </Button>
              <Button size="sm" onClick={() => toggleOpen(f)}>
                {f.is_open ? "Close" : "Reopen"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDraft({ id: f.id, title: f.title, event_slug: f.event_slug || "", description: f.description, questions: f.questions, is_open: f.is_open })}
                aria-label="Edit form"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              {isOwner && (
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(f)} aria-label="Delete form">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}
