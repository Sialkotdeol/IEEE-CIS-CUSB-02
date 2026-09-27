"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { api, Button, Card, Field, inputClass, PageHeader, run } from "@/components/admin/ui";
import { timeAgo } from "@/lib/format";

interface Member {
  email: string;
  name: string;
  role: "owner" | "reviewer";
  disabled: boolean;
  added_by: string | null;
  created_at: string;
  has_password: boolean;
}

export default function TeamManager({ members, lastSeen, me, locked }: { members: Member[]; lastSeen: Record<string, string>; me: string; locked: string[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", name: "", role: "reviewer" as Member["role"] });
  const [pwFor, setPwFor] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const save = async (m: Pick<Member, "email" | "name" | "role" | "disabled">, msg: string) => {
    const ok = await run(() => api("/api/admin/team", { method: "POST", body: m }), msg);
    if (ok) router.refresh();
    return ok;
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await save({ ...form, disabled: false }, `${form.email} added`)) setForm({ email: "", name: "", role: "reviewer" });
  };

  const remove = async (m: Member) => {
    if (!window.confirm(`Remove ${m.email} from the admin team? They'll be signed out everywhere.`)) return;
    const ok = await run(() => api(`/api/admin/team?email=${encodeURIComponent(m.email)}`, { method: "DELETE" }), "Removed");
    if (ok) router.refresh();
  };

  const setPw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwFor) return;
    const res = await run(() => api("/api/admin/team", { method: "PUT", body: { email: pwFor, password } }));
    if (res) {
      window.alert(`Password set for ${pwFor}. Share it with them privately — they can change it under Sessions & account.`);
      router.refresh();
      setPwFor(null);
      setPassword("");
    }
  };

  return (
    <>
      <PageHeader
        title="Team"
        description="Logins are stored in the admin_users table in Supabase. Add someone here, then Set password to let them sign in."
      />

      <Card className="p-5 mb-6">
        <form onSubmit={add} className="grid sm:grid-cols-[2fr_1.5fr_1fr_auto] gap-3 items-end">
          <Field label="Email">
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="teammate@gmail.com" />
          </Field>
          <Field label="Name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Role">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Member["role"] })} className={inputClass}>
              <option value="reviewer">Reviewer</option>
              <option value="owner">Owner</option>
            </select>
          </Field>
          <Button variant="primary" type="submit">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </form>
        <p className="text-xs text-slate-500 mt-3">
          <b>Reviewers</b> can review and score applicants, manage events, certificates and feedback. <b>Owners</b> can also change roles and the applications
          window, manage the team, delete things, and see the activity log.
        </p>
      </Card>

      {pwFor && (
        <Card className="p-5 mb-6 border-primary/40">
          <form onSubmit={setPw} className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <Field label={`Password for ${pwFor}`} hint="At least 8 characters. Their other sessions will be signed out." className="flex-1">
              <input type="text" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete="off" />
            </Field>
            <div className="flex gap-2">
              <Button type="button" onClick={() => setPwFor(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Set password
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="divide-y divide-slate-100">
        {members.map((m) => {
          const fixed = m.email === me || locked.includes(m.email);
          return (
            <div key={m.email} className={`p-4 flex flex-col md:flex-row md:items-center gap-3 ${m.disabled ? "opacity-60" : ""}`}>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">
                  {m.name || m.email.split("@")[0]} {m.email === me && <span className="text-xs font-semibold text-slate-400">(you)</span>}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {m.email} · {!m.has_password ? <span className="text-amber-600 font-semibold">no password yet</span> : lastSeen[m.email] ? `active ${timeAgo(lastSeen[m.email])}` : "not signed in"}
                  {locked.includes(m.email) && " · set in ADMIN_EMAILS"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <select
                  value={m.role}
                  disabled={fixed}
                  onChange={(e) => save({ ...m, role: e.target.value as Member["role"] }, "Role updated")}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white disabled:opacity-60"
                  aria-label={`Role for ${m.email}`}
                >
                  <option value="reviewer">Reviewer</option>
                  <option value="owner">Owner</option>
                </select>
                <Button size="sm" disabled={fixed} onClick={() => save({ ...m, disabled: !m.disabled }, m.disabled ? "Access restored" : "Access paused")}>
                  {m.disabled ? "Enable" : "Pause access"}
                </Button>
                <Button size="sm" onClick={() => setPwFor(m.email)}>
                  <KeyRound className="w-3.5 h-3.5" /> Set password
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" disabled={fixed} onClick={() => remove(m)} aria-label={`Remove ${m.email}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}
