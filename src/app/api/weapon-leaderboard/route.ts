// src/app/api/weapon-leaderboard/route.ts
import { NextResponse } from "next/server";
import { getWeaponLeaderboard, getTopWeapons } from "@/services/weapon-leaderboard.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weapon = searchParams.get("weapon");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (weapon) {
      const leaderboard = await getWeaponLeaderboard(weapon, limit);
      return NextResponse.json(leaderboard);
    } else {
      const topWeapons = await getTopWeapons(20);
      return NextResponse.json(topWeapons);
    }
  } catch (error) {
    console.error("Ошибка weapon-leaderboard:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
