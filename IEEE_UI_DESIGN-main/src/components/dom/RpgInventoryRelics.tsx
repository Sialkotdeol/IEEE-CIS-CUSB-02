"use client";

import React from "react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export function RpgInventoryRelics({ rating, streak }: { rating: number; streak: number }) {
  const getClassTitle = (r: number) => {
    if (r >= 2000) return { title: "Grandmaster Paladin 👑", color: "text-purple-600 bg-purple-50 border-purple-200" };
    if (r >= 1800) return { title: "Graph Master ⚡", color: "text-amber-600 bg-amber-50 border-amber-200" };
    if (r >= 1600) return { title: "DP Sorcerer 🔮", color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
    if (r >= 1400) return { title: "Algorithm Knight ⚔️", color: "text-primary bg-primary/10 border-primary/20" };
    return { title: "Novice Code Warrior 🛡️", color: "text-slate-700 bg-slate-100 border-slate-200" };
  };

  const classInfo = getClassTitle(rating || 1500);

  const RELICS = [
    { name: "Scroll of Two Pointers", icon: "📜", bonus: "+5% Speed", unlocked: true },
    { name: "Ring of Binary Search", icon: "💍", bonus: "+10% Precision", unlocked: true },
    { name: "Shield of Dynamic Prog.", icon: "🛡️", bonus: "+15% Defense", unlocked: rating >= 1600 },
    { name: "Staff of Graph Traversal", icon: "⚡", bonus: "+20% EXP Boost", unlocked: streak >= 7 },
  ];

  return (
    <SpotlightCard glowHue={205} spotSize={260} borderSize={2} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <span className="quest-badge text-[9px] mb-1 inline-block">⚔️ EQUIPPED CLASS & RELICS</span>
          <h4 className="font-black text-sm text-slate-900">Warrior Inventory</h4>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border ${classInfo.color}`}>
          {classInfo.title}
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
