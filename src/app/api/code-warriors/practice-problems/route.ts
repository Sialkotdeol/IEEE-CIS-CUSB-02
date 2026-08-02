export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { codeWarriorsDb } from "@/lib/codeWarriorsDb";

export async function GET() {
  try {
    const problems = await codeWarriorsDb.getPracticeProblems();
    return NextResponse.json({ problems });
  } catch (error: any) {
    console.error("Error fetching practice problems:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { problem } = body;

    if (!problem || !problem.title_slug) {
      return NextResponse.json({ message: "Invalid problem data" }, { status: 400 });
    }

    const saved = await codeWarriorsDb.savePracticeProblem(problem);
    return NextResponse.json({ message: "Practice problem saved successfully", problem: saved });
  } catch (error: any) {
    console.error("Error saving practice problem:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing problem ID" }, { status: 400 });
    }

    await codeWarriorsDb.deletePracticeProblem(id);
    return NextResponse.json({ message: "Practice problem removed successfully" });
  } catch (error: any) {
    console.error("Error deleting practice problem:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
