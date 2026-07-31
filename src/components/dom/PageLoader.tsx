"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export default function PageLoader() {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  // Listen for navigation clicks to cover the old page BEFORE route changes
  useEffect(() => {
    const handleLeave = () => {
      if (!overlayRef.current) return;
      
      // Reset the progress bar immediately so it's empty when the circle expands
      if (progressRef.current) {
        progressRef.current.style.width = "0%";
      }
      
      gsap.set(overlayRef.current, { opacity: 1, pointerEvents: "auto" });
      gsap.to(overlayRef.current, {
        clipPath: "circle(150% at 50% 50%)",
        duration: 0.4,
        ease: "power3.inOut"
      });
    };
    window.addEventListener("page-leave", handleLeave);
    return () => window.removeEventListener("page-leave", handleLeave);
  }, []);

  useEffect(() => {
    if (!overlayRef.current) return;
    
    gsap.killTweensOf(overlayRef.current);
    const tl = gsap.timeline();
    
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    } else {
      // The screen is ALREADY covered by the 'page-leave' event (or we force it just in case)
      gsap.set(overlayRef.current, { 
        opacity: 1, 
        pointerEvents: "auto",
        clipPath: "circle(150% at 50% 50%)"
      });
    }
    
    // Animate progress loading directly using GSAP
    tl.fromTo(progressRef.current, 
      { width: "0%" },
      { width: "100%", duration: 0.4, ease: "power2.inOut" }
    );

    // Contract the circle to reveal the newly loaded page
    tl.to(overlayRef.current, {
      clipPath: "circle(0% at 50% 50%)",
      duration: 0.5,
      ease: "power3.inOut",
      pointerEvents: "none"
    });

    return () => {
      tl.kill();
    };
  }, [pathname]);

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center pointer-events-auto"
      style={{ clipPath: "circle(150% at 50% 50%)" }} // Visible by default during SSR to prevent FOUC
    >
      <div className="relative overflow-hidden mb-12">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-500">
          IEEE CIS CUSB
        </h1>
      </div>
      
      <div className="flex flex-col items-center w-full max-w-xs md:max-w-md">
        <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
          <div 
            ref={progressRef}
            className="absolute top-0 left-0 h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            style={{ width: "0%" }}
          />
        </div>
      </div>
    </div>
  );
}
