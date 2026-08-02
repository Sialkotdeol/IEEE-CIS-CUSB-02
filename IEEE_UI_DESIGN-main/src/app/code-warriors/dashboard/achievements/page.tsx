"use client";

import { useEffect, useState } from "react";
import { useCodeWarriorsAuth } from "@/context/CodeWarriorsAuthContext";
import { 
  Flame, Trophy, Award, Shield, Crown, CheckCircle, 
  Loader2, Star, Sparkles 
} from "lucide-react";
import { toast } from "sonner";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function AchievementsPage() {
  const { user } = useCodeWarriorsAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/code-warriors/achievements?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setBadges(data.badges || []);
          
          const mapped: Record<string, string> = {};
          data.unlockedBadges.forEach((ub: any) => {
            mapped[ub.badge_id] = ub.unlocked_at;
          });
          setUnlockedIds(mapped);
        } else {
          // Fallback mock badges if Supabase backend offline
          const mockBadges = [
            { id: "b1", name: "Streak Starter", description: "Maintain a 3-day daily POTD streak", icon: "Flame", requirement_type: "streak", requirement_value: 3 },
            { id: "b2", name: "Problem Solver", description: "Solve 10 daily POTD quests", icon: "Trophy", requirement_type: "solves", requirement_value: 10 },
            { id: "b3", name: "Knight Defender", description: "Reach a LeetCode rating of 1600+", icon: "Shield", requirement_type: "rating", requirement_value: 1600 },
            { id: "b4", name: "Streak Legend", description: "Maintain a 14-day daily POTD streak", icon: "Flame", requirement_type: "streak", requirement_value: 14 },
            { id: "b5", name: "DSA Master", description: "Solve 50 daily POTD quests", icon: "Award", requirement_type: "solves", requirement_value: 50 },
            { id: "b6", name: "Grandmaster", description: "Reach a LeetCode rating of 1900+", icon: "Crown", requirement_type: "rating", requirement_value: 1900 },
          ];
          setBadges(mockBadges);
          setUnlockedIds({ b1: new Date().toISOString(), b2: new Date().toISOString(), b3: new Date().toISOString(), b4: new Date().toISOString() });
        }
      } catch (err) {
        console.error("Failed to load badges:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const size = "w-7 h-7";
    const colorClass = isUnlocked ? "text-primary" : "text-slate-300";
    
    switch (iconName) {
      case "Flame":
        return <Flame className={`${size} ${isUnlocked ? "text-orange-500 fill-orange-500 pixel-flame" : "text-slate-300"}`} />;
      case "Trophy":
        return <Trophy className={`${size} ${isUnlocked ? "text-amber-500" : "text-slate-300"}`} />;
      case "Award":
        return <Award className={`${size} ${isUnlocked ? "text-primary" : "text-slate-300"}`} />;
      case "Shield":
        return <Shield className={`${size} ${isUnlocked ? "text-emerald-600" : "text-slate-300"}`} />;
      case "Crown":
        return <Crown className={`${size} ${isUnlocked ? "text-yellow-500" : "text-slate-300"}`} />;
      default:
        return <Star className={`${size} ${colorClass}`} />;
    }
  };

  const getBadgeProgress = (badge: any): { current: number; target: number; percentage: number } => {
    if (!user) return { current: 0, target: badge.requirement_value, percentage: 0 };
    
    let current = 0;
    if (badge.requirement_type === "streak") {
      current = user.current_streak;
    } else if (badge.requirement_type === "solves") {
      current = user.total_solved;
    } else if (badge.requirement_type === "rating") {
      current = user.lc_rating || 1500;
    }
    
    const percentage = Math.min(100, Math.round((current / badge.requirement_value) * 100));
    return { current, target: badge.requirement_value, percentage };
  };

  const totalBadges = badges.length;
  const unlockedCount = Object.keys(unlockedIds).length;
  const progressPercent = totalBadges > 0 ? Math.round((unlockedCount / totalBadges) * 100) : 0;

  return (
    <div className="space-y-8 pb-16 text-slate-900">
      
      {/* Header Showcase */}
      <SpotlightCard glowHue={205} spotSize={300} borderSize={2} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <span className="quest-badge mb-2 inline-block">🏆 WARRIOR TROPHY ROOM</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Badge Showcase <Sparkles size={20} className="text-yellow-500 animate-pulse" />
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-mono mt-1 font-bold">
              Unlock relics and badges by completing daily quests, extending your streak, and leveling up!
            </p>
          </div>

          <div className="text-left md:text-right shrink-0 bg-slate-50 border border-slate-200 px-5 py-3 rounded-2xl shadow-inner">
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest leading-none mb-1">Completion</p>
            <h3 className="text-2xl font-black text-slate-900">{unlockedCount} / {totalBadges}</h3>
            <p className="text-xs text-primary font-mono font-black mt-0.5">{progressPercent}% Unlocked</p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full mt-6 overflow-hidden border border-slate-200">
          <div 
            className="xp-bar-fill h-full rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </SpotlightCard>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => {
          const isUnlocked = !!unlockedIds[badge.id];
          const { current, target, percentage } = getBadgeProgress(badge);
          const unlockDate = unlockedIds[badge.id];

          return (
            <SpotlightCard 
              key={badge.id}
              glowHue={isUnlocked ? 205 : 0}
              spotSize={240}
              borderSize={2}
              className={`rounded-3xl p-6 relative overflow-hidden transition-all duration-300 bg-white border ${
                isUnlocked 
                  ? "border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1" 
                  : "border-slate-200/60 opacity-65 bg-slate-50/50"
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-4 right-4 text-emerald-600">
                  <CheckCircle className="w-5 h-5 fill-emerald-100" />
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                  isUnlocked 
                    ? "bg-primary/8 border-primary/20 shadow-sm" 
                    : "bg-slate-100 border-slate-200"
                }`}>
                  {getBadgeIcon(badge.icon, isUnlocked)}
                </div>

                <div className="min-w-0 pr-4">
                  <h4 className="font-extrabold text-base text-slate-900">{badge.name}</h4>
                  <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Progress Track */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono font-bold">
                  <span className="text-slate-400">
                    {isUnlocked 
                      ? "RELIC UNLOCKED ✓" 
                      : `${current} / ${target} ${badge.requirement_type}`}
                  </span>
                  <span className={isUnlocked ? "text-primary" : "text-slate-400"}>
                    {percentage}%
                  </span>
                </div>
                
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUnlocked ? "bg-primary" : "bg-slate-300"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {isUnlocked && unlockDate && (
                  <p className="text-[10px] text-slate-400 font-mono text-right mt-1 font-semibold">
                    Unlocked: {new Date(unlockDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
}
