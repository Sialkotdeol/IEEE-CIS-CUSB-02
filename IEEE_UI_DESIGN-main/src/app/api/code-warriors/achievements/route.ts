import { NextRequest, NextResponse } from "next/server";
import { codeWarriorsDb } from "@/lib/codeWarriorsDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    }

    const badges = await codeWarriorsDb.getBadges();
    const userBadges = await codeWarriorsDb.getUserBadges(userId);

    return NextResponse.json({
      badges,
      unlockedBadges: userBadges
    });
  } catch (err: any) {
    console.error("Achievements GET error:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
