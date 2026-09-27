import { NextResponse } from "next/server";
import { isServiceRoleConfigured } from "@/lib/supabaseAdmin";

// Temporary diagnostic endpoint — DELETE after debugging.
export async function GET() {
  const checks: Record<string, unknown> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ set" : "❌ missing",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ set" : "❌ missing",
    ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET ? "✅ set" : "❌ missing",
    isServiceRoleConfigured: isServiceRoleConfigured(),
  };

  if (isServiceRoleConfigured()) {
    try {
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin");
      const db = supabaseAdmin();

      // Check if admin_users table exists
      const { data: usersData, error: usersErr } = await db.from("admin_users").select("email").limit(1);
      checks.admin_users_table = usersErr ? `❌ ${usersErr.message}` : `✅ exists (${usersData?.length ?? 0} rows visible)`;

      // Check if admin_sessions table exists
      const { data: sessData, error: sessErr } = await db.from("admin_sessions").select("id").limit(1);
      checks.admin_sessions_table = sessErr ? `❌ ${sessErr.message}` : `✅ exists (${sessData?.length ?? 0} rows visible)`;

      // Check if verify_admin_login function exists
      const { data: rpcData, error: rpcErr } = await db.rpc("verify_admin_login", { p_email: "test@test.com", p_password: "test" });
      checks.verify_admin_login_fn = rpcErr ? `❌ ${rpcErr.message}` : `✅ function works (returned ${JSON.stringify(rpcData)})`;
    } catch (err: any) {
      checks.connection_error = err.message;
    }
  }

  return NextResponse.json(checks, { status: 200 });
}
