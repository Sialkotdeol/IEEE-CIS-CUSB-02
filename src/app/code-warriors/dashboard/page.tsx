"use client";

import { useEffect, useState } from "react";
import { useCodeWarriorsAuth } from "@/context/CodeWarriorsAuthContext";
import { 
  Flame, Award, Code, CheckCircle2, RefreshCw, Clock, 
  ExternalLink, Sparkles, BookOpen, AlertCircle, ArrowUpRight, Megaphone, Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardOverview() {
  const { user, syncUserCF } = useCodeWarriorsAuth();
  const [potd, setPotd] = useState<any>(null);
  const [loadingPOTD, setLoadingPOTD] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const [isSolved, setIsSolved] = useState(false);
  const [checkingSolve, setCheckingSolve] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [autoSyncing, setAutoSyncing] = useState(false);
  const SYNC_COOLDOWN_MS = 1 * 60 * 1000; // 1 minute

  // Silent background sync — no toast, respects cooldown
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
      // silent — don't show error toast for background sync
    } finally {
      setAutoSyncing(false);
    }
  };

  // Time remaining countdown
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

  // Fetch POTD and announcements
  const fetchDashboardData = async () => {
    if (!user) return;
    setLoadingPOTD(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      let fetchedPotd = null;
      
      const res = await fetch(`/api/code-warriors/problems?date=${todayStr}`);
      if (res.ok) {
        const data = await res.json();
        setPotd(data.problem);
        fetchedPotd = data.problem;
      }

      const annRes = await fetch("/api/code-warriors/announcements");
      if (annRes.ok) {
        const annData = await annRes.json();
        setAnnouncements(annData.announcements.slice(0, 3));
      }

      // Check if user solved it by searching submissions
      const subRes = await fetch(`/api/code-warriors/stats?userId=${user.id}`);
      if (subRes.ok) {
        const statsData = await subRes.json();
        const heatmapToday = statsData.heatmap[todayStr];
        // If there's a solved record for today, and it matches fetchedPotd
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
    } finally {
      setLoadingPOTD(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Auto-sync on load (respects 5-min cooldown)
  useEffect(() => {
    if (user) silentSync();
  }, [user]);

  // Auto-sync when user tabs back (e.g. after solving on LeetCode)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && user) {
        silentSync();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [user]);

  // Re-check solve state on user profile update/sync
  useEffect(() => {
    if (user && potd) {
      const checkSolveStatus = async () => {
        const todayStr = new Date().toISOString().split("T")[0];
        try {
          const subRes = await fetch(`/api/code-warriors/stats?userId=${user.id}`);
          if (subRes.ok) {
            const statsData = await subRes.json();
            const heatmapToday = statsData.heatmap[todayStr];
            if (heatmapToday && heatmapToday.count > 0) {
              const solvedPOTD = heatmapToday.details.some(
                (d: any) => d.titleSlug === potd.title_slug
              );
              setIsSolved(solvedPOTD);
            } else {
              setIsSolved(false);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      checkSolveStatus();
    }
  }, [user, potd]);

  const handleSyncClick = async () => {
    setCheckingSolve(true);
    await syncUserCF();
    await fetchDashboardData();
    setCheckingSolve(false);
  };

  const getDifficultyColor = (diff: number) => {
    if (diff < 1000) return "text-green-400 bg-green-400/10 border-green-500/20";
    if (diff < 1400) return "text-indigo-400 bg-indigo-400/10 border-indigo-500/20";
    if (diff < 1800) return "text-orange-400 bg-orange-400/10 border-orange-500/20";
    return "text-red-400 bg-red-400/10 border-red-500/20";
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Upper Alerts/Announcements */}
      {announcements.length > 0 && (
        <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3">
          <Megaphone className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-indigo-400 tracking-wider uppercase mb-1">Latest Announcement</p>
            <p className="text-sm font-semibold">{announcements[0].title}</p>
            <p className="text-sm text-white/70 mt-1">{announcements[0].content}</p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* POTD Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/[0.02] border-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 relative overflow-hidden">
            {/* Solve state background glow */}
            <div className={`absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[120px] transition-all pointer-events-none ${
              isSolved ? "bg-green-500/10" : "bg-indigo-500/5"
            }`} />

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Problem of the day</span>
                <h2 className="text-2xl md:text-3xl font-black mt-1">
                  {loadingPOTD ? "Loading Problem..." : potd ? potd.name : "Rest Day! ☕"}
                </h2>
              </div>
            </div>

            {loadingPOTD ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : potd ? (
              <div className="space-y-6 relative z-10">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getDifficultyColor(potd.difficulty)}`}>
                    Difficulty: {potd.difficulty}
                  </span>
                  {potd.tags?.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-white/60">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="text-xs text-white/50 leading-none">TIME REMAINING</p>
                      <p className="font-mono font-bold text-lg mt-1">{timeLeft}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isSolved ? (
                      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2.5 rounded-xl font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 fill-green-500/20" /> Completed
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-2.5 rounded-xl font-bold text-sm">
                        <Clock className="w-5 h-5" /> Pending Solve
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <a
                    href={`https://leetcode.com/problems/${potd.title_slug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide transition-all flex items-center justify-center gap-2"
                  >
                    Open Problem on LeetCode <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-white/50">
                <p>No problem assigned for today yet. Check back soon!</p>
              </div>
            )}
          </Card>

          {/* Guidelines / Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/[0.02] border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Daily Goal Rules</h3>
              </div>
              <ul className="space-y-2 text-sm text-white/70 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span> Solve today's assigned problem on LeetCode before midnight.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span> Click the "Sync Progress" button to load your submissions.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span> Streak increases with consecutive daily completes!
                </li>
              </ul>
            </Card>

            <Card className="bg-white/[0.02] border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Pro-Tips for Streak</h3>
              </div>
              <ul className="space-y-2 text-sm text-white/70 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span> Maintain a clean submission style. Clean variable names speed up debug.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span> Read tags before coding if you are stuck.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span> Join the community chat for collaborative debug help.
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* User Card Sidebar */}
        <div className="space-y-6">
          {/* Streak Card */}
          <Card className="bg-white/[0.02] border-white/5 backdrop-blur-xl rounded-3xl p-6 text-center overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none" />
            <Flame className="w-16 h-16 text-red-500 fill-red-500/10 mx-auto mb-4 animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]" />
            
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest leading-none mb-1">Current Streak</p>
            <h3 className="text-4xl font-black mb-1">{user?.current_streak ?? 0} Days 🔥</h3>
            <p className="text-xs text-white/40">Best Streak: {user?.max_streak ?? 0} Days</p>

            <div className="border-t border-white/5 mt-6 pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Solved POTDs</p>
                <p className="text-xl font-bold text-indigo-400 mt-1">{user?.total_solved ?? 0}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Last Sync</p>
                <p className="text-xs font-mono text-white/60 mt-1.5 truncate">
                  {user?.last_sync ? new Date(user.last_sync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Never"}
                </p>
              </div>
            </div>
          </Card>

          {/* Platform Details */}
          <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" /> Platform Stats
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                <span className="text-white/50">Username</span>
                <span className="font-mono font-bold text-indigo-400">{user?.leetcode_handle}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                <span className="text-white/50">Rating</span>
                <span className="font-bold">{user?.lc_rating ?? "Unrated"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                <span className="text-white/50">Rank</span>
                <span className="capitalize">{user?.lc_rank || "Unrated"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                <span className="text-white/50">Max Rating</span>
                <span className="font-bold text-yellow-500/80">{user?.lc_max_rating ?? "Unrated"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                <span className="text-white/50">Max Rank</span>
                <span className="capitalize text-yellow-500/80">{user?.lc_max_rank || "Unrated"}</span>
              </div>
            </div>

            <a
              href={`https://leetcode.com/u/${user?.leetcode_handle}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-center text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2"
            >
              View Profile <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </Card>
        </div>

      </div>
    </div>
  );
}
