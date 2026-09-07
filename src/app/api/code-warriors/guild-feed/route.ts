import { NextResponse } from "next/server";
import { codeWarriorsDb } from "@/lib/codeWarriorsDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activity = await codeWarriorsDb.getRecentGuildActivity();
    return NextResponse.json({ activity });
  } catch (error: any) {
    console.error("Guild feed API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch guild feed" },
      { status: 500 }
    );
  }
}
