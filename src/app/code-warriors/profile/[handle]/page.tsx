"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from "recharts";
import { 
  Loader2, Flame, Trophy, Award, Shield, Crown, 
  ArrowLeft, ExternalLink, CalendarDays, CheckCircle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PublicProfilePage() {
  const params = useParams();
  const handle = params?.handle as string;
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<any>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!handle) return;
      try {
        // Fetch profile
        const pRes = await fetch(`/api/code-warriors/profile?handle=${handle}`);
        if (!pRes.ok) throw new Error("Profile not found");
        const pData = await pRes.json();
        setProfile(pData.profile);

        // Fetch stats
        const sRes = await fetch(`/api/code-warriors/stats?userId=${pData.profile.id}`);
        if (sRes.ok) {
          const sData = await sRes.json();
          setAnalytics(sData);
        }
      } catch (err) {
        console.error("Failed to load public profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProfile();
  }, [handle]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#050505] text-white p-6 text-center">
        <p className="text-red-400 font-bold text-lg">PROFILE NOT FOUND</p>
        <p className="text-sm text-white/50 mt-1">The requested LeetCode username is not registered in Code Warriors.</p>
        <Link href="/code-warriors" className="mt-6 text-indigo-400 font-bold hover:underline">
          Go Back
        </Link>
      </div>
    );
  }

  // Heatmap generation
  const generateHeatmapDays = () => {
    if (!analytics) return [];
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
      const dateData = analytics.heatmap[dateStr] || { count: 0, level: 0, details: [] };
      
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
  const heatmapWeeks: any[][] = [];
  for (let i = 0; i < heatmapDays.length; i += 7) {
    heatmapWeeks.push(heatmapDays.slice(i, i + 7));
  }

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 1: return "bg-indigo-900/50 border-indigo-700/20";
      case 2: return "bg-indigo-600 border-indigo-500/20";
      case 3: return "bg-purple-500 border-purple-400/30";
      default: return "bg-white/[0.02] border-white/5";
    }
  };

  const getMonthLabel = (weekIndex: number) => {
    if (weekIndex % 4 === 0 && weekIndex < heatmapWeeks.length) {
      const d = new Date(heatmapWeeks[weekIndex][0].date);
      return d.toLocaleString("en-US", { month: "short" });
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 space-y-8">
        {/* Back Link */}
        <Link 
          href="/code-warriors/dashboard/leaderboard"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors group mb-4"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" /> Back to Leaderboard
        </Link>

        {/* Public User Identity Card */}
        <Card className="bg-white/[0.02] border-white/5 p-6 md:p-8 rounded-3xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-2xl">
                {profile.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{profile.name}</h2>
                <p className="text-sm text-indigo-400 font-mono">@{profile.leetcode_handle}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-white/40 font-light">
                  <span>Dept: {profile.department}</span>
                  <span>•</span>
                  <span>Year: {profile.year}</span>
                  <span>•</span>
                  <span>College: {profile.college || "CUSB"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl text-center min-w-[100px]">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Streak</p>
                <p className="text-xl font-black text-red-500 mt-0.5">{profile.current_streak} 🔥</p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-2xl text-center min-w-[100px]">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Rating</p>
                <p className="text-xl font-black text-indigo-400 mt-0.5">{profile.cw_rating > 0 ? profile.cw_rating : "Unrated"}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Analytics Section */}
        {analytics && (
          <>
            {/* Heatmap */}
            <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-6">
              <CardHeader className="p-0 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-lg font-bold">Contribution Calendar</CardTitle>
                  <p className="text-xs text-white/50">Daily solves log over the past year</p>
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

              <div className="overflow-x-auto pb-4">
                <div className="min-w-[700px] flex flex-col gap-1">
                  {/* Months Header */}
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
                    <div className="flex flex-col justify-between h-[98px] text-[9px] text-white/40 select-none py-1.5 leading-none shrink-0 font-medium">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                    </div>

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

              {hoveredDay && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t border-white/5 mt-6 pt-4 flex flex-col sm:flex-row justify-between gap-4 text-sm"
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
                      {hoveredDay.count === 0 ? "No solving records" : `Solved ${hoveredDay.count} problem${hoveredDay.count > 1 ? "s" : ""}`}
                    </p>
                  </div>
                  
                  {hoveredDay.count > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {hoveredDay.details.map((det: any) => (
                        <div key={det.id} className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-xs text-indigo-400">{det.titleSlug}</p>
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

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Rating History */}
              <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-indigo-400" /> Rating Trajectory
                  </CardTitle>
                </CardHeader>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.ratingProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                      <YAxis domain={["auto", "auto"]} stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f0f15", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                        itemStyle={{ color: "#a5b4fc" }}
                        labelStyle={{ fontWeight: "bold" }}
                      />
                      <Line type="monotone" dataKey="rating" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#4f46e5" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Difficulty Distribution */}
              <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-6">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-400" /> Difficulty Distribution
                  </CardTitle>
                </CardHeader>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.difficultyDistribution}>
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
          </>
        )}
      </div>
    </div>
  );
}
