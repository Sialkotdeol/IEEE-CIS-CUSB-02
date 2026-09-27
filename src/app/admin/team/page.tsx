import { requirePageAdmin, bootstrapOwnerEmails } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import TeamManager from "@/components/admin/TeamManager";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await requirePageAdmin({ owner: true });
  const db = supabaseAdmin();
  const [members, sessions] = await Promise.all([
    db.from("admin_users").select("email, name, role, disabled, added_by, created_at, password").order("created_at"),
    db.from("admin_sessions").select("admin_email, last_seen_at").is("revoked_at", null).gt("expires_at", new Date().toISOString()),
  ]);
  const lastSeen: Record<string, string> = {};
  for (const s of sessions.data || []) if (!lastSeen[s.admin_email] || s.last_seen_at > lastSeen[s.admin_email]) lastSeen[s.admin_email] = s.last_seen_at;
  // Only a yes/no reaches the browser — never the password hash.
  const safeMembers = (members.data || []).map(({ password, ...m }) => ({ ...m, has_password: Boolean(password) }));
  return <TeamManager members={safeMembers} lastSeen={lastSeen} me={session.email} locked={bootstrapOwnerEmails()} />;
}
