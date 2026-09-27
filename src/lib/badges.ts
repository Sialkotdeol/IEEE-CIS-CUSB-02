import "server-only";
import { headers } from "next/headers";
import { Resend } from "resend";
import { isServiceRoleConfigured, supabaseAdmin } from "@/lib/supabaseAdmin";
import { ISSUER, type Badge } from "@/lib/badgeShared";

export const BADGE_BUCKET = "badges";
const BADGE_COLUMNS = "id, slug, event_slug, title, description, image_url, focus_x, focus_y, zoom, created_at";

/** Absolute site URL for links in emails and on LinkedIn. */
export async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// ─── Public readers (never return email or UID) ──────────────────────────────

export interface PublicAward {
  id: string;
  awarded_at: string;
  badge: Badge;
}

export interface PublicWallet {
  wallet_slug: string;
  name: string;
  created_at: string;
  awards: PublicAward[];
}

export async function getWallet(slug: string): Promise<PublicWallet | null> {
  if (!isServiceRoleConfigured() || !/^[a-z0-9-]{3,80}$/.test(slug)) return null;
  const db = supabaseAdmin();
  const { data: holder } = await db.from("badge_holders").select("id, wallet_slug, name, created_at, is_public").eq("wallet_slug", slug).maybeSingle();
  // Private wallets look exactly like missing ones.
  if (!holder || !holder.is_public) return null;
  const { data: awards } = await db
    .from("badge_awards")
    .select(`id, awarded_at, badge:badges(${BADGE_COLUMNS})`)
    .eq("holder_id", holder.id)
    .order("awarded_at", { ascending: false });
  return {
    wallet_slug: holder.wallet_slug,
    name: holder.name,
    created_at: holder.created_at,
    awards: ((awards || []) as unknown as PublicAward[]).filter((a) => a.badge),
  };
}

export async function getPublicAward(id: string) {
  if (!isServiceRoleConfigured() || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabaseAdmin()
    .from("badge_awards")
    .select(`id, awarded_at, badge:badges(${BADGE_COLUMNS}), holder:badge_holders(wallet_slug, name)`)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return data as unknown as PublicAward & { holder: { wallet_slug: string; name: string } };
}

export async function getAllBadges(): Promise<(Badge & { awarded: number })[]> {
  if (!isServiceRoleConfigured()) return [];
  const db = supabaseAdmin();
  const [{ data: badges }, { data: awards }] = await Promise.all([
    db.from("badges").select(BADGE_COLUMNS).order("created_at", { ascending: false }),
    db.from("badge_awards").select("badge_id"),
  ]);
  const counts: Record<string, number> = {};
  for (const a of awards || []) counts[a.badge_id] = (counts[a.badge_id] || 0) + 1;
  return ((badges || []) as Badge[]).map((b) => ({ ...b, awarded: counts[b.id] || 0 }));
}

// ─── Awarding ────────────────────────────────────────────────────────────────

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "member";

/** Finds or creates the wallet for an email (keeps the first name/UID given unless blank). */
export async function ensureHolder(r: { name: string; email: string; uid: string | null }) {
  const db = supabaseAdmin();
  const email = r.email.trim().toLowerCase();
  const { data: existing } = await db.from("badge_holders").select("id, wallet_slug, manage_token, name, uid").eq("email", email).maybeSingle();
  if (existing) {
    const patch: Record<string, string> = {};
    if (!existing.name && r.name) patch.name = r.name;
    if (!existing.uid && r.uid) patch.uid = r.uid;
    if (Object.keys(patch).length) await db.from("badge_holders").update(patch).eq("id", existing.id);
    return { id: existing.id as string, wallet_slug: existing.wallet_slug as string, manage_token: existing.manage_token as string, created: false };
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const wallet_slug = `${slugify(r.name)}-${crypto.randomUUID().slice(0, 6)}`;
    const { data, error } = await db
      .from("badge_holders")
      .insert({ wallet_slug, email, name: r.name.trim(), uid: r.uid })
      .select("id, wallet_slug, manage_token")
      .single();
    if (data) return { id: data.id as string, wallet_slug: data.wallet_slug as string, manage_token: data.manage_token as string, created: true };
    if (error?.code !== "23505") throw new Error(error?.message || "Could not create wallet");
    // 23505: either the slug collided (retry) or the email was just inserted concurrently.
    const { data: again } = await db.from("badge_holders").select("id, wallet_slug, manage_token").eq("email", email).maybeSingle();
    if (again) return { id: again.id as string, wallet_slug: again.wallet_slug as string, manage_token: again.manage_token as string, created: false };
  }
  throw new Error("Could not create wallet");
}

/** Awards a badge to a holder. If they already have it, returns the existing award. */
export async function awardBadge(badgeId: string, holderId: string, awardedBy: string): Promise<{ awardId: string; created: boolean }> {
  const db = supabaseAdmin();
  const { data, error } = await db.from("badge_awards").insert({ badge_id: badgeId, holder_id: holderId, awarded_by: awardedBy }).select("id").single();
  if (data) return { awardId: data.id as string, created: true };
  if (error?.code !== "23505") throw new Error(error?.message || "Could not award badge");
  const { data: existing } = await db.from("badge_awards").select("id").eq("badge_id", badgeId).eq("holder_id", holderId).single();
  return { awardId: existing!.id as string, created: false };
}

export async function getHolderByToken(token: string) {
  if (!isServiceRoleConfigured() || !/^[0-9a-f]{48}$/.test(token)) return null;
  const { data } = await supabaseAdmin().from("badge_holders").select("id, name, wallet_slug, is_public").eq("manage_token", token).maybeSingle();
  return data as { id: string; name: string; wallet_slug: string; is_public: boolean } | null;
}

/** HTML block linking to a badge, its wallet and the private manage page — used in badge and certificate emails. */
export function badgeEmailBlock(opts: { badge: Badge; awardId: string; walletSlug: string; manageToken: string; origin: string }) {
  const credentialUrl = `${opts.origin}/badges/${opts.awardId}`;
  const walletUrl = `${opts.origin}/badges/wallet/${opts.walletSlug}`;
  const manageUrl = `${opts.origin}/badges/manage/${opts.manageToken}`;
  const img = opts.badge.image_url
    ? `<p style="text-align:center"><img src="${opts.badge.image_url}" width="140" height="140" alt="" style="border-radius:50%;object-fit:cover;border:6px solid #00629b"/></p>`
    : "";
  return `${img}
<p style="text-align:center;margin:20px 0">
  <a href="${credentialUrl}" style="background:#00629b;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">View badge &amp; add to LinkedIn</a>
</p>
<p>All your badges live in your wallet: <a href="${walletUrl}">${walletUrl}</a></p>
<p style="color:#64748b;font-size:12px">Want your wallet private? <a href="${manageUrl}" style="color:#64748b">Manage your wallet</a> (this link is just for you — don't share it).</p>`;
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const FROM = process.env.BADGE_FROM_EMAIL || "IEEE CIS CUSB <badges@ieeeciscusb.site>";

export async function sendBadgeEmail(opts: { to: string; name: string; badge: Badge; awardId: string; walletSlug: string; manageToken: string; origin: string }) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: FROM,
    to: opts.to,
    subject: `🏅 You earned the ${opts.badge.title} badge`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#0f172a">
<h2 style="text-align:center;margin:8px 0">${escapeHtml(opts.badge.title)}</h2>
<p>Hi ${escapeHtml(opts.name)},</p>
<p>Congratulations! You've earned a new digital badge from <strong>${ISSUER}</strong> for taking part in <strong>${escapeHtml(opts.badge.title)}</strong>.</p>
${badgeEmailBlock(opts)}
<p style="color:#64748b;font-size:12px">— Team IEEE CIS CUSB</p>
</div>`,
  });
  if (error) throw new Error(error.message);
}
