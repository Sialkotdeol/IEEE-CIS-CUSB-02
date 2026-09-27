import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, createSession, findAdmin, isAdminConfigured, sessionCookieOptions } from "@/lib/adminAuth";
import { logActivity } from "@/lib/adminApi";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";

// Email + password login against the admin_users table in Supabase.
// Passwords are bcrypt-hashed in the database; verification is done
// in Node.js using bcryptjs to avoid pgcrypto/RPC permission issues.

// Basic brute-force protection: max 10 failed attempts per IP per 15 minutes.
// In-memory, so it resets on redeploy/cold start — enough to slow down guessing.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 10;
const failures = new Map<string, { count: number; first: number }>();

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

function recordFailure(ip: string) {
  const entry = failures.get(ip);
  const fresh = !entry || Date.now() - entry.first >= WINDOW_MS;
  failures.set(ip, fresh ? { count: 1, first: Date.now() } : { ...entry, count: entry.count + 1 });
}

export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin portal is not configured. Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_JWT_SECRET." },
      { status: 500 }
    );
  }

  const ip = clientIp(req);
  const entry = failures.get(ip);
  if (entry && Date.now() - entry.first < WINDOW_MS && entry.count >= MAX_FAILS) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
  if (!email || !password) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });

  // Fetch the admin user directly from the table
  const { data: userData, error: userError } = await supabaseAdmin()
    .from("admin_users")
    .select("email, name, role, disabled, password")
    .eq("email", email)
    .maybeSingle();

  if (userError) {
    console.error("❌ admin_users query failed:", userError);
    return NextResponse.json({ error: "Database not set up — run supabase/admin_portal.sql" }, { status: 503 });
  }

  // Verify: user exists, not disabled, has a password, and password matches
  let passwordValid = false;
  if (userData && !userData.disabled && userData.password) {
    passwordValid = await bcrypt.compare(password, userData.password);
  }

  // findAdmin also applies ADMIN_EMAILS (always-owner) and the disabled flag.
  const admin = passwordValid ? await findAdmin(email) : null;
  if (!admin) {
    recordFailure(ip);
    await logActivity({ email }, "login.denied");
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }

  let session;
  try {
    session = await createSession(admin, null);
  } catch (err) {
    console.error("❌ Could not create admin session:", err);
    return NextResponse.json({ error: "Database not set up — run supabase/admin_portal.sql" }, { status: 503 });
  }

  failures.delete(ip);
  await logActivity(admin, "login", { type: "session", id: session.sessionId });

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, session.token, sessionCookieOptions);
  return res;
}
