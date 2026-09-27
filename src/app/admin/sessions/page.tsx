import { requirePageAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import SessionsManager from "@/components/admin/SessionsManager";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const session = await requirePageAdmin();
  const db = supabaseAdmin();
  let q = db
    .from("admin_sessions")
    .select("id, admin_email, created_at, last_seen_at, expires_at, user_agent, ip")
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("last_seen_at", { ascending: false });
  if (session.role !== "owner") q = q.eq("admin_email", session.email);
  const { data } = await q;

  return (
    <SessionsManager
      sessions={data || []}
      currentId={session.sessionId}
      me={{ email: session.email, name: session.name, role: session.role }}
    />
  );
}
