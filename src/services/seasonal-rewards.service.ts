// src/services/seasonal-rewards.service.ts
"use server";

import type { NormalizedPlayerStats, SeasonStat } from "@/types/warface";

export interface SeasonalReward {
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  name: string;
  winsRequired: number;
  currentWins: number;
  progress: number;
  isCompleted: boolean;
  reward: string;
}

const SEASON_REWARDS: SeasonalReward[] = [
  {
    tier: "bronze",
    name: "Бронза",
    winsRequired: 10,
    currentWins: 0,
    progress: 0,
    isCompleted: false,
    reward: "Бронзовый значок сезона",
  },
  {
    tier: "silver",
    name: "Серебро",
    winsRequired: 25,
    currentWins: 0,
    progress: 0,
    isCompleted: false,
    reward: "Серебряный значок сезона",
  },
  {
    tier: "gold",
    name: "Золото",
    winsRequired: 50,
    currentWins: 0,
    progress: 0,
    isCompleted: false,
    reward: "Золотой значок сезона + оружие",
  },
  {
    tier: "platinum",
    name: "Платина",
    winsRequired: 100,
    currentWins: 0,
    progress: 0,
    isCompleted: false,
    reward: "Платиновый значок + камуфляж",
  },
  {
    tier: "diamond",
    name: "Алмаз",
    winsRequired: 200,
    currentWins: 0,
    progress: 0,
    isCompleted: false,
    reward: "Алмазный значок + золотое оружие",
  },
];

export async function getSeasonalRewards(player: NormalizedPlayerStats): Promise<SeasonalReward[]> {
  const currentSeason = player.seasonStats[0];
  const seasonWins = currentSeason?.wins || 0;

  return SEASON_REWARDS.map((reward) => ({
    ...reward,
    currentWins: seasonWins,
    progress: Math.min(100, Math.round((seasonWins / reward.winsRequired) * 100)),
    isCompleted: seasonWins >= reward.winsRequired,
  }));
}

export async function getSeasonSummary(player: NormalizedPlayerStats): Promise<{
  currentSeason: string;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  kdRatio: number;
  bestWeapon: string;
}> {
  const currentSeason = player.seasonStats[0];
  
  if (!currentSeason) {
    return {
      currentSeason: "Не активен",
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      kdRatio: 0,
      bestWeapon: "—",
    };
  }

  const totalGames = currentSeason.wins + currentSeason.losses;
  const winRate = totalGames > 0 ? (currentSeason.wins / totalGames) * 100 : 0;
  const kdRatio = currentSeason.deaths > 0 
    ? currentSeason.kills / currentSeason.deaths 
    : currentSeason.kills;

  const bestWeapon = player.weapons[0]?.weaponName || "—";

  return {
    currentSeason: currentSeason.label,
    totalWins: currentSeason.wins,
    totalLosses: currentSeason.losses,
    winRate: Math.round(winRate * 10) / 10,
    kdRatio: Math.round(kdRatio * 100) / 100,
    bestWeapon,
  };
}
