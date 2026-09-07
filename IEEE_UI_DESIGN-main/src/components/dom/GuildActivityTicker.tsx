"use client";

import React, { useState, useEffect } from "react";

const RECENT_GUILD_FEATS = [
  { handle: "neal_wu", feat: "cleared Quest #1 (Two Sum)", reward: "+150 EXP", icon: "⚔️" },
  { handle: "alex_rivera", feat: "reached 21-Day Streak!", reward: "21x Multiplier 🔥", icon: "🔥" },
  { handle: "tourist", feat: "unlocked DP Sorcerer Class", reward: "Title Unlocked", icon: "👑" },
  { handle: "priya_codes", feat: "cleared Quest #15 (3Sum)", reward: "+200 EXP", icon: "⚔️" },
  { handle: "rohan_v", feat: "earned Streak Starter Relic", reward: "Relic Equipped", icon: "🛡️" },
];

export function GuildActivityTicker() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % RECENT_GUILD_FEATS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const feat = RECENT_GUILD_FEATS[activeIdx];

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-3.5 px-5 flex items-center justify-between shadow-md border border-slate-800 font-mono text-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
        <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0">LIVE GUILD FEED:</span>
        <span className="font-bold text-primary shrink-0">@{feat.handle}</span>
        <span className="text-slate-300 truncate">{feat.feat}</span>
      </div>
      <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-cyan-300 font-black text-[10px] shrink-0 ml-3">
        {feat.reward}
      </span>
    </div>
  );
}
