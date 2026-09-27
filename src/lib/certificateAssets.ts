import "server-only";
import { CERT_BUCKET } from "@/lib/certificate";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/** Short-lived signed URLs so the portal can display private template / signature images. */
export async function signedAssetUrls(paths: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return {};
  const { data } = await supabaseAdmin().storage.from(CERT_BUCKET).createSignedUrls(unique, 60 * 60);
  const urls: Record<string, string> = {};
  for (const d of data || []) if (d.path && d.signedUrl) urls[d.path] = d.signedUrl;
  return urls;
}
