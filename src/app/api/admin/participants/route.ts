import { adminRoute, logActivity } from "@/lib/adminApi";
import { getRepeatParticipants } from "@/lib/adminData";
import { csvResponse, toCsv } from "@/lib/csv";

// CSV of students who took part in two or more events.
export const GET = adminRoute(async (session) => {
  const { participants } = await getRepeatParticipants(2);
  await logActivity(session, "participants.export", { type: "participants" }, { rows: participants.length });
  return csvResponse(
    toCsv(participants.map((p) => ({ name: p.name, email: p.email, uid: p.uid, event_count: p.count, events: p.events, badge_count: p.badges.length, badges: p.badges }))),
    `repeat-participants-${new Date().toISOString().slice(0, 10)}.csv`
  );
});
