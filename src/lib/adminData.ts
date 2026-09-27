import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const APPLICATION_STATUSES = ["pending", "shortlisted", "interview", "selected", "rejected"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Application {
  id: string;
  created_at: string;
  full_name: string;
  uid: string;
  email: string;
  phone: string;
  department: string;
  year_of_study: string;
  is_ieee_member: boolean;
  ieee_member_id: string | null;
  first_preference: string;
  second_preference: string | null;
  why_this_role: string;
  relevant_experience: string;
  hours_per_week: string;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  status: ApplicationStatus;
}

export interface Score {
  application_id: string;
  reviewer_email: string;
  communication: number;
  skills: number;
  commitment: number;
  comment: string | null;
  updated_at: string;
}

export interface ScoreSummary {
  count: number;
  communication: number | null;
  skills: number | null;
  commitment: number | null;
  overall: number | null;
}

const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);

export function summarizeScores(scores: Score[]): ScoreSummary {
  return {
    count: scores.length,
    communication: avg(scores.map((s) => s.communication)),
    skills: avg(scores.map((s) => s.skills)),
    commitment: avg(scores.map((s) => s.commitment)),
    overall: avg(scores.map((s) => (s.communication + s.skills + s.commitment) / 3)),
  };
}

/** Reads every row of a query, 1000 at a time (PostgREST's default page cap). */
export async function fetchAll<T>(table: string, select = "*", order = "created_at"): Promise<{ rows: T[]; error: string | null }> {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabaseAdmin()
      .from(table)
      .select(select)
      .order(order, { ascending: false })
      .range(from, from + 999);
    if (error) return { rows, error: error.message };
    rows.push(...((data || []) as T[]));
    if (!data || data.length < 1000) return { rows, error: null };
  }
}

export async function getApplicationsWithScores() {
  const [apps, scores] = await Promise.all([
    fetchAll<Application>("position_applications"),
    fetchAll<Score>("application_scores", "*", "updated_at"),
  ]);
  const byApp = new Map<string, Score[]>();
  for (const s of scores.rows) byApp.set(s.application_id, [...(byApp.get(s.application_id) || []), s]);
  return {
    error: apps.error,
    applications: apps.rows.map((a) => ({ ...a, scores: summarizeScores(byApp.get(a.id) || []) })),
  };
}

// ─── Event registrations ──────────────────────────────────────────────────────
// Registration tables the portal can browse, export, pull certificate recipients
// from, and scan for repeat participants. Add new event tables here.

export const REGISTRATION_SOURCES = {
  innovators_hub_registrations: { label: "CIS Innovators Hub", name: "name", email: "email", uid: "uid" },
  contribute_x_registrations: { label: "Contribute-X", name: "full_name", email: "email", uid: "uid" },
  code_warriors_registrations: { label: "Code Warriors", name: "name", email: "email", uid: "uid" },
  position_applications: { label: "Call for Positions", name: "full_name", email: "email", uid: "uid" },
} as const;

export type RegistrationSource = keyof typeof REGISTRATION_SOURCES;

export function isRegistrationSource(t: string): t is RegistrationSource {
  return Object.prototype.hasOwnProperty.call(REGISTRATION_SOURCES, t);
}

export interface Participant {
  key: string;
  name: string;
  email: string;
  uid: string;
  events: string[];
  badges: string[];
  count: number;
}

/**
 * Students who joined several events or earned several badges. Matched by email, then UID.
 * `count` is events (registrations + feedback); badges are counted separately so a badge for
 * an event someone also registered for isn't counted twice. Someone qualifies with `minEvents`
 * events OR `minEvents` badges.
 */
export async function getRepeatParticipants(minEvents = 2): Promise<{ participants: Participant[]; errors: string[] }> {
  const errors: string[] = [];
  const people = new Map<string, Participant>();
  const uidToKey = new Map<string, string>();

  const add = (label: string, name: unknown, email: unknown, uid: unknown, kind: "event" | "badge" = "event") => {
    const e = typeof email === "string" ? email.trim().toLowerCase() : "";
    const u = typeof uid === "string" ? uid.trim().toUpperCase() : "";
    if (!e && !u) return;
    const key = (e && people.has(e) ? e : u && uidToKey.get(u)) || e || `uid:${u}`;
    const p = people.get(key) || { key, name: "", email: e, uid: u, events: [], badges: [], count: 0 };
    if (!p.name && typeof name === "string") p.name = name.trim();
    if (!p.email && e) p.email = e;
    if (!p.uid && u) p.uid = u;
    const list = kind === "badge" ? p.badges : p.events;
    if (!list.includes(label)) list.push(label);
    people.set(key, p);
    if (u) uidToKey.set(u, key);
  };

  await Promise.all(
    Object.entries(REGISTRATION_SOURCES).map(async ([table, cfg]) => {
      const res = await fetchAll<Record<string, unknown>>(table, `${cfg.name}, ${cfg.email}, ${cfg.uid}`);
      if (res.error) errors.push(`${cfg.label}: ${res.error}`);
      for (const r of res.rows) add(cfg.label, r[cfg.name], r[cfg.email], r[cfg.uid]);
    })
  );

  const forms = await supabaseAdmin().from("feedback_forms").select("id, title");
  const titles = new Map((forms.data || []).map((f) => [f.id as string, `Feedback: ${f.title}`]));
  const responses = await fetchAll<{ form_id: string; respondent_name: string | null; respondent_email: string | null }>(
    "feedback_responses",
    "form_id, respondent_name, respondent_email"
  );
  for (const r of responses.rows) add(titles.get(r.form_id) || "Feedback", r.respondent_name, r.respondent_email, null);

  const awards = await fetchAll<{ badge: { title: string } | null; holder: { name: string; email: string; uid: string | null } | null }>(
    "badge_awards",
    "badge:badges(title), holder:badge_holders(name, email, uid)",
    "awarded_at"
  );
  if (awards.error && !/badge_awards/.test(awards.error)) errors.push(`Badges: ${awards.error}`);
  for (const a of awards.rows) if (a.badge && a.holder) add(a.badge.title, a.holder.name, a.holder.email, a.holder.uid, "badge");

  const participants = [...people.values()]
    .map((p) => ({ ...p, count: p.events.length }))
    .filter((p) => p.count >= minEvents || p.badges.length >= minEvents)
    .sort((a, b) => b.count + b.badges.length - (a.count + a.badges.length) || a.name.localeCompare(b.name));
  return { participants, errors };
}
