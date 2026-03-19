// src/app/api/search/saved/route.ts
// Поиск игроков по сохраненным данным в БД

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  try {
    // Ищем игроков по нику (case-insensitive)
    const players = await prisma.player.findMany({
      where: {
        nickname: {
          contains: query.toLowerCase(),
        },
      },
      include: {
        snapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      take: 10,
      orderBy: {
        lastUpdated: 'desc',
      },
    });

    const results = players.map((player) => ({
      nickname: player.nickname,
      displayNickname: player.displayNickname || player.nickname,
      lastUpdated: player.lastUpdated.toISOString(),
      hasHiddenStats: true, // Раз нашли в БД, значит статистика скрыта или давно не обновлялась
    }));

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("[Search Saved Players] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to search players" },
      { status: 500 }
    );
  }
}
