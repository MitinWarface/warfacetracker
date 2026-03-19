// src/services/pve-guild.service.ts
"use server";

import { prisma } from "@/lib/prisma";

export interface PvEGuildMember {
  nickname: string;
  pveKills: number;
  pveWins: number;
  pveKd: number;
  playtimeHours: number;
  rank: number;
}

export interface PvEGuildLeaderboard {
  category: "kills" | "wins" | "kd" | "playtime";
  members: PvEGuildMember[];
}

export async function getPvEGuildLeaderboard(
  category: "kills" | "wins" | "kd" | "playtime" = "kills",
  limit: number = 100
): Promise<PvEGuildLeaderboard> {
  try {
    const players = await prisma.player.findMany({
      include: {
        snapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        experience: 'desc',
      },
      take: limit * 2, // Берём больше для фильтрации
    });

    const members: PvEGuildMember[] = players
      .map((player) => {
        const snapshot = player.snapshots[0];
        const pveKills = snapshot?.pveKills || 0;
        const pveWins = snapshot?.pveWins || 0;
        const pveDeaths = snapshot?.pveDeaths || 1;
        
        return {
          nickname: player.displayNickname || player.nickname,
          pveKills,
          pveWins,
          pveKd: pveDeaths > 0 ? pveKills / pveDeaths : pveKills,
          playtimeHours: Math.floor((snapshot?.playtime || 0) / 60),
          rank: player.rankId,
        };
      })
      .filter(m => m.pveKills > 0 || m.pveWins > 0); // Только с PvE активностью

    // Сортировка по категории
    members.sort((a, b) => {
      switch (category) {
        case "kills": return b.pveKills - a.pveKills;
        case "wins": return b.pveWins - a.pveWins;
        case "kd": return b.pveKd - a.pveKd;
        case "playtime": return b.playtimeHours - a.playtimeHours;
        default: return 0;
      }
    });

    return {
      category,
      members: members.slice(0, limit),
    };
  } catch {
    return {
      category,
      members: [],
    };
  }
}

export async function getPvEStats(nickname: string): Promise<{
  pveKills: number;
  pveWins: number;
  pveKd: number;
  pveWinRate: number;
  globalRank: number;
  totalPlayers: number;
} | null> {
  try {
    const player = await prisma.player.findUnique({
      where: { nickname: nickname.toLowerCase() },
      include: {
        snapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!player || !player.snapshots[0]) {
      return null;
    }

    const snapshot = player.snapshots[0];
    const pveKills = snapshot.pveKills;
    const pveWins = snapshot.pveWins;
    const pveDeaths = snapshot.pveDeaths || 1;
    const pveTotal = snapshot.pveTotal || 1;

    // Считаем глобальный ранг
    const totalPlayers = await prisma.player.count({
      where: {
        snapshots: {
          some: {
            pveKills: { gt: 0 },
          },
        },
      },
    });

    const betterPlayers = await prisma.player.count({
      where: {
        snapshots: {
          some: {
            pveKills: { gt: pveKills },
          },
        },
      },
    });

    return {
      pveKills,
      pveWins,
      pveKd: pveDeaths > 0 ? pveKills / pveDeaths : pveKills,
      pveWinRate: Math.round((pveWins / pveTotal) * 100 * 10) / 10,
      globalRank: betterPlayers + 1,
      totalPlayers,
    };
  } catch {
    return null;
  }
}
