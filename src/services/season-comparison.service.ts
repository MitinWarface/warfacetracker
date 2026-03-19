// src/services/season-comparison.service.ts
"use server";

import type { SeasonStat } from "@/types/warface";

export interface SeasonComparison {
  current: SeasonStat | null;
  previous: SeasonStat | null;
  changes: {
    kdRatio: { value: number; percent: number; improved: boolean };
    wins: { value: number; percent: number; improved: boolean };
    losses: { value: number; percent: number; improved: boolean };
    accuracy: { value: number; percent: number; improved: boolean };
    kills: { value: number; percent: number; improved: boolean };
  };
}

export async function compareSeasons(current: SeasonStat | null, previous: SeasonStat | null): Promise<SeasonComparison> {
  if (!current || !previous) {
    return {
      current,
      previous,
      changes: {
        kdRatio: { value: 0, percent: 0, improved: false },
        wins: { value: 0, percent: 0, improved: false },
        losses: { value: 0, percent: 0, improved: false },
        accuracy: { value: 0, percent: 0, improved: false },
        kills: { value: 0, percent: 0, improved: false },
      },
    };
  }

  const currentKd = current.deaths > 0 ? current.kills / current.deaths : current.kills;
  const previousKd = previous.deaths > 0 ? previous.kills / previous.deaths : previous.kills;

  const currentAccuracy = current.shots > 0 ? (current.hits / current.shots) * 100 : 0;
  const previousAccuracy = previous.shots > 0 ? (previous.hits / previous.shots) * 100 : 0;

  const calculateChange = (current: number, previous: number, higherIsBetter: boolean = true) => {
    if (previous === 0) return { value: current, percent: 100, improved: current > 0 };
    const value = current - previous;
    const percent = Math.abs((value / previous) * 100);
    const improved = higherIsBetter ? current > previous : current < previous;
    return { value, percent: Math.round(percent * 10) / 10, improved };
  };

  return {
    current,
    previous,
    changes: {
      kdRatio: calculateChange(currentKd, previousKd),
      wins: calculateChange(current.wins, previous.wins),
      losses: calculateChange(current.losses, previous.losses, false),
      accuracy: calculateChange(currentAccuracy, previousAccuracy),
      kills: calculateChange(current.kills, previous.kills),
    },
  };
}
