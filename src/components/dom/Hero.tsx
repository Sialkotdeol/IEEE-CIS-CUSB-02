"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MousePointerClick } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

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

type MemoryStatus = 'entering' | 'visible' | 'exiting';

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
    // Keep sizes reasonable so they can fit
    const width = Math.floor(Math.random() * 80) + 160;  // 160px - 240px
    const height = Math.floor(Math.random() * 100) + 180; // 180px - 280px
    // Keep within the 60% container cleanly
    const top = Math.floor(Math.random() * 60) + 5; // 5% to 65%
    const left = Math.floor(Math.random() * 65) + 5; // 5% to 70%

    if (existingMemories.length === 0) {
      return { top, left, width, height };
    }

    // Convert pixel widths to approximate percentages assuming ~800px container width
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

      // Check strict bounding box overlap with a small padding (2%)
      const overlapX = Math.abs(dx) < (w1 / 2 + w2 / 2 + 2);
      const overlapY = Math.abs(dy) < (h1 / 2 + h2 / 2 + 2);
      
      if (overlapX && overlapY) {
        hasOverlap = true;
      }
    }

    // If we found a spot with NO overlap, return it immediately
    if (!hasOverlap) {
      return { top, left, width, height };
    }

    // Otherwise, keep track of the "least bad" spot (the one furthest from its nearest neighbor)
    if (minDist > maxMinDist) {
      maxMinDist = minDist;
      bestSpot = { top, left, width, height };
    }
  }

  // If we exhausted all 150 tries without finding a perfect spot, use the best one we found
  return bestSpot;
};

function MemoryCard({ mem, onEntranceComplete, onExitComplete, setHovered }: {
  mem: ActiveMemory;
  onEntranceComplete: (id: string) => void;
  onExitComplete: (id: string) => void;
  setHovered: (state: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    
    const wrapper = containerRef.current.querySelector('.memory-wrapper');
    const imageEl = containerRef.current.querySelector('.memory-img');
    const shadowEl = containerRef.current.querySelector('.memory-shadow');
    const particleEl = containerRef.current.querySelector('.memory-particle');

    if (mem.status === 'entering') {
      gsap.set(wrapper, { clipPath: "circle(0px at 50% 50%)", opacity: 0, scale: 0.9 });
      gsap.set(shadowEl, { opacity: 0 });
      gsap.set(imageEl, { scale: 1.2 });
      gsap.set(particleEl, { opacity: 0, scale: 0 });

      const tl = gsap.timeline({
        delay: mem.initialDelay !== undefined ? mem.initialDelay : 0.3,
        onComplete: () => onEntranceComplete(mem.id)
      });

      tl.to(wrapper, { opacity: 1, clipPath: "circle(20px at 50% 50%)", duration: 0.5, ease: "back.out(1.2)" });
      tl.to(wrapper, { clipPath: "circle(200% at 50% 50%)", scale: 1, duration: 0.9, ease: "power3.inOut" }, "+=0.1");
      tl.to(imageEl, { scale: 1, duration: 0.9, ease: "power3.inOut" }, "<");
      tl.to(shadowEl, { opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.4");

    } else if (mem.status === 'exiting') {
      const tl = gsap.timeline({
        onComplete: () => onExitComplete(mem.id)
      });

      tl.to(shadowEl, { opacity: 0, duration: 0.3, ease: "power2.in" });
      tl.to(imageEl, { scale: 1.2, duration: 0.8, ease: "power3.inOut" }, 0);
      tl.to(wrapper, { 
        clipPath: "circle(20px at 50% 50%)", 
        scale: 0.9, 
        duration: 0.8, 
        ease: "power3.inOut" 
      }, 0);
      
      tl.to(wrapper, { opacity: 0, clipPath: "circle(0px at 50% 50%)", duration: 0.4, ease: "back.in(1.2)" });

      tl.fromTo(particleEl, 
        { opacity: 1, scale: 0.5 },
        { opacity: 0, scale: 2.5, y: -40, duration: 0.8, ease: "power2.out" },
        "-=0.3"
      );
    }
  }, { dependencies: [mem.status], scope: containerRef });

  return (
    <motion.div
      ref={containerRef}
      className="absolute will-change-transform cursor-pointer"
      style={{
        top: `${mem.top}%`,
        left: `${mem.left}%`,
        width: `${mem.width}px`,
        height: `${mem.height}px`,
        zIndex: mem.status === 'exiting' ? 1 : mem.zIndex, // Drop depth while exiting
      }}
      animate={{
        y: [0, -15 * (1 / mem.floatSpeed), 0],
        x: [0, 8 * (1 / mem.floatSpeed), 0],
      }}
      transition={{
        duration: mem.floatSpeed * 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{
        scale: 1.05,
        zIndex: 50,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
    >
      <div className="memory-wrapper relative w-full h-full rounded-2xl overflow-hidden bg-black/20 max-lg:scale-[0.6] max-lg:origin-top-left">
        <div className="memory-shadow absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(99,102,241,0.15)] pointer-events-none z-10" />
        <div className="memory-img w-full h-full relative">
          <Image 
            src={mem.src} 
            alt="Society Memory" 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 100vw, 300px" 
            priority={mem.initialDelay === 0.6 || mem.initialDelay === 1.2} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
      </div>
      <div className="memory-particle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[radial-gradient(circle,rgba(255,255,255,0.3)_0%,transparent_60%)] pointer-events-none z-20" />
    </motion.div>
  );
}

export default function Hero() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [memories, setMemories] = useState<ActiveMemory[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  // Initial setup
  useEffect(() => {
    const initialMemories: ActiveMemory[] = [];
    const usedIndices = new Set<number>();
    
    for (let i = 0; i < 6; i++) {
      let idx;
      do { idx = Math.floor(Math.random() * ALL_IMAGES.length); } while(usedIndices.has(idx));
      usedIndices.add(idx);

      const pos = generateSafePosition(initialMemories);
      initialMemories.push({
        id: Math.random().toString(36).substr(2, 9),
        src: ALL_IMAGES[idx],
        ...pos,
        zIndex: Math.floor(Math.random() * 20) + 5,
        floatSpeed: Math.random() * 3 + 2,
        status: 'entering',
        initialDelay: i * 0.6 + 0.6 // Staggered entry: 0.6s, 1.2s, 1.8s, etc.
      });
    }
    setMemories(initialMemories);
  }, []);

  // Continuous Cycle Engine
  useEffect(() => {
    const cycle = () => {
      if (isHovered) return;

      setMemories(prev => {
        const visible = prev.filter(m => m.status === 'visible');
        if (visible.length < 5) return prev;

        const toExit = visible[Math.floor(Math.random() * visible.length)];
        return prev.map(m => m.id === toExit.id ? { ...m, status: 'exiting' } : m);
      });
    };

    const intervalId = setInterval(cycle, 3500); // Trigger an exit every 3.5s
    return () => clearInterval(intervalId);
  }, [isHovered]);

  const handleEntranceComplete = useCallback((id: string) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, status: 'visible' } : m));
  }, []);

  const handleExitComplete = useCallback((id: string) => {
    setMemories(prev => {
      const filtered = prev.filter(m => m.id !== id);
      
      // Spawn a new memory to replace the exited one
      if (filtered.length < 6) {
        const usedSrcs = new Set(filtered.map(m => m.src));
        const availableSrcs = ALL_IMAGES.filter(src => !usedSrcs.has(src));
        const newSrc = availableSrcs[Math.floor(Math.random() * availableSrcs.length)];

        const pos = generateSafePosition(filtered);
        
        const newMem: ActiveMemory = {
          id: Math.random().toString(36).substr(2, 9),
          src: newSrc,
          ...pos,
          zIndex: Math.floor(Math.random() * 20) + 5,
          floatSpeed: Math.random() * 3 + 2,
          status: 'entering'
        };

        return [...filtered, newMem];
      }
      return filtered;
    });
  }, []);

  useGSAP(() => {
    // Fade in text content immediately but smoothly
    gsap.fromTo(".gsap-hero-text", 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative lg:absolute inset-0 w-full min-h-[100dvh] lg:h-screen flex items-center justify-center overflow-hidden z-10 bg-transparent">
      
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full pt-28 lg:pt-12 pb-10 lg:pb-0">
        
        {/* Left Side: Text Content */}
        <div className="gsap-hero-content gsap-hero-text col-span-1 lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left z-20 opacity-0">
          <div className="mb-4 lg:mb-6">
            <div className="inline-block px-3 md:px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] sm:text-xs md:text-sm font-semibold tracking-widest uppercase mb-3 lg:mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)] text-center max-w-full leading-relaxed">
              Chandigarh University Student Branch
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-5xl xl:text-[72px] 2xl:text-[80px] font-bold tracking-tighter leading-[1.05]">
              <span className="block text-white">IEEE Computational</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-400 to-accent pb-2">
                Intelligence Society
              </span>
            </h1>
          </div>

          <p className="text-base md:text-lg lg:text-lg xl:text-xl text-white/60 max-w-xl mb-6 xl:mb-10 font-light leading-relaxed">
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
              className="px-6 py-3 lg:px-5 lg:py-2.5 2xl:px-8 2xl:py-4 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm lg:text-sm 2xl:text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95 w-full lg:w-auto flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)] whitespace-nowrap shrink-0"
            >
              Explore Events
            </a>
            <a href="/code-warriors" onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("page-leave"));
              setTimeout(() => router.push("/code-warriors"), 400);
            }} className="px-6 py-3 lg:px-5 lg:py-2.5 2xl:px-8 2xl:py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm lg:text-sm 2xl:text-base font-bold transition-all duration-300 hover:scale-105 active:scale-95 w-full lg:w-auto flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] whitespace-nowrap shrink-0">
              Join Code Warriors
            </a>
            <a href="/innovators-hub" onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("page-leave"));
              setTimeout(() => router.push("/innovators-hub"), 400);
            }} className="px-6 py-3 lg:px-5 lg:py-2.5 2xl:px-8 2xl:py-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm lg:text-sm 2xl:text-base font-bold transition-all duration-300 hover:scale-105 active:scale-95 w-full lg:w-auto flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] whitespace-nowrap shrink-0">
              Join Innovators Hub
            </a>
          </div>
        </div>

        {/* Right Side: Floating Memories */}
        <div className="gsap-hero-photos max-lg:absolute max-lg:inset-0 max-lg:-z-10 max-lg:h-[100dvh] max-lg:opacity-40 max-lg:pointer-events-none lg:col-span-6 xl:col-span-6 relative lg:h-[80vh] w-full block perspective-[1000px] max-lg:overflow-hidden lg:-translate-y-16">
          {memories.map((mem) => (
            <MemoryCard 
              key={mem.id} 
              mem={mem} 
              onEntranceComplete={handleEntranceComplete} 
              onExitComplete={handleExitComplete} 
              setHovered={setIsHovered}
            />
          ))}
        </div>
        
      </div>
      
    </section>
  );
}
