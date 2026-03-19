// src/services/streak-tracker.service.ts
"use server";

import type { SeasonStat } from "@/types/warface";

export interface StreakData {
  currentStreak: number;
  bestWinStreak: number;
  worstLossStreak: number;
  last10Games: ("W" | "L")[];
}

export async function trackStreaks(seasons: SeasonStat[]): Promise<StreakData> {
  if (seasons.length === 0) {
    return {
      currentStreak: 0,
      bestWinStreak: 0,
      worstLossStreak: 0,
      last10Games: [],
    };
  }

  // Собираем все игры из сезонов
  const allGames: ("W" | "L")[] = [];
  
  for (const season of seasons) {
    const wins = Array(season.wins).fill("W" as const);
    const losses = Array(season.losses).fill("L" as const);
    allGames.push(...wins, ...losses);
  }

  // Сортируем по времени (новые первые)
  allGames.reverse();

  // Текущая серия
  let currentStreak = 0;
  if (allGames.length > 0) {
    const firstGame = allGames[0];
    for (const game of allGames) {
      if (game === firstGame) {
        currentStreak++;
      } else {
        break;
      }
    }
    currentStreak = firstGame === "W" ? currentStreak : -currentStreak;
  }

  // Лучшая серия побед
  let bestWinStreak = 0;
  let currentWinStreak = 0;
  for (const game of allGames) {
    if (game === "W") {
      currentWinStreak++;
      bestWinStreak = Math.max(bestWinStreak, currentWinStreak);
    } else {
      currentWinStreak = 0;
    }
  }

  // Худшая серия поражений
  let worstLossStreak = 0;
  let currentLossStreak = 0;
  for (const game of allGames) {
    if (game === "L") {
      currentLossStreak++;
      worstLossStreak = Math.max(worstLossStreak, currentLossStreak);
    } else {
      currentLossStreak = 0;
    }
  }

  // Последние 10 игр
  const last10Games = allGames.slice(0, 10);

  return {
    currentStreak,
    bestWinStreak,
    worstLossStreak,
    last10Games,
  };
}
