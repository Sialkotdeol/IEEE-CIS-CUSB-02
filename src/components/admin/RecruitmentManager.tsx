"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { api, Button, Card, Field, inputClass, PageHeader, run } from "@/components/admin/ui";
import { POSITION_CATEGORIES, isApplicationWindowOpen, type Position, type RecruitmentSettings } from "@/data/positions";

type Role = Position & { is_active: boolean };
type Draft = Omit<Role, "responsibilities"> & { responsibilities: string; sort_order: number; isNew: boolean };

const blank = (order: number): Draft => ({
  id: "",
  title: "",
  category: "Technical",
  openings: 1,
  summary: "",
  responsibilities: "",
  eligibility: "",
  is_active: true,
  sort_order: order,
  isNew: true,
});

/** ISO timestamp → value for <input type="datetime-local"> in India time. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 5.5 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 16);
}

export default function RecruitmentManager({
  settings: initial,
  positions,
  applicantCounts,
  canEdit,
}: {
  settings: RecruitmentSettings;
  positions: Role[];
  applicantCounts: Record<string, number>;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [deadlineInput, setDeadlineInput] = useState(toLocalInput(initial.deadline));
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const saveSettings = async (next: RecruitmentSettings) => {
    setSaving(true);
    const ok = await run(() => api("/api/admin/recruitment", { method: "PUT", body: next }), next.open !== settings.open ? (next.open ? "Applications opened" : "Applications closed") : "Saved");
    setSaving(false);
    if (ok) {
      setSettings(next);
      router.refresh();
    }
  };

  const deadlineIso = deadlineInput ? new Date(`${deadlineInput}:00+05:30`).toISOString().replace(".000Z", "+00:00") : null;
  const live = isApplicationWindowOpen(settings);

  const saveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const { isNew, ...role } = draft;
    const body = {
      ...role,
      id: isNew ? role.id || role.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : role.id,
      responsibilities: role.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    const ok = await run(() => api("/api/admin/positions", { method: "PUT", body }), isNew ? "Role added" : "Role updated");
    if (ok) {
      setDraft(null);
      router.refresh();
    }
  };

  const toggleActive = async (p: Role, i: number) => {
    await run(() => api("/api/admin/positions", { method: "PUT", body: { ...p, is_active: !p.is_active, sort_order: i } }), p.is_active ? "Role hidden" : "Role visible");
    router.refresh();
  };

  const remove = async (p: Role) => {
    if (!window.confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    await run(() => api(`/api/admin/positions?id=${p.id}`, { method: "DELETE" }), "Role deleted");
    router.refresh();
  };

  return (
    <>
      <PageHeader
        title="Roles & applications window"
        description="Changes go live on the public Call for Positions page within a few seconds."
        actions={
          <a href="/call-for-positions" target="_blank" rel="noopener noreferrer">
            <Button>
              View public page <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        }
      />

      {!canEdit && <div className="mb-6 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl px-4 py-3 text-sm">Only owners can change these settings.</div>}

      <Card className="p-5 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Applications are</p>
            <p className={`text-2xl font-black ${live ? "text-emerald-600" : "text-slate-500"}`}>{live ? "Open" : "Closed"}</p>
            {settings.open && !live && <p className="text-xs text-amber-600 mt-1">Switched on, but the deadline has passed.</p>}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.open}
            disabled={!canEdit || saving}
            onClick={() => saveSettings({ ...settings, open: !settings.open })}
            className={`relative w-16 h-9 rounded-full transition-colors disabled:opacity-50 ${settings.open ? "bg-emerald-500" : "bg-slate-300"}`}
          >
            <span className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow transition-transform ${settings.open ? "translate-x-7" : ""}`} />
            <span className="sr-only">Accept applications</span>
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveSettings({ ...settings, deadline: deadlineIso });
          }}
          className="grid sm:grid-cols-[1fr_1fr_auto] gap-4 items-end mt-6 pt-6 border-t border-slate-100"
        >
          <Field label="Deadline (IST)" hint="Leave empty for no deadline">
            <div className="flex gap-2">
              <input type="datetime-local" value={deadlineInput} onChange={(e) => setDeadlineInput(e.target.value)} disabled={!canEdit} className={inputClass} />
              {deadlineInput && canEdit && (
                <Button type="button" variant="ghost" onClick={() => setDeadlineInput("")}>
                  Clear
                </Button>
              )}
            </div>
          </Field>
          <Field label="Tenure label">
            <input value={settings.tenure} onChange={(e) => setSettings({ ...settings, tenure: e.target.value })} disabled={!canEdit} className={inputClass} />
          </Field>
          <Button variant="primary" type="submit" disabled={!canEdit || saving}>
            Save
          </Button>
        </form>
      </Card>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-black">Roles ({positions.filter((p) => p.is_active).length} visible)</h2>
        {canEdit && (
          <Button variant="primary" onClick={() => setDraft(blank(positions.length))}>
            <Plus className="w-4 h-4" /> Add role
          </Button>
        )}
      </div>

      {draft && (
        <Card className="p-5 mb-4 border-primary/40">
          <form onSubmit={saveRole} className="grid md:grid-cols-2 gap-4">
            <Field label="Title">
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputClass} placeholder="e.g. Research Lead" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Category">
                <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Role["category"] })} className={inputClass}>
                  {POSITION_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Openings">
                <input type="number" min={1} max={50} value={draft.openings} onChange={(e) => setDraft({ ...draft, openings: Number(e.target.value) })} className={inputClass} />
              </Field>
              <Field label="Order">
                <input type="number" min={0} value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} className={inputClass} />
              </Field>
            </div>
            <Field label="Summary" className="md:col-span-2">
              <input value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} maxLength={400} className={inputClass} />
            </Field>
            <Field label="Responsibilities" hint="One per line">
              <textarea rows={4} value={draft.responsibilities} onChange={(e) => setDraft({ ...draft, responsibilities: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Eligibility">
              <textarea rows={4} value={draft.eligibility} onChange={(e) => setDraft({ ...draft, eligibility: e.target.value })} maxLength={300} className={inputClass} />
            </Field>
            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} className="accent-[#00629b]" />
                Visible on the public page
              </label>
              <div className="flex gap-2">
                <Button type="button" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {draft.isNew ? "Add role" : "Save role"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      <Card className="divide-y divide-slate-100">
        {positions.map((p, i) => (
          <div key={p.id} className={`p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${p.is_active ? "" : "bg-slate-50/80"}`}>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className={`font-bold ${p.is_active ? "text-slate-900" : "text-slate-400 line-through"}`}>{p.title}</p>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{p.category}</span>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{p.openings} open</span>
                {!p.is_active && <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Hidden</span>}
              </div>
              <p className="text-sm text-slate-500 truncate">{p.summary}</p>
            </div>
            <p className="text-xs text-slate-500 shrink-0">{applicantCounts[p.id] || 0} applicants</p>
            {canEdit && (
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => setDraft({ ...p, responsibilities: p.responsibilities.join("\n"), sort_order: i, isNew: false })}>
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleActive(p, i)}>
                  <EyeOff className="w-3.5 h-3.5" /> {p.is_active ? "Hide" : "Show"}
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(p)} disabled={Boolean(applicantCounts[p.id])} title={applicantCounts[p.id] ? "Has applicants — hide instead" : "Delete"}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
        {!positions.length && <p className="p-6 text-sm text-slate-500">No roles yet.</p>}
      </Card>
    </>
  );
}
