export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { codeWarriorsDb } from "@/lib/codeWarriorsDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const handle = searchParams.get("handle");

    if (id) {
      const profile = await codeWarriorsDb.getProfile(id);
      if (!profile) {
        return NextResponse.json({ message: "Profile not found." }, { status: 404 });
      }
      return NextResponse.json({ profile });
    }

    if (handle) {
      const profile = await codeWarriorsDb.getProfileByHandle(handle);
      if (!profile) {
        return NextResponse.json({ message: "Profile not found." }, { status: 404 });
      }
      return NextResponse.json({ profile });
    }

    // Otherwise, return all profiles (for leaderboard/admin)
    const profiles = await codeWarriorsDb.getProfiles();
    return NextResponse.json({ profiles });
  } catch (err: any) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json({ message: "User ID and updates are required." }, { status: 400 });
    }

    const currentProfile = await codeWarriorsDb.getProfile(userId);
    if (!currentProfile) {
      return NextResponse.json({ message: "Profile not found." }, { status: 404 });
    }

    // Only allow updating certain fields (no tampering with rating/streaks/admin directly)
    const allowedUpdates = {
      name: updates.name ?? currentProfile.name,
      leetcode_handle: updates.leetcode_handle ?? currentProfile.leetcode_handle,
      linkedin_profile: updates.linkedin_profile ?? currentProfile.linkedin_profile,
      avatar_url: updates.avatar_url ?? currentProfile.avatar_url,
      department: updates.department ?? currentProfile.department,
      year: updates.year ?? currentProfile.year,
      college: updates.college ?? currentProfile.college,
      section: updates.section ?? currentProfile.section,
    };

    const updatedProfile = {
      ...currentProfile,
      ...allowedUpdates
    };

    const saved = await codeWarriorsDb.saveProfile(updatedProfile);
    return NextResponse.json({ profile: saved });
  } catch (err: any) {
    console.error("Profile PUT error:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
