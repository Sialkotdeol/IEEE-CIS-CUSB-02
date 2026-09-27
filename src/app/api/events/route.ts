import { NextResponse } from "next/server";
import { getOngoingEvents } from "@/lib/siteContent";

// Public: ongoing events managed in the admin portal, shown on the home page.
// `ready: false` means the events table isn't set up yet (the home page then shows its built-in cards).
export async function GET() {
  const { ready, events } = await getOngoingEvents();
  return NextResponse.json(
    {
      ready,
      events: events.map((e) => ({
        slug: e.slug,
        title: e.title,
        date: e.date_label,
        location: e.location,
        description: e.description,
        link: e.link,
        image: e.image_url,
      })),
    },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } }
  );
}
