import { z } from "zod";
import { adminRoute, ApiError, check, logActivity, readJson } from "@/lib/adminApi";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// The signed-in person updates their own display name or password.
// Changing the password requires the current one, and signs out their other devices.
const schema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  current_password: z.string().max(200).optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(72).optional(),
});

export const PUT = adminRoute(async (session, req) => {
  const { name, current_password, password } = schema.parse(await readJson(req));
  const db = supabaseAdmin();

  if (name !== undefined) {
    check(await db.from("admin_users").update({ name }).eq("email", session.email));
    await logActivity(session, "account.name", { type: "admin", id: session.email });
  }

  if (password !== undefined) {
    const { data, error } = await db.rpc("verify_admin_login", { p_email: session.email, p_password: current_password || "" });
    if (error) throw new ApiError(502, error.message);
    if (!Array.isArray(data) || !data.length) throw new ApiError(400, "Current password is wrong");

    // The database trigger bcrypt-hashes the new password on save.
    check(await db.from("admin_users").update({ password }).eq("email", session.email));
    await db
      .from("admin_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("admin_email", session.email)
      .neq("id", session.sessionId)
      .is("revoked_at", null);
    await logActivity(session, "account.password", { type: "admin", id: session.email });
  }

  return { success: true };
});
