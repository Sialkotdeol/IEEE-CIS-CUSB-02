import { requirePageAdmin } from "@/lib/adminAuth";
import { getAllEventOptions } from "@/lib/siteContent";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { FeedbackForm } from "@/lib/feedback";
import FeedbackManager from "@/components/admin/FeedbackManager";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const session = await requirePageAdmin();
  const db = supabaseAdmin();
  const [forms, responses, events] = await Promise.all([
    db.from("feedback_forms").select("*").order("created_at", { ascending: false }),
    db.from("feedback_responses").select("form_id"),
    getAllEventOptions(),
  ]);
  const counts: Record<string, number> = {};
  for (const r of responses.data || []) counts[r.form_id] = (counts[r.form_id] || 0) + 1;
  return (
    <FeedbackManager
      forms={(forms.data || []) as FeedbackForm[]}
      counts={counts}
      events={events.map((e) => ({ slug: e.slug, title: e.title }))}
      isOwner={session.role === "owner"}
      loadError={forms.error?.message || null}
    />
  );
}
