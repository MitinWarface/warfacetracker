// src/app/api/recent-profiles/route.ts
import { NextResponse } from "next/server";
import { getRecentProfiles, trackProfileView } from "@/services/recent-profiles.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const profiles = await getRecentProfiles(limit);
    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Ошибка recent-profiles:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nickname, displayNickname, rankId } = body;

    if (!nickname || !rankId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await trackProfileView(nickname, displayNickname, rankId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка track view:", error);
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
