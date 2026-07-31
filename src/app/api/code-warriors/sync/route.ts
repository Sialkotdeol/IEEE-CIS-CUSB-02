import { NextRequest, NextResponse } from "next/server";
import { codeWarriorsDb, type Profile, type Submission, type DailyProblem } from "@/lib/codeWarriorsDb";

// Helper to delay between API requests if needed
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: convert platform rating to Warrior rank label
function getPlatformRankFromRating(rating: number): string {
  if (rating >= 6000) return "Legend";
  if (rating >= 4000) return "Champion";
  if (rating >= 2000) return "Knight";
  if (rating >= 1000) return "Elite Warrior";
  if (rating >= 500) return "Warrior";
  if (rating >= 200) return "Apprentice";
  if (rating > 0) return "Novice";
  return "Unrated";
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // Sync single user
      const profile = await codeWarriorsDb.getProfile(userId);
      if (!profile) {
        return NextResponse.json({ message: "Profile not found." }, { status: 404 });
      }
      const updated = await syncSingleUser(profile);
      return NextResponse.json({ profile: updated });
    } else {
      // Sync all users (Cron trigger)
      const profiles = await codeWarriorsDb.getProfiles();
      const updatedProfiles = [];

      for (const profile of profiles) {
        try {
          const updated = await syncSingleUser(profile);
          updatedProfiles.push(updated);
          // Small delay to be respectful to LeetCode's servers
          await delay(500);
        } catch (err) {
          console.error(`Failed to sync user ${profile.leetcode_handle}:`, err);
        }
      }

      return NextResponse.json({ message: `Synced ${updatedProfiles.length} users successfully.` });
    }
  } catch (err: any) {
    console.error("Sync API error:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}

async function syncSingleUser(profile: Profile): Promise<Profile> {
  const handle = profile.leetcode_handle;
  if (!handle) return profile;

  // 1. Fetch user info to get true total_solved count
  let lc_rating = profile.lc_rating;
  let lc_max_rating = profile.lc_max_rating;
  let lc_rank = profile.lc_rank;
  let lc_max_rank = profile.lc_max_rank;

  // 2. Fetch recent accepted submissions
  let dbSubmissions: Submission[] = [];
  try {
    const statusRes = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query recentAcSubmissions($username: String!, $limit: Int!) {
            recentAcSubmissionList(username: $username, limit: $limit) {
              id
              title
              titleSlug
              timestamp
              lang
            }
          }
        `,
        variables: { username: handle, limit: 50 }
      }),
      cache: 'no-store'
    });

    if (statusRes.ok) {
      const statusData = await statusRes.json();
      const submissions = statusData.data?.recentAcSubmissionList || [];

      // We need difficulty info for each problem — fetch from a separate query
      // For efficiency, we'll batch-check the unique slugs
      const uniqueSlugs = [...new Set(submissions.map((s: any) => s.titleSlug))] as string[];
      const difficultyMap: Record<string, string> = {};

      // Fetch difficulty for each unique slug (in small batches)
      for (const slug of uniqueSlugs.slice(0, 20)) {
        try {
          const probRes = await fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
                query getQuestionDetail($titleSlug: String!) {
                  question(titleSlug: $titleSlug) {
                    difficulty
                  }
                }
              `,
              variables: { titleSlug: slug }
            })
          });
          if (probRes.ok) {
            const probData = await probRes.json();
            difficultyMap[slug] = probData.data?.question?.difficulty || "Medium";
          }
        } catch {
          difficultyMap[slug] = "Medium";
        }
      }

      dbSubmissions = submissions.map((sub: any) => ({
        id: `sub-${sub.id}`,
        user_id: profile.id,
        lc_submission_id: parseInt(sub.id),
        title_slug: sub.titleSlug,
        problem_name: sub.title,
        difficulty: difficultyMap[sub.titleSlug] || "Medium",
        creation_time: new Date(parseInt(sub.timestamp) * 1000).toISOString(),
        verdict: "Accepted",
        programming_language: sub.lang,
        is_potd: false,
        created_at: new Date().toISOString()
      }));
    }
  } catch (err) {
    console.warn(`LeetCode submissions API failed for ${handle}:`, err);
  }

  // 3. Check POTD Solved
  const todayStr = new Date().toISOString().split("T")[0];
  const potd = await codeWarriorsDb.getDailyProblem(todayStr);
  let potdSolved = false;

  if (potd && dbSubmissions.length > 0) {
    // Check if user solved POTD today
    const potdSub = dbSubmissions.find(
      sub =>
        sub.title_slug === potd.title_slug &&
        sub.verdict === "Accepted" &&
        sub.creation_time.split("T")[0] === todayStr
    );

    if (potdSub) {
      potdSolved = true;
      potdSub.is_potd = true;
    }
  }

  // Save the synchronized submissions
  if (dbSubmissions.length > 0) {
    await codeWarriorsDb.saveSubmissions(dbSubmissions);
  }

  // 4. Update Profile Streak & Stats
  let current_streak = profile.current_streak;
  let max_streak = profile.max_streak;
  let total_solved = profile.total_solved;

  // Let's get total solved count (distinct solved problems in our records)
  const allUserSubmissions = await codeWarriorsDb.getSubmissions(profile.id);
  const solvedProblemKeys = new Set(
    allUserSubmissions
      .filter(s => s.verdict === "Accepted")
      .map(s => s.title_slug)
  );
  total_solved = solvedProblemKeys.size;
  
  // Calculate platform rating
  lc_rating = total_solved * 10;
  lc_max_rating = Math.max(lc_rating, profile.lc_max_rating || 0);
  lc_rank = getPlatformRankFromRating(lc_rating);
  lc_max_rank = getPlatformRankFromRating(lc_max_rating);

  // Check POTD solve status change to update streak
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const potdYesterday = await codeWarriorsDb.getDailyProblem(yesterdayStr);

  const yesterdaySolved = potdYesterday ? allUserSubmissions.some(
    sub =>
      sub.title_slug === potdYesterday.title_slug &&
      sub.verdict === "Accepted" &&
      sub.creation_time.split("T")[0] === yesterdayStr
  ) : false;

  // Streak logic:
  if (potdSolved) {
    const lastSyncDate = profile.last_sync ? profile.last_sync.split("T")[0] : "";
    const wasAlreadyStreakUpdatedToday = lastSyncDate === todayStr && profile.current_streak > 0;

    if (!wasAlreadyStreakUpdatedToday) {
      if (profile.current_streak === 0) {
        current_streak = 1;
      } else {
        if (yesterdaySolved || current_streak === 1) {
          current_streak = profile.current_streak + 1;
        } else {
          current_streak = 1;
        }
      }
    }
  } else {
    if (!yesterdaySolved && profile.current_streak > 0) {
      current_streak = 0;
    }
  }

  max_streak = Math.max(current_streak, max_streak);

  const updatedProfile: Profile = {
    ...profile,
    lc_rating,
    lc_max_rating,
    lc_rank,
    lc_max_rank,
    current_streak,
    max_streak,
    total_solved,
    last_sync: new Date().toISOString()
  };

  const savedProfile = await codeWarriorsDb.saveProfile(updatedProfile);

  // 5. Evaluate and Unlock Badges
  const userBadges = await codeWarriorsDb.getUserBadges(profile.id);
  const unlockedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
  const allBadges = await codeWarriorsDb.getBadges();

  for (const badge of allBadges) {
    if (unlockedBadgeIds.has(badge.id)) continue;

    let qualifies = false;
    if (badge.requirement_type === "streak" && current_streak >= badge.requirement_value) {
      qualifies = true;
    } else if (badge.requirement_type === "solves" && total_solved >= badge.requirement_value) {
      qualifies = true;
    } else if (badge.requirement_type === "rating" && lc_rating >= badge.requirement_value) {
      qualifies = true;
    }

    if (qualifies) {
      await codeWarriorsDb.unlockBadge(profile.id, badge.id);
    }
  }

  return savedProfile;
}
