// Badge types and helpers safe for both server and client components.

export interface Badge {
  id: string;
  slug: string;
  event_slug: string | null;
  title: string;
  description: string;
  image_url: string | null;
  focus_x: number;
  focus_y: number;
  zoom: number;
  created_at: string;
}

export const ISSUER = "IEEE CIS CUSB";
export const ISSUER_FULL = "IEEE Computational Intelligence Society, Chandigarh University Student Branch";

/** Wallet levels, by number of badges earned. */
export const TIERS = [
  { min: 10, name: "Legend", color: "#7c3aed" },
  { min: 5, name: "Champion", color: "#d97706" },
  { min: 3, name: "Contributor", color: "#0891b2" },
  { min: 1, name: "Explorer", color: "#00629b" },
] as const;

export function tierFor(count: number) {
  return TIERS.find((t) => count >= t.min) ?? null;
}

export function nextTier(count: number) {
  return [...TIERS].reverse().find((t) => t.min > count) ?? null;
}

/** LinkedIn "Add licence or certification" link, pre-filled. */
export function linkedInAddUrl(opts: { title: string; awardedAt: string; credentialUrl: string; credentialId: string }) {
  const d = new Date(opts.awardedAt);
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: `${opts.title} — Digital Badge`,
    organizationName: ISSUER,
    issueYear: String(d.getFullYear()),
    issueMonth: String(d.getMonth() + 1),
    certUrl: opts.credentialUrl,
    certId: opts.credentialId,
  });
  return `https://www.linkedin.com/profile/add?${params}`;
}

export function linkedInShareUrl(url: string) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}
