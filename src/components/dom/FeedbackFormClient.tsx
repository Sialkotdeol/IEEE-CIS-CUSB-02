"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Lock, Star } from "lucide-react";
import type { Question } from "@/lib/feedback";

const inputClass =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white transition-colors";

export default function FeedbackFormClient({
  form,
}: {
  form: { id: string; title: string; description: string; questions: Question[]; is_open: boolean };
}) {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const set = (id: string, v: string | number) => setAnswers((a) => ({ ...a, [id]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = form.questions.find((q) => q.required && (answers[q.id] === undefined || answers[q.id] === ""));
    if (missing) {
      setError(`Please answer: ${missing.label}`);
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/feedback/${form.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, answers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not submit");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-[100dvh] pixel-grid-bg px-4 py-12 sm:py-20">
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-cyan-400 to-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">IEEE CIS CUSB · Feedback</p>
        <h1 className="text-3xl font-black text-slate-900 mb-2">{form.title}</h1>
        {form.description && <p className="text-slate-500 mb-8">{form.description}</p>}

        {!form.is_open ? (
          <div className="text-center py-10">
            <Lock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="font-bold text-slate-700">This form is no longer accepting responses.</p>
          </div>
        ) : status === "done" ? (
          <div className="text-center py-10">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Thank you!</h2>
            <p className="text-slate-600 mb-6">Your feedback helps us make the next event better.</p>
            <Link href="/" className="text-primary font-bold text-sm hover:underline">
              Back to IEEE CIS CUSB
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-7">
            {status === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 text-sm" role="alert">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
            {form.questions.map((q) => (
              <fieldset key={q.id}>
                <legend className="font-semibold text-slate-800 mb-2">
                  {q.label} {q.required && <span className="text-red-500">*</span>}
                </legend>
                {q.type === "rating" && (
                  <div className="flex gap-1.5" role="radiogroup" aria-label={q.label}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={answers[q.id] === n}
                        aria-label={`${n} out of 5`}
                        onClick={() => set(q.id, n)}
                        className="p-1"
                      >
                        <Star className={`w-8 h-8 transition-colors ${Number(answers[q.id] || 0) >= n ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-300"}`} />
                      </button>
                    ))}
                  </div>
                )}
                {q.type === "choice" && (
                  <div className="flex flex-wrap gap-2">
                    {(q.options || []).map((o) => (
                      <label
                        key={o}
                        className={`px-4 py-2 rounded-full border text-sm font-semibold cursor-pointer transition-colors ${
                          answers[q.id] === o ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200 hover:border-primary/40"
                        }`}
                      >
                        <input type="radio" name={q.id} value={o} checked={answers[q.id] === o} onChange={() => set(q.id, o)} className="sr-only" />
                        {o}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "text" && (
                  <textarea rows={3} maxLength={2000} value={String(answers[q.id] ?? "")} onChange={(e) => set(q.id, e.target.value)} className={inputClass} />
                )}
              </fieldset>
            ))}

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Name (optional)</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className={inputClass} />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Email (optional)</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </label>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-primary hover:bg-[#00527f] text-white font-black py-4 rounded-xl transition-colors flex justify-center disabled:opacity-50 uppercase tracking-wider text-sm"
            >
              {status === "loading" ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
