import { notFound } from "next/navigation";
import { requirePageAdmin } from "@/lib/adminAuth";
import { REGISTRATION_SOURCES } from "@/lib/adminData";
import { getAllEventOptions } from "@/lib/siteContent";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import BadgeDetail from "@/components/admin/BadgeDetail";

export const dynamic = "force-dynamic";

export default async function BadgePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePageAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = supabaseAdmin();
  const [{ data: badge }, { data: awards }, events] = await Promise.all([
    db.from("badges").select("*").eq("id", id).maybeSingle(),
    db
      .from("badge_awards")
      .select("id, awarded_at, emailed_at, holder:badge_holders(name, email, uid, wallet_slug, is_public)")
      .eq("badge_id", id)
      .order("awarded_at", { ascending: false }),
    getAllEventOptions(),
  ]);
  if (!badge) notFound();
  return (
    <BadgeDetail
      badge={badge}
      awards={(awards || []) as unknown as { id: string; awarded_at: string; emailed_at: string | null; holder: { name: string; email: string; uid: string | null; wallet_slug: string; is_public: boolean } }[]}
      events={events.map((e) => ({ slug: e.slug, title: e.title }))}
      sources={Object.entries(REGISTRATION_SOURCES).map(([table, s]) => ({ table, label: s.label }))}
      emailConfigured={Boolean(process.env.RESEND_API_KEY)}
      isOwner={session.role === "owner"}
    />
  );
}
