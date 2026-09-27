import { NextRequest } from "next/server";
import { z } from "zod";
import { adminRoute, ApiError, check, logActivity, readJson, revalidatePublic } from "@/lib/adminApi";
import { POSITION_CATEGORIES } from "@/data/positions";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const schema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]{2,60}$/, "Use lowercase letters, numbers and dashes"),
  title: z.string().trim().min(2).max(80),
  category: z.enum(POSITION_CATEGORIES as [string, ...string[]]),
  openings: z.number().int().min(1).max(50),
  summary: z.string().trim().max(400),
  responsibilities: z.array(z.string().trim().min(1).max(200)).max(12),
  eligibility: z.string().trim().max(300),
  sort_order: z.number().int().min(0).max(1000),
  is_active: z.boolean(),
});

// Create or update a role (matched by id).
export const PUT = adminRoute(
  async (session, req) => {
    const role = schema.parse(await readJson(req));
    const db = supabaseAdmin();
    const existed = check(await db.from("positions").select("id").eq("id", role.id).maybeSingle());
    check(await db.from("positions").upsert({ ...role, updated_at: new Date().toISOString() }));
    await logActivity(session, existed ? "position.update" : "position.create", { type: "position", id: role.id }, {
      title: role.title,
      openings: role.openings,
      is_active: role.is_active,
    });
    revalidatePublic("/call-for-positions");
    return { success: true };
  },
  { owner: true }
);

// Deleting is refused while applications reference the role — hide it instead.
export const DELETE = adminRoute(
  async (session, req) => {
    const id = schema.shape.id.parse((req as NextRequest).nextUrl.searchParams.get("id"));
    const db = supabaseAdmin();
    const { count } = await db
      .from("position_applications")
      .select("id", { count: "exact", head: true })
      .or(`first_preference.eq.${id},second_preference.eq.${id}`);
    if (count) throw new ApiError(409, `${count} application(s) chose this role. Hide it instead of deleting.`);
    const rows = check(await db.from("positions").delete().eq("id", id).select("title"));
    if (!rows?.length) throw new ApiError(404, "Role not found");
    await logActivity(session, "position.delete", { type: "position", id }, { title: rows[0].title });
    revalidatePublic("/call-for-positions");
    return { success: true };
  },
  { owner: true }
);
