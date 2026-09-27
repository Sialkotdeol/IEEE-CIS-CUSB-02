"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { api, Button, Card, EmptyState, Field, inputClass, PageHeader, run } from "@/components/admin/ui";

/** Reads an image file's pixel size in the browser. */
function imageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => reject(new Error("That file isn't a readable image"));
    img.src = url;
  });
}

export default function TemplateLibrary({
  templates,
  loadError,
}: {
  templates: { id: string; name: string; fields: number; thumb: string | null }[];
  loadError: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    try {
      if (!["image/png", "image/jpeg"].includes(file.type)) throw new Error("Upload a PNG or JPG (export your design as an image)");
      if (file.size > 10 * 1024 * 1024) throw new Error("File is over 10 MB");
      const { width, height } = await imageSize(file);
      if (Math.max(width, height) < 1200) toast.warning("This image is quite small — certificates may look blurry. Export at 2000px+ wide if you can.");
      const { path, token } = await api<{ path: string; token: string }>("/api/admin/certificate-templates", {
        method: "POST",
        body: { action: "sign", kind: "template", contentType: file.type },
      });
      const { error } = await supabase.storage.from("certificate-assets").uploadToSignedUrl(path, token, file, { contentType: file.type });
      if (error) throw new Error(error.message);
      const { id } = await api<{ id: string }>("/api/admin/certificate-templates", {
        method: "POST",
        body: { action: "create", name: name.trim() || file.name.replace(/\.[^.]+$/, ""), file_path: path, file_type: file.type, width, height },
      });
      toast.success("Design uploaded — now place the fields");
      router.push(`/admin/certificates/templates/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setBusy(false);
    }
  };

  const remove = async (t: { id: string; name: string }) => {
    if (!window.confirm(`Delete the "${t.name}" design?`)) return;
    const ok = await run(() => api(`/api/admin/certificate-templates?id=${t.id}`, { method: "DELETE" }), "Design deleted");
    if (ok) router.refresh();
  };

  return (
    <>
      <Link href="/admin/certificates" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Certificates
      </Link>
      <PageHeader
        title="Certificate designs"
        description="Upload your pre-made certificate (PNG or JPG, with blank spaces for the name, UID and signatures), then drag the fields into place."
      />
      {loadError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">Couldn&apos;t load designs: {loadError}. Re-run supabase/admin_portal.sql.</div>}

      <Card className="p-5 mb-6">
        <form onSubmit={upload} className="grid sm:grid-cols-[1fr_1.5fr_auto] gap-3 items-end">
          <Field label="Design name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Agent Craft participation" className={inputClass} />
          </Field>
          <Field label="Image" hint="PNG or JPG, ideally 3508×2480 (A4 at 300 dpi), max 10 MB">
            <input type="file" accept="image/png,image/jpeg" required onChange={(e) => setFile(e.target.files?.[0] || null)} className={`${inputClass} file:mr-3 file:border-0 file:bg-slate-100 file:rounded file:px-2 file:py-1`} />
          </Field>
          <Button variant="primary" type="submit" disabled={!file || busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
          </Button>
        </form>
      </Card>

      {templates.length === 0 ? (
        <Card>
          <EmptyState title="No designs yet">Upload one above. Until then, certificates use the built-in design.</EmptyState>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className="overflow-hidden">
              <div className="aspect-[1.414] bg-slate-100 border-b border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {t.thumb && <img src={t.thumb} alt="" className="w-full h-full object-contain" />}
              </div>
              <div className="p-4 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold truncate">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.fields} fields placed</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Link href={`/admin/certificates/templates/${t.id}`}>
                    <Button size="sm" variant="primary">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => remove(t)} aria-label="Delete design">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
