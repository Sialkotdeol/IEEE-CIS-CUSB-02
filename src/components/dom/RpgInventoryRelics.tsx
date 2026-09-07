"use client";

import React from "react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export function RpgInventoryRelics({ rank, rating, streak }: { rank: string; rating: number; streak: number }) {
  const getRankColor = (r: string) => {
    switch (r) {
      case "Legend": return "text-purple-600 bg-purple-50 border-purple-200";
      case "Champion": return "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200";
      case "Knight": return "text-amber-600 bg-amber-50 border-amber-200";
      case "Elite Warrior": return "text-indigo-600 bg-indigo-50 border-indigo-200";
      case "Warrior": return "text-primary bg-primary/10 border-primary/20";
      case "Apprentice": return "text-emerald-700 bg-emerald-50 border-emerald-200";
      default: return "text-slate-700 bg-slate-100 border-slate-200";
    }
  };

  const RELICS = [
    { name: "Scroll of Two Pointers", icon: "📜", bonus: "+5% Speed", unlocked: true },
    { name: "Ring of Binary Search", icon: "💍", bonus: "+10% Precision", unlocked: true },
    { name: "Shield of Dynamic Prog.", icon: "🛡️", bonus: "+15% Defense", unlocked: rating >= 300 },
    { name: "Staff of Graph Traversal", icon: "⚡", bonus: "+20% EXP Boost", unlocked: streak >= 7 },
  ];

  return (
    <SpotlightCard glowHue={205} spotSize={260} borderSize={2} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <span className="quest-badge text-[9px] mb-1 inline-block">⚔️ EQUIPPED CLASS & RELICS</span>
          <h4 className="font-black text-sm text-slate-900">Warrior Inventory</h4>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border ${getRankColor(rank)}`}>
          {rank} 🛡️
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {RELICS.map((relic, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-2.5 ${
              relic.unlocked
                ? "bg-slate-50 border-slate-200 text-slate-900 shadow-sm"
                : "bg-slate-100/50 border-slate-200/50 opacity-40 text-slate-400"
            }`}
          >
            <span className="text-xl">{relic.icon}</span>
            <div className="min-w-0">
              <p className="font-extrabold text-xs truncate leading-tight">{relic.name}</p>
              <p className="text-[10px] font-mono font-bold text-primary mt-0.5">{relic.unlocked ? relic.bonus : "Locked 🔒"}</p>
            </div>
          </div>
        ))}
      </div>
    </SpotlightCard>
  );
}
