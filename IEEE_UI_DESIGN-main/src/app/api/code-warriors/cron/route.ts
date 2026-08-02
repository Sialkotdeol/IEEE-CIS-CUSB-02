import { NextRequest, NextResponse } from "next/server";
import { codeWarriorsDb, type Profile } from "@/lib/codeWarriorsDb";

// This route is called by Vercel Cron every day at 00:00 IST (18:30 UTC)
// It syncs ALL registered Code Warriors participants automatically
// No user needs to be logged in for this to work

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron (not a random visitor)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Also allow calls from localhost for testing
    const host = req.headers.get("host") || "";
    if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  console.log(`[CRON] Starting nightly sync at ${new Date().toISOString()}`);

  try {
    const profiles = await codeWarriorsDb.getProfiles();
    console.log(`[CRON] Syncing ${profiles.length} users...`);

    const results = { success: 0, failed: 0 };

    for (const profile of profiles as Profile[]) {
      try {
        // Call the sync API for each user
        const syncUrl = new URL("/api/code-warriors/sync", req.url);
        syncUrl.searchParams.set("userId", profile.id);

        await fetch(syncUrl.toString(), { method: "POST" });

        results.success++;
        console.log(`[CRON] ✓ Synced: ${profile.leetcode_handle}`);

        // Small delay to be respectful to LeetCode servers
        await delay(1000);
      } catch (err) {
        results.failed++;
        console.error(`[CRON] ✗ Failed: ${profile.leetcode_handle}`, err);
      }
    }

    const message = `Nightly sync complete. ✓ ${results.success} synced, ✗ ${results.failed} failed.`;
    console.log(`[CRON] ${message}`);

    return NextResponse.json({ message, ...results });
  } catch (err: any) {
    console.error("[CRON] Fatal error:", err);
    return NextResponse.json({ message: err.message || "Cron failed" }, { status: 500 });
  }
}
