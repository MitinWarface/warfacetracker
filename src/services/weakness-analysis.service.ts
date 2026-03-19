// src/services/weakness-analysis.service.ts
"use server";

import type { NormalizedPlayerStats } from "@/types/warface";

export interface WeaknessAnalysis {
  category: string;
  current: number | string;
  recommendation: string;
  impact: "high" | "medium" | "low";
}

export function analyzeWeaknesses(player: NormalizedPlayerStats): WeaknessAnalysis[] {
  const weaknesses: WeaknessAnalysis[] = [];

  // Accuracy analysis
  if (player.globalAccuracy < 20) {
    weaknesses.push({
      category: "Меткость",
      current: `${player.globalAccuracy.toFixed(1)}%`,
      recommendation: "Тренируйтесь на картах с ботами, цельтесь в голову",
      impact: "high",
    });
  } else if (player.globalAccuracy < 35) {
    weaknesses.push({
      category: "Меткость",
      current: `${player.globalAccuracy.toFixed(1)}%`,
      recommendation: "Стреляйте очередями по 2-3 выстрела",
      impact: "medium",
    });
  }

  // K/D analysis
  if (player.kdRatio < 0.8) {
    weaknesses.push({
      category: "K/D Ratio",
      current: player.kdRatio.toFixed(2),
      recommendation: "Играйте от укрытий, не бегите в открытую",
      impact: "high",
    });
  } else if (player.kdRatio < 1.2) {
    weaknesses.push({
      category: "K/D Ratio",
      current: player.kdRatio.toFixed(2),
      recommendation: "Улучшайте позиционирование и карту",
      impact: "medium",
    });
  }

  // Win rate analysis
  const winRate = player.pvpTotal > 0 ? (player.pvpWins / player.pvpTotal) * 100 : 0;
  if (winRate < 40) {
    weaknesses.push({
      category: "Победы",
      current: `${winRate.toFixed(1)}%`,
      recommendation: "Играйте с командой, используйте голосовой чат",
      impact: "high",
    });
  } else if (winRate < 50) {
    weaknesses.push({
      category: "Победы",
      current: `${winRate.toFixed(1)}%`,
      recommendation: "Следите за мини-картой и тактикой",
      impact: "medium",
    });
  }

  // Headshot rate
  if (player.globalHsRate < 15) {
    weaknesses.push({
      category: "Хедшоты",
      current: `${player.globalHsRate.toFixed(1)}%`,
      recommendation: "Цельтесь в голову, используйте оружие с высоким уроном",
      impact: "medium",
    });
  }

  // Playtime analysis
  if (player.playtimeH < 10) {
    weaknesses.push({
      category: "Опыт",
      current: `${player.playtimeH}ч`,
      recommendation: "Продолжайте играть, практика — ключ к успеху",
      impact: "low",
    });
  }

  // Support stats for medic/engineer
  if (player.supportStats.healDone < 1000 && player.favPvP === "Medic") {
    weaknesses.push({
      category: "Поддержка",
      current: `${player.supportStats.healDone} ОЗ`,
      recommendation: "Лечите команду чаще, используйте диспенсер",
      impact: "medium",
    });
  }

  if (player.supportStats.repairDone < 1000 && player.favPvP === "Engineer") {
    weaknesses.push({
      category: "Поддержка",
      current: `${player.supportStats.repairDone} ОБ`,
      recommendation: "Чините броню союзникам и технику",
      impact: "medium",
    });
  }

  return weaknesses.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });
}
