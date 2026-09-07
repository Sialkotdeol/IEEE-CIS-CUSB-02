"use client";

import { useCallback, useRef, useState, type CSSProperties, type HTMLAttributes, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type GlowCardProps = HTMLAttributes<HTMLDivElement> & {
  glowColor?: string;
};

/** A lightweight pointer spotlight surface that degrades to a static card. */
export function GlowCard({ className, glowColor = "0, 98, 155", onMouseMove, onMouseLeave, style, ...props }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -200, y: -200, active: false });

  const handleMouseMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const bounds = cardRef.current?.getBoundingClientRect();
    if (bounds) {
      setPosition({ x: event.clientX - bounds.left, y: event.clientY - bounds.top, active: true });
    }
    onMouseMove?.(event);
  }, [onMouseMove]);

  const handleMouseLeave = useCallback((event: MouseEvent<HTMLDivElement>) => {
    setPosition((current) => ({ ...current, active: false }));
    onMouseLeave?.(event);
  }, [onMouseLeave]);

  return (
    <div
      ref={cardRef}
      className={cn("glow-card", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        "--spotlight-x": `${position.x}px`,
        "--spotlight-y": `${position.y}px`,
        "--spotlight-color": glowColor,
        "--spotlight-opacity": position.active ? 1 : 0,
        ...style,
      } as CSSProperties}
      {...props}
    />
  );
}
