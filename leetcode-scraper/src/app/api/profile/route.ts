import { NextResponse } from "next/server";
import { fetchLeetCodeProfile } from "@/lib/leetcode";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { username } = (await req.json()) as { username?: string };

    if (!username || !username.trim()) {
      return NextResponse.json(
        { error: "Please provide a LeetCode username." },
        { status: 400 }
      );
    }

    const profile = await fetchLeetCodeProfile(username.trim());

    return NextResponse.json({ profile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

