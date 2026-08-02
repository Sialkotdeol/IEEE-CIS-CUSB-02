import { NextRequest, NextResponse } from "next/server";
import { codeWarriorsDb, type Announcement } from "@/lib/codeWarriorsDb";

export async function GET(req: NextRequest) {
  try {
    const announcements = await codeWarriorsDb.getAnnouncements();
    return NextResponse.json({ announcements });
  } catch (err: any) {
    console.error("Announcements GET error:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, createdBy } = body;

    if (!title || !content) {
      return NextResponse.json({ message: "Title and content are required." }, { status: 400 });
    }

    const newAnnouncement: Announcement = {
      id: "ann-" + Math.random().toString(36).substr(2, 9),
      title,
      content,
      created_by: createdBy || "admin",
      created_at: new Date().toISOString()
    };

    const saved = await codeWarriorsDb.saveAnnouncement(newAnnouncement);
    return NextResponse.json({ announcement: saved });
  } catch (err: any) {
    console.error("Announcements POST error:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
