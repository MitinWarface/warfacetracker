// src/services/class-stats.service.ts
"use server";

import type { ClassStat } from "@/types/warface";

export interface DetailedClassStat extends ClassStat {
  kdRatio: number;
}

export async function getDetailedClassStats(classStats: ClassStat[]): Promise<DetailedClassStat[]> {
  return classStats.map((stat) => {
    const kdRatio = stat.kills > 0 && stat.shots > 0
      ? stat.kills / Math.max(1, stat.hits - stat.headshots)
      : 0;

    return {
      ...stat,
      kdRatio: Math.round(kdRatio * 100) / 100,
    };
  }).sort((a, b) => b.playtimeMs - a.playtimeMs);
}
