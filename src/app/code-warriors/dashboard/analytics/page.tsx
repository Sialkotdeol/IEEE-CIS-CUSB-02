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
          // Zeroed-out fallback analytics
          setAnalyticsData({
            stats: { totalSolved: user.quests_solved || 0, acceptanceRate: 0, hardestSolved: "None", weeklySolved: 0, weeklyGoal: 7 },
            heatmap: {},
            ratingProgress: [],
            difficultyDistribution: [],
            recommendations: []
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

  // Heatmap Helpers
  const generateHeatmapDays = () => {
    const days = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);
    const currentDate = new Date(startDate);
    const endDate = new Date(today);
    const endDayOfWeek = endDate.getDay();
    endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dateData = analyticsData.heatmap[dateStr] || { count: 0, level: 0, details: [] };
      days.push({
        date: dateStr,
        dayOfWeek: currentDate.getDay(),
        month: currentDate.getMonth(),
        count: dateData.count,
        level: dateData.level,
        details: dateData.details
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  const heatmapDays = generateHeatmapDays();
  const heatmapWeeks: any[] = [];
  for (let i = 0; i < heatmapDays.length; i += 7) {
    heatmapWeeks.push(heatmapDays.slice(i, i + 7));
  }

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 1: return "bg-primary/30 border-primary/20"; // Level 1 (Easy)
      case 2: return "bg-primary border-primary/20 shadow-sm"; // Level 2 (Medium)
      case 3: return "bg-purple-500 border-purple-400 shadow-sm"; // Level 3 (Hard)
      default: return "bg-slate-100 border-slate-200 hover:bg-slate-200"; // Unsolved
    }
  };

  const getMonthLabel = (weekIndex: number) => {
    if (weekIndex % 4 === 0 && weekIndex < heatmapWeeks.length) {
      const firstDayOfWeek = heatmapWeeks[weekIndex][0];
      const d = new Date(firstDayOfWeek.date);
      return d.toLocaleString("en-US", { month: "short" });
    }
    return "";
  };

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

      {/* Activity Heatmap */}
      <SpotlightCard glowHue={205} spotSize={300} borderSize={2} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Activity Heatmap
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Your daily competitive programming solve records over the past year</p>
          </div>
          {/* Heatmap Legend */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400">
            <span>Less</span>
            <div className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200" />
            <div className="w-3.5 h-3.5 rounded bg-primary/30 border border-primary/20" />
            <div className="w-3.5 h-3.5 rounded bg-primary border border-primary/20" />
            <div className="w-3.5 h-3.5 rounded bg-purple-500 border border-purple-400" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Container */}
        <div className="overflow-x-auto pb-4 -mx-2 px-2 sm:mx-0 sm:px-0">
          <div className="min-w-[700px] flex flex-col gap-1">
            {/* Months Header Row */}
            <div className="flex h-4 text-[10px] text-slate-400 font-semibold mb-1 ml-6">
              {heatmapWeeks.map((week, idx) => {
                const label = getMonthLabel(idx);
                return label ? (
                  <div key={idx} style={{ width: "calc(100% / 53)" }} className="text-left select-none">
                    {label}
                  </div>
                ) : (
                  <div key={idx} style={{ width: "calc(100% / 53)" }} />
                );
              })}
            </div>

            <div className="flex gap-2">
              {/* Day Labels Column */}
              <div className="flex flex-col justify-between h-[98px] text-[9px] text-slate-400 select-none py-1.5 leading-none shrink-0 font-medium">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              {/* Grid block columns */}
              <div className="flex-1 flex gap-[3.5px] items-stretch justify-between">
                {heatmapWeeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3.5px] w-full">
                    {week.map((day: any) => (
                      <div
                        key={day.date}
                        className={`aspect-square w-full rounded-[3px] border cursor-pointer transition-all ${getHeatmapColor(
                          day.level
                        )} ${hoveredDay?.date === day.date ? "ring-2 ring-primary scale-110 z-10" : ""}`}
                        onMouseEnter={() => setHoveredDay(day)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Heatmap Day Details Drawer */}
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-slate-100 mt-6 pt-4 flex flex-col sm:flex-row justify-between gap-4 text-sm relative z-10"
          >
            <div>
              <p className="font-extrabold text-slate-900">
                {new Date(hoveredDay.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                {hoveredDay.count === 0 
                  ? "No daily solves registered" 
                  : `Solved ${hoveredDay.count} problem${hoveredDay.count > 1 ? "s" : ""}`}
              </p>
            </div>
            
            {hoveredDay.count > 0 && (
              <div className="flex flex-wrap gap-3">
                {hoveredDay.details.map((det: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-[10px] text-slate-500 tracking-wider uppercase">LC • {det.titleSlug || "PROBLEM"}</p>
                      <p className="font-extrabold text-sm leading-tight text-slate-900 mt-0.5">{det.name}</p>
                    </div>
                    <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded font-mono font-bold">
                      {det.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </SpotlightCard>

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
