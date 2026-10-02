"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Star, Trash2 } from "lucide-react";
import { api, Button, Card, inputClass, run, ScorePill, StatusBadge } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";

interface App {
  id: string;
  created_at: string;
  full_name: string;
  uid: string;
  email: string;
  phone: string;
  department: string;
  year_of_study: string;
  is_ieee_member: boolean;
  ieee_member_id: string | null;
  first_preference: string;
  second_preference: string | null;
  why_this_role: string;
  relevant_experience: string;
  hours_per_week: string;
  linkedin_url: string | null;
  portfolio_url: string | null;

  status: string;
}

interface ScoreRow {
  reviewer_email: string;
  reviewer_name: string;
  communication: number;
  skills: number;
  commitment: number;
  comment: string | null;
  updated_at: string;
}

interface Note {
  id: string;
  author_email: string;
  author_name: string | null;
  body: string;
  created_at: string;
}

const CRITERIA = [
  { key: "communication", label: "Communication", hint: "Clarity, confidence, how well they express ideas" },
  { key: "skills", label: "Skills", hint: "Relevant experience and ability for the role" },
  { key: "commitment", label: "Commitment", hint: "Time, motivation and reliability" },
] as const;

function Stars({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} out of 5`}
          onClick={() => onChange(n)}
          className="p-0.5"
        >
          <Star className={`w-6 h-6 transition-colors ${n <= value ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300"}`} />
        </button>
      ))}
    </div>
  );
}

export default function ApplicationDetail({
  app,
  roles,
  statuses,
  scores,
  summary,
  notes: initialNotes,
  me,
}: {
  app: App;
  roles: Record<string, string>;
  statuses: string[];
  scores: ScoreRow[];
  summary: { count: number; communication: number | null; skills: number | null; commitment: number | null; overall: number | null };
  notes: Note[];
  me: { email: string; role: string };
}) {
  const router = useRouter();
  const mine = scores.find((s) => s.reviewer_email === me.email);
  const [status, setStatus] = useState(app.status);
  const [score, setScore] = useState({
    communication: mine?.communication ?? 0,
    skills: mine?.skills ?? 0,
    commitment: mine?.commitment ?? 0,
    comment: mine?.comment ?? "",
  });
  const [savingScore, setSavingScore] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [draft, setDraft] = useState("");

  const changeStatus = async (s: string) => {
    const prev = status;
    setStatus(s);
    const ok = await run(() => api("/api/admin/status", { method: "PATCH", body: { id: app.id, status: s } }), `Moved to ${s}`);
    if (!ok) setStatus(prev);
    else router.refresh();
  };

  const saveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score.communication || !score.skills || !score.commitment) return;
    setSavingScore(true);
    await run(() => api(`/api/admin/applications/${app.id}/score`, { method: "PUT", body: score }), "Score saved");
    setSavingScore(false);
    router.refresh();
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const res = await run(() => api<{ note: Note }>(`/api/admin/applications/${app.id}/notes`, { method: "POST", body: { body: draft } }));
    if (res) {
      setNotes((n) => [...n, res.note]);
      setDraft("");
    }
  };

  const deleteNote = async (id: string) => {
    const ok = await run(() => api(`/api/admin/applications/${app.id}/notes?noteId=${id}`, { method: "DELETE" }), "Note deleted");
    if (ok) setNotes((n) => n.filter((x) => x.id !== id));
  };

  const link = (label: string, url: string | null) =>
    url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
        {label} <ExternalLink className="w-3.5 h-3.5" />
      </a>
    ) : null;

  return (
    <>
      <Link href="/admin/applications" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> All applicants
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{app.full_name}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {app.uid} · {app.department} · {app.year_of_study} · applied {formatDateTime(app.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <select value={status} onChange={(e) => changeStatus(e.target.value)} className={`${inputClass} w-auto`} aria-label="Stage">
            {statuses.map((s) => (
              <option key={s} value={s}>
                Move to {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">First preference</p>
                <p className="font-bold mt-0.5">{roles[app.first_preference] || app.first_preference}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Second preference</p>
                <p className="font-bold mt-0.5">{app.second_preference ? roles[app.second_preference] || app.second_preference : "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact</p>
                <p className="mt-0.5">
                  <a href={`mailto:${app.email}`} className="text-primary hover:underline">{app.email}</a>
                  <br />
                  {app.phone}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">IEEE member · Hours/week</p>
                <p className="mt-0.5">
                  {app.is_ieee_member ? `Yes${app.ieee_member_id ? ` (${app.ieee_member_id})` : ""}` : "No"} · {app.hours_per_week}
                </p>
              </div>
            </div>
            {(app.linkedin_url || app.portfolio_url) && (
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100">
                {link("LinkedIn", app.linkedin_url)}
                {link("Portfolio / GitHub", app.portfolio_url)}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Why this role</h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{app.why_this_role}</p>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-5 mb-2">Relevant experience</h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{app.relevant_experience}</p>
          </Card>

          <Card className="p-5">
            <h2 className="font-bold mb-1">Private notes</h2>
            <p className="text-xs text-slate-500 mb-4">Only the admin team can see these.</p>
            <ul className="space-y-3 mb-4">
              {notes.map((n) => (
                <li key={n.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-slate-600">
                      {n.author_name || n.author_email} <span className="font-normal text-slate-400">· {formatDateTime(n.created_at)}</span>
                    </p>
                    {(n.author_email === me.email || me.role === "owner") && (
                      <button onClick={() => deleteNote(n.id)} className="text-slate-400 hover:text-red-600" aria-label="Delete note">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{n.body}</p>
                </li>
              ))}
              {!notes.length && <li className="text-sm text-slate-400">No notes yet.</li>}
            </ul>
            <form onSubmit={addNote} className="flex flex-col gap-2">
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a note for the team…" rows={3} maxLength={4000} className={inputClass} />
              <Button variant="primary" type="submit" disabled={!draft.trim()} className="self-end">
                Add note
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">Team average</h2>
              <ScorePill value={summary.overall} count={summary.count} />
            </div>
            <dl className="space-y-1.5 text-sm">
              {CRITERIA.map((c) => (
                <div key={c.key} className="flex justify-between">
                  <dt className="text-slate-500">{c.label}</dt>
                  <dd className="font-bold tabular-nums">{summary[c.key]?.toFixed(1) ?? "—"}</dd>
                </div>
              ))}
            </dl>
            {scores.length > 0 && (
              <ul className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                {scores.map((s) => (
                  <li key={s.reviewer_email} className="text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700 truncate">{s.reviewer_name || s.reviewer_email}</span>
                      <span className="tabular-nums text-slate-500">
                        {s.communication} · {s.skills} · {s.commitment}
                      </span>
                    </div>
                    {s.comment && <p className="text-slate-500 mt-0.5">“{s.comment}”</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-bold mb-1">{mine ? "Your score" : "Score this applicant"}</h2>
            <p className="text-xs text-slate-500 mb-4">Rate each out of 5. You can change it any time.</p>
            <form onSubmit={saveScore} className="space-y-4">
              {CRITERIA.map((c) => (
                <div key={c.key}>
                  <p className="text-sm font-semibold">{c.label}</p>
                  <p className="text-xs text-slate-400 mb-1">{c.hint}</p>
                  <Stars label={c.label} value={score[c.key]} onChange={(v) => setScore((s) => ({ ...s, [c.key]: v }))} />
                </div>
              ))}
              <textarea
                value={score.comment}
                onChange={(e) => setScore((s) => ({ ...s, comment: e.target.value }))}
                placeholder="Optional comment"
                rows={2}
                maxLength={1000}
                className={inputClass}
              />
              <Button variant="primary" type="submit" className="w-full" disabled={savingScore || !score.communication || !score.skills || !score.commitment}>
                {mine ? "Update score" : "Submit score"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
