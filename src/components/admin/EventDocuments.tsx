"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Check, ExternalLink, FileText, Link2, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api, Button, Card, Field, inputClass, run } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { ALLOWED_EXTENSIONS, DOC_TYPES, GENERAL, MAX_DOC_BYTES, REQUIRED_DOCS, STATUS_LABELS, isOverdue, type DocType, type EventDocument, type Task } from "@/lib/workShared";

const fmtSize = (n: number | null) => (!n ? "" : n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`);

export default function EventDocuments({
  slug,
  title,
  docs,
  tasks,
  names,
  me,
}: {
  slug: string;
  title: string;
  docs: EventDocument[];
  tasks: Task[];
  names: Record<string, string>;
  me: { email: string; role: string };
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const eventSlug = slug === GENERAL ? null : slug;
  const [form, setForm] = useState({ doc_type: "report" as DocType, title: "", notes: "", mode: "file" as "file" | "link", link_url: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const byType = (t: DocType) => docs.filter((d) => d.doc_type === t);
  const openTasks = tasks.filter((t) => t.status !== "done");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      let filePart = {};
      if (form.mode === "file") {
        if (!file) throw new Error("Choose a file");
        const ext = (file.name.split(".").pop() || "").toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) throw new Error("Use PDF, Word, Excel, PowerPoint, CSV, images or ZIP");
        if (file.size > MAX_DOC_BYTES) throw new Error("Over 25 MB — upload to Google Drive and add the link instead");
        const { path, token } = await api<{ path: string; token: string }>("/api/admin/documents", {
          method: "POST",
          body: { action: "sign", event_slug: eventSlug, file_name: file.name, size: file.size },
        });
        const { error } = await supabase.storage.from("event-docs").uploadToSignedUrl(path, token, file, { contentType: file.type || "application/octet-stream" });
        if (error) throw new Error(error.message);
        filePart = { file_path: path, file_name: file.name, file_size: file.size };
      }
      const res = await api<{ completedTasks: number }>("/api/admin/documents", {
        method: "POST",
        body: {
          action: "create",
          event_slug: eventSlug,
          doc_type: form.doc_type,
          title: form.title.trim() || (form.mode === "file" && file ? file.name : DOC_TYPES[form.doc_type]),
          notes: form.notes,
          ...(form.mode === "link" ? { link_url: form.link_url } : filePart),
        },
      });
      toast.success(`${DOC_TYPES[form.doc_type]} added${res.completedTasks ? ` · ${res.completedTasks} task${res.completedTasks > 1 ? "s" : ""} marked done` : ""}`);
      setForm((f) => ({ ...f, title: "", notes: "", link_url: "" }));
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
    setBusy(false);
  };

  const remove = async (d: EventDocument) => {
    if (!window.confirm(`Delete "${d.title}"?`)) return;
    const ok = await run(() => api(`/api/admin/documents?id=${d.id}`, { method: "DELETE" }), "Deleted");
    if (ok) router.refresh();
  };

  return (
    <>
      <Link href="/admin/documents" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> All events
      </Link>
      <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1">{title}</h1>
      <p className="text-sm text-slate-500 mb-6">{docs.length} document{docs.length === 1 ? "" : "s"} · files are private to the admin team</p>

      {eventSlug && (
        <div className="flex flex-wrap gap-2 mb-6">
          {REQUIRED_DOCS.map((d) => {
            const ok = byType(d).length > 0;
            const assigned = openTasks.find((t) => t.deliverable === d);
            return (
              <div key={d} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm ${ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white border-slate-200"}`}>
                {ok ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4 text-slate-400" />}
                <span className="font-semibold">{DOC_TYPES[d]}</span>
                {!ok &&
                  (assigned ? (
                    <span className="text-xs text-amber-700">· with {assigned.assignee_email ? names[assigned.assignee_email] || assigned.assignee_email : "no one"}</span>
                  ) : (
                    <Link href={`/admin/tasks?new=1&event=${slug}&deliverable=${d}`} className="text-xs font-bold text-primary hover:underline">
                      · Assign
                    </Link>
                  ))}
              </div>
            );
          })}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-4">
          {(Object.keys(DOC_TYPES) as DocType[]).map((t) => {
            const items = byType(t);
            if (!items.length) return null;
            return (
              <Card key={t} className="overflow-hidden">
                <p className="px-4 py-2.5 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">{DOC_TYPES[t]}</p>
                <ul className="divide-y divide-slate-100">
                  {items.map((d) => (
                    <li key={d.id} className="px-4 py-3 flex items-center gap-3">
                      {d.file_path ? <FileText className="w-5 h-5 text-primary shrink-0" /> : <Link2 className="w-5 h-5 text-primary shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <a href={`/api/admin/documents/${d.id}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm hover:text-primary truncate block">
                          {d.title}
                        </a>
                        <p className="text-xs text-slate-500 truncate">
                          {names[d.uploaded_by] || d.uploaded_by} · {formatDateTime(d.created_at)}
                          {d.file_size ? ` · ${fmtSize(d.file_size)}` : d.link_url ? " · link" : ""}
                        </p>
                        {d.notes && <p className="text-xs text-slate-600 mt-0.5">{d.notes}</p>}
                      </div>
                      <a href={`/api/admin/documents/${d.id}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary" aria-label="Open">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {(d.uploaded_by === me.email || me.role === "owner") && (
                        <button onClick={() => remove(d)} className="text-slate-400 hover:text-red-600" aria-label="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
          {!docs.length && <Card className="p-8 text-center text-sm text-slate-500">Nothing uploaded yet.</Card>}

          <Card className="overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tasks for this {eventSlug ? "event" : "area"}</p>
              <Link href={`/admin/tasks?new=1&event=${slug}`} className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
                <Plus className="w-3 h-3" /> New task
              </Link>
            </div>
            {tasks.length ? (
              <ul className="divide-y divide-slate-100">
                {tasks.map((t) => (
                  <li key={t.id} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                    <span className={`flex-1 truncate ${t.status === "done" ? "line-through text-slate-400" : ""}`}>{t.title}</span>
                    <span className="text-xs text-slate-500 shrink-0">{t.assignee_email ? names[t.assignee_email] || t.assignee_email : "Unassigned"}</span>
                    <span className={`text-[10px] font-bold uppercase shrink-0 ${isOverdue(t) ? "text-red-600" : "text-slate-400"}`}>{isOverdue(t) ? "Overdue" : STATUS_LABELS[t.status]}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-4 text-sm text-slate-400">No tasks yet.</p>
            )}
          </Card>
        </div>

        <Card className="p-5 lg:sticky lg:top-6">
          <h2 className="font-bold mb-4">Add a document</h2>
          <form onSubmit={submit} className="space-y-3">
            <Field label="Type">
              <select value={form.doc_type} onChange={(e) => setForm({ ...form, doc_type: e.target.value as DocType })} className={inputClass}>
                {Object.entries(DOC_TYPES).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 w-full">
              {(["file", "link"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, mode: m })}
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold ${form.mode === m ? "bg-primary/10 text-primary" : "text-slate-500"}`}
                >
                  {m === "file" ? "Upload file" : "Add link"}
                </button>
              ))}
            </div>
            {form.mode === "file" ? (
              <Field label="File" hint="PDF, Word, Excel, PowerPoint, CSV, images or ZIP · max 25 MB">
                <input ref={fileRef} type="file" required onChange={(e) => setFile(e.target.files?.[0] || null)} className={`${inputClass} file:mr-3 file:border-0 file:bg-slate-100 file:rounded file:px-2 file:py-1`} />
              </Field>
            ) : (
              <Field label="Link" hint="Google Drive / Docs link — make sure the team can open it">
                <input type="url" required value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://drive.google.com/…" className={inputClass} />
              </Field>
            )}
            <Field label="Title (optional)">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={160} placeholder={DOC_TYPES[form.doc_type]} className={inputClass} />
            </Field>
            <Field label="Notes (optional)">
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={1000} className={inputClass} />
            </Field>
            <Button variant="primary" type="submit" disabled={busy} className="w-full">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Add document
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
