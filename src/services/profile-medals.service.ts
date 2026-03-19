// src/services/profile-medals.service.ts
"use server";

import type { NormalizedPlayerStats } from "@/types/warface";

export interface ProfileMedal {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  required: number;
  earnedAt?: string;
}

export async function getProfileMedals(player: NormalizedPlayerStats): Promise<ProfileMedal[]> {
  const medals: ProfileMedal[] = [];

  // Медаль "Ветеран" - 100 часов в игре
  medals.push({
    id: "veteran_100h",
    name: "Ветеран",
    description: "100 часов в игре",
    icon: "🎖️",
    earned: player.playtimeH >= 100,
    progress: Math.min(player.playtimeH, 100),
    required: 100,
  });

  // Медаль "Снайпер" - 1000 хедшотов
  const totalHeadshots = player.classPvpStats.reduce((sum, c) => sum + c.headshots, 0);
  medals.push({
    id: "sniper_1000hs",
    name: "Снайпер",
    description: "1000 хедшотов",
    icon: "🎯",
    earned: totalHeadshots >= 1000,
    progress: Math.min(totalHeadshots, 1000),
    required: 1000,
  });

  // Медаль "Победитель" - 500 побед
  medals.push({
    id: "winner_500wins",
    name: "Победитель",
    description: "500 побед в PvP",
    icon: "🏆",
    earned: player.pvpWins >= 500,
    progress: Math.min(player.pvpWins, 500),
    required: 500,
  });

  // Медаль "Гриндер" - 10,000 убийств
  medals.push({
    id: "grinder_10k",
    name: "Гриндер",
    description: "10,000 убийств",
    icon: "⚔️",
    earned: player.kills >= 10000,
    progress: Math.min(player.kills, 10000),
    required: 10000,
  });

  // Медаль "Командир" - K/D 2.0+
  medals.push({
    id: "leader_kd2",
    name: "Командир",
    description: "K/D 2.0 или выше",
    icon: "⭐",
    earned: player.kdRatio >= 2.0,
    progress: Math.min(player.kdRatio, 2.0),
    required: 2.0,
  });

  // Медаль "Точный" - точность 40%+
  medals.push({
    id: "accurate_40",
    name: "Точный",
    description: "Точность 40% или выше",
    icon: "🎯",
    earned: player.globalAccuracy >= 40,
    progress: Math.min(player.globalAccuracy, 40),
    required: 40,
  });

  // Медаль "Медик" - 1000 реанимаций
  medals.push({
    id: "medic_1000res",
    name: "Медик",
    description: "1000 реанимаций",
    icon: "💉",
    earned: player.supportStats.ressurectsMade >= 1000,
    progress: Math.min(player.supportStats.ressurectsMade, 1000),
    required: 1000,
  });

  // Медаль "Инженер" - 1000 ремонтов
  medals.push({
    id: "engineer_1000rep",
    name: "Инженер",
    description: "1000 ремонтов",
    icon: "🔧",
    earned: player.supportStats.repairDone >= 1000,
    progress: Math.min(player.supportStats.repairDone, 1000),
    required: 1000,
  });

  // Медаль "Топ-100" - в топ-100 рейтинга
  medals.push({
    id: "top100",
    name: "Элита",
    description: "В топ-100 рейтинга",
    icon: "👑",
    earned: player.top100 !== undefined,
    progress: player.top100 ? player.top100.position : 100,
    required: 100,
  });

  return medals.sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    return (b.progress / b.required) - (a.progress / a.required);
  });
}

export async function getMedalsSummary(medals: ProfileMedal[]): Promise<{
  total: number;
  earned: number;
  percent: number;
}> {
  const earned = medals.filter(m => m.earned).length;
  return {
    total: medals.length,
    earned,
    percent: Math.round((earned / medals.length) * 100),
  };
}
