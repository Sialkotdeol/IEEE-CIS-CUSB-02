"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Flame, Award, Sparkles, Sword } from "lucide-react";
import { Profile } from "@/types/codeWarriors";

interface RpgCharacterCardProps {
  user: Profile;
}

export function RpgCharacterCard({ user }: RpgCharacterCardProps) {
  const rankTitle = user.rank || "Unrated";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl border-2 border-slate-200/80 bg-white/95 backdrop-blur-xl p-6 md:p-8 shadow-xl overflow-hidden group"
    >
      {/* Background ambient gradient morph */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-cyan-400/6 to-indigo-500/8 opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left: Pixel Art Character Avatar */}
        <div className="flex items-center gap-6 w-full lg:w-auto">
          <div className="relative shrink-0">
            {/* Outer level ring */}
            <div className="rpg-avatar-frame w-24 h-24 md:w-28 md:h-28 flex items-center justify-center bg-gradient-to-tr from-primary via-cyan-500 to-indigo-600">
              <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                
                {/* Animated Pixel Art Knight / Avatar graphic */}
                <svg
                  viewBox="0 0 64 64"
                  className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-[float-up_4s_ease-in-out_infinite]"
                  fill="currentColor"
                >
                  {/* Pixel Helmet / Sword Graphic */}
                  <rect x="20" y="12" width="24" height="6" fill="#06b6d4" />
                  <rect x="16" y="18" width="32" height="6" fill="#38bdf8" />
                  <rect x="12" y="24" width="40" height="20" fill="#0284c7" />
                  {/* Visor Slit */}
                  <rect x="20" y="30" width="24" height="4" fill="#0f172a" />
                  <rect x="24" y="32" width="6" height="2" fill="#38bdf8" />
                  {/* Shoulders */}
                  <rect x="8" y="44" width="48" height="12" fill="#0369a1" />
                  <rect x="16" y="56" width="32" height="8" fill="#0c4a6e" />
                </svg>

              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="quest-badge">⚡ {rankTitle}</span>
              <span className="text-[10px] font-mono text-slate-400">ID: #{user.uid}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="gaming-text-gradient">{user.name}</span>
              <Sparkles size={18} className="text-yellow-500 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {user.department} • {user.year}
            </p>
          </div>
        </div>



        {/* Right: Equipped Relics / Badges Deck */}
        <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto justify-between lg:justify-center">

          <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/80 px-4 py-2.5 rounded-2xl shadow-sm">
            <Shield size={18} className="text-cyan-600" />
            <div>
              <p className="text-[10px] text-cyan-700 font-mono font-bold uppercase leading-none">QUEST CLEAR RATE</p>
              <p className="text-xs font-black text-slate-900 mt-0.5">94.2% ACCURACY</p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
