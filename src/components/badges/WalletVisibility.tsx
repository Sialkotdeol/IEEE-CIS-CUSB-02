"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function WalletVisibility({ token, initialPublic, walletUrl }: { token: string; initialPublic: boolean; walletUrl: string }) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/badges/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, is_public: !isPublic }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save");
      setIsPublic(!isPublic);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          {isPublic ? <Eye className="w-5 h-5 text-emerald-600" /> : <EyeOff className="w-5 h-5 text-slate-500" />}
          <div>
            <p className="font-bold">{isPublic ? "Public" : "Private"}</p>
            <p className="text-xs text-slate-500">{isPublic ? "Anyone with your link can see your wallet." : "Your wallet link shows 'not found'."}</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          aria-label="Wallet is public"
          onClick={toggle}
          disabled={saving}
          className={`relative w-14 h-8 rounded-full transition-colors shrink-0 disabled:opacity-60 ${isPublic ? "bg-emerald-500" : "bg-slate-300"}`}
        >
          <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform flex items-center justify-center ${isPublic ? "translate-x-6" : ""}`}>
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
          </span>
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      {isPublic && (
        <a href={walletUrl} className="inline-block mt-4 text-sm font-bold text-primary hover:underline">
          Open my wallet →
        </a>
      )}
    </div>
  );
}
