"use client";

import React from "react";
import { toast } from "sonner";

// Small building blocks shared by portal screens.

export async function api<T = unknown>(url: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(url, {
    method: init.method || "GET",
    headers: init.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.assign("/admin/login");
  }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

/** Runs an API call with a toast on failure (and optionally on success). */
export async function run<T>(fn: () => Promise<T>, success?: string): Promise<T | undefined> {
  try {
    const result = await fn();
    if (success) toast.success(success);
    return result;
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Something went wrong");
    return undefined;
  }
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}>{children}</div>;
}

const BUTTON_STYLES = {
  primary: "bg-primary hover:bg-[#00527f] text-white border-primary",
  secondary: "bg-white hover:bg-slate-50 text-slate-700 border-slate-200",
  danger: "bg-white hover:bg-red-50 text-red-600 border-red-200",
  ghost: "bg-transparent hover:bg-slate-100 text-slate-600 border-transparent",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BUTTON_STYLES; size?: "sm" | "md" }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none ${
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm"
      } ${BUTTON_STYLES[variant]} ${className}`}
    />
  );
}

export const inputClass =
  "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition";

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  shortlisted: "bg-sky-50 text-sky-700 border-sky-200",
  interview: "bg-amber-50 text-amber-700 border-amber-200",
  selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
      {status}
    </span>
  );
}

export function ScorePill({ value, count }: { value: number | null; count?: number }) {
  if (value === null) return <span className="text-xs text-slate-400">Not scored</span>;
  const tone = value >= 4 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : value >= 3 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold tabular-nums ${tone}`}>
      {value.toFixed(1)}
      <span className="font-normal opacity-70">/5{count !== undefined ? ` · ${count}` : ""}</span>
    </span>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="text-center py-14 px-6">
      <p className="font-bold text-slate-700">{title}</p>
      {children && <div className="text-sm text-slate-500 mt-1">{children}</div>}
    </div>
  );
}
