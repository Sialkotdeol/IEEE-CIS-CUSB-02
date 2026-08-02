"use client";

import { useEffect, useState } from "react";
import { useCodeWarriorsAuth } from "@/context/CodeWarriorsAuthContext";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, ReferenceLine
} from "recharts";
import { 
  Loader2, Flame, Trophy, Award, Brain, 
  ChevronRight, GraduationCap, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function AnalyticsPage() {
  const { user } = useCodeWarriorsAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [hoveredDay, setHoveredDay] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/code-warriors/stats?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setAnalyticsData(data);
        } else {
          // Fallback mock analytics
          setAnalyticsData({
            stats: { totalSolved: user.total_solved || 48, acceptanceRate: 88, hardestSolved: "1920", weeklySolved: 7, weeklyGoal: 7 },
            heatmap: {},
            ratingProgress: [
              { date: "Jan", rating: 1500 },
              { date: "Feb", rating: 1620 },
              { date: "Mar", rating: 1710 },
              { date: "Apr", rating: 1780 },
              { date: "May", rating: 1845 }
            ],
            difficultyDistribution: [
              { difficulty: "Easy", count: 24 },
              { difficulty: "Medium", count: 18 },
              { difficulty: "Hard", count: 6 }
            ],
            recommendations: [
              { id: "1", contestId: "LC", problemIndex: "15", name: "3Sum", tag: "Two Pointers", difficulty: "Medium", url: "https://leetcode.com/problems/3sum/" },
              { id: "2", contestId: "LC", problemIndex: "53", name: "Maximum Subarray", tag: "Dynamic Programming", difficulty: "Medium", url: "https://leetcode.com/problems/maximum-subarray/" }
            ]
          });
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  if (loading || !analyticsData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 text-slate-900">
      
      {/* Overview Header */}
      <SpotlightCard glowHue={205} spotSize={300} borderSize={2} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md">
        <span className="quest-badge mb-2 inline-block">📊 PERFORMANCE METRICS</span>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Warrior Analytics <Sparkles size={20} className="text-yellow-500 animate-pulse" />
        </h2>
        <p className="text-xs md:text-sm text-slate-500 font-mono mt-1 font-bold">
          Detailed metrics of your streak progression, solve distributions, and rating velocity.
        </p>
      </SpotlightCard>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SpotlightCard glowHue={205} spotSize={200} borderSize={2} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest leading-none mb-2">CURRENT STREAK</p>
          <h3 className="text-3xl font-black text-orange-600">{user?.current_streak ?? 0} DAYS 🔥</h3>
          <p className="text-xs text-slate-500 font-mono mt-1">Best streak: {user?.max_streak ?? 0} Days</p>
        </SpotlightCard>

        <SpotlightCard glowHue={205} spotSize={200} borderSize={2} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest leading-none mb-2">TOTAL SOLVED</p>
          <h3 className="text-3xl font-black text-primary">{analyticsData.stats.totalSolved} ⚔️</h3>
          <p className="text-xs text-slate-500 font-mono mt-1">Acceptance Rate: {analyticsData.stats.acceptanceRate}%</p>
        </SpotlightCard>

        <SpotlightCard glowHue={205} spotSize={200} borderSize={2} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest leading-none mb-2">HARDEST SOLVED</p>
          <h3 className="text-2xl font-black text-amber-600">{analyticsData.stats.hardestSolved} 🛡️</h3>
          <p className="text-xs text-slate-500 font-mono mt-1">Rating difficulty cap</p>
        </SpotlightCard>

        <SpotlightCard glowHue={205} spotSize={200} borderSize={2} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest leading-none mb-2">WEEKLY SOLVES</p>
          <h3 className="text-3xl font-black text-emerald-600">{analyticsData.stats.weeklySolved} / {analyticsData.stats.weeklyGoal}</h3>
          <p className="text-xs text-slate-500 font-mono mt-1">Target is 1 POTD daily</p>
        </SpotlightCard>
      </div>

      {/* Recharts Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Rating Progression Graph */}
        <SpotlightCard glowHue={205} spotSize={280} borderSize={2} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" /> Rating Progression
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Your rating trajectory over recent competitive contests</p>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.ratingProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={["auto", "auto"]} stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  itemStyle={{ color: "#00629b" }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#00629b" 
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: "#06b6d4" }}
                  dot={{ r: 4, fill: "#00629b" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        {/* Difficulty Distribution Chart */}
        <SpotlightCard glowHue={205} spotSize={280} borderSize={2} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Solved Difficulty Breakdown
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Problems solved categorized by platform difficulty</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.difficultyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="difficulty" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  itemStyle={{ color: "#00629b" }}
                />
                <Bar dataKey="count" fill="#00629b" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

      </div>

      {/* Recommended Practice */}
      <SpotlightCard glowHue={205} spotSize={300} borderSize={2} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Recommended Practice Quests</h3>
            <p className="text-xs text-slate-500 font-mono">Suggested based on your tag history and weaknesses</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {analyticsData.recommendations.map((rec: any) => (
            <div 
              key={rec.id}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-primary/40 transition-all flex justify-between items-center group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {rec.tag} • {rec.difficulty}
                </span>
                <h4 className="font-extrabold text-base text-slate-900 mt-2 group-hover:text-primary transition-colors">
                  {rec.name}
                </h4>
              </div>

              <a
                href={rec.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-1 hover:bg-[#00527f] transition-colors shadow-sm shrink-0"
              >
                ATTACK <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </SpotlightCard>
    </div>
  );
}
