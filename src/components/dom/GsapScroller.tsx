"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function GsapScroller({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.innerWidth < 1024) return;
    const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

    // ─── SECTION LAYOUT ───
    // 5 sections: Hero | About | Flagship | Featured | Ongoing Events
    const SECTION_COUNT = 5;
    const SECTION_DUR = 6;  // timeline units per section
    const TRANS = 2;
    const HOLD = SECTION_DUR - TRANS;

    // Compute the timeline position where each section "lands" (fully visible)
    const sectionPositions: number[] = [];

    let pos = 0;

    // ═══════════════════════════════
    // SECTION 0: HERO
    // ═══════════════════════════════
    sectionPositions.push(pos);
    tl.to(".gsap-hero-content", { autoAlpha: 1, duration: HOLD }, pos);
    tl.to(".gsap-hero-photos", { autoAlpha: 1, duration: HOLD }, pos);
    pos += HOLD;

    tl.to(".gsap-hero-content", {
      autoAlpha: 0, scale: 0.7, rotateX: 12, y: -60,
      duration: TRANS, ease: "power2.inOut",
    }, pos);
    tl.to(".gsap-hero-photos", {
      autoAlpha: 0, scale: 1.15, y: -40,
      duration: TRANS, ease: "power2.inOut",
    }, pos);
    tl.fromTo(".gsap-about-section",
      { clipPath: "circle(0% at 50% 50%)" },
      { clipPath: "circle(150% at 50% 50%)", duration: TRANS, ease: "power2.inOut" },
    pos);
    pos += TRANS;

    // ═══════════════════════════════
    // SECTION 1: ABOUT US
    // ═══════════════════════════════
    sectionPositions.push(pos);
    tl.to(".gsap-about-section", { autoAlpha: 1, duration: HOLD }, pos);
    pos += HOLD;

    tl.to(".gsap-about-section", {
      autoAlpha: 0, y: -100, scale: 1.05,
      duration: TRANS, ease: "power2.inOut",
    }, pos);
    tl.fromTo(".gsap-flagship-events-section",
      { clipPath: "circle(0% at 50% 50%)" },
      { clipPath: "circle(150% at 50% 50%)", duration: TRANS, ease: "power2.inOut" },
    pos);
    pos += TRANS;

    // ═══════════════════════════════
    // SECTION 2: FLAGSHIP EVENTS
    // ═══════════════════════════════
    sectionPositions.push(pos);
    tl.to(".gsap-flagship-events-section", { autoAlpha: 1, duration: HOLD }, pos);
    pos += HOLD;

    tl.to(".gsap-flagship-events-section", {
      autoAlpha: 0, y: -100, scale: 1.05,
      duration: TRANS, ease: "power2.inOut",
    }, pos);
    tl.fromTo(".gsap-featured-section",
      { clipPath: "circle(0% at 50% 50%)" },
      { clipPath: "circle(150% at 50% 50%)", duration: TRANS, ease: "power2.inOut" },
    pos);
    pos += TRANS;

    // ═══════════════════════════════
    // SECTION 3: FEATURED CONTENT
    // ═══════════════════════════════
    sectionPositions.push(pos);
    tl.to(".gsap-featured-section", { autoAlpha: 1, duration: HOLD }, pos);
    pos += HOLD;

    tl.to(".gsap-featured-section", {
      autoAlpha: 0, y: -100, scale: 1.05,
      duration: TRANS, ease: "power2.inOut",
    }, pos);
    tl.fromTo(".gsap-ongoing-section",
      { clipPath: "circle(0% at 50% 50%)" },
      { clipPath: "circle(150% at 50% 50%)", duration: TRANS, ease: "power2.inOut" },
    pos);
    pos += TRANS;

    // ═══════════════════════════════
    // SECTION 4: ONGOING EVENTS
    // ═══════════════════════════════
    sectionPositions.push(pos);
    tl.to(".gsap-ongoing-section", { autoAlpha: 1, duration: HOLD }, pos);

    // Start at section 0
    tl.seek(sectionPositions[0]);

    // ─── APPLE-STYLE DIRECT TIMELINE CONTROL ───
    // No ScrollTrigger scrub. No native scroll. We drive the timeline directly.
    // Key insight: each section has a HOLD (dead time) + TRANS (the visual animation).
    // For adjacent transitions, we SKIP the hold and only animate the transition
    // portion so the circle-reveal is fully visible and dramatic.
    let currentSection = 0;
    let locked = false;

    // Duration for the circle-reveal animation in real seconds
    const TRANSITION_DURATION = 0.65;
    // Hard cooldown after a transition completes before accepting new input
    const POST_TRANSITION_COOLDOWN = 50; // ms

    const updateIndicators = (index: number, duration: number) => {
      gsap.to(".nav-dot", {
        backgroundColor: (i: number) => i === index ? "#6366f1" : "rgba(255, 255, 255, 0.2)",
        scale: (i: number) => i === index ? 1.25 : 1,
        duration,
        ease: "power2.inOut",
      });
    };

    const unlockAfterTransition = () => {
      setTimeout(() => {
        locked = false;
      }, POST_TRANSITION_COOLDOWN);
    };

    const goToSection = (index: number) => {
      if (index < 0 || index >= SECTION_COUNT || index === currentSection || locked) return;
      locked = true;
      const prevSection = currentSection;
      currentSection = index;
      window.dispatchEvent(new CustomEvent('section-change', { detail: index }));

      const isAdjacent = Math.abs(index - prevSection) === 1;
      const goingForward = index > prevSection;

      if (isAdjacent) {
        // ─── ADJACENT TRANSITION: skip hold, animate only the reveal ───
        if (goingForward) {
          // Jump instantly to where the transition animation begins
          // (end of the hold = start of the outgoing transition)
          const transitionStart = sectionPositions[prevSection] + HOLD;
          tl.seek(transitionStart);

          // Now tween through ONLY the circle-reveal/crossfade portion
          updateIndicators(index, TRANSITION_DURATION);
          gsap.to(tl, {
            time: sectionPositions[index],
            duration: TRANSITION_DURATION,
            ease: "power3.inOut",
            onComplete: unlockAfterTransition,
          });
        } else {
          // Going backward: reverse through the transition that brought us here
          // The incoming transition ends at sectionPositions[prevSection]
          // and starts at sectionPositions[prevSection] - TRANS
          const reverseTarget = sectionPositions[prevSection] - TRANS;

          updateIndicators(index, TRANSITION_DURATION);
          gsap.to(tl, {
            time: reverseTarget,
            duration: TRANSITION_DURATION,
            ease: "power3.inOut",
            onComplete: () => {
              // Settle at the section's hold position (visually identical)
              tl.seek(sectionPositions[index]);
              unlockAfterTransition();
            },
          });
        }
      } else {
        // ─── MULTI-SECTION JUMP (dot navigation): direct tween ───
        updateIndicators(index, TRANSITION_DURATION * 1.2);
        gsap.to(tl, {
          time: sectionPositions[index],
          duration: TRANSITION_DURATION * 1.2,
          ease: "power3.inOut",
          onComplete: unlockAfterTransition,
        });
      }
    };

    // ─── SCROLL TO ADVANCE ───
    let wheelAccumulator = 0;
    let lastWheelTime = Date.now();
    let isMomentum = false;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const now = Date.now();
      // Detect a pause in scroll events to reset momentum and accumulator
      if (now - lastWheelTime > 50) {
        isMomentum = false;
        wheelAccumulator = 0;
      }
      lastWheelTime = now;

      if (locked || isMomentum) return;

      wheelAccumulator += e.deltaY;

      // Trigger threshold (accumulates slow scrolls, or triggers instantly on fast scrolls)
      if (Math.abs(wheelAccumulator) > 40) {
        const direction = wheelAccumulator > 0 ? 1 : -1;
        const nextSection = currentSection + direction;
        
        if (nextSection >= 0 && nextSection < SECTION_COUNT) {
          isMomentum = true; // Block until pause
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

    // ─── KEYBOARD (accessibility) ───
    const onKeyDown = (e: KeyboardEvent) => {
      if (locked) return;

      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        goToSection(currentSection + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goToSection(currentSection - 1);
      }
    };

    // ─── EVENT LISTENERS ───
    const blockTouchMove = (e: Event) => { e.preventDefault(); };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
    window.addEventListener("touchmove", blockTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    // Initial dot state
    gsap.set(".nav-dot", { backgroundColor: "rgba(255, 255, 255, 0.2)", scale: 1 });
    gsap.set(".nav-dot:nth-child(1)", { backgroundColor: "#6366f1", scale: 1.25 });
    
    // Broadcast initial state
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('section-change', { detail: 0 }));
    }, 100);

    // Prevent all native scroll on the body while scroller is mounted
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";

    // ─── NAV SCROLL HANDLERS ───
    const handleAboutScroll = () => goToSection(1);
    const handleHeroScroll = () => goToSection(0);

    window.addEventListener("scroll-to-about", handleAboutScroll);
    window.addEventListener("scroll-to-hero", handleHeroScroll);

    // Make dot navigation interactive
    const handleDotClick = (e: Event) => {
      e.stopPropagation(); // Prevent the click-to-advance from also firing
      const target = e.currentTarget as HTMLElement;
      const index = parseInt(target.getAttribute("data-index") || "0", 10);
      goToSection(index);
    };

    document.querySelectorAll(".nav-dot").forEach(dot => {
      dot.addEventListener("click", handleDotClick);
    });

    if (window.location.hash === "#about") {
      setTimeout(handleAboutScroll, 500);
    }

    const containerEl = container.current;

    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.overscrollBehavior = "";
      window.removeEventListener("wheel", onWheel, { capture: true } as EventListenerOptions);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchmove", blockTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll-to-about", handleAboutScroll);
      window.removeEventListener("scroll-to-hero", handleHeroScroll);
      document.querySelectorAll(".nav-dot").forEach(dot => {
        dot.removeEventListener("click", handleDotClick);
      });
    };
  }, { scope: container });

  return (
    <main ref={container} className="relative w-full lg:h-screen lg:overflow-hidden bg-transparent" style={{ perspective: "1200px" }}>
      {children}
      
      {/* Side Navigation Dots */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-50 hidden lg:flex">
        {[0, 1, 2, 3, 4].map((index) => (
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
