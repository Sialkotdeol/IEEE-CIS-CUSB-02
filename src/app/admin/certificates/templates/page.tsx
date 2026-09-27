import { requirePageAdmin } from "@/lib/adminAuth";
import { signedAssetUrls } from "@/lib/certificateAssets";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { CertificateTemplate } from "@/lib/certificateTemplate";
import TemplateLibrary from "@/components/admin/TemplateLibrary";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  await requirePageAdmin();
  const { data, error } = await supabaseAdmin().from("certificate_templates").select("*").order("created_at", { ascending: false });
  const templates = (data || []) as CertificateTemplate[];
  const urls = await signedAssetUrls(templates.map((t) => t.file_path));
  return <TemplateLibrary templates={templates.map((t) => ({ id: t.id, name: t.name, fields: t.fields.length, thumb: urls[t.file_path] || null }))} loadError={error?.message || null} />;
}
