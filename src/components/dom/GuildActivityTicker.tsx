"use client";

import React, { useState, useEffect } from "react";

export function GuildActivityTicker() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [feats, setFeats] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch("/api/code-warriors/guild-feed");
        if (res.ok) {
          const data = await res.json();
          if (data.activity && data.activity.length > 0) {
            const formatted = data.activity.map((item: any) => ({
              handle: item.profile?.leetcode_handle || item.profile?.name?.replace(/\s+/g, '') || "unknown_warrior",
              feat: `solved ${item.problem_name}`,
              reward: "+10 PTS",
              icon: "⚔️"
            }));
            setFeats(formatted);
          }
        }
      } catch (err) {
        console.error("Failed to fetch guild feed", err);
      }
    };
    fetchFeed();
    // Refresh feed every 60 seconds
    const refreshInterval = setInterval(fetchFeed, 60000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (feats.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % feats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [feats]);

  const displayFeat = feats.length > 0 
    ? feats[activeIdx] 
    : { handle: "system", feat: "waiting for guild activity...", reward: "syncing", icon: "⏳" };

  return (
    <div className="relative bg-slate-900/80 backdrop-blur-md text-white rounded-2xl p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between shadow-xl border border-slate-700/50 overflow-hidden group hover:border-primary/50 transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-primary/5 opacity-50"></div>
      
      <div className="flex items-center gap-3 min-w-0 z-10 flex-1">
        <div className="relative flex items-center justify-center shrink-0">
          <span className="absolute w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
          <span className="relative w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
        </div>
        
        <span className="text-emerald-400 font-black uppercase text-xs tracking-widest shrink-0 opacity-90">LIVE FEED:</span>
        
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="font-bold text-primary text-sm sm:text-base">@{displayFeat.handle}</span>
          <span className="text-slate-200 text-sm sm:text-base leading-tight break-words">{displayFeat.feat}</span>
        </div>
      </div>

      <div className="z-10 shrink-0 mt-3 sm:mt-0 sm:ml-4 flex justify-end">
        <span className="px-3 py-1 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/30 text-cyan-300 font-black text-xs sm:text-sm whitespace-nowrap shadow-[0_0_10px_rgba(6,182,212,0.2)]">
          {displayFeat.icon} {displayFeat.reward}
        </span>
      </div>
    </div>
  );
}
