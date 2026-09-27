import "server-only";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AuthError, requestMeta, requireAdmin, type AdminSession } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Shared plumbing for /api/admin/* route handlers.

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type Handler<C> = (session: AdminSession, req: Request, ctx: C) => Promise<Response | unknown>;

/**
 * Wraps a route handler: checks the admin session (owner-only if asked),
 * turns thrown errors into JSON responses, and JSON-encodes plain return values.
 */
export function adminRoute<C = unknown>(handler: Handler<C>, opts: { owner?: boolean } = {}) {
  return async (req: Request, ctx: C) => {
    try {
      const session = await requireAdmin(opts);
      const result = await handler(session, req, ctx);
      if (result instanceof Response) return result;
      return NextResponse.json(result ?? { success: true }, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
      if (err instanceof AuthError || err instanceof ApiError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      if (err instanceof z.ZodError) {
        const first = err.issues[0];
        return NextResponse.json(
          { error: first ? `${first.path.join(".") || "input"}: ${first.message}` : "Invalid input" },
          { status: 400 }
        );
      }
      console.error("❌ Admin API error:", err);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body");
  }
}

/** Throws a 502 ApiError if a Supabase call failed. */
export function check<T>(result: { data: T; error: { message: string; code?: string } | null }): T {
  if (result.error) {
    if (result.error.code === "23505") throw new ApiError(409, "That already exists");
    if (result.error.code === "42P01" || result.error.code === "PGRST205") {
      throw new ApiError(503, "Database table missing — run supabase/admin_portal.sql in the Supabase SQL editor");
    }
    throw new ApiError(502, result.error.message);
  }
  return result.data;
}

/** Like check(), for .single() queries: also guarantees a row. */
export function checkRow<T>(result: { data: T; error: { message: string; code?: string } | null }): NonNullable<T> {
  const row = check(result);
  if (row === null || row === undefined) throw new ApiError(404, "Not found");
  return row as NonNullable<T>;
}

/** Records who did what. Never throws — a logging failure must not break the action. */
export async function logActivity(
  session: Pick<AdminSession, "email">,
  action: string,
  target?: { type: string; id?: string | null },
  details: Record<string, unknown> = {}
) {
  try {
    const { ip } = await requestMeta();
    await supabaseAdmin().from("admin_activity").insert({
      actor_email: session.email,
      action,
      target_type: target?.type ?? null,
      target_id: target?.id ?? null,
      details,
      ip,
    });
  } catch (err) {
    console.error("❌ Failed to log admin activity:", err);
  }
}

/** Revalidates public pages whose content comes from portal-managed data. */
export function revalidatePublic(...paths: string[]) {
  for (const p of paths) revalidatePath(p, p.includes("[") ? "page" : undefined);
}
