// src/services/clan-wars.service.ts
"use server";

import { prisma } from "@/lib/prisma";
import { fetchClanInfo } from "./wf-api.service";
import { syncPlayer } from "./player-sync.service";

export interface ClanWarComparison {
  clan1: {
    name: string;
    members: ClanMemberStats[];
    avgKd: number;
    avgRank: number;
    totalKills: number;
    totalWins: number;
  };
  clan2: {
    name: string;
    members: ClanMemberStats[];
    avgKd: number;
    avgRank: number;
    totalKills: number;
    totalWins: number;
  };
}

export interface ClanMemberStats {
  nickname: string;
  kdRatio: number;
  rankId: number;
  kills: number;
  wins: number;
}

export async function compareClans(
  clan1Name: string,
  clan2Name: string
): Promise<ClanWarComparison | null> {
  try {
    // Получаем информацию о кланах
    const [clan1Info, clan2Info] = await Promise.all([
      fetchClanInfo(clan1Name),
      fetchClanInfo(clan2Name),
    ]);

    if (!clan1Info || !clan2Info) {
      return null;
    }

    // Получаем статистику участников
    const [clan1Members, clan2Members] = await Promise.all([
      getClanMembersStats(clan1Info.members),
      getClanMembersStats(clan2Info.members),
    ]);

    // Считаем агрегированную статистику
    const clan1Stats = calculateClanStats(clan1Members);
    const clan2Stats = calculateClanStats(clan2Members);

    return {
      clan1: {
        name: clan1Info.name,
        members: clan1Members,
        ...clan1Stats,
      },
      clan2: {
        name: clan2Info.name,
        members: clan2Members,
        ...clan2Stats,
      },
    };
  } catch {
    return null;
  }
}

async function getClanMembersStats(members: Array<{ nickname: string }>): Promise<ClanMemberStats[]> {
  const stats: ClanMemberStats[] = [];

  for (const member of members.slice(0, 20)) { // Ограничиваем 20 участниками
    try {
      const result = await syncPlayer(member.nickname);
      if (result.ok) {
        stats.push({
          nickname: result.data.nickname,
          kdRatio: result.data.kdRatio,
          rankId: result.data.rankId,
          kills: result.data.kills,
          wins: result.data.pvpWins,
        });
      }
    } catch {
      // Пропускаем если ошибка
    }
  }

  return stats;
}

function calculateClanStats(members: ClanMemberStats[]) {
  if (members.length === 0) {
    return {
      avgKd: 0,
      avgRank: 0,
      totalKills: 0,
      totalWins: 0,
    };
  }

  const avgKd = members.reduce((sum, m) => sum + m.kdRatio, 0) / members.length;
  const avgRank = members.reduce((sum, m) => sum + m.rankId, 0) / members.length;
  const totalKills = members.reduce((sum, m) => sum + m.kills, 0);
  const totalWins = members.reduce((sum, m) => sum + m.wins, 0);

  return { avgKd, avgRank, totalKills, totalWins };
}
