import { requirePageAdmin } from "@/lib/adminAuth";
import { getPositions, getRecruitmentSettings } from "@/lib/siteContent";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import RecruitmentManager from "@/components/admin/RecruitmentManager";

export const dynamic = "force-dynamic";

export default async function RecruitmentPage() {
  const session = await requirePageAdmin();
  const [settings, positions, apps] = await Promise.all([
    getRecruitmentSettings(),
    getPositions({ includeInactive: true }),
    supabaseAdmin().from("position_applications").select("first_preference, second_preference"),
  ]);
  const counts: Record<string, number> = {};
  for (const a of apps.data || []) {
    counts[a.first_preference] = (counts[a.first_preference] || 0) + 1;
    if (a.second_preference) counts[a.second_preference] = (counts[a.second_preference] || 0) + 1;
  }
  return <RecruitmentManager settings={settings} positions={positions} applicantCounts={counts} canEdit={session.role === "owner"} />;
}
