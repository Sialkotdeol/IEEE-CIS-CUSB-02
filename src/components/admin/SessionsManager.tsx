"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Laptop, LogOut, Smartphone } from "lucide-react";
import { api, Button, Card, Field, inputClass, PageHeader, run } from "@/components/admin/ui";
import { describeDevice, formatDateTime, timeAgo } from "@/lib/format";

interface Session {
  id: string;
  admin_email: string;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  user_agent: string | null;
  ip: string | null;
}

export default function SessionsManager({
  sessions,
  currentId,
  me,
}: {
  sessions: Session[];
  currentId: string;
  me: { email: string; name: string; role: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(me.name);
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const mine = sessions.filter((s) => s.admin_email === me.email);
  const others = sessions.filter((s) => s.admin_email !== me.email);

  const revoke = async (s: Session) => {
    const self = s.id === currentId;
    if (self && !window.confirm("Sign out of this device?")) return;
    const res = await run(() => api<{ self: boolean }>("/api/admin/sessions", { method: "POST", body: { action: "revoke", id: s.id } }), "Signed out");
    if (res?.self) window.location.assign("/admin/login");
    else if (res) router.refresh();
  };

  const revokeOthers = async () => {
    const res = await run(() => api<{ revoked: number }>("/api/admin/sessions", { method: "POST", body: { action: "revoke-others" } }));
    if (res) {
      router.refresh();
      window.alert(`Signed out of ${res.revoked} other device${res.revoked === 1 ? "" : "s"}.`);
    }
  };

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await run(() => api("/api/admin/account", { method: "PUT", body: { name } }), "Name updated");
    if (ok) router.refresh();
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await run(
      () => api("/api/admin/account", { method: "PUT", body: { current_password: currentPassword, password } }),
      "Password changed — your other devices were signed out"
    );
    if (ok) {
      setPassword("");
      setCurrentPassword("");
      router.refresh();
    }
  };

  const item = (s: Session) => {
    const mobile = /iPhone|iPad|Android/.test(s.user_agent || "");
    const Icon = mobile ? Smartphone : Laptop;
    return (
      <div key={s.id} className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            {describeDevice(s.user_agent)}{" "}
            {s.id === currentId && <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded ml-1">This device</span>}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {s.admin_email !== me.email && <b>{s.admin_email} · </b>}
            Active {timeAgo(s.last_seen_at)} · signed in {formatDateTime(s.created_at)}
            {s.ip && ` · ${s.ip}`}
          </p>
        </div>
        <Button size="sm" variant={s.id === currentId ? "ghost" : "danger"} onClick={() => revoke(s)}>
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </Button>
      </div>
    );
  };

  return (
    <>
      <PageHeader title="Sessions & account" description="See where you're signed in and sign out devices you don't recognise." />

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-black">Your devices</h2>
        {mine.length > 1 && (
          <Button variant="danger" onClick={revokeOthers}>
            Sign out all other devices
          </Button>
        )}
      </div>
      <Card className="divide-y divide-slate-100 mb-8">{mine.map(item)}</Card>

      {me.role === "owner" && others.length > 0 && (
        <>
          <h2 className="text-lg font-black mb-3">Other team members</h2>
          <Card className="divide-y divide-slate-100 mb-8">{others.map(item)}</Card>
        </>
      )}

      <h2 className="text-lg font-black mb-3">Account</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-5">
          <form onSubmit={saveName} className="space-y-3">
            <Field label="Display name" hint={me.email}>
              <input required value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass} />
            </Field>
            <Button variant="primary" type="submit">
              Save name
            </Button>
          </form>
        </Card>
        <Card className="p-5">
          <form onSubmit={savePassword} className="space-y-3">
            <Field label="Current password">
              <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" className={inputClass} />
            </Field>
            <Field label="New password" hint="At least 8 characters. Your other devices will be signed out.">
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className={inputClass} />
            </Field>
            <Button variant="primary" type="submit" disabled={!currentPassword || password.length < 8}>
              Change password
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
