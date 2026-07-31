"use client";

import { useEffect, useState } from "react";
import { useCodeWarriorsAuth } from "@/context/CodeWarriorsAuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, ReferenceLine
} from "recharts";
import { 
  Loader2, Flame, Trophy, Award, Sparkles, Brain, 
  HelpCircle, ChevronRight, GraduationCap, CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
        toast.error("Failed to load analytics details.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  if (loading || !analyticsData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Generate list of last 365 days for heatmap
  const generateHeatmapDays = () => {
    const days = [];
    const today = new Date();
    // Go back 364 days to make it a full year of 52 weeks (365 days)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    // Adjust start date to previous Sunday to keep the columns aligned
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    const currentDate = new Date(startDate);
    const endDate = new Date(today);
    // Align end date to Saturday
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
  
  // Group days by column (weeks)
  const heatmapWeeks: any[] = [];
  for (let i = 0; i < heatmapDays.length; i += 7) {
    heatmapWeeks.push(heatmapDays.slice(i, i + 7));
  }

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 1: return "bg-indigo-900/50 border-indigo-700/20"; // Level 1 (Easy Solved)
      case 2: return "bg-indigo-600 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]"; // Level 2 (Medium Solved)
      case 3: return "bg-purple-500 border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.4)]"; // Level 3 (Hard / Multiple)
      default: return "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"; // Unsolved
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
    <div className="space-y-8 pb-16">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/[0.02] border-white/5 p-6 rounded-2xl">
          <p className="text-xs text-white/50 font-bold uppercase tracking-widest leading-none mb-1">Streak</p>
          <h3 className="text-3xl font-black text-white">{user?.current_streak ?? 0} 🔥</h3>
          <p className="text-xs text-white/40 mt-1">Best streak: {user?.max_streak ?? 0} Days</p>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 p-6 rounded-2xl">
          <p className="text-xs text-white/50 font-bold uppercase tracking-widest leading-none mb-1">Total Solved</p>
          <h3 className="text-3xl font-black text-indigo-400">{analyticsData.stats.totalSolved} ⚔️</h3>
          <p className="text-xs text-white/40 mt-1">Acceptance Rate: {analyticsData.stats.acceptanceRate}%</p>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 p-6 rounded-2xl">
          <p className="text-xs text-white/50 font-bold uppercase tracking-widest leading-none mb-1">Hardest Solved</p>
          <h3 className="text-2xl font-bold text-yellow-500">{analyticsData.stats.hardestSolved} 🛡️</h3>
          <p className="text-xs text-white/40 mt-1">Rating difficulty cap</p>
        </Card>

        <Card className="bg-white/[0.02] border-white/5 p-6 rounded-2xl">
          <p className="text-xs text-white/50 font-bold uppercase tracking-widest leading-none mb-1">Weekly Solves</p>
          <h3 className="text-3xl font-black text-green-400">{analyticsData.stats.weeklySolved} / {analyticsData.stats.weeklyGoal}</h3>
          <p className="text-xs text-white/40 mt-1">Target is 1 POTD daily</p>
        </Card>
      </div>

      {/* GitHub style heatmap */}
      <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-6 md:p-8">
        <CardHeader className="p-0 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold">Activity Heatmap</CardTitle>
            <p className="text-xs text-white/50">Your daily competitive programming solve records over the past year</p>
          </div>
          {/* Heatmap Legend */}
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>Less</span>
            <div className="w-3.5 h-3.5 rounded bg-white/[0.02] border border-white/5" />
            <div className="w-3.5 h-3.5 rounded bg-indigo-900/50 border border-indigo-700/20" />
            <div className="w-3.5 h-3.5 rounded bg-indigo-600 border border-indigo-500/20" />
            <div className="w-3.5 h-3.5 rounded bg-purple-500 border border-purple-400/30" />
            <span>More</span>
          </div>
        </CardHeader>

        {/* Heatmap Container */}
        <div className="overflow-x-auto pb-4 -mx-6 px-6">
          <div className="min-w-[700px] flex flex-col gap-1">
            {/* Months Header Row */}
            <div className="flex h-4 text-[10px] text-white/40 font-semibold mb-1 ml-6">
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
              <div className="flex flex-col justify-between h-[98px] text-[9px] text-white/40 select-none py-1.5 leading-none shrink-0 font-medium">
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
                        )} ${hoveredDay?.date === day.date ? "ring-2 ring-indigo-400 scale-110 z-10" : ""}`}
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
            className="border-t border-white/5 mt-6 pt-4 flex flex-col sm:flex-row justify-between gap-4 text-sm relative z-10"
          >
            <div>
              <p className="font-bold text-white/80">
                {new Date(hoveredDay.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                {hoveredDay.count === 0 
                  ? "No daily solves registered" 
                  : `Solved ${hoveredDay.count} problem${hoveredDay.count > 1 ? "s" : ""}`}
              </p>
            </div>
            
            {hoveredDay.count > 0 && (
              <div className="flex flex-wrap gap-3">
                {hoveredDay.details.map((det: any) => (
                  <div key={det.id} className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-xs text-indigo-400">{det.contestId}{det.index}</p>
                      <p className="font-bold text-sm leading-tight mt-0.5">{det.name}</p>
                    </div>
                    <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">
                      {det.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </Card>

      {/* Recharts Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Rating Progression Graph */}
        <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-400" /> Rating Progress
            </CardTitle>
            <p className="text-xs text-white/50">Your rating trajectory over recent competitive contests</p>
          </CardHeader>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.ratingProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis domain={["auto", "auto"]} stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f0f15", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  itemStyle={{ color: "#a5b4fc" }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                {/* Reference line for max rating */}
                {(user?.lc_max_rating ?? 0) > 0 && (
                  <ReferenceLine y={user?.lc_max_rating ?? 0} stroke="#eab308" strokeDasharray="4 4" label={{ value: `Max: ${user?.lc_max_rating ?? 0}`, fill: "rgba(255,255,255,0.5)", fontSize: 9, position: "top" }} />
                )}
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: "#818cf8" }}
                  dot={{ r: 4, fill: "#4f46e5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Difficulty Distribution Chart */}
        <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" /> Solved Difficulty Distribution
            </CardTitle>
            <p className="text-xs text-white/50">Number of solved problems categorized by platform difficulty levels</p>
          </CardHeader>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.difficultyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="difficulty" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f0f15", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  itemStyle={{ color: "#a5b4fc" }}
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                />
                <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* Problem Recommendations (from real submission tag analysis) */}
      <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />
        
        <CardHeader className="p-0 mb-6 flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Recommended Practice</CardTitle>
            <p className="text-xs text-white/50">Problems suggested based on your real submission tag history</p>
          </div>
        </CardHeader>

        {analyticsData.recommendations.length === 0 ? (
          <div className="py-12 text-center text-white/30">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Solve more problems to unlock personalized recommendations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {analyticsData.recommendations.map((rec: any) => (
              <div 
                key={rec.id}
                className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {rec.tag}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                      Diff: {rec.difficulty}
                    </span>
                  </div>

                  <h4 className="font-bold text-base group-hover:text-purple-400 transition-colors">
                    {rec.contestId}{rec.problemIndex} - {rec.name}
                  </h4>
                </div>

                <a
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors"
                >
                  <span>SOLVE PROBLEM</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
