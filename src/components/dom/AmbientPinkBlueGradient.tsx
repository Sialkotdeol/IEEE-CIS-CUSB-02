"use client";

import React from "react";

export default function AmbientPinkBlueGradient() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Continuous Animated Multi-Point Mesh Gradient spanning 100% of website */}
      <div 
        className="absolute inset-0 opacity-45 transition-opacity duration-500"
        style={{
          backgroundImage: `
            radial-gradient(at 10% 10%, rgba(244, 114, 182, 0.45) 0px, transparent 55%),
            radial-gradient(at 90% 15%, rgba(56, 189, 248, 0.45) 0px, transparent 55%),
            radial-gradient(at 20% 45%, rgba(6, 182, 212, 0.38) 0px, transparent 55%),
            radial-gradient(at 80% 50%, rgba(251, 113, 133, 0.42) 0px, transparent 55%),
            radial-gradient(at 30% 80%, rgba(14, 165, 233, 0.42) 0px, transparent 55%),
            radial-gradient(at 70% 85%, rgba(244, 114, 182, 0.40) 0px, transparent 55%)
          `,
          backgroundSize: '170% 170%',
          animation: 'meshGradientMove 20s ease-in-out infinite alternate'
        }}
      />

      {/* 2. Spread Accent Floating Orbs across Top, Middle, and Bottom */}
      <div className="absolute top-[8%] left-[12%] w-[420px] h-[420px] rounded-full bg-pink-400/35 blur-[95px] animate-first" />
      <div className="absolute top-[22%] right-[10%] w-[440px] h-[440px] rounded-full bg-sky-400/35 blur-[95px] animate-second" />
      <div className="absolute top-[48%] left-[28%] w-[480px] h-[480px] rounded-full bg-fuchsia-300/32 blur-[105px] animate-third" />
      <div className="absolute top-[72%] left-[10%] w-[440px] h-[440px] rounded-full bg-cyan-400/35 blur-[95px] animate-fourth" />
      <div className="absolute top-[88%] right-[14%] w-[420px] h-[420px] rounded-full bg-rose-300/35 blur-[95px] animate-fifth" />

      {/* 3. Light translucent overlay to keep text crisp while displaying the rich gradient background */}
      <div className="absolute inset-0 bg-white/25" />
    </div>
  );
}
