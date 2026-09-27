import { requirePageAdmin } from "@/lib/adminAuth";
import { getEventPhotos, getManagedEvents } from "@/lib/siteContent";
import { pastEvents } from "@/data/events";
import EventsManager from "@/components/admin/EventsManager";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const session = await requirePageAdmin();
  const [events, photos] = await Promise.all([getManagedEvents(), getEventPhotos()]);
  const managedSlugs = new Set(events.map((e) => e.slug));
  return (
    <EventsManager
      events={events}
      photos={photos}
      archive={pastEvents.filter((e) => !managedSlugs.has(e.slug)).map((e) => ({ slug: e.slug, title: e.title, date: e.date, builtInMedia: e.media?.length || 0 }))}
      isOwner={session.role === "owner"}
    />
  );
}
