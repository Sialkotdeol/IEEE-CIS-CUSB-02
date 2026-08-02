"use client";

import React, { useEffect, useRef, ReactNode, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  glowHue?: number;      // hsl hue value, e.g. 205 = IEEE Blue
  borderSize?: number;   // border width in px
  spotSize?: number;     // spotlight radius in px
}

/**
 * SpotlightCard — tracks the global pointer position and projects a coloured
 * spotlight onto the card's border. Zero re-renders: all updates happen via
 * direct DOM CSS-custom-property mutation for 60fps performance.
 */
export function SpotlightCard({
  children,
  className,
  glowHue = 205,
  borderSize = 2,
  spotSize = 220,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--sc-x", String(e.clientX.toFixed(1)));
    el.style.setProperty("--sc-y", String(e.clientY.toFixed(1)));
    el.style.setProperty(
      "--sc-hue",
      String((glowHue + ((e.clientX / window.innerWidth) * 60 - 30)).toFixed(1))
    );
  }, [glowHue]);

  useEffect(() => {
    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => document.removeEventListener("pointermove", handlePointerMove);
  }, [handlePointerMove]);

  return (
    <div
      ref={ref}
      data-spotlight-card
      className={cn("relative isolate overflow-hidden", className)}
      style={{
        "--sc-border-size": `${borderSize}px`,
        "--sc-size": `${spotSize}px`,
        "--sc-hue": String(glowHue),
        "--sc-border-spot-opacity": "0.8",
        "--sc-border-light-opacity": "0.5",
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export default SpotlightCard;
