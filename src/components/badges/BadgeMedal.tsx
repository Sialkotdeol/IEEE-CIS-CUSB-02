import type { Badge } from "@/lib/badgeShared";

// The badge: the event poster cropped to a circle, inside a ring with the issuer and
// event name running around it. Pure markup, so it works in server and client components.

export default function BadgeMedal({
  badge,
  size = 160,
  ring = true,
  className = "",
}: {
  badge: Pick<Badge, "id" | "title" | "image_url" | "focus_x" | "focus_y" | "zoom">;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  const pathId = `arc-${badge.id}-${size}`;
  const inset = ring ? size * 0.13 : 0;
  // Repeat short labels so the text wraps the whole ring; trim long ones.
  const unit = `IEEE CIS CUSB • ${badge.title.toUpperCase()} • `;
  let label = unit;
  while (label.length < 44) label += unit;
  if (label.length > 64) label = `${label.slice(0, 62).trimEnd()}… • `;

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }} aria-label={`${badge.title} badge`} role="img">
      {ring && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00629b] via-[#0891b2] to-[#00629b] shadow-lg" />
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" aria-hidden>
            <defs>
              <path id={pathId} d="M 100,100 m -83,0 a 83,83 0 1,1 166,0 a 83,83 0 1,1 -166,0" />
            </defs>
            <text fill="white" fontSize="11.5" fontWeight="700" letterSpacing="1.6" fontFamily="Helvetica, Arial, sans-serif">
              <textPath href={`#${pathId}`} startOffset="0" textLength="515" lengthAdjust="spacing">
                {label}
              </textPath>
            </text>
          </svg>
        </>
      )}
      <div
        className="absolute rounded-full overflow-hidden bg-slate-200 ring-4 ring-white"
        style={{ inset }}
      >
        {badge.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={badge.image_url}
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: `${badge.focus_x * 100}% ${badge.focus_y * 100}%`, transform: `scale(${badge.zoom})`, transformOrigin: `${badge.focus_x * 100}% ${badge.focus_y * 100}%` }}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 font-black" style={{ fontSize: size * 0.18 }}>
            {badge.title.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
