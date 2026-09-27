import { requirePageAdmin } from "@/lib/adminAuth";
import { REGISTRATION_SOURCES } from "@/lib/adminData";
import { getAllEventOptions } from "@/lib/siteContent";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CertificateStudio from "@/components/admin/CertificateStudio";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  await requirePageAdmin();
  const [events, recent, templates, badges] = await Promise.all([
    getAllEventOptions(),
    supabaseAdmin()
      .from("certificates")
      .select("id, recipient_name, recipient_email, recipient_uid, event_title, kind, emailed_at, created_at, issued_by")
      .order("created_at", { ascending: false })
      .limit(50),
    supabaseAdmin().from("certificate_templates").select("id, name").order("created_at", { ascending: false }),
    supabaseAdmin().from("badges").select("id, title, event_slug").order("created_at", { ascending: false }),
  ]);
  return (
    <CertificateStudio
      events={events.map((e) => e.title)}
      sources={Object.entries(REGISTRATION_SOURCES).map(([table, s]) => ({ table, label: s.label }))}
      recent={recent.data || []}
      templates={templates.data || []}
      badges={badges.data || []}
      emailConfigured={Boolean(process.env.RESEND_API_KEY)}
    />
  );
}
