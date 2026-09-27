"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Eye, LayoutTemplate, Mail, Plus, Trash2, Users } from "lucide-react";
import { api, Button, Card, Field, inputClass, PageHeader, run } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { parseRecipients } from "@/lib/recipients";

interface Issued {
  id: string;
  recipient_name: string;
  recipient_email: string;
  recipient_uid: string | null;
  event_title: string;
  kind: string;
  emailed_at: string | null;
  created_at: string;
}

const KINDS = ["Participation", "Excellence", "Winner", "Appreciation", "Volunteering"];
const BATCH = 10;

export default function CertificateStudio({
  events,
  sources,
  recent,
  templates,
  badges,
  emailConfigured,
}: {
  events: string[];
  sources: { table: string; label: string }[];
  recent: Issued[];
  templates: { id: string; name: string }[];
  badges: { id: string; title: string; event_slug: string | null }[];
  emailConfigured: boolean;
}) {
  const router = useRouter();
  const [details, setDetails] = useState({
    template_id: templates[0]?.id || "",
    event_title: "",
    event_date: "",
    kind: "Participation",
    signatories: [
      { name: "", title: "Chairperson, IEEE CIS CUSB" },
      { name: "", title: "Faculty Advisor" },
    ],
  });
  const [recipientsText, setRecipientsText] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number; failed: string[] } | null>(null);
  const { ok: recipients, bad } = useMemo(() => parseRecipients(recipientsText), [recipientsText]);

  const usingTemplate = Boolean(details.template_id);
  const detailsValid =
    details.event_title.trim().length >= 2 &&
    details.event_date.trim().length >= 2 &&
    (usingTemplate || details.signatories.every((s) => s.name.trim() && s.title.trim()));

  /** What the API gets: signatories only matter for the built-in design. */
  const payload = () => {
    const { template_id, signatories, ...rest } = details;
    return template_id ? { ...rest, template_id } : { ...rest, signatories };
  };

  const importFrom = async (table: string) => {
    const res = await run(() => api<{ recipients: { name: string; uid: string; email: string }[] }>(`/api/admin/data?table=${table}&fields=recipients`));
    if (!res) return;
    const lines = res.recipients.map((r) => (r.uid ? `${r.name}, ${r.uid}, ${r.email}` : `${r.name}, ${r.email}`)).join("\n");
    setRecipientsText((t) => (t.trim() ? `${t.trim()}\n${lines}` : lines));
    toast.success(`Imported ${res.recipients.length} people`);
  };

  const preview = () => {
    const d = encodeURIComponent(JSON.stringify(payload()));
    const first = recipients[0];
    window.open(`/api/admin/certificates?d=${d}&name=${encodeURIComponent(first?.name || "Participant Name")}&uid=${encodeURIComponent(first?.uid || "23BCS10001")}`, "_blank", "noopener");
  };

  const issue = async (sendEmail: boolean) => {
    const verb = sendEmail ? "email" : "issue";
    const badgeTitle = badges.find((b) => b.id === badgeId)?.title;
    if (!window.confirm(`${sendEmail ? "Email" : "Issue"} ${recipients.length} certificate(s) for "${details.event_title}"${badgeTitle ? ` and award the "${badgeTitle}" badge` : ""}?`)) return;
    const failed: string[] = [];
    setProgress({ done: 0, total: recipients.length, failed });
    for (let i = 0; i < recipients.length; i += BATCH) {
      const batch = recipients.slice(i, i + BATCH);
      try {
        const { results } = await api<{ results: { email: string; ok: boolean; error?: string }[] }>("/api/admin/certificates", {
          method: "POST",
          body: {
            ...payload(),
            recipients: batch.map((r) => ({ ...r, uid: r.uid || undefined })),
            send_email: sendEmail,
            ...(badgeId && { badge_id: badgeId }),
          },
        });
        for (const r of results) if (!r.ok) failed.push(`${r.email}: ${r.error}`);
      } catch (err) {
        for (const r of batch) failed.push(`${r.email}: ${err instanceof Error ? err.message : "failed"}`);
      }
      setProgress({ done: Math.min(i + BATCH, recipients.length), total: recipients.length, failed: [...failed] });
    }
    const sent = recipients.length - failed.length;
    if (sent) toast.success(`${sent} certificate(s) ${sendEmail ? "emailed" : "issued"}`);
    if (failed.length) toast.error(`${failed.length} failed to ${verb}`);
    else setRecipientsText("");
    router.refresh();
  };

  const busy = progress !== null && progress.done < progress.total;

  return (
    <>
      <PageHeader title="Certificates" description="Generate PDF certificates and email them to participants. Every certificate gets a unique ID and is kept on record." />

      {!emailConfigured && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
          <code>RESEND_API_KEY</code> isn&apos;t set, so certificates can be issued and downloaded but not emailed.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-5 space-y-4">
          <h2 className="font-bold">1. Certificate details</h2>
          <Field label="Design">
            <div className="flex gap-2">
              <select value={details.template_id} onChange={(e) => setDetails({ ...details, template_id: e.target.value })} className={inputClass}>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
                <option value="">Built-in design</option>
              </select>
              <Link href="/admin/certificates/templates">
                <Button type="button" className="whitespace-nowrap h-full">
                  <LayoutTemplate className="w-4 h-4" /> Manage designs
                </Button>
              </Link>
            </div>
          </Field>
          <Field label="Also award a badge" hint="Recipients get the badge in their wallet, and the certificate email links to it">
            <select value={badgeId} onChange={(e) => setBadgeId(e.target.value)} className={inputClass}>
              <option value="">No badge</option>
              {badges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Event">
            <input list="event-titles" value={details.event_title} onChange={(e) => setDetails({ ...details, event_title: e.target.value })} className={inputClass} placeholder="e.g. Agent Craft Workshop" />
            <datalist id="event-titles">
              {events.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Event date">
              <input value={details.event_date} onChange={(e) => setDetails({ ...details, event_date: e.target.value })} className={inputClass} placeholder="23 March 2026" />
            </Field>
            <Field label="Certificate of">
              <select value={details.kind} onChange={(e) => setDetails({ ...details, kind: e.target.value })} className={inputClass}>
                {KINDS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </Field>
          </div>
          {usingTemplate ? (
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
              Signatures, names and positions come from the selected design. Each certificate prints the recipient&apos;s name and UID.
            </p>
          ) : (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Signatories</p>
            <div className="space-y-2">
              {details.signatories.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={s.name}
                    onChange={(e) => setDetails({ ...details, signatories: details.signatories.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })}
                    placeholder="Name"
                    className={inputClass}
                  />
                  <input
                    value={s.title}
                    onChange={(e) => setDetails({ ...details, signatories: details.signatories.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })}
                    placeholder="Title"
                    className={inputClass}
                  />
                  {details.signatories.length > 1 && (
                    <Button variant="ghost" type="button" onClick={() => setDetails({ ...details, signatories: details.signatories.filter((_, j) => j !== i) })} aria-label="Remove signatory">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {details.signatories.length < 3 && (
              <Button size="sm" variant="ghost" className="mt-2" onClick={() => setDetails({ ...details, signatories: [...details.signatories, { name: "", title: "" }] })}>
                <Plus className="w-3.5 h-3.5" /> Add signatory
              </Button>
            )}
          </div>
          )}
          <Button onClick={preview} disabled={!detailsValid}>
            <Eye className="w-4 h-4" /> Preview PDF
          </Button>
        </Card>

        <Card className="p-5 space-y-4">
          <h2 className="font-bold">2. Recipients</h2>
          <div className="flex flex-wrap gap-2">
            {sources.map((s) => (
              <Button key={s.table} size="sm" onClick={() => importFrom(s.table)}>
                <Users className="w-3.5 h-3.5" /> Import {s.label}
              </Button>
            ))}
          </div>
          <Field label="One per line: Name, UID, email" hint="UID is optional: Name, email also works">
            <textarea
              rows={10}
              value={recipientsText}
              onChange={(e) => setRecipientsText(e.target.value)}
              placeholder={"Asha Verma, 23BCS10001, asha@example.com\nRohan Gill, 23BCS10002, rohan@example.com"}
              className={`${inputClass} font-mono text-xs`}
            />
          </Field>
          <p className="text-xs text-slate-500">
            {recipients.length} recipient{recipients.length === 1 ? "" : "s"}
            {bad.length > 0 && <span className="text-red-600"> · {bad.length} line(s) not understood: {bad.slice(0, 2).join(" | ")}</span>}
          </p>
          {progress && (
            <div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {progress.done} / {progress.total} processed{progress.failed.length ? ` · ${progress.failed.length} failed` : ""}
              </p>
              {progress.failed.length > 0 && (
                <ul className="mt-2 text-xs text-red-600 max-h-24 overflow-y-auto">
                  {progress.failed.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" disabled={!detailsValid || !recipients.length || busy || !emailConfigured} onClick={() => issue(true)}>
              <Mail className="w-4 h-4" /> Generate & email {recipients.length || ""}
            </Button>
            <Button disabled={!detailsValid || !recipients.length || busy} onClick={() => issue(false)}>
              Issue without email
            </Button>
          </div>
        </Card>
      </div>

      <h2 className="text-lg font-black mb-3">Recently issued</h2>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Recipient</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Emailed</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recent.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold">{c.recipient_name}</p>
                  <p className="text-xs text-slate-500">
                    {c.recipient_uid ? `${c.recipient_uid} · ` : ""}
                    {c.recipient_email}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs">
                  {c.event_title} <span className="text-slate-400">· {c.kind}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{c.emailed_at ? formatDateTime(c.emailed_at) : "Not emailed"}</td>
                <td className="px-4 py-3 text-right">
                  <a href={`/api/admin/certificates?id=${c.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </a>
                </td>
              </tr>
            ))}
            {!recent.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No certificates issued yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
