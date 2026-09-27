import { ImageResponse } from "next/og";
import { getWallet } from "@/lib/badges";
import { ISSUER, tierFor } from "@/lib/badgeShared";

// LinkedIn / social preview for a wallet: name, badge count and a row of badges.
export const alt = "IEEE CIS CUSB badge wallet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const wallet = await getWallet((await params).slug);
  const awards = wallet?.awards.slice(0, 5) || [];
  const count = wallet?.awards.length || 0;
  const tier = tierFor(count);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 70, background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)" }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#00629b", letterSpacing: 3 }}>{ISSUER} · BADGE WALLET</div>
        <div style={{ fontSize: 72, fontWeight: 800, color: "#0f172a", marginTop: 16 }}>{wallet?.name || "Badge wallet"}</div>
        <div style={{ fontSize: 34, color: "#475569", marginTop: 10 }}>
          {`${count} badge${count === 1 ? "" : "s"} earned${tier ? ` · ${tier.name}` : ""}`}
        </div>
        <div style={{ display: "flex", gap: 28, marginTop: 50 }}>
          {awards.map((a) => (
            <div key={a.id} style={{ width: 170, height: 170, borderRadius: 9999, background: "linear-gradient(135deg, #00629b, #0891b2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 146, height: 146, borderRadius: 9999, border: "6px solid white", overflow: "hidden", display: "flex", background: "#e2e8f0" }}>
                {a.badge.image_url && (
                   
                  <img src={a.badge.image_url} alt="" width={134} height={134} style={{ width: 134, height: 134, objectFit: "cover", objectPosition: `${a.badge.focus_x * 100}% ${a.badge.focus_y * 100}%` }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
