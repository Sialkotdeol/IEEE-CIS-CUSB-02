"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function FindWallet() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ status: "idle" | "loading" | "done" | "error"; message?: string }>({ status: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/badges/find-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setState({ status: "done", message: data.message });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Something went wrong" });
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
      />
      <button type="submit" disabled={state.status === "loading"} className="px-6 py-3 rounded-full bg-primary hover:bg-[#00527f] text-white font-bold disabled:opacity-50 flex items-center justify-center">
        {state.status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Email my wallet link"}
      </button>
      {state.message && (
        <p className={`sm:basis-full text-sm mt-2 ${state.status === "error" ? "text-red-600" : "text-emerald-700"}`} role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
