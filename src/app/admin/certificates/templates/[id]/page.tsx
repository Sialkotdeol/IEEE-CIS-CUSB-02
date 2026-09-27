import { notFound } from "next/navigation";
import { requirePageAdmin } from "@/lib/adminAuth";
import { signedAssetUrls } from "@/lib/certificateAssets";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { CertificateTemplate } from "@/lib/certificateTemplate";
import TemplateEditor from "@/components/admin/TemplateEditor";

export const dynamic = "force-dynamic";

export default async function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabaseAdmin().from("certificate_templates").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const tpl = data as CertificateTemplate;
  const urls = await signedAssetUrls([tpl.file_path, ...tpl.fields.map((f) => f.image_path || "")]);
  return <TemplateEditor template={tpl} imageUrl={urls[tpl.file_path] || ""} assetUrls={urls} />;
}
