"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { pastEvents } from "@/data/events";

const VALID_EVENTS = pastEvents.filter(e => e.media && e.media.length > 0);

const MEMORY_DATA = VALID_EVENTS.length > 0 ? VALID_EVENTS : [
  {
    title: "IEEE Tech Symposium",
    description: "Showcasing student-led technological breakthroughs.",
    media: ["https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop"]
  }
];

export default function FeaturedContent() {
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const cycleTl = useRef<gsap.core.Timeline | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isSectionActive = useRef(false);

  useGSAP(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      isSectionActive.current = true;
      gsap.set(".featured-static-text", { opacity: 1, y: 0 });
      runCycle(currentIndex);
      return () => {
        if (cycleTl.current) cycleTl.current.kill();
      };
    }
    const handleSectionChange = (e: CustomEvent) => {
      if (e.detail === 3) {
        // Section 3 is active (Featured Content)
        isSectionActive.current = true;
        
        // Ensure static text is visible
        gsap.to(".featured-static-text", { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out" });
        
        // Start the cycle
        runCycle(currentIndex);
      } else {
        // Leaving section
        isSectionActive.current = false;
        if (cycleTl.current) cycleTl.current.kill();
        
        // Hide card instantly to reset state for next time
        gsap.set(".memory-card", { clipPath: "circle(0% at 50% 50%)", filter: "blur(20px)" });
      }
    };

    window.addEventListener("section-change", handleSectionChange as EventListener);

    // Ensure elements start hidden before timeline plays
    gsap.set(".featured-static-text", { opacity: 0, y: 30 });
    gsap.set(".memory-card", { clipPath: "circle(0% at 50% 50%)", filter: "blur(20px)" });

    return () => {
      window.removeEventListener("section-change", handleSectionChange as EventListener);
      if (cycleTl.current) cycleTl.current.kill();
    };
  }, { scope: container });

  const runCycle = (index: number) => {
    if (!isSectionActive.current) return;
    setCurrentIndex(index);

    // Wait a tiny bit for React state to update the DOM, then animate
    setTimeout(() => {
      if (!isSectionActive.current) return;

      if (cycleTl.current) cycleTl.current.kill();
      cycleTl.current = gsap.timeline();

      const tl = cycleTl.current;

      // 1. Entrance Animation (Circle Expand)
      tl.fromTo(".memory-card", 
        { clipPath: "circle(0% at 50% 50%)", filter: "blur(20px)", scale: 0.95 },
        { clipPath: "circle(150% at 50% 50%)", filter: "blur(0px)", scale: 1, duration: 0.5, ease: "power3.inOut" }
      );

      // 2. Content Reveal (Image zooms slightly, Text slides in)
      tl.fromTo(".memory-card-img",
        { scale: 1.05 },
        { scale: 1, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      );
      tl.fromTo(".memory-card-content > *",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.02, ease: "power2.out" },
        "-=0.4"
      );

      // 3. Hold (Wait for 1.2 seconds to let user notice it before it cycles)
      tl.to({}, { duration: 1.2 });

      // 4. Exit Animation (Text fades, Card collapses)
      tl.to(".memory-card-content > *", {
        opacity: 0, x: -20, duration: 0.2, stagger: 0.02, ease: "power2.in"
      });
      tl.to(".memory-card", {
        clipPath: "circle(0% at 50% 50%)", filter: "blur(20px)", scale: 0.95, duration: 0.4, ease: "power3.inOut"
      }, "-=0.1");

      // 5. Trigger Next Cycle
      tl.call(() => {
        let nextIndex;
        if (MEMORY_DATA.length <= 1) {
          nextIndex = 0;
        } else {
          do {
            nextIndex = Math.floor(Math.random() * MEMORY_DATA.length);
          } while (nextIndex === index);
        }
        runCycle(nextIndex);
      });

    }, 50); // Small React render buffer
  };

  const activeMemory = MEMORY_DATA[currentIndex];

  return (
    <section id="emerging-stories" className="gsap-featured-section relative lg:absolute lg:-inset-y-24 inset-x-0 w-full min-h-[100dvh] lg:h-[120vh] flex items-center justify-center z-30 max-lg:bg-transparent lg:bg-[#0a0a0a] px-6 lg:[clip-path:circle(0%_at_50%_50%)]">
      <div ref={container} className="relative w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between pt-16 pb-16 lg:pt-32 lg:pb-24 overflow-hidden gap-12">
        
        {/* Section Header (Left Side) */}
        <div className="flex flex-col items-start justify-center text-left z-50 w-full lg:w-1/3">
          <div className="featured-static-text inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs md:text-sm font-semibold tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            Our Legacy
          </div>
          <h2 className="featured-static-text text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-tight">
            Emerging <br/> Memories
          </h2>
        </div>

        {/* Dynamic Card Container (Right Side) */}
        <div className="w-full lg:w-2/3 flex justify-end perspective-[1000px]">
          <div className="memory-card relative w-full max-w-4xl bg-[#0a0a0a]/90 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row will-change-transform">
            
            {/* Image Side (Left) */}
            <div className="w-full md:w-1/2 h-[300px] md:h-[450px] relative overflow-hidden">
              {activeMemory.media![0].match(/\.(mp4|mov|webm)$/i) ? (
                <video
                  src={activeMemory.media![0]}
                  className="memory-card-img absolute inset-0 w-full h-full object-cover"
                  muted playsInline loop autoPlay
                />
              ) : (
                <img
                  src={activeMemory.media![0]}
                  alt={activeMemory.title}
                  className="memory-card-img absolute inset-0 w-full h-full object-cover"
                />
              )}
              {/* Gradient Overlay for blending */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#0a0a0a]/90 pointer-events-none" />
            </div>

            {/* Content Side (Right) */}
            <div className="memory-card-content w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center z-10">
              <div className="inline-block px-3 py-1 rounded-full bg-white/5 text-white/50 text-[10px] md:text-xs font-semibold uppercase tracking-wider w-fit mb-4 border border-white/10">
                Featured Moment
              </div>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
                {activeMemory.title}
              </h3>
              <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed mb-8 line-clamp-4">
                {activeMemory.description}
              </p>
              <div className="mt-auto flex gap-4">
                <a 
                  href={`/past-events/${(activeMemory as any).slug || ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("page-leave"));
                    setTimeout(() => router.push(`/past-events/${(activeMemory as any).slug || ''}`), 400);
                  }}
                  className="group/btn inline-flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors font-medium text-sm"
                >
                  View Event
                </a>
                <a 
                  href="/events"
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("page-leave"));
                    setTimeout(() => router.push("/events"), 400);
                  }}
                  className="group/btn inline-flex items-center gap-2 text-primary hover:text-white transition-colors font-medium text-sm px-2 py-2"
                >
                  All Events
                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
