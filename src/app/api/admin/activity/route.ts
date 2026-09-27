import { NextRequest } from "next/server";
import { adminRoute, check, logActivity } from "@/lib/adminApi";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { csvResponse, toCsv } from "@/lib/csv";

// Activity log export (owners only). The on-screen log is rendered by /admin/activity.
export const GET = adminRoute(
  async (session, req) => {
    const params = (req as NextRequest).nextUrl.searchParams;
    let q = supabaseAdmin()
      .from("admin_activity")
      .select("created_at, actor_email, action, target_type, target_id, details, ip")
      .order("created_at", { ascending: false })
      .limit(10000);
    const actor = params.get("actor");
    const action = params.get("action");
    if (actor) q = q.eq("actor_email", actor);
    if (action) q = q.like("action", `${action}%`);

    const rows = check(await q) || [];
    await logActivity(session, "activity.export", { type: "activity" }, { rows: rows.length, actor, action });
    return csvResponse(toCsv(rows), `admin-activity-${new Date().toISOString().slice(0, 10)}.csv`);
  },
  { owner: true }
);
