"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlignCenter, AlignLeft, AlignRight, ArrowLeft, Eye, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api, Button, Card, Field, inputClass, run } from "@/components/admin/ui";
import {
  CSS_FONTS,
  FIELD_LABELS,
  FONTS,
  SAMPLE_VALUES,
  type CertificateTemplate,
  type FieldType,
  type FontName,
  type TemplateField,
} from "@/lib/certificateTemplate";

const newId = () => `f${Math.random().toString(36).slice(2, 10)}`;
const clamp = (n: number) => Math.min(1, Math.max(0, n));
const round = (n: number) => Math.round(n * 10000) / 10000;

const FONT_LABELS: Record<FontName, string> = {
  helvetica: "Sans",
  "helvetica-bold": "Sans bold",
  times: "Serif",
  "times-bold": "Serif bold",
  "times-italic": "Serif italic",
  courier: "Monospace",
};

const ADDABLE: FieldType[] = ["name", "uid", "signature", "text", "event", "date", "certid"];

export default function TemplateEditor({
  template,
  imageUrl,
  assetUrls,
}: {
  template: CertificateTemplate;
  imageUrl: string;
  assetUrls: Record<string, string>;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; startX: number; startY: number; fx: number; fy: number } | null>(null);
  const [fields, setFields] = useState<TemplateField[]>(template.fields);
  const [name, setName] = useState(template.name);
  const [selectedId, setSelectedId] = useState<string | null>(template.fields[0]?.id ?? null);
  const [sampleName, setSampleName] = useState(SAMPLE_VALUES.name);
  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});
  const [canvas, setCanvas] = useState({ w: 0, h: 0 });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const selected = fields.find((f) => f.id === selectedId) || null;

  // Text size is a fraction of the image height, so track the rendered height.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCanvas({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (id: string, patch: Partial<TemplateField>) => {
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    setDirty(true);
  };

  const add = (type: FieldType) => {
    const f: TemplateField = {
      id: newId(),
      type,
      x: 0.5,
      y: type === "signature" ? 0.8 : 0.4,
      size: type === "name" ? 0.06 : 0.025,
      font: type === "name" ? "times-bold" : "helvetica",
      color: "#1e293b",
      align: "center",
      max_width: type === "name" ? 0.7 : 0.5,
      width: 0.15,
      ...(type === "text" && { text: "Signatory name" }),
    };
    setFields((fs) => [...fs, f]);
    setSelectedId(f.id);
    setDirty(true);
  };

  const remove = (id: string) => {
    setFields((fs) => fs.filter((f) => f.id !== id));
    setSelectedId(null);
    setDirty(true);
  };

  const onPointerDown = (e: React.PointerEvent, f: TemplateField) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setSelectedId(f.id);
    drag.current = { id: f.id, startX: e.clientX, startY: e.clientY, fx: f.x, fy: f.y };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    update(d.id, {
      x: round(clamp(d.fx + (e.clientX - d.startX) / rect.width)),
      y: round(clamp(d.fy + (e.clientY - d.startY) / rect.height)),
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!selected || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const step = e.shiftKey ? 0.01 : 0.002;
    const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
    const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
    update(selected.id, { x: round(clamp(selected.x + dx)), y: round(clamp(selected.y + dy)) });
  };

  const uploadSignature = async (file: File | undefined) => {
    if (!file || !selected) return;
    setUploading(true);
    try {
      if (!["image/png", "image/jpeg"].includes(file.type)) throw new Error("Use a PNG (transparent background works best) or JPG");
      const { path, token } = await api<{ path: string; token: string }>("/api/admin/certificate-templates", {
        method: "POST",
        body: { action: "sign", kind: "signature", contentType: file.type },
      });
      const { error } = await supabase.storage.from("certificate-assets").uploadToSignedUrl(path, token, file, { contentType: file.type });
      if (error) throw new Error(error.message);
      setLocalUrls((u) => ({ ...u, [path]: URL.createObjectURL(file) }));
      update(selected.id, { image_path: path });
      toast.success("Signature uploaded — drag it into place, then save");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    const ok = await run(() => api("/api/admin/certificate-templates", { method: "PATCH", body: { id: template.id, name, fields } }), "Design saved");
    setSaving(false);
    if (ok) {
      setDirty(false);
      router.refresh();
    }
    return Boolean(ok);
  };

  const preview = async () => {
    if (dirty && !(await save())) return;
    const d = encodeURIComponent(JSON.stringify({ template_id: template.id, event_title: SAMPLE_VALUES.event, event_date: SAMPLE_VALUES.date, kind: "Participation" }));
    window.open(`/api/admin/certificates?d=${d}&name=${encodeURIComponent(sampleName)}&uid=${SAMPLE_VALUES.uid}`, "_blank", "noopener");
  };

  const sampleText = (f: TemplateField) => (f.type === "name" ? sampleName : f.type === "text" ? f.text || "" : f.type === "signature" ? "" : SAMPLE_VALUES[f.type]);
  const imgFor = (path?: string) => (path ? localUrls[path] || assetUrls[path] : undefined);
  const anchor = (align: string) => (align === "left" ? "translate(0,-50%)" : align === "right" ? "translate(-100%,-50%)" : "translate(-50%,-50%)");

  return (
    <>
      <Link href="/admin/certificates/templates" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> All designs
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setDirty(true);
          }}
          className="text-2xl font-black bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none"
          aria-label="Design name"
        />
        <div className="flex gap-2">
          <Button onClick={preview}>
            <Eye className="w-4 h-4" /> Preview PDF
          </Button>
          <Button variant="primary" onClick={save} disabled={saving || !dirty}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {dirty ? "Save" : "Saved"}
          </Button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_320px] gap-6 items-start">
        <div>
          <p className="text-xs text-slate-500 mb-2">Drag fields to position them. Arrow keys nudge the selected field (hold Shift for bigger steps).</p>
          <div
            ref={canvasRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (drag.current = null)}
            onPointerDown={() => setSelectedId(null)}
            className="relative w-full select-none touch-none rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ aspectRatio: `${template.width} / ${template.height}` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {imageUrl && <img src={imageUrl} alt="Certificate design" className="absolute inset-0 w-full h-full object-fill pointer-events-none" draggable={false} />}

            {fields.map((f) => {
              const isSel = f.id === selectedId;
              const base = { left: `${f.x * 100}%`, top: `${f.y * 100}%` };
              if (f.type === "signature") {
                const src = imgFor(f.image_path);
                return (
                  <div
                    key={f.id}
                    onPointerDown={(e) => onPointerDown(e, f)}
                    className={`absolute cursor-move ${isSel ? "ring-2 ring-primary" : "ring-1 ring-dashed ring-primary/40 hover:ring-primary/70"}`}
                    style={{ ...base, width: `${f.width * 100}%`, transform: "translate(-50%,-50%)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {src ? <img src={src} alt="Signature" className="w-full h-auto pointer-events-none" draggable={false} /> : (
                      <div className="aspect-[3/1] bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">Signature</div>
                    )}
                  </div>
                );
              }
              const css = CSS_FONTS[f.font];
              return (
                <div key={f.id} className="absolute" style={{ ...base, transform: anchor(f.align) }}>
                  {isSel && (
                    <div
                      className="absolute top-1/2 border-t border-dashed border-primary/50 pointer-events-none"
                      style={{
                        width: `${f.max_width * canvas.w}px`,
                        left: f.align === "left" ? 0 : f.align === "right" ? "auto" : "50%",
                        right: f.align === "right" ? 0 : "auto",
                        transform: f.align === "center" ? "translateX(-50%)" : undefined,
                      }}
                    />
                  )}
                  <span
                    onPointerDown={(e) => onPointerDown(e, f)}
                    className={`relative block whitespace-nowrap cursor-move px-0.5 ${isSel ? "outline outline-2 outline-primary" : "outline outline-1 outline-dashed outline-primary/30 hover:outline-primary/70"}`}
                    style={{ fontFamily: css.family, fontWeight: css.weight, fontStyle: css.style, fontSize: `${f.size * canvas.h}px`, lineHeight: 1, color: f.color }}
                  >
                    {sampleText(f) || " "}
                  </span>
                </div>
              );
            })}
          </div>
          <Field label="Preview name" hint="Try a long name to check it fits" className="mt-4 max-w-sm">
            <input value={sampleName} onChange={(e) => setSampleName(e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="space-y-4 xl:sticky xl:top-6">
          <Card className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Add a field</p>
            <div className="flex flex-wrap gap-1.5">
              {ADDABLE.map((t) => (
                <Button key={t} size="sm" onClick={() => add(t)}>
                  <Plus className="w-3 h-3" /> {FIELD_LABELS[t]}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            {!selected ? (
              <p className="text-sm text-slate-500">Select a field on the design to edit it.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{FIELD_LABELS[selected.type]}</p>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(selected.id)}>
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </Button>
                </div>

                {selected.type === "signature" ? (
                  <>
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:border-primary text-sm font-semibold text-slate-600">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {selected.image_path ? "Replace signature image" : "Upload signature image"}
                      <input type="file" accept="image/png,image/jpeg" className="sr-only" disabled={uploading} onChange={(e) => uploadSignature(e.target.files?.[0])} />
                    </label>
                    <p className="text-xs text-slate-400">PNG with a transparent background looks best.</p>
                    <Field label={`Width · ${Math.round(selected.width * 100)}% of design`}>
                      <input type="range" min={0.04} max={0.5} step={0.005} value={selected.width} onChange={(e) => update(selected.id, { width: Number(e.target.value) })} className="w-full accent-[#00629b]" />
                    </Field>
                  </>
                ) : (
                  <>
                    {selected.type === "text" && (
                      <Field label="Text">
                        <input value={selected.text || ""} maxLength={120} onChange={(e) => update(selected.id, { text: e.target.value })} className={inputClass} />
                      </Field>
                    )}
                    <Field label="Font">
                      <select value={selected.font} onChange={(e) => update(selected.id, { font: e.target.value as FontName })} className={inputClass}>
                        {FONTS.map((f) => (
                          <option key={f} value={f}>
                            {FONT_LABELS[f]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={`Size · ${(selected.size * 100).toFixed(1)}% of height`}>
                      <input type="range" min={0.008} max={0.15} step={0.001} value={selected.size} onChange={(e) => update(selected.id, { size: Number(e.target.value) })} className="w-full accent-[#00629b]" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Colour">
                        <input type="color" value={selected.color} onChange={(e) => update(selected.id, { color: e.target.value })} className="h-9 w-full rounded-lg border border-slate-200 bg-white p-1" />
                      </Field>
                      <Field label="Align">
                        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
                          {([
                            ["left", AlignLeft],
                            ["center", AlignCenter],
                            ["right", AlignRight],
                          ] as const).map(([a, Icon]) => (
                            <button
                              key={a}
                              type="button"
                              onClick={() => update(selected.id, { align: a })}
                              className={`flex-1 flex justify-center py-1.5 rounded-md ${selected.align === a ? "bg-primary/10 text-primary" : "text-slate-500"}`}
                              aria-label={`Align ${a}`}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </Field>
                    </div>
                    <Field label={`Max width · ${Math.round(selected.max_width * 100)}%`} hint="Longer text shrinks to fit this line (dashed guide)">
                      <input type="range" min={0.1} max={1} step={0.01} value={selected.max_width} onChange={(e) => update(selected.id, { max_width: Number(e.target.value) })} className="w-full accent-[#00629b]" />
                    </Field>
                  </>
                )}
                <p className="text-[11px] text-slate-400 tabular-nums">
                  Position: {(selected.x * 100).toFixed(1)}% across, {(selected.y * 100).toFixed(1)}% down
                </p>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Fields on this design</p>
            <ul className="space-y-1">
              {fields.map((f) => (
                <li key={f.id}>
                  <button
                    onClick={() => setSelectedId(f.id)}
                    className={`w-full text-left text-sm px-2 py-1 rounded-md ${f.id === selectedId ? "bg-primary/10 text-primary font-semibold" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    {FIELD_LABELS[f.type]}
                    {f.type === "text" && f.text ? ` — ${f.text}` : ""}
                    {f.type === "signature" && !f.image_path ? " (no image yet)" : ""}
                  </button>
                </li>
              ))}
              {!fields.length && <li className="text-sm text-slate-400">No fields yet.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
