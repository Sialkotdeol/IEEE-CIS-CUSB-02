"use client";

import { useEffect, useRef } from "react";
import AmbientPinkBlueGradient from "./AmbientPinkBlueGradient";

/**
 * GsapScroller — handles:
 *  1. Intersection-observer–based reveal animations (.reveal-section → .is-visible)
 *  2. Ambient Pink + Light Blue + White shifting background gradient
 */
export default function GsapScroller({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLElement>(null);

  /* ── Reveal animations ── */
  useEffect(() => {
    const sections = Array.from(
      container.current?.querySelectorAll<HTMLElement>("[data-reveal]") ?? []
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      sections.forEach((s) => s.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px" }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <main ref={container} className="relative w-full overflow-hidden site-canvas min-h-screen">
      <AmbientPinkBlueGradient />
      <div className="relative z-10">
        {children}
      </div>
    </main>
  );
}
