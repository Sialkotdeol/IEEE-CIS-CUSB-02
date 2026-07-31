"use client";

import { useEffect, useState } from "react";
import { useCodeWarriorsAuth } from "@/context/CodeWarriorsAuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Flame, Trophy, Award, Shield, Crown, Lock, 
  CheckCircle, Loader2, Sparkles, Star
} from "lucide-react";
import { toast } from "sonner";

export default function AchievementsPage() {
  const { user } = useCodeWarriorsAuth();
  const [badges, setBadges] = useState<any[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Record<string, string>>({}); // badgeId -> unlockDate
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/code-warriors/achievements?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setBadges(data.badges || []);
          
          // Map unlocked badges for quick lookup
          const mapped: Record<string, string> = {};
          data.unlockedBadges.forEach((ub: any) => {
            mapped[ub.badge_id] = ub.unlocked_at;
          });
          setUnlockedIds(mapped);
        }
      } catch (err) {
        console.error("Failed to load badges:", err);
        toast.error("Failed to load achievements.");
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const getBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const size = "w-8 h-8";
    const colorClass = isUnlocked ? "text-indigo-400" : "text-white/20";
    
    switch (iconName) {
      case "Flame":
        return <Flame className={`${size} ${isUnlocked ? "text-red-500 fill-red-500/10" : "text-white/20"}`} />;
      case "Trophy":
        return <Trophy className={`${size} ${isUnlocked ? "text-yellow-500 fill-yellow-500/10" : "text-white/20"}`} />;
      case "Award":
        return <Award className={`${size} ${isUnlocked ? "text-indigo-400 fill-indigo-400/10" : "text-white/20"}`} />;
      case "Shield":
        return <Shield className={`${size} ${isUnlocked ? "text-green-400 fill-green-400/10" : "text-white/20"}`} />;
      case "Crown":
        return <Crown className={`${size} ${isUnlocked ? "text-yellow-500 fill-yellow-500/10" : "text-white/20"}`} />;
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
      current = user.lc_rating;
    }
    
    const percentage = Math.min(100, Math.round((current / badge.requirement_value) * 100));
    return { current, target: badge.requirement_value, percentage };
  };

  const totalBadges = badges.length;
  const unlockedCount = Object.keys(unlockedIds).length;
  const progressPercent = totalBadges > 0 ? Math.round((unlockedCount / totalBadges) * 100) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Overview/Progress Header */}
      <Card className="bg-white/[0.02] border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h2 className="text-3xl font-black flex items-center gap-3">
              <Award className="w-8 h-8 text-indigo-400" /> Badge Showcase
            </h2>
            <p className="text-sm text-white/50 mt-1">Unlock badges by solving daily problems, maintaining streaks, and climbing the ranking ladder.</p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <p className="text-xs text-white/50 font-bold uppercase tracking-widest leading-none mb-2">Completion</p>
            <h3 className="text-3xl font-black text-white">{unlockedCount} / {totalBadges}</h3>
            <p className="text-xs text-indigo-400 font-bold mt-1">{progressPercent}% unlocked</p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-white/5 h-2 rounded-full mt-8 overflow-hidden">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => {
          const isUnlocked = !!unlockedIds[badge.id];
          const { current, target, percentage } = getBadgeProgress(badge);
          const unlockDate = unlockedIds[badge.id];

          return (
            <Card 
              key={badge.id}
              className={`bg-white/[0.02] border-white/5 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 ${
                isUnlocked 
                  ? "border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.03)] hover:border-indigo-500/40 hover:scale-[1.02]" 
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {/* Unlock badge highlight */}
              {isUnlocked && (
                <div className="absolute top-2 right-2 text-indigo-400/30">
                  <CheckCircle className="w-5 h-5 fill-indigo-500/10" />
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Icon Box */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                  isUnlocked 
                    ? "bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                    : "bg-white/5 border-white/5"
                }`}>
                  {getBadgeIcon(badge.icon, isUnlocked)}
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-base text-white">{badge.name}</h4>
                  <p className="text-xs text-white/50 font-light mt-1 leading-normal pr-4">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Progress Track */}
              <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-white/40 font-mono">
                    {isUnlocked 
                      ? "UNLOCKED" 
                      : `${current} / ${target} ${badge.requirement_type === "solves" ? "solves" : badge.requirement_type}`}
                  </span>
                  <span className={isUnlocked ? "text-indigo-400" : "text-white/60"}>
                    {percentage}%
                  </span>
                </div>
                
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUnlocked ? "bg-indigo-500" : "bg-white/10"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {isUnlocked && unlockDate && (
                  <p className="text-[10px] text-white/30 font-mono text-right mt-1.5">
                    Earned: {new Date(unlockDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
