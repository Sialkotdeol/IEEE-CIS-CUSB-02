"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { X, Maximize2 } from "lucide-react";

const ALL_IMAGES = [
  "/hero-slideshow/IMG-20250122-WA0005.jpg",
  "/hero-slideshow/IMG_0446.jpg",
  "/hero-slideshow/IMG_20250122_151045_535.jpg",
  "/hero-slideshow/IMG_20250217_105746_867.jpg",
  "/hero-slideshow/IMG_20250228_110545.jpg",
  "/hero-slideshow/IMG_20250228_162132.jpg",
  "/hero-slideshow/IMG_20250228_162159.jpg",
  "/hero-slideshow/IMG_20250228_162234.jpg",
  "/hero-slideshow/IMG_2211.jpg",
  "/hero-slideshow/IMG_2942.jpg",
  "/hero-slideshow/InShot_20251007_003943514.jpg",
  "/hero-slideshow/PXL_20251006_105410010.jpg",
  "/hero-slideshow/PXL_20251008_085321460.jpg"
];

type MemoryStatus = 'entering' | 'visible';

interface ActiveMemory {
  id: string;
  src: string;
  top: number;
  left: number;
  width: number;
  height: number;
  zIndex: number;
  floatSpeed: number;
  status: MemoryStatus;
  initialDelay?: number;
}

const generateSafePosition = (existingMemories: ActiveMemory[]) => {
  let bestSpot = { top: 10, left: 10, width: 200, height: 250 };
  let maxMinDist = -1;

  for (let i = 0; i < 150; i++) {
    const width = Math.floor(Math.random() * 80) + 170;  // 170px - 250px
    const height = Math.floor(Math.random() * 100) + 190; // 190px - 290px
    const top = Math.floor(Math.random() * 55) + 5;
    const left = Math.floor(Math.random() * 60) + 5;

    if (existingMemories.length === 0) {
      return { top, left, width, height };
    }

    const w1 = width / 8;
    const h1 = height / 8;
    const cx1 = left + w1 / 2;
    const cy1 = top + h1 / 2;

    let minDist = 999999;
    let hasOverlap = false;

    for (const mem of existingMemories) {
      const w2 = mem.width / 8;
      const h2 = mem.height / 8;
      const cx2 = mem.left + w2 / 2;
      const cy2 = mem.top + h2 / 2;

      const dx = cx1 - cx2;
      const dy = cy1 - cy2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < minDist) {
        minDist = dist;
      }

      const overlapX = Math.abs(dx) < (w1 / 2 + w2 / 2 + 2);
      const overlapY = Math.abs(dy) < (h1 / 2 + h2 / 2 + 2);
      
      if (overlapX && overlapY) {
        hasOverlap = true;
      }
    }

    if (!hasOverlap) {
      return { top, left, width, height };
    }

    if (minDist > maxMinDist) {
      maxMinDist = minDist;
      bestSpot = { top, left, width, height };
    }
  }

  return bestSpot;
};

const generateNewCardBatch = (): ActiveMemory[] => {
  const newBatch: ActiveMemory[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < 4; i++) {
    let idx;
    do {
      idx = Math.floor(Math.random() * ALL_IMAGES.length);
    } while (usedIndices.has(idx) && usedIndices.size < ALL_IMAGES.length);
    usedIndices.add(idx);

    const pos = generateSafePosition(newBatch);
    newBatch.push({
      id: Math.random().toString(36).substring(2, 9),
      src: ALL_IMAGES[idx],
      ...pos,
      zIndex: Math.floor(Math.random() * 20) + 10,
      floatSpeed: Math.random() * 3 + 2,
      status: "entering",
      initialDelay: i * 0.22 + 0.1, // Staggered pop-in cascade
    });
  }

  return newBatch;
};

function MemoryCard({ mem, onEntranceComplete, onClick }: {
  mem: ActiveMemory;
  onEntranceComplete: (id: string) => void;
  onClick: (src: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    
    const wrapper = containerRef.current.querySelector('.memory-wrapper');
    const imageEl = containerRef.current.querySelector('.memory-img');
    const shadowEl = containerRef.current.querySelector('.memory-shadow');

    if (mem.status === 'entering') {
      gsap.set(wrapper, { clipPath: "circle(0px at 50% 50%)", opacity: 0, scale: 0.8 });
      gsap.set(shadowEl, { opacity: 0 });
      gsap.set(imageEl, { scale: 1.3 });

      const tl = gsap.timeline({
        delay: mem.initialDelay !== undefined ? mem.initialDelay : 0.1,
        onComplete: () => onEntranceComplete(mem.id)
      });

      tl.to(wrapper, { opacity: 1, clipPath: "circle(35px at 50% 50%)", duration: 0.45, ease: "back.out(1.5)" });
      tl.to(wrapper, { clipPath: "circle(200% at 50% 50%)", scale: 1, duration: 0.85, ease: "power3.inOut" }, "+=0.05");
      tl.to(imageEl, { scale: 1, duration: 0.85, ease: "power3.inOut" }, "<");
      tl.to(shadowEl, { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.3");
    }
  }, { dependencies: [mem.status, mem.id], scope: containerRef });

  return (
    <motion.div
      ref={containerRef}
      onClick={() => onClick(mem.src)}
      className="absolute will-change-transform cursor-pointer group"
      style={{
        top: `${mem.top}%`,
        left: `${mem.left}%`,
        width: `${mem.width}px`,
        height: `${mem.height}px`,
        zIndex: mem.zIndex,
      }}
      animate={{
        y: [0, -14 * (1 / mem.floatSpeed), 0],
        x: [0, 7 * (1 / mem.floatSpeed), 0],
      }}
      transition={{
        duration: mem.floatSpeed * 2.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.06,
        zIndex: 60,
        transition: { type: "spring", stiffness: 400, damping: 22 }
      }}
    >
      <div className="memory-wrapper relative w-full h-full rounded-2xl overflow-hidden bg-white max-lg:scale-[0.6] max-lg:origin-top-left shadow-lg group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-primary/40 transition-all duration-300">
        
        {/* Click indicator zoom overlay */}
        <div className="absolute inset-0 bg-slate-900/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <Maximize2 className="w-5 h-5" />
          </div>
        </div>

        <div className="memory-shadow absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6),0_18px_36px_rgba(15,23,42,0.14)] pointer-events-none z-10" />
        <div className="memory-img w-full h-full relative">
          <Image 
            src={mem.src} 
            alt="IEEE CIS Memory" 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 100vw, 300px" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-white/10" />
        </div>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [memories, setMemories] = useState<ActiveMemory[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Setup batch rotation: generate brand new card batch in random positions every 5.2 seconds
  useEffect(() => {
    setMemories(generateNewCardBatch());

    const interval = setInterval(() => {
      setMemories(generateNewCardBatch());
    }, 5200);

    return () => clearInterval(interval);
  }, []);

  const handleEntranceComplete = useCallback((id: string) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, status: 'visible' } : m));
  }, []);

  useGSAP(() => {
    gsap.fromTo(".gsap-hero-text", 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
    );
  }, { scope: containerRef });

  return (
    <>
      <section ref={containerRef} className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden z-10 bg-transparent py-20 lg:py-8">
        
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-28 lg:pt-12 pb-10 lg:pb-0">
          
          {/* Left Side: Text Content */}
          <div className="gsap-hero-content gsap-hero-text col-span-1 lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left z-20 opacity-0">
            <div className="mb-4 lg:mb-6">
              <div className="section-eyebrow inline-block px-3 md:px-4 py-1.5 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold tracking-widest uppercase mb-3 lg:mb-4 text-center max-w-full leading-relaxed">
                Chandigarh University Student Branch
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-[72px] 2xl:text-[80px] font-bold tracking-tighter leading-[1.05]">
                <span className="block text-slate-900">IEEE Computational</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-500 pb-2">
                  Intelligence Society
                </span>
              </h1>
            </div>

            <p className="text-base md:text-lg lg:text-lg xl:text-xl text-slate-600 max-w-xl mb-6 xl:mb-10 font-normal leading-relaxed">
              Advancing AI, ML & Intelligent Systems. Bridging the gap between theoretical research and real-world impact.
            </p>

            <div className="flex flex-col lg:flex-row lg:flex-nowrap gap-3 w-full lg:w-auto mt-2">
              <a 
                href="/events"
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent("page-leave"));
                  setTimeout(() => router.push("/events"), 400);
                }}
                className="px-6 py-3 lg:px-5 lg:py-2.5 2xl:px-8 2xl:py-4 rounded-full bg-primary hover:bg-[#00527f] text-white text-sm lg:text-sm 2xl:text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 w-full lg:w-auto flex items-center justify-center shadow-md whitespace-nowrap shrink-0"
              >
                Explore Events
              </a>
              <a href="/code-warriors" onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("page-leave"));
                setTimeout(() => router.push("/code-warriors"), 400);
              }} className="px-6 py-3 lg:px-5 lg:py-2.5 2xl:px-8 2xl:py-4 rounded-full border border-slate-200 bg-white hover:bg-[#e6f0f5] hover:border-primary text-slate-800 hover:text-primary text-sm lg:text-sm 2xl:text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 w-full lg:w-auto flex items-center justify-center shadow-sm whitespace-nowrap shrink-0">
                Join Code Warriors
              </a>
              <a href="/innovators-hub" onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("page-leave"));
                setTimeout(() => router.push("/innovators-hub"), 400);
              }} className="px-6 py-3 lg:px-5 lg:py-2.5 2xl:px-8 2xl:py-4 rounded-full border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-sm lg:text-sm 2xl:text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 w-full lg:w-auto flex items-center justify-center shadow-sm whitespace-nowrap shrink-0">
                Join Innovators Hub
              </a>
            </div>
          </div>

          {/* Right Side: Batch-Popping Floating Memories */}
          <div className="gsap-hero-photos max-lg:absolute max-lg:inset-0 max-lg:-z-10 max-lg:h-[100dvh] max-lg:opacity-20 max-lg:pointer-events-none lg:col-span-6 xl:col-span-6 relative lg:h-[80vh] w-full block perspective-[1000px] max-lg:overflow-hidden lg:-translate-y-16">
            {memories.map((mem) => (
              <MemoryCard 
                key={mem.id} 
                mem={mem} 
                onEntranceComplete={handleEntranceComplete} 
                onClick={(src) => setLightboxImage(src)}
              />
            ))}
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
                  alt="Expanded IEEE Memory"
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
