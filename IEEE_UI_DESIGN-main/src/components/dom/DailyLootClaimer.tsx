"use client";

import React, { useState } from "react";
import { Gift, Sparkles, Check, Flame, Box } from "lucide-react";
import { toast } from "sonner";

export function DailyLootClaimer({ userId, streak }: { userId: string; streak: number }) {
  const [claimed, setClaimed] = useState(() => {
    if (typeof window === "undefined") return false;
    const todayStr = new Date().toISOString().split("T")[0];
    const claimedDate = localStorage.getItem(`cw_loot_claimed_${userId}`);
    return claimedDate === todayStr;
  });
  const [claiming, setClaiming] = useState(false);

  const handleClaim = () => {
    if (claimed || claiming) return;
    setClaiming(true);

    setTimeout(() => {
      const todayStr = new Date().toISOString().split("T")[0];
      localStorage.setItem(`cw_loot_claimed_${userId}`, todayStr);
      setClaimed(true);
      setClaiming(false);
      toast.success(`🎉 Daily Loot Claimed! +50 EXP & +10 Gold (Streak x${Math.min(streak, 5)})`);
    }, 600);
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border-2 border-amber-300/80 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md relative overflow-hidden">
      <div className="flex items-center gap-3.5 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
          {claimed ? (
            <Check className="w-6 h-6 text-emerald-600" />
          ) : (
            <Gift className="w-6 h-6 text-amber-600 animate-bounce" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="quest-badge text-[9px] bg-amber-100 text-amber-800 border-amber-300">
              🎁 DAILY STREAK LOOT CHEST
            </span>
            {streak > 1 && (
              <span className="text-[10px] font-mono font-black text-orange-600 flex items-center gap-0.5">
                <Flame size={12} className="fill-orange-500" /> {streak}x Multiplier
              </span>
            )}
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">
            {claimed ? "Daily Loot Claimed for Today!" : "Claim Your Daily Warrior Bonus"}
          </h4>
          <p className="text-xs text-slate-500 font-mono mt-0.5 font-semibold">
            {claimed ? "Come back tomorrow after midnight for your next bonus." : "Reward: +50 EXP • +10 IEEE Gold Coins"}
          </p>
        </div>
      </div>

      <button
        onClick={handleClaim}
        disabled={claimed || claiming}
        className={`px-5 py-2.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider transition-all shrink-0 shadow-md relative z-10 ${
          claimed
            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-default"
            : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 hover:scale-105 active:scale-95"
        }`}
      >
        {claiming ? "OPENING CHEST..." : claimed ? "CLAIMED ✓" : "CLAIM DAILY LOOT 📦"}
      </button>
    </div>
  );
}
