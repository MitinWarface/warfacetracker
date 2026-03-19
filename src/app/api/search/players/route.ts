// src/app/api/search/players/route.ts
// Поиск игроков по БД

import { NextRequest, NextResponse } from "next/server";
import { searchPlayersInDB } from "@/services/player-sync.service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    const players = await searchPlayersInDB(query);
    return NextResponse.json(players);
  } catch (error: any) {
    console.error("[Search Players API] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to search players" },
      { status: 500 }
    );
  }
}
