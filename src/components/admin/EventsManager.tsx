"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, ExternalLink, ImagePlus, Loader2, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api, Button, Card, EmptyState, Field, inputClass, PageHeader, run } from "@/components/admin/ui";

interface ManagedEvent {
  id: string;
  slug: string;
  title: string;
  type: string;
  date_label: string;
  description: string;
  tags: string[];
  link: string | null;
  image_url: string | null;
  location: string;
  status: "upcoming" | "ongoing" | "past";
  archived_at: string | null;
}
interface Photo {
  id: string;
  event_slug: string;
  url: string;
  caption: string | null;
}

const STATUS_TONE = {
  upcoming: "bg-sky-50 text-sky-700 border-sky-200",
  ongoing: "bg-emerald-50 text-emerald-700 border-emerald-200",
  past: "bg-slate-100 text-slate-600 border-slate-200",
};

const EMPTY = { id: "", title: "", type: "event", date_label: "", description: "", tags: "", link: "", status: "ongoing", image_url: "", location: "CU" };

export default function EventsManager({
  events,
  photos,
  archive,
  isOwner,
}: {
  events: ManagedEvent[];
  photos: Photo[];
  archive: { slug: string; title: string; date: string; builtInMedia: number }[];
  isOwner: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<typeof EMPTY | null>(null);
  const [gallery, setGallery] = useState<{ slug: string; title: string } | null>(null);
  const [uploading, setUploading] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const photosFor = (slug: string) => photos.filter((p) => p.event_slug === slug);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const { id, ...rest } = form;
    const fields = { ...rest, tags: rest.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    const ok = await run(
      () =>
        id
          ? api("/api/admin/events", { method: "PATCH", body: { id, action: "update", fields: { ...fields, status: undefined } } })
          : api("/api/admin/events", { method: "POST", body: fields }),
      id ? "Event updated" : "Event created"
    );
    if (ok) {
      setForm(null);
      router.refresh();
    }
  };

  const act = async (ev: ManagedEvent, action: "archive" | "restore") => {
    const ok = await run(
      () => api("/api/admin/events", { method: "PATCH", body: { id: ev.id, action } }),
      action === "archive" ? `${ev.title} moved to Past Events` : `${ev.title} restored`
    );
    if (ok) router.refresh();
  };

  const setStatus = async (ev: ManagedEvent, status: ManagedEvent["status"]) => {
    if (status === "past") return act(ev, "archive");
    const ok = await run(() => api("/api/admin/events", { method: "PATCH", body: { id: ev.id, action: "update", fields: { status } } }), "Updated");
    if (ok) router.refresh();
  };

  const remove = async (ev: ManagedEvent) => {
    if (!window.confirm(`Delete "${ev.title}"? Its uploaded photos stay in storage until removed.`)) return;
    const ok = await run(() => api(`/api/admin/events?id=${ev.id}`, { method: "DELETE" }), "Event deleted");
    if (ok) router.refresh();
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length || !gallery) return;
    const list = Array.from(files);
    setUploading(list.length);
    let done = 0;
    for (const file of list) {
      try {
        if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} is over 10 MB`);
        const { path, token } = await api<{ path: string; token: string }>("/api/admin/events/photos", {
          method: "POST",
          body: { action: "sign", slug: gallery.slug, contentType: file.type },
        });
        const { error } = await supabase.storage.from("event-photos").uploadToSignedUrl(path, token, file, { contentType: file.type });
        if (error) throw new Error(error.message);
        await api("/api/admin/events/photos", { method: "POST", body: { action: "confirm", slug: gallery.slug, path } });
        done++;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Could not upload ${file.name}`);
      }
      setUploading((n) => n - 1);
    }
    if (done) toast.success(`${done} photo${done > 1 ? "s" : ""} uploaded`);
    if (fileInput.current) fileInput.current.value = "";
    router.refresh();
  };

  const deletePhoto = async (p: Photo) => {
    if (!window.confirm("Remove this photo from the public page?")) return;
    const ok = await run(() => api(`/api/admin/events/photos?id=${p.id}`, { method: "DELETE" }), "Photo removed");
    if (ok) router.refresh();
  };

  const row = (ev: ManagedEvent) => (
    <div key={ev.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold">{ev.title}</p>
          <span className={`text-[11px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${STATUS_TONE[ev.status]}`}>{ev.status}</span>
        </div>
        <p className="text-xs text-slate-500">
          {ev.date_label || "No date"} · {photosFor(ev.slug).length} photos {ev.link ? `· ${ev.link}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ev.status !== "past" ? (
          <>
            <select value={ev.status} onChange={(e) => setStatus(ev, e.target.value as ManagedEvent["status"])} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
            </select>
            <Button size="sm" variant="primary" onClick={() => act(ev, "archive")}>
              <Archive className="w-3.5 h-3.5" /> Move to Past Events
            </Button>
          </>
        ) : (
          <>
            <a href={`/past-events/${ev.slug}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm">
                View <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
            <Button size="sm" onClick={() => act(ev, "restore")}>
              <RotateCcw className="w-3.5 h-3.5" /> Restore
            </Button>
          </>
        )}
        <Button
          size="sm"
          variant="ghost"
          aria-label="Edit event"
          onClick={() =>
            setForm({
              id: ev.id,
              title: ev.title,
              type: ev.type,
              date_label: ev.date_label,
              description: ev.description,
              tags: ev.tags.join(", "),
              link: ev.link || "",
              status: ev.status,
              image_url: ev.image_url || "",
              location: ev.location || "CU",
            })
          }
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Button>
        <Button size="sm" onClick={() => setGallery({ slug: ev.slug, title: ev.title })}>
          <ImagePlus className="w-3.5 h-3.5" /> Photos
        </Button>
        {isOwner && (
          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(ev)} aria-label="Delete event">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );

  const live = events.filter((e) => e.status !== "past");
  const archived = events.filter((e) => e.status === "past");

  return (
    <>
      <PageHeader
        title="Events & photos"
        description="Ongoing events show on the home page. One click moves an event to the public Past Events page, and photos you upload appear there."
        actions={
          <Button variant="primary" onClick={() => setForm({ ...EMPTY })}>
            <Plus className="w-4 h-4" /> New event
          </Button>
        }
      />

      {form && (
        <Card className="p-5 mb-6 border-primary/40">
          <form onSubmit={create} className="grid md:grid-cols-2 gap-4">
            <Field label="Title">
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                  {["event", "workshop", "hackathon", "talk", "conference"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} disabled={Boolean(form.id)} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="past">Past (archive now)</option>
                </select>
              </Field>
            </div>
            <Field label="Date" hint='Shown as written, e.g. "12-13 OCT 2026"'>
              <input required value={form.date_label} onChange={(e) => setForm({ ...form, date_label: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Link" hint="Registration page, e.g. /innovators-hub or https://…">
              <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} className={inputClass} />
            </Field>
            <Field label="Tags" hint="Comma-separated">
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputClass} placeholder="AI, Workshop" />
            </Field>
            <Field label="Location">
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={60} className={inputClass} placeholder="Online / CU" />
            </Field>
            <Field label="Card image URL" hint="https:// image shown on the home page card (optional)" className="md:col-span-2">
              <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputClass} placeholder="https://…" />
            </Field>
            <div className="flex items-end justify-end gap-2">
              <Button type="button" onClick={() => setForm(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {form.id ? "Save changes" : "Create event"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <h2 className="text-lg font-black mb-3">Live & upcoming</h2>
      <Card className="divide-y divide-slate-100 mb-8">{live.length ? live.map(row) : <EmptyState title="No live events">Create one to show it on the home page.</EmptyState>}</Card>

      <h2 className="text-lg font-black mb-3">Archived from the portal</h2>
      <Card className="divide-y divide-slate-100 mb-8">{archived.length ? archived.map(row) : <EmptyState title="Nothing archived yet" />}</Card>

      <h2 className="text-lg font-black mb-1">Earlier past events</h2>
      <p className="text-sm text-slate-500 mb-3">Built into the site. You can still add photos to them.</p>
      <Card className="divide-y divide-slate-100">
        {archive.map((e) => (
          <div key={e.slug} className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold truncate">{e.title}</p>
              <p className="text-xs text-slate-500">
                {e.date} · {e.builtInMedia + photosFor(e.slug).length} photos
              </p>
            </div>
            <Button size="sm" onClick={() => setGallery({ slug: e.slug, title: e.title })}>
              <ImagePlus className="w-3.5 h-3.5" /> Photos
            </Button>
          </div>
        ))}
      </Card>

      {gallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => !uploading && setGallery(null)} />
          <div role="dialog" aria-label={`Photos for ${gallery.title}`} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-black">{gallery.title}</h3>
                <p className="text-xs text-slate-500">Uploaded photos appear on the public past-event page.</p>
              </div>
              <button onClick={() => !uploading && setGallery(null)} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors mb-5">
                {uploading ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <ImagePlus className="w-6 h-6 text-primary" />}
                <span className="text-sm font-semibold">{uploading ? `Uploading… ${uploading} left` : "Choose photos to upload"}</span>
                <span className="text-xs text-slate-400">JPG, PNG, WEBP, GIF or HEIC · up to 10 MB each</span>
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/heic" multiple disabled={Boolean(uploading)} onChange={(e) => upload(e.target.files)} className="sr-only" />
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photosFor(gallery.slug).map((p) => (
                  <div key={p.id} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.caption || ""} className="w-full h-full object-cover" loading="lazy" />
                    <button
                      onClick={() => deletePhoto(p)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {!photosFor(gallery.slug).length && <p className="text-sm text-slate-400 text-center">No uploaded photos yet.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
