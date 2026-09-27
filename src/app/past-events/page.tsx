import PastEventsClient from "@/components/dom/PastEventsClient";
import { getPastEvents } from "@/lib/siteContent";

// Includes events archived from the admin portal and photos uploaded there.
export const revalidate = 60;

export default async function PastEvents() {
  return <PastEventsClient events={await getPastEvents()} />;
}
