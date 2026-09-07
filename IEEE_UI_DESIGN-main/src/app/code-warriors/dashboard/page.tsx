"use client";

import { useEffect, useState } from "react";
import { useCodeWarriorsAuth } from "@/context/CodeWarriorsAuthContext";
import { 
  Flame, Code, CheckCircle2, RefreshCw, Clock, 
  ExternalLink, Sparkles, BookOpen, ArrowUpRight, Megaphone, Loader2,
  Trophy, Shield, Zap, Target, Box, Gift, Swords, ChevronDown, Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RpgCharacterCard } from "@/components/dom/RpgCharacterCard";
import { DailyLootClaimer } from "@/components/dom/DailyLootClaimer";
import { RpgInventoryRelics } from "@/components/dom/RpgInventoryRelics";
import { GuildActivityTicker } from "@/components/dom/GuildActivityTicker";

export default function DashboardOverview() {
  const { user, syncUserCF } = useCodeWarriorsAuth();
  const [potd, setPotd] = useState<any>(null);
  const [loadingPOTD, setLoadingPOTD] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const [isSolved, setIsSolved] = useState(false);
  const [checkingSolve, setCheckingSolve] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [autoSyncing, setAutoSyncing] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const SYNC_COOLDOWN_MS = 1 * 60 * 1000;

  const silentSync = async () => {
    if (!user || autoSyncing) return;
    const lastSync = localStorage.getItem(`cw_last_sync_${user.id}`);
    if (lastSync && Date.now() - parseInt(lastSync) < SYNC_COOLDOWN_MS) return;

    setAutoSyncing(true);
    try {
      await fetch(`/api/code-warriors/sync?userId=${user.id}`, { method: "POST" });
      localStorage.setItem(`cw_last_sync_${user.id}`, Date.now().toString());
      await fetchDashboardData();
    } catch (err) {
      // silent
    } finally {
      setAutoSyncing(false);
    }
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0
      );
      const diffMs = midnight.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      const formatted = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(":");
      
      setTimeLeft(formatted);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoadingPOTD(true);
    const todayStr = new Date().toISOString().split("T")[0];

    const fallbackProblem = {
      id: "potd-1",
      date: todayStr,
      title_slug: "two-sum",
      question_id: 1,
      name: "1. Two Sum",
      difficulty: "Easy",
      tags: ["Array", "Hash Table"],
      points: 150,
      expected_solve_time: 15,
      hint: "Use a Hash Map to store numbers and their indices in linear time O(N) instead of brute-force O(N²).",
      created_at: new Date().toISOString()
    };

    const fallbackAnnouncements = [
      {
        id: "ann-1",
        title: "🚀 Welcome to CIS Code Warriors 2026 Sprints!",
        content: "Daily POTD is live! Solve today's quest to level up your streak and claim +150 EXP & 25 IEEE Gold.",
        created_by: "Admin",
        created_at: new Date().toISOString()
      }
    ];

    try {
      let fetchedPotd = null;
      
      const res = await fetch(`/api/code-warriors/problems?date=${todayStr}`);
      if (res.ok) {
        const data = await res.json();
        if (data.problem) {
          setPotd(data.problem);
          fetchedPotd = data.problem;
        } else {
          setPotd(fallbackProblem);
          fetchedPotd = fallbackProblem;
        }
      } else {
        setPotd(fallbackProblem);
        fetchedPotd = fallbackProblem;
      }

      const annRes = await fetch("/api/code-warriors/announcements");
      if (annRes.ok) {
        const annData = await annRes.json();
        if (annData.announcements && annData.announcements.length > 0) {
          setAnnouncements(annData.announcements.slice(0, 3));
        } else {
          setAnnouncements(fallbackAnnouncements);
        }
      } else {
        setAnnouncements(fallbackAnnouncements);
      }

      const subRes = await fetch(`/api/code-warriors/stats?userId=${user.id}`);
      if (subRes.ok) {
        const statsData = await subRes.json();
        const heatmapToday = statsData.heatmap?.[todayStr];
        if (heatmapToday && heatmapToday.count > 0 && fetchedPotd) {
          const solvedPOTD = heatmapToday.details.some(
            (d: any) => d.titleSlug === fetchedPotd.title_slug
          );
          setIsSolved(solvedPOTD);
        } else {
          setIsSolved(false);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard POTD data:", err);
      setPotd(fallbackProblem);
      setAnnouncements(fallbackAnnouncements);
    }
    setLoadingPOTD(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (user) silentSync();
  }, [user]);

  const handleSyncClick = async () => {
    setCheckingSolve(true);
    await syncUserCF();
    await fetchDashboardData();
    setCheckingSolve(false);
  };

  const getDifficultyBadge = (diff: string | number) => {
    const dStr = String(diff).toLowerCase();
    if (dStr.includes("easy") || Number(diff) < 1200) {
      return "bg-emerald-50 text-emerald-700 border-emerald-300";
    }
    if (dStr.includes("medium") || Number(diff) < 1700) {
      return "bg-amber-50 text-amber-700 border-amber-300";
    }
    return "bg-rose-50 text-rose-700 border-rose-300";
  };

  if (!user) return null;

  return (
    <div className="space-y-8 pb-16 text-slate-900">

      {/* ── 1. RPG Character Avatar & Level Banner ── */}
      <RpgCharacterCard user={user} />

      {/* ── 2. Live Guild Activity Ticker ── */}
      <GuildActivityTicker />

      {/* ── 3. Interactive Daily Loot Bonus Chest ── */}
      <DailyLootClaimer userId={user.id} streak={user.current_streak || 0} />

      {/* ── 4. Bulletin Board Announcement ── */}
      {announcements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-amber-50/90 border-2 border-amber-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-300 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
            <Megaphone className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="quest-badge text-[10px]">📌 GUILD BULLETIN BOARD</span>
              <span className="text-[10px] text-amber-700 font-mono">ANNOUNCEMENT</span>
            </div>
            <p className="text-sm font-black text-slate-900">{announcements[0].title}</p>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{announcements[0].content}</p>
          </div>
        </motion.div>
      )}

      {/* ── 5. RPG HUD Stat Cards Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
        {[
          {
            label: "🔥 CURRENT STREAK",
            value: `${user.current_streak ?? 0} DAYS`,
            sub: `Best: ${user.max_streak ?? 0} Days`,
            icon: <Flame className="w-5 h-5 text-orange-500 fill-orange-500 pixel-flame" />,
            color: "text-orange-600",
            bg: "from-orange-500/5 to-amber-500/5",
          },
          {
            label: "⚔️ QUESTS SOLVED",
            value: String(user.total_solved ?? 0),
            sub: "POTD Challenges",
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
            color: "text-emerald-600",
            bg: "from-emerald-500/5 to-teal-500/5",
          },
          {
            label: "⚡ SKILL RATING",
            value: user.lc_rating ? `${user.lc_rating} PTS` : "1500 PTS",
            sub: user.lc_rank || "Knight Rank",
            icon: <Zap className="w-5 h-5 text-primary fill-primary/20" />,
            color: "text-primary",
            bg: "from-primary/5 to-cyan-500/5",
          },
          {
            label: "🏆 PEAK RATING",
            value: user.lc_max_rating ? `${user.lc_max_rating} PTS` : "1500 PTS",
            sub: user.lc_max_rank || "Peak Knight",
            icon: <Trophy className="w-5 h-5 text-amber-500" />,
            color: "text-amber-600",
            bg: "from-amber-500/5 to-yellow-500/5",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.45 }}
            className={`hud-card p-5 relative overflow-hidden bg-gradient-to-br ${stat.bg}`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="quest-badge text-[9px]">{stat.label}</span>
              {stat.icon}
            </div>
            <p className={`text-2xl md:text-3xl font-black leading-none tracking-tight ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-500 mt-2 font-mono font-bold">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── 6. Main Grid: Active Quest + Sidebar Inventory & Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* Left 2 Cols: Quest of the Day & Codex Rules */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          {/* Active Quest Container */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55 }}
            className="hud-card p-7 md:p-9 relative overflow-hidden bg-gradient-to-b from-white via-cyan-50/20 to-white"
          >
            <div className={`absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[110px] pointer-events-none transition-all ${
              isSolved ? "bg-emerald-400/15" : "bg-primary/10"
            }`} />

            <div className="flex flex-wrap justify-between items-center gap-3 mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <span className="quest-badge text-xs flex items-center gap-1.5 py-1 px-3">
                  <Swords size={14} className="text-primary" /> ACTIVE QUEST OF THE DAY
                </span>
              </div>
              
              <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/80 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold shadow-sm">
                <span className="flex items-center gap-1 text-amber-700">
                  <Gift size={14} className="text-amber-600" /> +150 EXP
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-amber-700">
                  <Box size={14} className="text-amber-600" /> +25 GOLD
                </span>
              </div>
            </div>

            {loadingPOTD ? (
              <div className="py-14 flex flex-col items-center justify-center gap-3">
                <div className="flex gap-2">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-3 h-3 rounded-sm bg-primary"
                      style={{ animation: `pixel-pulse 0.8s ease-in-out infinite`, animationDelay: `${i*0.18}s` }}
                    />
                  ))}
                </div>
                <p className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">Loading Daily Quest Specs...</p>
              </div>
            ) : potd ? (
              <div className="space-y-6 relative z-10">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    {potd.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-1 font-bold">
                    QUEST REF: #{potd.question_id || 1} • TARGET SOLVE TIME: {potd.expected_solve_time || 15} MINS
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-xl border text-xs font-black font-mono shadow-sm ${getDifficultyBadge(potd.difficulty)}`}>
                    DIFFICULTY: {potd.difficulty}
                  </span>
                  {potd.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-mono text-slate-600 font-bold">
                      🏷️ {tag}
                    </span>
                  ))}
                </div>

                {/* Optional Hint Codex Accordion */}
                <div className="border border-amber-200 bg-amber-50/60 rounded-2xl p-4">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="w-full flex items-center justify-between font-mono text-xs font-black text-amber-900 uppercase"
                  >
                    <span className="flex items-center gap-1.5">
                      <Lightbulb size={16} className="text-amber-600" /> View Quest Hint & Optimal Approach
                    </span>
                    <ChevronDown size={16} className={`transform transition-transform ${showHint ? "rotate-180" : ""}`} />
                  </button>
                  {showHint && (
                    <div className="mt-3 pt-3 border-t border-amber-200/60 text-xs text-amber-900 leading-relaxed font-mono">
                      {potd.hint || "Analyze constraints to pick between Hash Map O(N) or Sorting O(N log N). Avoid nested loops."}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 border-2 border-slate-200/90 rounded-2xl p-5 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">QUEST TIME REMAINING</p>
                      <p className="font-mono font-black text-2xl text-slate-900 mt-0.5">{timeLeft}</p>
                    </div>
                  </div>

                  {isSolved ? (
                    <div className="flex items-center gap-2 bg-emerald-50 border-2 border-emerald-300 text-emerald-700 px-5 py-3 rounded-xl font-extrabold text-sm shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" /> QUEST CLEARED ✓
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-amber-50 border-2 border-amber-300 text-amber-700 px-5 py-3 rounded-xl font-extrabold text-sm shadow-sm">
                      <Target className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} /> QUEST IN PROGRESS
                    </div>
                  )}
                </div>

                <a
                  href={`https://leetcode.com/problems/${potd.title_slug}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary via-cyan-600 to-primary hover:opacity-95 text-white font-black tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Swords size={18} /> ATTACK PROBLEM ON LEETCODE <ExternalLink size={16} />
                </a>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <p className="text-4xl mb-3">🏕️</p>
                <p className="font-bold">No quest assigned today. Rest up warrior!</p>
              </div>
            )}
          </motion.div>

          {/* Codex Rules & Pro-Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="hud-card p-6"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <BookOpen size={18} />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">DAILY QUEST CODEX</h3>
              </div>
              <ul className="space-y-2.5">
                {[
                  "Solve today's quest on LeetCode before midnight.",
                  "Hit 'Sync Progress' to record your submission in the Guild.",
                  "Consecutive daily solves increase your HP & streak multipliers!",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed font-medium">
                    <span className="text-primary font-black mt-0.5">⚔️</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52 }}
              className="hud-card p-6"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-600">
                  <Sparkles size={18} />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">WARRIOR PRO-TIPS</h3>
              </div>
              <ul className="space-y-2.5">
                {[
                  "Review topic tags before coding to pick the optimal data structure.",
                  "Clean, modular code speeds up debug and reduces runtime overhead.",
                  "Collaborate with fellow IEEE warriors in the community guild chat.",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed font-medium">
                    <span className="text-amber-500 font-black mt-0.5">✦</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

        </div>

        {/* Right 1 Col: RPG Inventory & Profile Deck */}
        <div className="space-y-6">
          
          {/* RPG Inventory & Class System */}
          <RpgInventoryRelics rating={user.lc_rating || 1500} streak={user.current_streak || 0} />

          {/* Player Stats Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="hud-card p-6 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" /> LEETCODE PROFILE
              </h3>
              <span className="quest-badge text-[9px]">VERIFIED</span>
            </div>

            <div className="space-y-3">
              {[
                { label: "HANDLE", value: user.leetcode_handle, mono: true, color: "text-primary font-black" },
                { label: "RATING", value: user.lc_rating ?? "Unrated", mono: false, color: "text-slate-900 font-bold" },
                { label: "RANK", value: user.lc_rank || "Unranked", mono: false, color: "text-slate-600 font-semibold" },
                { label: "MAX RATING", value: user.lc_max_rating ?? "—", mono: false, color: "text-amber-600 font-bold" },
                { label: "MAX RANK", value: user.lc_max_rank || "—", mono: false, color: "text-amber-600 font-semibold" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 text-xs last:border-0">
                  <span className="text-slate-400 font-mono font-bold text-[10px] uppercase">{row.label}</span>
                  <span className={`${row.color} ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
                </div>
              ))}
            </div>

            <a
              href={`https://leetcode.com/u/${user.leetcode_handle}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full py-2.5 rounded-xl border border-slate-200 hover:bg-primary/5 hover:border-primary/30 text-center text-xs font-extrabold tracking-wider uppercase transition-all flex items-center justify-center gap-2 text-slate-600 hover:text-primary shadow-sm"
            >
              View Profile on LeetCode <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          {/* Sync Progress Button */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleSyncClick}
            disabled={checkingSolve}
            className="w-full py-4 rounded-2xl border-2 border-primary text-primary font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkingSolve ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> SYNCING GUILD STATS...</>
            ) : (
              <><RefreshCw className="w-4 h-4" /> SYNC LEETCODE PROGRESS</>
            )}
          </motion.button>

        </div>

      </div>
    </div>
  );
}
