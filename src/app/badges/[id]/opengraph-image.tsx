import { ImageResponse } from "next/og";
import { getPublicAward } from "@/lib/badges";
import { ISSUER } from "@/lib/badgeShared";

// LinkedIn / social preview for a badge: the circular badge next to the holder's name.
export const alt = "IEEE CIS CUSB digital badge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const award = await getPublicAward((await params).id);
  const b = award?.badge;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)", padding: 70, gap: 60 }}>
        <div style={{ width: 420, height: 420, borderRadius: 9999, background: "linear-gradient(135deg, #00629b, #0891b2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: 360, height: 360, borderRadius: 9999, border: "10px solid white", overflow: "hidden", display: "flex", background: "#e2e8f0" }}>
            {b?.image_url && (
               
              <img src={b.image_url} alt="" width={340} height={340} style={{ width: 340, height: 340, objectFit: "cover", objectPosition: `${b.focus_x * 100}% ${b.focus_y * 100}%` }} />
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#00629b", letterSpacing: 3 }}>{ISSUER} · DIGITAL BADGE</div>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#0f172a", lineHeight: 1.1, marginTop: 20 }}>{b?.title || "Badge"}</div>
          <div style={{ fontSize: 34, color: "#475569", marginTop: 24 }}>Earned by {award?.holder.name || "a member"}</div>
        </div>
      </div>
    ),
    size
  );
}
