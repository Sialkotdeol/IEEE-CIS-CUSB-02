import { notFound } from "next/navigation";
import { requirePageAdmin } from "@/lib/adminAuth";
import { getAllEventOptions } from "@/lib/siteContent";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { GENERAL, type EventDocument, type Task } from "@/lib/workShared";
import EventDocuments from "@/components/admin/EventDocuments";

export const dynamic = "force-dynamic";

export default async function EventDocumentsPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await requirePageAdmin();
  const { slug } = await params;
  const events = await getAllEventOptions();
  const event = slug === GENERAL ? null : events.find((e) => e.slug === slug);
  if (slug !== GENERAL && !event) notFound();

  const db = supabaseAdmin();
  let docsQ = db.from("event_documents").select("*").order("created_at", { ascending: false });
  let tasksQ = db.from("admin_tasks").select("*").order("created_at", { ascending: false });
  docsQ = event ? docsQ.eq("event_slug", slug) : docsQ.is("event_slug", null);
  tasksQ = event ? tasksQ.eq("event_slug", slug) : tasksQ.is("event_slug", null);
  const [{ data: docs }, { data: tasks }, { data: team }] = await Promise.all([docsQ, tasksQ, db.from("admin_users").select("email, name")]);

  return (
    <EventDocuments
      slug={slug}
      title={event?.title || "General / core team"}
      docs={(docs || []) as EventDocument[]}
      tasks={(tasks || []) as Task[]}
      names={Object.fromEntries((team || []).map((m) => [m.email, m.name || m.email]))}
      me={{ email: session.email, role: session.role }}
    />
  );
}
