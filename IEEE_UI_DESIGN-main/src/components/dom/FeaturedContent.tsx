"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { pastEvents } from "@/data/events";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import Image from "next/image";

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
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const isSectionActive = useRef(false);

  function runCycle(index: number) {
    if (!isSectionActive.current) return;
    setCurrentIndex(index);

    setTimeout(() => {
      if (!isSectionActive.current) return;

      if (cycleTl.current) cycleTl.current.kill();
      const tl = gsap.timeline({
        onComplete: () => {
          if (!isSectionActive.current) return;
          const nextIndex = (index + 1) % MEMORY_DATA.length;
          runCycle(nextIndex);
        }
      });
      cycleTl.current = tl;

      tl.fromTo(
        ".featured-title",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      )
      .fromTo(
        ".featured-desc",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "-=0.3"
      )
      .fromTo(
        ".featured-media-card",
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out", stagger: 0.1 },
        "-=0.4"
      )
      .to({}, { duration: 3.8 })
      .to(".featured-title, .featured-desc, .featured-media-card", {
        opacity: 0,
        y: -10,
        duration: 0.5,
        ease: "power2.in",
        stagger: 0.05
      });
    }, 50);
  }

  useGSAP(() => {
    isSectionActive.current = true;
    gsap.set(".featured-static-text", { opacity: 1, y: 0 });
    runCycle(currentIndex);

    return () => {
      isSectionActive.current = false;
      if (cycleTl.current) cycleTl.current.kill();
    };
  }, { scope: container });


  const activeMemory = MEMORY_DATA[currentIndex];

  return (
    <>
      <section id="emerging-stories" data-reveal className="reveal-section light-panel relative w-full flex items-center justify-center py-20 md:py-28 px-6">
        <div ref={container} className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between overflow-hidden gap-12">
          
          {/* Section Header (Left Side) */}
          <div className="flex flex-col items-start justify-center text-left z-50 w-full lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="featured-static-text section-eyebrow inline-block px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold tracking-widest uppercase mb-4"
            >
              Our Legacy
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="featured-static-text section-heading text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight"
            >
              Emerging <br/> Memories
            </motion.h2>
          </div>

          {/* Dynamic Card Container (Right Side) */}
          <div className="w-full lg:w-2/3 flex justify-end perspective-[1000px]">
            <SpotlightCard glowHue={205} spotSize={320} borderSize={2} className="memory-card relative w-full max-w-4xl bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row will-change-transform">
              
              {/* Image Side (Left) — Clickable to zoom */}
              <div 
                onClick={() => setLightboxImage(activeMemory.media![0])}
                className="w-full md:w-1/2 h-[300px] md:h-[450px] relative overflow-hidden cursor-pointer group/img"
              >
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
                    className="memory-card-img absolute inset-0 w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Click to zoom overlay */}
                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                  <div className="w-10 h-10 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-lg transform scale-75 group-hover/img:scale-100 transition-transform">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-white/30 pointer-events-none" />
              </div>

              {/* Content Side (Right) */}
              <div className="memory-card-content w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center z-10">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-semibold uppercase tracking-wider w-fit mb-4 border border-primary/15">
                  Featured Moment
                </div>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-900 leading-tight">
                  {activeMemory.title}
                </h3>
                <p className="text-slate-600 text-lg md:text-xl font-normal leading-relaxed mb-8 line-clamp-4">
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
                    className="group/btn inline-flex items-center gap-2 text-white bg-primary hover:bg-[#00527f] px-5 py-2.5 rounded-full transition-colors font-medium text-sm shadow-md"
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
                    className="group/btn inline-flex items-center gap-2 text-primary hover:text-[#00527f] transition-colors font-medium text-sm px-2 py-2"
                  >
                    All Events
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

            </SpotlightCard>
          </div>

        </div>
      </section>

      {/* Full-Screen Interactive Image Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[85vh] w-full h-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 cursor-default flex items-center justify-center"
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 z-50 p-3 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600 transition-all hover:scale-110 shadow-lg"
                aria-label="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-full h-full p-6">
                <Image
                  src={lightboxImage}
                  alt="Expanded Featured Moment"
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
