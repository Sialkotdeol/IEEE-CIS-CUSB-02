import { NextRequest, NextResponse } from "next/server";
import { codeWarriorsDb, type Submission } from "@/lib/codeWarriorsDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    }

    const profile = await codeWarriorsDb.getProfile(userId);
    if (!profile) {
      return NextResponse.json({ message: "Profile not found." }, { status: 404 });
    }

    const submissions = await codeWarriorsDb.getSubmissions(userId);
    const solvedSubmissions = submissions.filter(s => s.verdict === "Accepted");

    // 1. Heatmap calculation (grouped by date)
    const heatmap: Record<string, { count: number; maxDifficulty: string; level: number; details: any[] }> = {};
    
    solvedSubmissions.forEach(sub => {
      const dateStr = sub.creation_time.split("T")[0];
      if (!heatmap[dateStr]) {
        heatmap[dateStr] = { count: 0, maxDifficulty: "Easy", level: 0, details: [] };
      }
      
      heatmap[dateStr].count += 1;

      // Track max difficulty for this day
      const diffRank = { "Easy": 1, "Medium": 2, "Hard": 3 } as Record<string, number>;
      const currentMax = diffRank[heatmap[dateStr].maxDifficulty] || 0;
      const subDiff = diffRank[sub.difficulty] || 1;
      if (subDiff > currentMax) {
        heatmap[dateStr].maxDifficulty = sub.difficulty;
      }

      heatmap[dateStr].details.push({
        id: sub.lc_submission_id,
        name: sub.problem_name,
        difficulty: sub.difficulty,
        time: sub.creation_time,
        titleSlug: sub.title_slug
      });
      
      // Level 1: 1 solve (Easy)
      // Level 2: 1 solve (Medium) or 2 solves
      // Level 3: 1 solve (Hard) or 3+ solves
      let level = 1;
      const maxDiff = heatmap[dateStr].maxDifficulty;
      if (maxDiff === "Hard" || heatmap[dateStr].count >= 3) {
        level = 3;
      } else if (maxDiff === "Medium" || heatmap[dateStr].count >= 2) {
        level = 2;
      }
      heatmap[dateStr].level = level;
    });

    // 2. Rating Progression — sourced from LeetCode GraphQL
    let ratingProgress: any[] = [];
    try {
      const ratingRes = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query userContestRankingHistory($username: String!) {
              userContestRankingHistory(username: $username) {
                attended
                rating
                ranking
                contest {
                  title
                  startTime
                }
              }
            }
          `,
          variables: { username: profile.leetcode_handle }
        }),
        cache: 'no-store'
      });

      if (ratingRes.ok) {
        const ratingData = await ratingRes.json();
        const history = ratingData.data?.userContestRankingHistory || [];
        ratingProgress = history
          .filter((r: any) => r.attended)
          .map((r: any) => ({
            contestName: r.contest.title,
            rating: Math.round(r.rating),
            rank: r.ranking,
            date: new Date(r.contest.startTime * 1000).toISOString().split("T")[0]
          }));
      }
    } catch (err) {
      console.warn("Could not fetch LeetCode rating history:", err);
    }

    // 3. Difficulty Distribution (Easy / Medium / Hard)
    const difficultyCounts: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    solvedSubmissions.forEach(s => {
      const diff = s.difficulty || "Medium";
      difficultyCounts[diff] = (difficultyCounts[diff] || 0) + 1;
    });
    const difficultyDistribution = Object.entries(difficultyCounts).map(([difficulty, count]) => ({
      difficulty,
      count
    }));

    // 4. Topic/Tag analysis — derived from actual stored tags on each submission
    const tagCounts: Record<string, number> = {};
    const failedTagCounts: Record<string, number> = {};

    submissions.forEach(sub => {
      // Use real tags stored on the submission (set when syncing from LC API)
      const tags: string[] = Array.isArray((sub as any).tags) ? (sub as any).tags : [];
      tags.forEach(tag => {
        if (sub.verdict === "Accepted") {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        } else {
          failedTagCounts[tag] = (failedTagCounts[tag] || 0) + 1;
        }
      });
    });

    // Recommendations: empty — only real data, no hardcoded fallbacks
    const recommendations: any[] = [];

    // Weekly summary
    const today = new Date();
    const weeklySolves = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = solvedSubmissions.filter(s => s.creation_time.split("T")[0] === dateStr).length;
      return {
        date: dateStr,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        solved: count
      };
    }).reverse();

    // Overall Analytics
    const totalSubmissions = submissions.length;
    const acceptanceRate = totalSubmissions > 0 
      ? Math.round((solvedSubmissions.length / totalSubmissions) * 100) 
      : 100;

    const hardestSolved = solvedSubmissions.some(s => s.difficulty === "Hard") 
      ? "Hard" 
      : solvedSubmissions.some(s => s.difficulty === "Medium") 
        ? "Medium" 
        : solvedSubmissions.length > 0 ? "Easy" : "None";

      return NextResponse.json({
      heatmap,
      ratingProgress,
      difficultyDistribution,
      recommendations,
      weeklySolves,
      stats: {
        acceptanceRate,
        totalSubmissions,
        totalSolved: solvedSubmissions.length,
        hardestSolved,
        weeklyGoal: 7,
        weeklySolved: weeklySolves.reduce((sum, item) => sum + item.solved, 0)
      }
    });
  } catch (err: any) {
    console.error("Stats GET error:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
