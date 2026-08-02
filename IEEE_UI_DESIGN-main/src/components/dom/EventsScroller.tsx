"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function EventsScroller({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLElement>(null);
  const masterTl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    // If we're on mobile/tablet portrait, don't use GSAP scrolling.
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
      return;
    }

    // Lock scrolling globally
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Rebuild the master timeline
    const tl = gsap.timeline({ paused: true });
    masterTl.current = tl;

    const SECTION_COUNT = 3;
    const TRANS = 2;
    const HOLD = 4;

    const sectionPositions: number[] = [];
    let pos = 0;

    // ═══════════════════════════════
    // SECTION 0: EVENTS HERO
    // ═══════════════════════════════
    sectionPositions.push(pos);
    tl.to(".gsap-events-hero", { autoAlpha: 1, duration: HOLD }, pos);
    pos += HOLD;

    tl.to(".gsap-events-hero", {
      autoAlpha: 0, y: -40, scale: 0.98,
      duration: TRANS, ease: "power2.inOut",
    }, pos);
    tl.fromTo(".gsap-events-flagship",
      { autoAlpha: 0, y: 80 },
      { autoAlpha: 1, y: 0, duration: TRANS, ease: "power2.inOut" },
    pos);
    pos += TRANS;

    // ═══════════════════════════════
    // SECTION 1: FLAGSHIP EVENTS
    // ═══════════════════════════════
    sectionPositions.push(pos);
    tl.to(".gsap-events-flagship", { autoAlpha: 1, duration: HOLD }, pos);
    pos += HOLD;

    tl.to(".gsap-events-flagship", {
      autoAlpha: 0, y: -40, scale: 0.98,
      duration: TRANS, ease: "power2.inOut",
    }, pos);
    tl.fromTo(".gsap-events-past",
      { autoAlpha: 0, y: 80 },
      { autoAlpha: 1, y: 0, duration: TRANS, ease: "power2.inOut" },
    pos);
    pos += TRANS;

    // ═══════════════════════════════
    // SECTION 2: PAST EVENTS
    // ═══════════════════════════════
    sectionPositions.push(pos);
    tl.to(".gsap-events-past", { autoAlpha: 1, duration: HOLD }, pos);

    // Initial state setup
    gsap.set(".gsap-events-flagship", { autoAlpha: 0 });
    gsap.set(".gsap-events-past", { autoAlpha: 0 });

    const TRANSITION_DURATION = 0.65;
    let locked = false;
    let currentSection = 0;

    // Update dot indicators
    const updateIndicators = (index: number, dur: number) => {
      document.querySelectorAll(".nav-dot").forEach((dot, i) => {
        gsap.to(dot, {
          scale: i === index ? 1.5 : 1,
          opacity: i === index ? 1 : 0.4,
          backgroundColor: i === index ? "#fff" : "rgba(255,255,255,0.4)",
          duration: dur,
        });
      });
      currentSection = index;
      
      // Dispatch event to child sections so they know to run their entrance animations
      window.dispatchEvent(new CustomEvent('section-change', { detail: index }));
    };

    updateIndicators(0, 0);

    const unlockAfterTransition = () => {
      locked = false;
    };

    const goToSection = (index: number) => {
      if (index < 0 || index >= SECTION_COUNT || index === currentSection || locked) return;
      locked = true;

      const prevSection = currentSection;
      const isAdjacent = Math.abs(index - prevSection) === 1;
      const goingForward = index > prevSection;

      if (isAdjacent) {
        if (goingForward) {
          const transitionStart = sectionPositions[prevSection] + HOLD;
          tl.seek(transitionStart);

          updateIndicators(index, TRANSITION_DURATION);
          gsap.to(tl, {
            time: sectionPositions[index],
            duration: TRANSITION_DURATION,
            ease: "power3.inOut",
            onComplete: unlockAfterTransition,
          });
        } else {
          const reverseTarget = sectionPositions[prevSection] - TRANS;

          updateIndicators(index, TRANSITION_DURATION);
          gsap.to(tl, {
            time: reverseTarget,
            duration: TRANSITION_DURATION,
            ease: "power3.inOut",
            onComplete: () => {
              tl.seek(sectionPositions[index]);
              unlockAfterTransition();
            },
          });
        }
      } else {
        tl.seek(sectionPositions[index]);
        updateIndicators(index, TRANSITION_DURATION);
        setTimeout(() => {
          locked = false;
        }, TRANSITION_DURATION * 1000);
      }
    };

    // ─── EVENT LISTENERS FOR SCROLL/SWIPE ───
    let wheelAccumulator = 0;
    let isMomentum = false;
    let lastWheelTime = Date.now();

    const onWheel = (e: WheelEvent) => {
      if (locked) return;
      const now = Date.now();

      if (now - lastWheelTime > 50) {
        isMomentum = false;
        wheelAccumulator = 0;
      }
      lastWheelTime = now;

      if (isMomentum) return;
      wheelAccumulator += e.deltaY;

      if (Math.abs(wheelAccumulator) > 40) {
        const direction = wheelAccumulator > 0 ? 1 : -1;
        const nextSection = currentSection + direction;
        
        if (nextSection >= 0 && nextSection < SECTION_COUNT) {
          isMomentum = true;
          goToSection(nextSection);
        }
        wheelAccumulator = 0;
      }
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const onTouchEnd = (e: TouchEvent) => {
      if (locked) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      if (Math.abs(deltaY) < 50) return;

      if (deltaY > 0) {
        goToSection(currentSection + 1);
      } else {
        goToSection(currentSection - 1);
      }
    };

    // Prevent default scroll behavior gracefully
    const blockTouchMove = (e: TouchEvent) => e.preventDefault();

    // Keyboard support
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") goToSection(currentSection + 1);
      if (e.key === "ArrowUp" || e.key === "PageUp") goToSection(currentSection - 1);
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
    window.addEventListener("touchmove", blockTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    // Side navigation clicks
    const handleDotClick = (e: Event) => {
      e.stopPropagation();
      const target = e.currentTarget as HTMLElement;
      const index = parseInt(target.getAttribute("data-index") || "0", 10);
      goToSection(index);
    };
    document.querySelectorAll(".nav-dot").forEach(dot => {
      dot.addEventListener("click", handleDotClick);
    });

    const handleHeroScroll = () => goToSection(0);
    window.addEventListener("scroll-to-hero", handleHeroScroll);

    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchmove", blockTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll-to-hero", handleHeroScroll);
      document.querySelectorAll(".nav-dot").forEach(dot => {
        dot.removeEventListener("click", handleDotClick);
      });
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, { scope: container });

  return (
    <main ref={container} className="relative w-full lg:h-screen lg:overflow-hidden bg-[#050505]" style={{ perspective: "1200px" }}>
      {children}
      
      {/* Side Navigation Dots */}
      <div className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            data-index={index}
            className="nav-dot w-2 h-2 rounded-full cursor-pointer hover:scale-150 hover:bg-white/60"
            aria-label={`Go to section ${index + 1}`}
          />
        ))}
      </div>
    </main>
  );
}
