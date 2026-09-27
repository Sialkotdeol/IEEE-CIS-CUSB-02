"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api, Button, Field, inputClass } from "@/components/admin/ui";
import BadgeMedal from "@/components/badges/BadgeMedal";

export interface BadgeDraft {
  title: string;
  event_slug: string;
  description: string;
  image_path: string | null;
  image_url: string | null;
  focus_x: number;
  focus_y: number;
  zoom: number;
}

/** Create / edit a badge: upload the event poster and choose which part sits in the circle. */
export default function BadgeForm({
  initial,
  events,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: BadgeDraft;
  events: { slug: string; title: string }[];
  submitLabel: string;
  onSubmit: (d: BadgeDraft) => Promise<void>;
  onCancel?: () => void;
}) {
  const [d, setD] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      if (!["image/png", "image/jpeg"].includes(file.type)) throw new Error("Use a PNG or JPG poster");
      if (file.size > 10 * 1024 * 1024) throw new Error("Poster is over 10 MB");
      const { path, token, url } = await api<{ path: string; token: string; url: string }>("/api/admin/badges", {
        method: "POST",
        body: { action: "sign", contentType: file.type },
      });
      const { error } = await supabase.storage.from("badges").uploadToSignedUrl(path, token, file, { contentType: file.type });
      if (error) throw new Error(error.message);
      setD((x) => ({ ...x, image_path: path, image_url: url, focus_x: 0.5, focus_y: 0.5, zoom: 1 }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
  };

  const pickFocus = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setD((x) => ({
      ...x,
      focus_x: Math.round(((e.clientX - r.left) / r.width) * 100) / 100,
      focus_y: Math.round(((e.clientY - r.top) / r.height) * 100) / 100,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(d);
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Badge name">
            <input
              required
              value={d.title}
              onChange={(e) => setD({ ...d, title: e.target.value })}
              maxLength={80}
              className={inputClass}
              placeholder="e.g. Agent Craft 2026"
            />
          </Field>
          <Field label="Event">
            <select
              value={d.event_slug}
              onChange={(e) => {
                const ev = events.find((x) => x.slug === e.target.value);
                setD({ ...d, event_slug: e.target.value, title: d.title || ev?.title || "" });
              }}
              className={inputClass}
            >
              <option value="">Not linked to an event</option>
              {events.map((ev) => (
                <option key={ev.slug} value={ev.slug}>
                  {ev.title}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="What it's for" hint="Shown on the badge page, e.g. 'Awarded for completing the hands-on AI agents workshop.'">
          <textarea rows={2} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} maxLength={500} className={inputClass} />
        </Field>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Event poster</p>
          {d.image_url ? (
            <>
              <p className="text-xs text-slate-500 mb-2">Click the part of the poster that should be in the centre of the badge.</p>
              <div className="relative inline-block max-w-full cursor-crosshair rounded-lg overflow-hidden border border-slate-200" onClick={pickFocus}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.image_url} alt="Poster" className="max-h-72 w-auto block" draggable={false} />
                <div
                  className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white ring-2 ring-primary pointer-events-none"
                  style={{ left: `${d.focus_x * 100}%`, top: `${d.focus_y * 100}%` }}
                />
              </div>
              <Field label={`Zoom · ${d.zoom.toFixed(1)}×`} className="mt-3 max-w-xs">
                <input type="range" min={1} max={3} step={0.05} value={d.zoom} onChange={(e) => setD({ ...d, zoom: Number(e.target.value) })} className="w-full accent-[#00629b]" />
              </Field>
            </>
          ) : null}
          <label className="mt-3 inline-flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {d.image_url ? "Replace poster" : "Upload poster (PNG or JPG)"}
            <input type="file" accept="image/png,image/jpeg" className="sr-only" disabled={uploading} onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          {onCancel && (
            <Button type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button variant="primary" type="submit" disabled={saving || uploading || d.title.trim().length < 2}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {submitLabel}
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-5 self-start">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Preview</p>
        <BadgeMedal badge={{ id: "preview", title: d.title || "Badge name", image_url: d.image_url, focus_x: d.focus_x, focus_y: d.focus_y, zoom: d.zoom }} size={200} />
        <BadgeMedal badge={{ id: "preview-sm", title: d.title || "Badge name", image_url: d.image_url, focus_x: d.focus_x, focus_y: d.focus_y, zoom: d.zoom }} size={72} />
        <p className="text-xs text-slate-400 text-center">Large on badge pages, small in wallets.</p>
      </div>
    </form>
  );
}
