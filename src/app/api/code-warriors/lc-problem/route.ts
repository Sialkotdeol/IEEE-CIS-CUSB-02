import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const titleSlug = searchParams.get("titleSlug");

    if (!titleSlug) {
      return NextResponse.json({ message: "Missing titleSlug parameter" }, { status: 400 });
    }

    // Fetch problem details from LeetCode GraphQL
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query getQuestionDetail($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              questionId
              title
              titleSlug
              difficulty
              topicTags {
                name
                slug
              }
            }
          }
        `,
        variables: { titleSlug }
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ message: "LeetCode API request failed", details: errText }, { status: res.status });
    }

    const data = await res.json();
    const question = data.data?.question;

    if (!question) {
      return NextResponse.json({ message: "Problem not found on LeetCode" }, { status: 404 });
    }

    return NextResponse.json({
      status: "OK",
      result: {
        questionId: parseInt(question.questionId),
        title: question.title,
        titleSlug: question.titleSlug,
        difficulty: question.difficulty,
        tags: question.topicTags.map((t: any) => t.name)
      }
    });
  } catch (err: any) {
    console.error("LC Problem Proxy Error:", err);
    return NextResponse.json({ message: err.message || "Internal Server Error" }, { status: 500 });
  }
}
