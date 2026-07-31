import { NextRequest, NextResponse } from "next/server";
import { codeWarriorsDb, type DailyProblem } from "@/lib/codeWarriorsDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (date) {
      const problem = await codeWarriorsDb.getDailyProblem(date);
      return NextResponse.json({ problem });
    }

    const problems = await codeWarriorsDb.getDailyProblems();
    return NextResponse.json({ problems });
  } catch (err: any) {
    console.error("Problems GET error:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, titleSlug, questionId, name, difficulty, tags, points, expectedSolveTime } = body;

    if (!date || !titleSlug || !name || !difficulty) {
      return NextResponse.json({ message: "Required fields are missing." }, { status: 400 });
    }

    const newProblem: DailyProblem = {
      id: "potd-" + Math.random().toString(36).substr(2, 9),
      date,
      title_slug: titleSlug,
      question_id: Number(questionId) || 0,
      name,
      difficulty,
      tags: tags || [],
      points: points ? Number(points) : undefined,
      expected_solve_time: expectedSolveTime ? Number(expectedSolveTime) : undefined,
      created_at: new Date().toISOString()
    };

    const saved = await codeWarriorsDb.saveDailyProblem(newProblem);
    return NextResponse.json({ problem: saved });
  } catch (err: any) {
    console.error("Problems POST error:", err);
    return NextResponse.json({ message: err.message || "Internal server error" }, { status: 500 });
  }
}
