import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabaseAdmin";

// Per-person admin sessions.
//
// Each admin has an email + bcrypt-hashed password in the admin_users table.
// /api/admin/login checks them and creates a row in admin_sessions. The cookie only
// carries that session's id (signed), so any session can be revoked from the portal
// and stops working on its next request.

export const ADMIN_COOKIE = "cis_admin_session";
const SESSION_DAYS = 7;
const LAST_SEEN_THROTTLE_MS = 5 * 60 * 1000;

export type AdminRole = "owner" | "reviewer";

export interface AdminSession {
  sessionId: string;
  email: string;
  name: string;
  role: AdminRole;
  authUserId: string | null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};

/** Emails in ADMIN_EMAILS are always owners (they still need a password in admin_users to sign in). */
export function bootstrapOwnerEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_JWT_SECRET && isServiceRoleConfigured());
}

function secret() {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error("Missing ADMIN_JWT_SECRET");
  return s;
}

export async function requestMeta() {
  const h = await headers();
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || null,
    userAgent: h.get("user-agent")?.slice(0, 300) || null,
  };
}

/** Returns the admin_users entry for an email, or null if they are not allowed in. */
export async function findAdmin(email: string): Promise<{ email: string; name: string; role: AdminRole } | null> {
  const normalized = email.trim().toLowerCase();
  const db = supabaseAdmin();
  const { data } = await db.from("admin_users").select("email, name, role, disabled").eq("email", normalized).maybeSingle();

  if (bootstrapOwnerEmails().includes(normalized)) {
    if (!data) {
      await db.from("admin_users").insert({ email: normalized, name: "", role: "owner", added_by: "ADMIN_EMAILS" });
    } else if (data.role !== "owner" || data.disabled) {
      await db.from("admin_users").update({ role: "owner", disabled: false }).eq("email", normalized);
    }
    return { email: normalized, name: data?.name || "", role: "owner" };
  }

  if (!data || data.disabled) return null;
  return { email: data.email, name: data.name, role: data.role as AdminRole };
}

/** Creates a session row and returns the signed cookie value. */
export async function createSession(admin: { email: string }, authUserId: string | null) {
  const { ip, userAgent } = await requestMeta();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const { data, error } = await supabaseAdmin()
    .from("admin_sessions")
    .insert({
      admin_email: admin.email,
      auth_user_id: authUserId,
      expires_at: expiresAt.toISOString(),
      ip,
      user_agent: userAgent,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message || "Could not create session");
  return { sessionId: data.id as string, token: jwt.sign({ sid: data.id }, secret(), { expiresIn: `${SESSION_DAYS}d` }) };
}

function readSessionId(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret()) as { sid?: unknown };
    return typeof payload.sid === "string" ? payload.sid : null;
  } catch {
    return null;
  }
}

/** The signed-in admin for this request, or null. Deduplicated per request. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (!isAdminConfigured()) return null;
  const sid = readSessionId((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!sid) return null;

  const db = supabaseAdmin();
  const { data: s } = await db
    .from("admin_sessions")
    .select("id, admin_email, auth_user_id, expires_at, revoked_at, last_seen_at")
    .eq("id", sid)
    .maybeSingle();
  if (!s || s.revoked_at || new Date(s.expires_at) < new Date()) return null;

  const admin = await findAdmin(s.admin_email);
  if (!admin) return null;

  if (Date.now() - new Date(s.last_seen_at).getTime() > LAST_SEEN_THROTTLE_MS) {
    await db.from("admin_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", sid);
  }

  return { sessionId: s.id, email: admin.email, name: admin.name, role: admin.role, authUserId: s.auth_user_id };
});

export class AuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message);
  }
}

/** For route handlers: throws AuthError unless signed in (and an owner, if required). */
export async function requireAdmin(opts: { owner?: boolean } = {}): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new AuthError(401, "Unauthorized");
  if (opts.owner && session.role !== "owner") throw new AuthError(403, "Only owners can do this");
  return session;
}

/** For portal pages: redirects to the login page (or the overview, for owner-only pages). */
export async function requirePageAdmin(opts: { owner?: boolean } = {}): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (opts.owner && session.role !== "owner") redirect("/admin?denied=1");
  return session;
}
