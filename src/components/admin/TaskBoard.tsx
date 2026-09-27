"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { api, Button, Card, EmptyState, Field, inputClass, PageHeader, run } from "@/components/admin/ui";
import { DOC_TYPES, GENERAL, PRIORITIES, STATUS_LABELS, TASK_STATUSES, isOverdue, todayIST, type Task, type TaskStatus } from "@/lib/workShared";

type Draft = {
  id?: string;
  title: string;
  description: string;
  event_slug: string;
  assignee_email: string;
  due_date: string;
  priority: Task["priority"];
  deliverable: string;
  notify: boolean;
};

const PRIORITY_STYLE = {
  high: "bg-red-50 text-red-700 border-red-200",
  normal: "bg-slate-100 text-slate-600 border-slate-200",
  low: "bg-slate-50 text-slate-400 border-slate-200",
};
const COLUMN_STYLE: Record<TaskStatus, string> = {
  todo: "bg-slate-100/70 border-slate-200",
  in_progress: "bg-amber-50/60 border-amber-200",
  done: "bg-emerald-50/60 border-emerald-200",
};

export default function TaskBoard({
  tasks,
  team,
  events,
  me,
  emailConfigured,
  prefill,
  loadError,
}: {
  tasks: Task[];
  team: { email: string; name: string }[];
  events: { slug: string; title: string }[];
  me: { email: string; role: string };
  emailConfigured: boolean;
  prefill: { event_slug: string; deliverable: string } | null;
  loadError: string | null;
}) {
  const router = useRouter();
  const blank = (p?: Partial<Draft>): Draft => ({
    title: "",
    description: "",
    event_slug: "",
    assignee_email: "",
    due_date: "",
    priority: "normal",
    deliverable: "",
    notify: emailConfigured,
    ...p,
  });
  const [draft, setDraft] = useState<Draft | null>(() => {
    if (!prefill) return null;
    const ev = events.find((e) => e.slug === prefill.event_slug);
    const deliverable = prefill.deliverable in DOC_TYPES ? prefill.deliverable : "";
    return blank({
      event_slug: prefill.event_slug === GENERAL ? "" : prefill.event_slug,
      deliverable,
      title: deliverable ? `Upload ${DOC_TYPES[deliverable as keyof typeof DOC_TYPES]}${ev ? ` — ${ev.title}` : ""}` : "",
    });
  });
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [eventFilter, setEventFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);

  const nameOf = (email: string | null) => (email ? team.find((t) => t.email === email)?.name || email.split("@")[0] : "Unassigned");
  const eventTitle = (slug: string | null) => (slug ? events.find((e) => e.slug === slug)?.title || slug : "General");

  const visible = useMemo(
    () =>
      tasks
        .filter((t) => scope === "all" || t.assignee_email === me.email || (t.created_by === me.email && !t.assignee_email))
        .filter((t) => !eventFilter || (eventFilter === GENERAL ? !t.event_slug : t.event_slug === eventFilter))
        .filter((t) => !assigneeFilter || t.assignee_email === assigneeFilter)
        .sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999") || b.created_at.localeCompare(a.created_at)),
    [tasks, scope, eventFilter, assigneeFilter, me.email]
  );
  const myOpen = tasks.filter((t) => t.assignee_email === me.email && t.status !== "done").length;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const { id, notify, ...fields } = draft;
    const body = { ...fields, event_title: eventTitle(fields.event_slug || null) };
    const res = await run(
      () =>
        id
          ? api("/api/admin/tasks", { method: "PATCH", body: { id, ...fields } })
          : api<{ emailed: boolean }>("/api/admin/tasks", { method: "POST", body: { ...body, notify } }),
      id ? "Task updated" : "Task created"
    );
    if (res) {
      setDraft(null);
      if (prefill) router.replace("/admin/tasks");
      router.refresh();
    }
  };

  const move = async (t: Task, status: TaskStatus) => {
    if (t.status === status) return;
    const ok = await run(() => api("/api/admin/tasks", { method: "PATCH", body: { id: t.id, status } }), status === "done" ? "Nice — task done ✅" : undefined);
    if (ok) router.refresh();
  };

  const remove = async (t: Task) => {
    if (!window.confirm(`Delete "${t.title}"?`)) return;
    const ok = await run(() => api(`/api/admin/tasks?id=${t.id}`, { method: "DELETE" }), "Task deleted");
    if (ok) router.refresh();
  };

  const canEdit = (t: Task) => [t.created_by, t.assignee_email].includes(me.email) || me.role === "owner";

  const card = (t: Task) => {
    const overdue = isOverdue(t);
    return (
      <div
        key={t.id}
        draggable
        onDragStart={(e) => {
          setDragging(t.id);
          e.dataTransfer.setData("text/plain", t.id);
        }}
        onDragEnd={() => setDragging(null)}
        className={`group bg-white border rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing ${dragging === t.id ? "opacity-40" : ""} ${
          overdue ? "border-red-300" : "border-slate-200"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className={`font-semibold text-sm ${t.status === "done" ? "line-through text-slate-400" : "text-slate-900"}`}>{t.title}</p>
          <span className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
        </div>
        {t.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2 whitespace-pre-wrap">{t.description}</p>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">{nameOf(t.assignee_email)}</span>
          <span>{eventTitle(t.event_slug)}</span>
          {t.due_date && (
            <span className={`inline-flex items-center gap-1 ${overdue ? "text-red-600 font-bold" : ""}`}>
              <CalendarClock className="w-3 h-3" /> {overdue ? "Overdue · " : ""}
              {new Date(`${t.due_date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          )}
          {t.deliverable && (
            <Link href={`/admin/documents/${t.event_slug || GENERAL}`} className="inline-flex items-center gap-1 text-primary hover:underline">
              <FileText className="w-3 h-3" /> {DOC_TYPES[t.deliverable]}
            </Link>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <select value={t.status} onChange={(e) => move(t, e.target.value as TaskStatus)} aria-label="Status" className="text-[11px] border border-slate-200 rounded-md px-1 py-0.5 bg-white">
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <div className="flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 focus-within:opacity-100">
            {canEdit(t) && (
              <button
                onClick={() =>
                  setDraft({
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    event_slug: t.event_slug || "",
                    assignee_email: t.assignee_email || "",
                    due_date: t.due_date || "",
                    priority: t.priority,
                    deliverable: t.deliverable || "",
                    notify: false,
                  })
                }
                className="p-1 text-slate-400 hover:text-primary"
                aria-label="Edit task"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {(t.created_by === me.email || me.role === "owner") && (
              <button onClick={() => remove(t)} className="p-1 text-slate-400 hover:text-red-600" aria-label="Delete task">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        description={`Assign work to the team. Tasks with a deliverable complete themselves when that document is uploaded. You have ${myOpen} open task${myOpen === 1 ? "" : "s"}.`}
        actions={
          <Button variant="primary" onClick={() => setDraft(blank())}>
            <Plus className="w-4 h-4" /> New task
          </Button>
        }
      />
      {loadError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">Couldn&apos;t load tasks: {loadError}. Re-run supabase/admin_portal.sql.</div>}

      {draft && (
        <Card className="p-5 mb-6 border-primary/40">
          <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
            <Field label="Task" className="md:col-span-2">
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={160} className={inputClass} placeholder="e.g. Write the event report for Agent Craft" />
            </Field>
            <Field label="Assign to">
              <select value={draft.assignee_email} onChange={(e) => setDraft({ ...draft, assignee_email: e.target.value })} className={inputClass}>
                <option value="">Unassigned</option>
                {team.map((m) => (
                  <option key={m.email} value={m.email}>
                    {m.name || m.email}
                    {m.email === me.email ? " (me)" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Event">
              <select value={draft.event_slug} onChange={(e) => setDraft({ ...draft, event_slug: e.target.value })} className={inputClass}>
                <option value="">General / core team</option>
                {events.map((ev) => (
                  <option key={ev.slug} value={ev.slug}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Due date">
                <input type="date" min={draft.id ? undefined : todayIST()} value={draft.due_date} onChange={(e) => setDraft({ ...draft, due_date: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Priority">
                <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Task["priority"] })} className={inputClass}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p[0].toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Deliverable" hint="Uploading this document for the event marks the task done">
              <select value={draft.deliverable} onChange={(e) => setDraft({ ...draft, deliverable: e.target.value })} className={inputClass}>
                <option value="">None</option>
                {Object.entries(DOC_TYPES).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Details" className="md:col-span-2">
              <textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={2000} className={inputClass} placeholder="Anything they need to know" />
            </Field>
            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
              {!draft.id ? (
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={draft.notify} disabled={!emailConfigured} onChange={(e) => setDraft({ ...draft, notify: e.target.checked })} className="accent-[#00629b]" />
                  Email the assignee
                </label>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {draft.id ? "Save task" : "Create task"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
          {(["mine", "all"] as const).map((s) => (
            <button key={s} onClick={() => setScope(s)} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${scope === s ? "bg-primary/10 text-primary" : "text-slate-500"}`}>
              {s === "mine" ? "My tasks" : "All tasks"}
            </button>
          ))}
        </div>
        <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className={`${inputClass} w-auto`}>
          <option value="">All events</option>
          <option value={GENERAL}>General / core team</option>
          {events.map((ev) => (
            <option key={ev.slug} value={ev.slug}>
              {ev.title}
            </option>
          ))}
        </select>
        {scope === "all" && (
          <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className={`${inputClass} w-auto`}>
            <option value="">Everyone</option>
            {team.map((m) => (
              <option key={m.email} value={m.email}>
                {m.name || m.email}
              </option>
            ))}
          </select>
        )}
      </div>

      {!visible.length ? (
        <Card>
          <EmptyState title={scope === "mine" ? "Nothing on your plate 🎉" : "No tasks match"}>{scope === "mine" && "Switch to All tasks to see the whole team's work."}</EmptyState>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          {TASK_STATUSES.map((s) => {
            const items = visible.filter((t) => t.status === s);
            return (
              <div
                key={s}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const t = tasks.find((x) => x.id === e.dataTransfer.getData("text/plain"));
                  if (t) move(t, s);
                }}
                className={`rounded-2xl border p-2.5 min-h-[240px] ${COLUMN_STYLE[s]}`}
              >
                <div className="flex items-center justify-between px-1 mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{STATUS_LABELS[s]}</span>
                  <span className="text-sm font-bold text-slate-500 tabular-nums">{items.length}</span>
                </div>
                <div className="space-y-2">{items.map(card)}</div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
