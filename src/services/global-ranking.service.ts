// src/services/global-ranking.service.ts
"use server";

import { prisma } from "@/lib/prisma";
import type { NormalizedPlayerStats } from "@/types/warface";

export interface GlobalRanking {
  kdRatio: { percentile: number; rank: number };
  accuracy: { percentile: number; rank: number };
  winRate: { percentile: number; rank: number };
  playtime: { percentile: number; rank: number };
  overall: { percentile: number; rank: number };
}

async function getGlobalStats() {
  try {
    // Получаем реальные статистики из БД
    const snapshots = await prisma.statSnapshot.findMany({
      select: {
        kdRatio: true,
        accuracy: true,
        playtime: true,
        wins: true,
        losses: true,
      },
    });

    if (snapshots.length === 0) {
      // Fallback значения если БД пуста
      return {
        kdRatio: { mean: 1.2, stdDev: 0.8 },
        accuracy: { mean: 25, stdDev: 10 },
        winRate: { mean: 48, stdDev: 15 },
        playtime: { mean: 200, stdDev: 300 },
      };
    }

    const n = snapshots.length;

    // K/D
    const kdValues = snapshots.map(s => s.kdRatio).filter(v => v > 0);
    const kdMean = kdValues.reduce((a, b) => a + b, 0) / kdValues.length;
    const kdVariance = kdValues.reduce((sum, v) => sum + Math.pow(v - kdMean, 2), 0) / kdValues.length;
    const kdStdDev = Math.sqrt(kdVariance) || 0.8;

    // Accuracy
    const accValues = snapshots.map(s => s.accuracy).filter(v => v > 0);
    const accMean = accValues.length > 0 ? accValues.reduce((a, b) => a + b, 0) / accValues.length : 25;
    const accVariance = accValues.length > 0 ? accValues.reduce((sum, v) => sum + Math.pow(v - accMean, 2), 0) / accValues.length : 100;
    const accStdDev = Math.sqrt(accVariance) || 10;

    // Win rate
    const wrValues = snapshots
      .filter(s => s.wins + s.losses > 0)
      .map(s => (s.wins / (s.wins + s.losses)) * 100);
    const wrMean = wrValues.length > 0 ? wrValues.reduce((a, b) => a + b, 0) / wrValues.length : 48;
    const wrVariance = wrValues.length > 0 ? wrValues.reduce((sum, v) => sum + Math.pow(v - wrMean, 2), 0) / wrValues.length : 225;
    const wrStdDev = Math.sqrt(wrVariance) || 15;

    // Playtime (hours)
    const ptValues = snapshots.map(s => Math.floor(s.playtime / 60));
    const ptMean = ptValues.reduce((a, b) => a + b, 0) / n;
    const ptVariance = ptValues.reduce((sum, v) => sum + Math.pow(v - ptMean, 2), 0) / n;
    const ptStdDev = Math.sqrt(ptVariance) || 300;

    return {
      kdRatio: { mean: kdMean, stdDev: kdStdDev },
      accuracy: { mean: accMean, stdDev: accStdDev },
      winRate: { mean: wrMean, stdDev: wrStdDev },
      playtime: { mean: ptMean, stdDev: ptStdDev },
    };
  } catch {
    // Fallback при ошибке
    return {
      kdRatio: { mean: 1.2, stdDev: 0.8 },
      accuracy: { mean: 25, stdDev: 10 },
      winRate: { mean: 48, stdDev: 15 },
      playtime: { mean: 200, stdDev: 300 },
    };
  }
}

function calculatePercentile(value: number, mean: number, stdDev: number): number {
  // Упрощённое вычисление перцентиля через Z-score
  const zScore = (value - mean) / stdDev;
  // Приблизительная функция распределения (approximation of erf)
  const t = 1 / (1 + 0.2316419 * Math.abs(zScore / Math.sqrt(2)));
  const d = 0.3989423 * Math.exp(-zScore * zScore / 4);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  const percentile = zScore > 0 ? 1 - prob : prob;
  return Math.round(percentile * 100);
}

export async function getGlobalRanking(player: NormalizedPlayerStats): Promise<GlobalRanking> {
  const globalStats = await getGlobalStats();
  const winRate = player.pvpTotal > 0 ? (player.pvpWins / player.pvpTotal) * 100 : 0;

  const kdPercentile = calculatePercentile(
    player.kdRatio,
    globalStats.kdRatio.mean,
    globalStats.kdRatio.stdDev
  );

  const accPercentile = calculatePercentile(
    player.globalAccuracy,
    globalStats.accuracy.mean,
    globalStats.accuracy.stdDev
  );

  const wrPercentile = calculatePercentile(
    winRate,
    globalStats.winRate.mean,
    globalStats.winRate.stdDev
  );

  const ptPercentile = calculatePercentile(
    player.playtimeH,
    globalStats.playtime.mean,
    globalStats.playtime.stdDev
  );

  const overallPercentile = Math.round((kdPercentile + accPercentile + wrPercentile + ptPercentile) / 4);

  return {
    kdRatio: { percentile: kdPercentile, rank: Math.round((100 - kdPercentile) * 1000) },
    accuracy: { percentile: accPercentile, rank: Math.round((100 - accPercentile) * 1000) },
    winRate: { percentile: wrPercentile, rank: Math.round((100 - wrPercentile) * 1000) },
    playtime: { percentile: ptPercentile, rank: Math.round((100 - ptPercentile) * 1000) },
    overall: { percentile: overallPercentile, rank: Math.round((100 - overallPercentile) * 1000) },
  };
}

export async function getRankingLabel(percentile: number): Promise<string> {
  if (percentile >= 99) return "👑 Топ 1%";
  if (percentile >= 95) return "🏆 Топ 5%";
  if (percentile >= 90) return "⭐ Топ 10%";
  if (percentile >= 75) return "🎯 Выше среднего";
  if (percentile >= 50) return "✓ Средний";
  return "📚 Ниже среднего";
}
