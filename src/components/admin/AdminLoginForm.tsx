"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { inputClass } from "@/components/admin/ui";

// Email + password checked against the admin_users table in Supabase.

export default function AdminLoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Sign-in failed");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-12 pixel-grid-bg">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-cyan-400 to-primary" />
        <div className="text-center mb-8">
          <Image src="/CIS_Logo_removed_bg.png" alt="IEEE CIS" width={64} height={64} className="w-16 h-16 mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-black text-slate-900">Admin portal</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in with your team email and password</p>
        </div>

        {!configured ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm flex gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              The portal isn&apos;t configured. Set <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>SUPABASE_SERVICE_ROLE_KEY</code> and{" "}
              <code>ADMIN_JWT_SECRET</code>.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl flex items-start gap-2 text-sm" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={signIn} className="space-y-3">
              <input type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              <input type="password" required autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
              <button type="submit" disabled={busy} className="w-full bg-primary hover:bg-[#00527f] text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 flex justify-center">
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
              </button>
            </form>
            <p className="mt-5 text-center text-xs text-slate-400">Forgot your password? Ask a portal owner to reset it.</p>
          </>
        )}
      </div>
    </div>
  );
}
