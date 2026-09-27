"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Award, ExternalLink, Pencil, Search, Trash2, Users, Wallet } from "lucide-react";
import { api, Button, Card, EmptyState, Field, inputClass, run } from "@/components/admin/ui";
import BadgeMedal from "@/components/badges/BadgeMedal";
import BadgeForm from "@/components/admin/BadgeForm";
import { parseRecipients } from "@/lib/recipients";
import { formatDateTime } from "@/lib/format";

const BATCH = 20;

interface BadgeRow {
  id: string;
  title: string;
  event_slug: string | null;
  description: string;
  image_path: string | null;
  image_url: string | null;
  focus_x: number;
  focus_y: number;
  zoom: number;
  created_at: string;
}
interface AwardRow {
  id: string;
  awarded_at: string;
  emailed_at: string | null;
  holder: { name: string; email: string; uid: string | null; wallet_slug: string; is_public: boolean };
}

export default function BadgeDetail({
  badge,
  awards,
  events,
  sources,
  emailConfigured,
  isOwner,
}: {
  badge: BadgeRow;
  awards: AwardRow[];
  events: { slug: string; title: string }[];
  sources: { table: string; label: string }[];
  emailConfigured: boolean;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [sendEmail, setSendEmail] = useState(emailConfigured);
  const [progress, setProgress] = useState<{ done: number; total: number; awarded: number; already: number; failed: string[] } | null>(null);
  const [query, setQuery] = useState("");
  const { ok: recipients, bad } = useMemo(() => parseRecipients(text), [text]);
  const busy = progress !== null && progress.done < progress.total;

  const filtered = awards.filter((a) => {
    const q = query.trim().toLowerCase();
    return !q || [a.holder.name, a.holder.email, a.holder.uid || ""].some((v) => v.toLowerCase().includes(q));
  });

  const importFrom = async (table: string) => {
    const res = await run(() => api<{ recipients: { name: string; uid: string; email: string }[] }>(`/api/admin/data?table=${table}&fields=recipients`));
    if (!res) return;
    const lines = res.recipients.map((r) => (r.uid ? `${r.name}, ${r.uid}, ${r.email}` : `${r.name}, ${r.email}`)).join("\n");
    setText((t) => (t.trim() ? `${t.trim()}\n${lines}` : lines));
    toast.success(`Imported ${res.recipients.length} people`);
  };

  const award = async () => {
    if (!window.confirm(`Award "${badge.title}" to ${recipients.length} ${recipients.length === 1 ? "person" : "people"}${sendEmail ? " and email them" : ""}?`)) return;
    const state = { done: 0, total: recipients.length, awarded: 0, already: 0, failed: [] as string[] };
    setProgress({ ...state });
    for (let i = 0; i < recipients.length; i += BATCH) {
      const batch = recipients.slice(i, i + BATCH);
      try {
        const { results } = await api<{ results: { email: string; status: string; error?: string }[] }>(`/api/admin/badges/${badge.id}`, {
          method: "POST",
          body: { recipients: batch.map((r) => ({ ...r, uid: r.uid || undefined })), send_email: sendEmail },
        });
        for (const r of results) {
          if (r.status === "awarded") state.awarded++;
          else if (r.status === "already") state.already++;
          else state.failed.push(`${r.email}: ${r.error}`);
        }
      } catch (err) {
        for (const r of batch) state.failed.push(`${r.email}: ${err instanceof Error ? err.message : "failed"}`);
      }
      state.done = Math.min(i + BATCH, recipients.length);
      setProgress({ ...state, failed: [...state.failed] });
    }
    toast.success(`${state.awarded} awarded${state.already ? `, ${state.already} already had it` : ""}`);
    if (state.failed.length) toast.error(`${state.failed.length} failed`);
    else setText("");
    router.refresh();
  };

  const revoke = async (a: AwardRow) => {
    if (!window.confirm(`Remove this badge from ${a.holder.name}'s wallet?`)) return;
    const ok = await run(() => api(`/api/admin/badges/${badge.id}?awardId=${a.id}`, { method: "DELETE" }), "Badge revoked");
    if (ok) router.refresh();
  };

  const remove = async () => {
    if (!window.confirm(`Delete the "${badge.title}" badge? It will disappear from all ${awards.length} wallets.`)) return;
    const ok = await run(() => api(`/api/admin/badges?id=${badge.id}`, { method: "DELETE" }), "Badge deleted");
    if (ok) router.push("/admin/badges");
  };

  return (
    <>
      <Link href="/admin/badges" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> All badges
      </Link>

      {editing ? (
        <Card className="p-5 mb-6 border-primary/40">
          <BadgeForm
            initial={{ ...badge, event_slug: badge.event_slug || "" }}
            events={events}
            submitLabel="Save badge"
            onCancel={() => setEditing(false)}
            onSubmit={async (d) => {
              const ok = await run(() => api("/api/admin/badges", { method: "PATCH", body: { id: badge.id, ...d, image_url: undefined } }), "Badge saved");
              if (ok) {
                setEditing(false);
                router.refresh();
              }
            }}
          />
        </Card>
      ) : (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <BadgeMedal badge={badge} size={150} />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">{badge.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {awards.length} awarded{badge.event_slug ? ` · ${events.find((e) => e.slug === badge.event_slug)?.title || badge.event_slug}` : ""}
            </p>
            {badge.description && <p className="text-sm text-slate-600 mt-2 max-w-xl">{badge.description}</p>}
            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              <Button onClick={() => setEditing(true)}>
                <Pencil className="w-4 h-4" /> Edit badge
              </Button>
              {isOwner && (
                <Button variant="danger" onClick={remove}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <h2 className="font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" /> Award this badge
          </h2>
          <div className="flex flex-wrap gap-2">
            {sources.map((s) => (
              <Button key={s.table} size="sm" onClick={() => importFrom(s.table)}>
                <Users className="w-3.5 h-3.5" /> Import {s.label}
              </Button>
            ))}
          </div>
          <Field label="One per line: Name, UID, email" hint="UID is optional. People who already have this badge are skipped.">
            <textarea rows={9} value={text} onChange={(e) => setText(e.target.value)} placeholder={"Asha Verma, 23BCS10001, asha@example.com"} className={`${inputClass} font-mono text-xs`} />
          </Field>
          <p className="text-xs text-slate-500">
            {recipients.length} {recipients.length === 1 ? "person" : "people"}
            {bad.length > 0 && <span className="text-red-600"> · {bad.length} line(s) not understood: {bad.slice(0, 2).join(" | ")}</span>}
          </p>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={sendEmail} disabled={!emailConfigured} onChange={(e) => setSendEmail(e.target.checked)} className="accent-[#00629b]" />
            Email each person their badge and wallet link {!emailConfigured && <span className="font-normal text-slate-400">(RESEND_API_KEY not set)</span>}
          </label>
          {progress && (
            <div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {progress.done}/{progress.total} · {progress.awarded} awarded · {progress.already} already had it{progress.failed.length ? ` · ${progress.failed.length} failed` : ""}
              </p>
              {progress.failed.length > 0 && (
                <ul className="mt-1 text-xs text-red-600 max-h-24 overflow-y-auto">
                  {progress.failed.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <Button variant="primary" disabled={!recipients.length || busy} onClick={award}>
            <Award className="w-4 h-4" /> Award to {recipients.length || ""}
          </Button>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <h2 className="font-bold flex-1">Holders ({awards.length})</h2>
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className={`${inputClass} pl-8 py-1.5`} />
            </div>
          </div>
          {!filtered.length ? (
            <EmptyState title={awards.length ? "No matches" : "Nobody has this badge yet"} />
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {filtered.map((a) => (
                <li key={a.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{a.holder.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {[a.holder.uid, a.holder.email].filter(Boolean).join(" · ")} · {formatDateTime(a.awarded_at)}
                      {a.emailed_at ? " · emailed" : ""}
                      {!a.holder.is_public ? " · wallet private" : ""}
                    </p>
                  </div>
                  <a href={`/badges/${a.id}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary" aria-label="Open badge page">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a href={`/badges/wallet/${a.holder.wallet_slug}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary" aria-label="Open wallet">
                    <Wallet className="w-4 h-4" />
                  </a>
                  <button onClick={() => revoke(a)} className="text-slate-400 hover:text-red-600" aria-label={`Revoke from ${a.holder.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
