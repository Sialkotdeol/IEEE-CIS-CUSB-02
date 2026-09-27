import { NextRequest } from "next/server";
import { z } from "zod";
import { adminRoute, ApiError, check, logActivity, readJson } from "@/lib/adminApi";
import { bootstrapOwnerEmails } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Owners manage who can sign in. Logins live in the admin_users table: email plus a
// bcrypt-hashed password (set here, or typed into the Supabase Table Editor).

const email = z.email().trim().toLowerCase();

async function revokeAllSessions(target: string) {
  await supabaseAdmin()
    .from("admin_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("admin_email", target)
    .is("revoked_at", null);
}

function guardSelfAndBootstrap(actor: string, target: string) {
  if (target === actor) throw new ApiError(400, "You can't change your own access");
  if (bootstrapOwnerEmails().includes(target)) throw new ApiError(400, "This owner is set in ADMIN_EMAILS and can only be changed there");
}

// Add a teammate or change their name / role / disabled flag.
export const POST = adminRoute(
  async (session, req) => {
    const body = z
      .object({
        email,
        name: z.string().trim().max(80),
        role: z.enum(["owner", "reviewer"]),
        disabled: z.boolean().default(false),
      })
      .parse(await readJson(req));
    const db = supabaseAdmin();
    const existing = check(await db.from("admin_users").select("role, disabled").eq("email", body.email).maybeSingle());
    if (existing) guardSelfAndBootstrap(session.email, body.email);

    // Never touches the password column, so an existing password is kept.
    check(await db.from("admin_users").upsert({ ...body, added_by: existing ? undefined : session.email }));
    if (body.disabled) await revokeAllSessions(body.email);
    await logActivity(session, existing ? "team.update" : "team.add", { type: "admin", id: body.email }, {
      role: body.role,
      disabled: body.disabled,
    });
    return { success: true };
  },
  { owner: true }
);

// Set or reset someone's password. The database trigger bcrypt-hashes it on save.
export const PUT = adminRoute(
  async (session, req) => {
    const body = z.object({ email, password: z.string().min(8, "Password must be at least 8 characters").max(72) }).parse(await readJson(req));
    const rows = check(await supabaseAdmin().from("admin_users").update({ password: body.password }).eq("email", body.email).select("email"));
    if (!rows?.length) throw new ApiError(404, "Add this person to the team first");
    await revokeAllSessions(body.email);
    await logActivity(session, "team.password_set", { type: "admin", id: body.email });
    return { success: true };
  },
  { owner: true }
);

// Remove someone from the team (and their login) and sign them out everywhere.
export const DELETE = adminRoute(
  async (session, req) => {
    const target = email.parse((req as NextRequest).nextUrl.searchParams.get("email"));
    guardSelfAndBootstrap(session.email, target);
    const rows = check(await supabaseAdmin().from("admin_users").delete().eq("email", target).select("email"));
    if (!rows?.length) throw new ApiError(404, "Not on the team");
    await revokeAllSessions(target);
    await logActivity(session, "team.remove", { type: "admin", id: target });
    return { success: true };
  },
  { owner: true }
);
