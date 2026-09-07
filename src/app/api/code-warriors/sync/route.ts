import { NextRequest, NextResponse } from "next/server";
import { codeWarriorsDb, type Profile, type Submission, type DailyProblem } from "@/lib/codeWarriorsDb";

// Helper to delay between API requests if needed
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: convert platform rating & stats to Warrior rank label
function getPlatformRank(rating: number, solved: number, streak: number): string {
  if (rating >= 2000 && solved >= 200 && streak >= 100) return "Legend";
  if (rating >= 1000 && solved >= 100 && streak >= 60) return "Champion";
  if (rating >= 600 && solved >= 60 && streak >= 30) return "Knight";
  if (rating >= 300 && solved >= 30 && streak >= 14) return "Elite Warrior";
  if (rating >= 150 && solved >= 15 && streak >= 7) return "Warrior";
  if (rating >= 50 && solved >= 5 && streak >= 3) return "Apprentice";
  if (rating > 0 || solved > 0) return "Novice";
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
      
      const syncProcess = async () => {
        for (const profile of profiles) {
          try {
            await syncSingleUser(profile);
            // Small delay to be respectful to LeetCode's servers
            await delay(500);
          } catch (err) {
            console.error(`Failed to sync user ${profile.leetcode_handle}:`, err);
          }
        }
      };

      // Start the sync process in the background without awaiting
      syncProcess().catch(console.error);

      return NextResponse.json({ message: `Global sync started for ${profiles.length} users in the background.` });
    }
  } catch (err: any) {
    console.error("Sync API error:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}

async function syncSingleUser(profile: Profile): Promise<Profile> {
  const handle = profile.leetcode_handle;
  if (!handle) return profile;

  // 1. Fetch user info to get true quests_solved count
  let cw_rating = profile.cw_rating;
  let cw_max_rating = profile.cw_max_rating;
  let rank = profile.rank;
  let max_rank = profile.max_rank;

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
  let quests_solved = profile.quests_solved;

  // Let's get total solved count (distinct solved problems in our records)
  const allUserSubmissions = await codeWarriorsDb.getSubmissions(profile.id);
  const allDailyProblems = await codeWarriorsDb.getDailyProblems();
  
  const potdDatesMap = new Map();
  for (const dp of allDailyProblems || []) {
    potdDatesMap.set(dp.date, dp);
  }

  let potd_solved = 0;
  let total_potd_points = 0;
  const solvedPotdDates = new Set();

  for (const sub of allUserSubmissions || []) {
    if (sub.verdict === "Accepted") {
      const subDateStr = sub.creation_time.split("T")[0];
      const matchingPotd = potdDatesMap.get(subDateStr);
      
      // If the submission matches the POTD for that date
      if (matchingPotd && matchingPotd.title_slug === sub.title_slug) {
        if (!solvedPotdDates.has(subDateStr)) {
          solvedPotdDates.add(subDateStr);
          potd_solved++;
          total_potd_points += 10;
          
          // Also retroactively mark submission as is_potd if not already
          if (!sub.is_potd) {
            sub.is_potd = true;
            await codeWarriorsDb.saveSubmissions([sub]);
          }
        }
      }
    }
  }
  // Calculate Streak Robustly
  current_streak = 0;
  max_streak = 0;
  
  const sortedSolvedDates = Array.from(solvedPotdDates).sort();
  
  let temp_streak = 0;
  let last_date: Date | null = null;
  
  for (const dateStr of sortedSolvedDates) {
    // Treat as UTC midnight to avoid timezone/daylight savings skew
    const d = new Date(`${dateStr}T00:00:00Z`);
    if (!last_date) {
      temp_streak = 1;
    } else {
      const diffTime = Math.abs(d.getTime() - last_date.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        temp_streak++;
      } else if (diffDays > 1) {
        temp_streak = 1;
      }
    }
    last_date = d;
    if (temp_streak > max_streak) max_streak = temp_streak;
  }
  
  // Calculate current streak
  if (sortedSolvedDates.length > 0) {
    const lastSolvedStr = sortedSolvedDates[sortedSolvedDates.length - 1];
    const today = new Date(`${todayStr}T00:00:00Z`);
    const lastSolved = new Date(`${lastSolvedStr}T00:00:00Z`);
    const diffTime = Math.abs(today.getTime() - lastSolved.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 || diffDays === 1) {
      // Trace backwards to find current streak
      current_streak = 1;
      let curr = new Date(`${lastSolvedStr}T00:00:00Z`);
      for (let i = sortedSolvedDates.length - 2; i >= 0; i--) {
        const prev = new Date(`${sortedSolvedDates[i]}T00:00:00Z`);
        const diff = Math.round(Math.abs(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          current_streak++;
          curr = prev;
        } else {
          break;
        }
      }
    }
  }

  // Ensure max streak is accurately reflected historically
  max_streak = Math.max(profile.max_streak || 0, max_streak, current_streak);
  quests_solved = potd_solved;
  
  // Penalty logic: Calculate missed days since user registration
  const createdDateStr = profile.created_at ? profile.created_at.split("T")[0] : todayStr;
  let missed_days = 0;
  for (const dp of allDailyProblems || []) {
    if (dp.date >= createdDateStr && dp.date < todayStr) {
      if (!solvedPotdDates.has(dp.date)) {
        missed_days++;
      }
    }
  }

  // Calculate platform rating based on POTD points and penalties
  cw_rating = Math.max(0, total_potd_points - (missed_days * 4));
  
  // Properly track all-time highest peak rating
  cw_max_rating = Math.max(cw_max_rating, cw_rating);
  
  rank = getPlatformRank(cw_rating, quests_solved, current_streak);
  max_rank = getPlatformRank(cw_max_rating, quests_solved, current_streak);

  max_streak = Math.max(current_streak, max_streak);

  const updatedProfile: Profile = {
    ...profile,
    cw_rating,
    cw_max_rating,
    rank,
    max_rank,
    current_streak,
    max_streak,
    quests_solved,
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
    } else if (badge.requirement_type === "solves" && quests_solved >= badge.requirement_value) {
      qualifies = true;
    } else if (badge.requirement_type === "rating" && cw_rating >= badge.requirement_value) {
      qualifies = true;
    }

    if (qualifies) {
      await codeWarriorsDb.unlockBadge(profile.id, badge.id);
    }
  }

  return savedProfile;
}
