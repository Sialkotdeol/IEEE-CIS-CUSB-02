import { requirePageAdmin } from "@/lib/adminAuth";
import { getAllBadges } from "@/lib/badges";
import { getAllEventOptions } from "@/lib/siteContent";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import BadgeManager from "@/components/admin/BadgeManager";

export const dynamic = "force-dynamic";

export default async function BadgesPage() {
  await requirePageAdmin();
  const [badges, events, holders] = await Promise.all([
    getAllBadges(),
    getAllEventOptions(),
    supabaseAdmin().from("badge_holders").select("id", { count: "exact", head: true }),
  ]);
  return <BadgeManager badges={badges} events={events.map((e) => ({ slug: e.slug, title: e.title }))} holderCount={holders.count ?? 0} />;
}
