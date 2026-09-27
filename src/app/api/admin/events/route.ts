import { NextRequest } from "next/server";
import { z } from "zod";
import { adminRoute, ApiError, check, logActivity, readJson, revalidatePublic } from "@/lib/adminApi";
import { pastEvents } from "@/data/events";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const fields = z.object({
  title: z.string().trim().min(2).max(120),
  type: z.enum(["event", "hackathon", "workshop", "talk", "conference"]),
  date_label: z.string().trim().min(1).max(60),
  description: z.string().trim().max(2000),
  tags: z.array(z.string().trim().min(1).max(40)).max(8),
  link: z.union([z.url({ protocol: /^https?$/ }), z.string().regex(/^\/[a-z0-9\-/]*$/), z.literal("")]).transform((v) => v || null),
  status: z.enum(["upcoming", "ongoing", "past"]),
  image_url: z.union([z.url({ protocol: /^https$/ }), z.literal("")]).optional().transform((v) => v || null),
  location: z.string().trim().max(60).optional().transform((v) => v || "CU"),
});

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

const PUBLIC_PAGES = ["/", "/events", "/past-events", "/past-events/[slug]"];

export const POST = adminRoute(async (session, req) => {
  const body = fields.extend({ slug: z.string().optional() }).parse(await readJson(req));
  const { slug: requestedSlug, ...rest } = body;
  const slug = slugify(requestedSlug || body.title);
  if (!slug) throw new ApiError(400, "Title must contain letters or numbers");
  if (pastEvents.some((e) => e.slug === slug)) throw new ApiError(409, "An archived event already uses that name");
  const event = check(
    await supabaseAdmin()
      .from("events")
      .insert({ ...rest, slug, created_by: session.email, archived_at: rest.status === "past" ? new Date().toISOString() : null })
      .select("*")
      .single()
  );
  await logActivity(session, "event.create", { type: "event", id: slug }, { title: body.title, status: body.status });
  revalidatePublic(...PUBLIC_PAGES);
  return { event };
});

// Edit fields, or one-click archive / restore.
const patch = z.union([
  z.object({ id: z.uuid(), action: z.enum(["archive", "restore"]) }),
  z.object({ id: z.uuid(), action: z.literal("update"), fields: fields.partial() }),
]);

export const PATCH = adminRoute(async (session, req) => {
  const body = patch.parse(await readJson(req));
  let update: Record<string, unknown>;
  if (body.action === "update") update = body.fields;
  else if (body.action === "archive") update = { status: "past", archived_at: new Date().toISOString() };
  else update = { status: "ongoing", archived_at: null };
  const rows = check(await supabaseAdmin().from("events").update(update).eq("id", body.id).select("slug, title"));
  if (!rows?.length) throw new ApiError(404, "Event not found");
  await logActivity(session, `event.${body.action}`, { type: "event", id: rows[0].slug }, { title: rows[0].title });
  revalidatePublic(...PUBLIC_PAGES);
  return { success: true };
});

export const DELETE = adminRoute(
  async (session, req) => {
    const id = z.uuid().parse((req as NextRequest).nextUrl.searchParams.get("id"));
    const rows = check(await supabaseAdmin().from("events").delete().eq("id", id).select("slug, title"));
    if (!rows?.length) throw new ApiError(404, "Event not found");
    await logActivity(session, "event.delete", { type: "event", id: rows[0].slug }, { title: rows[0].title });
    revalidatePublic(...PUBLIC_PAGES);
    return { success: true };
  },
  { owner: true }
);
