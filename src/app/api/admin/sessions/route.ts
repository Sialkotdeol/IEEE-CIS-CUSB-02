import { z } from "zod";
import { adminRoute, ApiError, check, logActivity, readJson } from "@/lib/adminApi";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Revoke one session, or every other session of the signed-in person.
// Owners may revoke anyone's session; reviewers only their own.
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("revoke"), id: z.uuid() }),
  z.object({ action: z.literal("revoke-others") }),
]);

export const POST = adminRoute(async (session, req) => {
  const body = schema.parse(await readJson(req));
  const db = supabaseAdmin();
  const now = new Date().toISOString();

  if (body.action === "revoke-others") {
    const rows = check(
      await db
        .from("admin_sessions")
        .update({ revoked_at: now })
        .eq("admin_email", session.email)
        .neq("id", session.sessionId)
        .is("revoked_at", null)
        .select("id")
    );
    await logActivity(session, "sessions.revoke_others", { type: "session" }, { count: rows?.length ?? 0 });
    return { revoked: rows?.length ?? 0 };
  }

  const target = check(await db.from("admin_sessions").select("id, admin_email").eq("id", body.id).maybeSingle());
  if (!target) throw new ApiError(404, "Session not found");
  if (target.admin_email !== session.email && session.role !== "owner") throw new ApiError(403, "You can only sign out your own devices");

  check(await db.from("admin_sessions").update({ revoked_at: now }).eq("id", body.id));
  await logActivity(session, "sessions.revoke", { type: "session", id: body.id }, { owner_of_session: target.admin_email });
  return { revoked: 1, self: body.id === session.sessionId };
});
