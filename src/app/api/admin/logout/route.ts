import { NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdminSession } from "@/lib/adminAuth";
import { logActivity } from "@/lib/adminApi";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST() {
  const session = await getAdminSession();
  if (session) {
    await supabaseAdmin().from("admin_sessions").update({ revoked_at: new Date().toISOString() }).eq("id", session.sessionId);
    await logActivity(session, "logout", { type: "session", id: session.sessionId });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
