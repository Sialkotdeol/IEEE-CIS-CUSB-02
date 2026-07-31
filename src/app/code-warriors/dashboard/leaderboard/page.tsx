"use client";

import { useEffect, useState } from "react";
import { useCodeWarriorsAuth } from "@/context/CodeWarriorsAuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Trophy, Search, Filter, ArrowUpDown, Flame, 
  Code, Loader2, Sparkles, Medal
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Link from "next/link";

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
          setProfiles(data.profiles || []);
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Filter and sort profiles
  const processedProfiles = profiles
    .filter(p => {
      // Search term match
      const nameMatch = p.name.toLowerCase().includes(search.toLowerCase());
      const handleMatch = p.leetcode_handle.toLowerCase().includes(search.toLowerCase());
      const matchesSearch = nameMatch || handleMatch;

      // Department filter
      const matchesDept = deptFilter === "all" || p.department.toLowerCase() === deptFilter.toLowerCase();

      // Year filter
      const matchesYear = yearFilter === "all" || p.year.toLowerCase() === yearFilter.toLowerCase();

      return matchesSearch && matchesDept && matchesYear;
    })
    .sort((a, b) => {
      // Sort logic
      if (sortBy === "streak") {
        if (b.current_streak !== a.current_streak) {
          return b.current_streak - a.current_streak;
        }
        return b.total_solved - a.total_solved; // Tie breaker: solved problems
      }
      if (sortBy === "solved") {
        if (b.total_solved !== a.total_solved) {
          return b.total_solved - a.total_solved;
        }
        return b.lc_rating - a.lc_rating; // Tie breaker: rating
      }
      if (sortBy === "rating") {
        return b.lc_rating - a.lc_rating;
      }
      return 0;
    });

  // Extract unique departments for filtering
  const uniqueDepts = Array.from(new Set(profiles.map(p => p.department))).filter(Boolean);

  const getRankBadge = (index: number) => {
    if (index === 0) return <Medal className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />;
    if (index === 1) return <Medal className="w-5 h-5 text-zinc-300 fill-zinc-300/20" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600 fill-amber-600/20" />;
    return <span className="text-white/40 font-mono text-sm">{index + 1}</span>;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3">
            <Trophy className="w-8 h-8 text-indigo-400" /> Leaderboard Arena
          </h2>
          <p className="text-sm text-white/50 mt-1">Real-time standings based on active streaks, rating, and solving counts</p>
        </div>
      </div>

      {/* Podiums (Top 3 Users) */}
      {processedProfiles.length >= 3 && search === "" && deptFilter === "all" && yearFilter === "all" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 max-w-4xl mx-auto mb-4">
          
          {/* 2nd Place */}
          <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 text-center order-2 md:order-1 h-[240px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-zinc-400/50" />
            <div>
              <div className="w-12 h-12 rounded-full bg-zinc-400/20 flex items-center justify-center font-bold text-lg text-zinc-300 mx-auto mb-3 border border-zinc-400/30">
                2
              </div>
              <h4 className="font-bold text-base truncate">{processedProfiles[1].name}</h4>
              <p className="text-xs font-mono text-indigo-400 truncate">@{processedProfiles[1].leetcode_handle}</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-around text-xs">
              <div>
                <p className="text-white/40 font-semibold">Streak</p>
                <p className="text-base font-bold text-red-400 mt-0.5">{processedProfiles[1].current_streak} 🔥</p>
              </div>
              <div>
                <p className="text-white/40 font-semibold">Solved</p>
                <p className="text-base font-bold text-indigo-400 mt-0.5">{processedProfiles[1].total_solved} ⚔️</p>
              </div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="bg-white/[0.02] border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.05)] rounded-3xl p-6 text-center order-1 md:order-2 h-[270px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-yellow-500" />
            <div className="absolute top-2 right-2 text-yellow-500 animate-pulse">
              <Sparkles className="w-5 h-5 fill-yellow-500/20" />
            </div>
            <div>
              <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center font-bold text-xl text-yellow-500 mx-auto mb-3 border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                1
              </div>
              <h4 className="font-bold text-lg truncate">{processedProfiles[0].name}</h4>
              <p className="text-sm font-mono text-indigo-400 truncate">@{processedProfiles[0].leetcode_handle}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-around text-xs">
              <div>
                <p className="text-white/40 font-semibold">Streak</p>
                <p className="text-lg font-black text-red-500 mt-0.5">{processedProfiles[0].current_streak} 🔥</p>
              </div>
              <div>
                <p className="text-white/40 font-semibold">Solved</p>
                <p className="text-lg font-black text-indigo-400 mt-0.5">{processedProfiles[0].total_solved} ⚔️</p>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 text-center order-3 h-[210px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-amber-600/50" />
            <div>
              <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center font-bold text-sm text-amber-500 mx-auto mb-3 border border-amber-600/30">
                3
              </div>
              <h4 className="font-bold text-sm truncate">{processedProfiles[2].name}</h4>
              <p className="text-xs font-mono text-indigo-400 truncate">@{processedProfiles[2].leetcode_handle}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-around text-xs">
              <div>
                <p className="text-white/40 font-semibold">Streak</p>
                <p className="text-sm font-bold text-red-400 mt-0.5">{processedProfiles[2].current_streak} 🔥</p>
              </div>
              <div>
                <p className="text-white/40 font-semibold">Solved</p>
                <p className="text-sm font-bold text-indigo-400 mt-0.5">{processedProfiles[2].total_solved} ⚔️</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Leaderboard Table Controls */}
      <Card className="bg-white/[0.02] border-white/5 rounded-3xl overflow-hidden p-6">
        
        {/* Controls Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
            <Input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search handle or name..."
              className="pl-10 bg-white/5 border-white/10 rounded-xl text-white placeholder-white/30 focus:border-indigo-500 focus:bg-white/10"
            />
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
            <ArrowUpDown className="w-4 h-4 text-indigo-400" />
            <span className="text-white/50">Sort By:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortField)}
              className="bg-transparent border-none text-white focus:outline-none font-bold"
            >
              <option className="bg-[#0f0f15]" value="streak">Streak 🔥</option>
              <option className="bg-[#0f0f15]" value="solved">Solved POTD ⚔️</option>
              <option className="bg-[#0f0f15]" value="rating">Rating 👑</option>
            </select>
          </div>

          {/* Department filter */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span className="text-white/50">Department:</span>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none font-bold"
            >
              <option className="bg-[#0f0f15]" value="all">All</option>
              {uniqueDepts.map(dept => (
                <option key={dept} className="bg-[#0f0f15]" value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Year filter */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span className="text-white/50">Year:</span>
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none font-bold"
            >
              <option className="bg-[#0f0f15]" value="all">All</option>
              <option className="bg-[#0f0f15]" value="1st Year">1st Year</option>
              <option className="bg-[#0f0f15]" value="2nd Year">2nd Year</option>
              <option className="bg-[#0f0f15]" value="3rd Year">3rd Year</option>
              <option className="bg-[#0f0f15]" value="4th Year">4th Year</option>
              <option className="bg-[#0f0f15]" value="Postgrad">Postgraduate</option>
            </select>
          </div>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-white/5">
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-center">Streak</TableHead>
                <TableHead className="text-center">Solved</TableHead>
                <TableHead className="text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedProfiles.length > 0 ? (
                processedProfiles.map((p, index) => {
                  const isCurrentUser = user && p.id === user.id;
                  return (
                    <TableRow 
                      key={p.id}
                      className={`border-b border-white/5 transition-colors ${
                        isCurrentUser 
                          ? "bg-indigo-600/10 hover:bg-indigo-600/15" 
                          : "hover:bg-white/[0.01]"
                      }`}
                    >
                      <TableCell className="font-medium text-center">
                        {getRankBadge(index)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm leading-tight">{p.name}</p>
                            <Link 
                              href={`/code-warriors/profile/${p.leetcode_handle}`}
                              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 hover:underline mt-0.5 inline-block"
                            >
                              @{p.leetcode_handle}
                            </Link>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-light text-white/80">{p.department}</TableCell>
                      <TableCell className="text-sm font-light text-white/60">{p.year}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-red-400 text-sm">
                          <Flame className="w-4 h-4 fill-current shrink-0" />
                          {p.current_streak}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-bold font-mono text-sm text-indigo-400">
                        {p.total_solved}
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm">
                        <span className="font-mono">{p.lc_rating > 0 ? p.lc_rating : "Unrated"}</span>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-white/40">
                    No participants matched filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

      </Card>
    </div>
  );
}
