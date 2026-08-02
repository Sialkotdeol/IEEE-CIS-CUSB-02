"use client";

import { useEffect, useState } from "react";
import { useCodeWarriorsAuth } from "@/context/CodeWarriorsAuthContext";
import { 
  Trophy, Search, Filter, ArrowUpDown, Flame, 
  Loader2, Sparkles, Medal, Crown, Swords
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/spotlight-card";

type SortField = "streak" | "solved" | "rating";

export default function LeaderboardPage() {
  const { user } = useCodeWarriorsAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search/Filters
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("streak");
  const [deptFilter, setDeptFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch("/api/code-warriors/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profiles && data.profiles.length > 0) {
            setProfiles(data.profiles);
          } else {
            // Fallback demo profiles if DB empty/offline
            setProfiles([
              { id: "1", name: "Neal Wu", leetcode_handle: "neal_wu", department: "Computer Science", year: "3rd Year", current_streak: 28, total_solved: 94, lc_rating: 2150 },
              { id: "2", name: "Alex Rivera", leetcode_handle: "alex_rivera", department: "AI & ML", year: "3rd Year", current_streak: 21, total_solved: 76, lc_rating: 1940 },
              { id: "3", name: "Gennady K", leetcode_handle: "tourist", department: "Software Eng", year: "4th Year", current_streak: 18, total_solved: 68, lc_rating: 1880 },
              { id: "4", name: "Priya Sharma", leetcode_handle: "priya_codes", department: "Computer Science", year: "2nd Year", current_streak: 14, total_solved: 48, lc_rating: 1720 },
              { id: "5", name: "Rohan Verma", leetcode_handle: "rohan_v", department: "Information Tech", year: "3rd Year", current_streak: 12, total_solved: 39, lc_rating: 1650 },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load profiles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const processedProfiles = profiles
    .filter(p => {
      const nameMatch = p.name.toLowerCase().includes(search.toLowerCase());
      const handleMatch = p.leetcode_handle.toLowerCase().includes(search.toLowerCase());
      const matchesSearch = nameMatch || handleMatch;
      const matchesDept = deptFilter === "all" || p.department.toLowerCase() === deptFilter.toLowerCase();
      const matchesYear = yearFilter === "all" || p.year.toLowerCase() === yearFilter.toLowerCase();
      return matchesSearch && matchesDept && matchesYear;
    })
    .sort((a, b) => {
      if (sortBy === "streak") {
        if (b.current_streak !== a.current_streak) return b.current_streak - a.current_streak;
        return b.total_solved - a.total_solved;
      }
      if (sortBy === "solved") {
        if (b.total_solved !== a.total_solved) return b.total_solved - a.total_solved;
        return (b.lc_rating || 0) - (a.lc_rating || 0);
      }
      if (sortBy === "rating") {
        return (b.lc_rating || 0) - (a.lc_rating || 0);
      }
      return 0;
    });

  const uniqueDepts = Array.from(new Set(profiles.map(p => p.department))).filter(Boolean);

  const getRankBadge = (index: number) => {
    if (index === 0) return <Medal className="w-5 h-5 text-amber-500 fill-amber-500/20 mx-auto" />;
    if (index === 1) return <Medal className="w-5 h-5 text-slate-400 fill-slate-400/20 mx-auto" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700 fill-amber-700/20 mx-auto" />;
    return <span className="text-slate-400 font-mono text-xs font-bold">#{index + 1}</span>;
  };

  return (
    <div className="space-y-8 pb-16 text-slate-900">
      
      {/* Page Header */}
      <SpotlightCard glowHue={205} spotSize={300} borderSize={2} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="quest-badge mb-2 inline-block">👑 LEADERBOARD ARENA</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Hall of Fame <Sparkles size={20} className="text-yellow-500 animate-pulse" />
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-mono mt-1 font-bold">
              Real-time standings based on active streaks, skill ratings, and daily quest solve counts.
            </p>
          </div>
        </div>
      </SpotlightCard>

      {/* Podiums (Top 3 Users) */}
      {processedProfiles.length >= 3 && search === "" && deptFilter === "all" && yearFilter === "all" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4 max-w-4xl mx-auto mb-4">
          
          {/* 2nd Place */}
          <SpotlightCard glowHue={205} spotSize={220} borderSize={2} className="bg-white border border-slate-200 rounded-3xl p-6 text-center order-2 md:order-1 h-[240px] flex flex-col justify-between shadow-md">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-400 rounded-t-3xl" />
            <div>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-lg text-slate-600 mx-auto mb-3 border-2 border-slate-300">
                2
              </div>
              <h4 className="font-extrabold text-base text-slate-900 truncate">{processedProfiles[1].name}</h4>
              <p className="text-xs font-mono font-bold text-primary truncate">@{processedProfiles[1].leetcode_handle}</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-around text-xs">
              <div>
                <p className="text-slate-400 font-mono text-[10px] uppercase font-bold">Streak</p>
                <p className="text-base font-black text-orange-600 mt-0.5">{processedProfiles[1].current_streak} 🔥</p>
              </div>
              <div>
                <p className="text-slate-400 font-mono text-[10px] uppercase font-bold">Solved</p>
                <p className="text-base font-black text-primary mt-0.5">{processedProfiles[1].total_solved} ⚔️</p>
              </div>
            </div>
          </SpotlightCard>

          {/* 1st Place */}
          <SpotlightCard glowHue={205} spotSize={260} borderSize={2} className="bg-gradient-to-b from-amber-50/80 via-white to-white border-2 border-amber-300 shadow-xl rounded-3xl p-6 text-center order-1 md:order-2 h-[270px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-amber-500 rounded-t-3xl" />
            <div className="absolute top-3 right-3 text-amber-500 animate-pulse">
              <Crown className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center font-black text-xl text-amber-700 mx-auto mb-3 border-2 border-amber-400 shadow-md">
                1
              </div>
              <h4 className="font-black text-lg text-slate-900 truncate">{processedProfiles[0].name}</h4>
              <p className="text-xs font-mono font-black text-primary truncate">@{processedProfiles[0].leetcode_handle}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-amber-200/60 flex justify-around text-xs">
              <div>
                <p className="text-slate-500 font-mono text-[10px] uppercase font-bold">Streak</p>
                <p className="text-lg font-black text-orange-600 mt-0.5">{processedProfiles[0].current_streak} 🔥</p>
              </div>
              <div>
                <p className="text-slate-500 font-mono text-[10px] uppercase font-bold">Solved</p>
                <p className="text-lg font-black text-primary mt-0.5">{processedProfiles[0].total_solved} ⚔️</p>
              </div>
            </div>
          </SpotlightCard>

          {/* 3rd Place */}
          <SpotlightCard glowHue={205} spotSize={220} borderSize={2} className="bg-white border border-slate-200 rounded-3xl p-6 text-center order-3 h-[220px] flex flex-col justify-between shadow-md">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-700/60 rounded-t-3xl" />
            <div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center font-black text-sm text-amber-800 mx-auto mb-3 border-2 border-amber-600/30">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900 truncate">{processedProfiles[2].name}</h4>
              <p className="text-xs font-mono font-bold text-primary truncate">@{processedProfiles[2].leetcode_handle}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-around text-xs">
              <div>
                <p className="text-slate-400 font-mono text-[10px] uppercase font-bold">Streak</p>
                <p className="text-sm font-black text-orange-600 mt-0.5">{processedProfiles[2].current_streak} 🔥</p>
              </div>
              <div>
                <p className="text-slate-400 font-mono text-[10px] uppercase font-bold">Solved</p>
                <p className="text-sm font-black text-primary mt-0.5">{processedProfiles[2].total_solved} ⚔️</p>
              </div>
            </div>
          </SpotlightCard>

        </div>
      )}

      {/* Leaderboard Table Controls */}
      <SpotlightCard glowHue={205} spotSize={300} borderSize={2} className="bg-white border border-slate-200 rounded-3xl overflow-hidden p-6 shadow-md">
        
        {/* Controls Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search handle or name..."
              className="pl-10 bg-slate-50 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <ArrowUpDown className="w-4 h-4 text-primary shrink-0" />
            <span className="text-slate-400 font-mono uppercase font-bold">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortField)}
              className="bg-transparent border-none text-slate-900 focus:outline-none font-bold cursor-pointer w-full"
            >
              <option value="streak">Streak 🔥</option>
              <option value="solved">Solved Quests ⚔️</option>
              <option value="rating">Rating 👑</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Filter className="w-4 h-4 text-primary shrink-0" />
            <span className="text-slate-400 font-mono uppercase font-bold">Dept:</span>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="bg-transparent border-none text-slate-900 focus:outline-none font-bold cursor-pointer w-full"
            >
              <option value="all">All Depts</option>
              {uniqueDepts.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Filter className="w-4 h-4 text-primary shrink-0" />
            <span className="text-slate-400 font-mono uppercase font-bold">Year:</span>
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="bg-transparent border-none text-slate-900 focus:outline-none font-bold cursor-pointer w-full"
            >
              <option value="all">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Postgrad">Postgrad</option>
            </select>
          </div>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow>
                <TableHead className="w-16 text-center font-bold text-slate-700">Rank</TableHead>
                <TableHead className="font-bold text-slate-700">Participant</TableHead>
                <TableHead className="font-bold text-slate-700">Department</TableHead>
                <TableHead className="font-bold text-slate-700">Year</TableHead>
                <TableHead className="text-center font-bold text-slate-700">Streak</TableHead>
                <TableHead className="text-center font-bold text-slate-700">Solved</TableHead>
                <TableHead className="text-right font-bold text-slate-700 pr-6">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedProfiles.length > 0 ? (
                processedProfiles.map((p, index) => {
                  const isCurrentUser = user && p.id === user.id;
                  return (
                    <TableRow 
                      key={p.id}
                      className={`border-b border-slate-100 transition-colors ${
                        isCurrentUser 
                          ? "bg-primary/8 font-semibold" 
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <TableCell className="font-medium text-center">
                        {getRankBadge(index)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-cyan-500 flex items-center justify-center font-black text-xs text-white shadow-sm">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-sm text-slate-900 leading-tight">{p.name}</p>
                            <Link 
                              href={`https://leetcode.com/u/${p.leetcode_handle}/`}
                              target="_blank"
                              className="text-xs font-mono font-bold text-primary hover:underline mt-0.5 inline-block"
                            >
                              @{p.leetcode_handle}
                            </Link>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-600">{p.department}</TableCell>
                      <TableCell className="text-xs font-medium text-slate-500 font-mono">{p.year}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 font-black text-orange-600 text-sm">
                          <Flame className="w-4 h-4 fill-orange-500 text-orange-500 pixel-flame" />
                          {p.current_streak}d
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-black font-mono text-sm text-primary">
                        {p.total_solved} ⚔️
                      </TableCell>
                      <TableCell className="text-right font-black text-sm pr-6">
                        <span className="font-mono">{p.lc_rating > 0 ? p.lc_rating : "1500"}</span>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-mono text-sm">
                    No participants matched filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

      </SpotlightCard>
    </div>
  );
}
