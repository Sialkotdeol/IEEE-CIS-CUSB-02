import "server-only";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabaseAdmin";
import { POSITIONS, DEFAULT_RECRUITMENT, type Position, type RecruitmentSettings } from "@/data/positions";
import { pastEvents, type EventData } from "@/data/events";

// Portal-managed content read by the public site. Every reader falls back to the
// hard-coded data in src/data/* if Supabase isn't configured or the tables are missing,
// so the public site never breaks because of the admin portal.

export interface ManagedEvent {
  id: string;
  slug: string;
  title: string;
  type: string;
  date_label: string;
  description: string;
  tags: string[];
  link: string | null;
  image_url: string | null;
  location: string;
  status: "upcoming" | "ongoing" | "past";
  archived_at: string | null;
  created_at: string;
}

export interface EventPhoto {
  id: string;
  event_slug: string;
  url: string;
  caption: string | null;
  created_at: string;
}

export async function getRecruitmentSettings(): Promise<RecruitmentSettings> {
  if (!isServiceRoleConfigured()) return DEFAULT_RECRUITMENT;
  const { data, error } = await supabaseAdmin().from("site_settings").select("value").eq("key", "recruitment").maybeSingle();
  if (error || !data) return DEFAULT_RECRUITMENT;
  return { ...DEFAULT_RECRUITMENT, ...(data.value as Partial<RecruitmentSettings>) };
}

/** Active roles for the public page (or all roles, for the portal). */
export async function getPositions(opts: { includeInactive?: boolean } = {}): Promise<(Position & { is_active: boolean })[]> {
  const fallback = POSITIONS.map((p) => ({ ...p, is_active: true }));
  if (!isServiceRoleConfigured()) return fallback;
  let q = supabaseAdmin()
    .from("positions")
    .select("id, title, category, openings, summary, responsibilities, eligibility, is_active")
    .order("sort_order")
    .order("title");
  if (!opts.includeInactive) q = q.eq("is_active", true);
  const { data, error } = await q;
  if (error || !data) return fallback;
  // An empty table after the SQL ran means the team removed every role on purpose.
  return data as (Position & { is_active: boolean })[];
}

export async function getManagedEvents(status?: ManagedEvent["status"]): Promise<ManagedEvent[]> {
  if (!isServiceRoleConfigured()) return [];
  let q = supabaseAdmin().from("events").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  return error || !data ? [] : (data as ManagedEvent[]);
}

/**
 * Ongoing events for the home page. `ready` is false when the events table isn't set up,
 * in which case the home page falls back to its built-in cards.
 */
export async function getOngoingEvents(): Promise<{ ready: boolean; events: ManagedEvent[] }> {
  if (!isServiceRoleConfigured()) return { ready: false, events: [] };
  const { data, error } = await supabaseAdmin().from("events").select("*").eq("status", "ongoing").order("created_at");
  return error || !data ? { ready: false, events: [] } : { ready: true, events: data as ManagedEvent[] };
}

export async function getEventPhotos(slug?: string): Promise<EventPhoto[]> {
  if (!isServiceRoleConfigured()) return [];
  let q = supabaseAdmin().from("event_photos").select("id, event_slug, url, caption, created_at").order("created_at");
  if (slug) q = q.eq("event_slug", slug);
  const { data, error } = await q;
  return error || !data ? [] : (data as EventPhoto[]);
}

function toEventData(e: ManagedEvent): EventData {
  return { title: e.title, slug: e.slug, type: e.type, date: e.date_label, description: e.description, tags: e.tags };
}

/** Past events for the public archive: portal-archived events first, then the hard-coded ones, with uploaded photos merged in. */
export async function getPastEvents(): Promise<EventData[]> {
  const [managed, photos] = await Promise.all([getManagedEvents("past"), getEventPhotos()]);
  const managedSlugs = new Set(managed.map((e) => e.slug));
  const archived = managed
    .sort((a, b) => (b.archived_at || b.created_at).localeCompare(a.archived_at || a.created_at))
    .map(toEventData);
  const all = [...archived, ...pastEvents.filter((e) => !managedSlugs.has(e.slug))];

  const bySlug = new Map<string, string[]>();
  for (const p of photos) bySlug.set(p.event_slug, [...(bySlug.get(p.event_slug) || []), p.url]);
  return all.map((e) => {
    const extra = bySlug.get(e.slug);
    return extra ? { ...e, media: [...(e.media || []), ...extra] } : e;
  });
}

export async function getPastEvent(slug: string): Promise<EventData | null> {
  const [managed, photos] = await Promise.all([getManagedEvents("past"), getEventPhotos(slug)]);
  const m = managed.find((e) => e.slug === slug);
  const base = m ? toEventData(m) : pastEvents.find((e) => e.slug === slug);
  if (!base) return null;
  return photos.length ? { ...base, media: [...(base.media || []), ...photos.map((p) => p.url)] } : base;
}

/** Every event a photo or feedback form can be attached to: portal events plus the hard-coded archive. */
export async function getAllEventOptions(): Promise<{ slug: string; title: string; status: string; managed: boolean }[]> {
  const managed = await getManagedEvents();
  const slugs = new Set(managed.map((e) => e.slug));
  return [
    ...managed.map((e) => ({ slug: e.slug, title: e.title, status: e.status, managed: true })),
    ...pastEvents.filter((e) => !slugs.has(e.slug)).map((e) => ({ slug: e.slug, title: e.title, status: "past", managed: false })),
  ];
}
