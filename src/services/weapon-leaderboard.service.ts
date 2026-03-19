// src/services/weapon-leaderboard.service.ts
"use server";

import { prisma } from "@/lib/prisma";

export interface WeaponLeaderboardEntry {
  nickname: string;
  weaponId: string;
  weaponName: string;
  kills: number;
  rank: number;
}

export interface WeaponLeaderboard {
  weaponId: string;
  weaponName: string;
  topPlayers: WeaponLeaderboardEntry[];
}

export async function getWeaponLeaderboard(
  weaponId: string,
  limit: number = 100
): Promise<WeaponLeaderboard | null> {
  try {
    const weaponStats = await prisma.weaponStats.findMany({
      where: { weaponId },
      include: {
        player: {
          select: {
            nickname: true,
            displayNickname: true,
          },
        },
      },
      orderBy: { kills: 'desc' },
      take: limit,
    });

    if (weaponStats.length === 0) {
      return null;
    }

    const topPlayers: WeaponLeaderboardEntry[] = weaponStats.map((stat, index) => ({
      nickname: stat.player.displayNickname || stat.player.nickname,
      weaponId: stat.weaponId,
      weaponName: stat.weaponName,
      kills: stat.kills,
      rank: index + 1,
    }));

    return {
      weaponId,
      weaponName: weaponStats[0].weaponName,
      topPlayers,
    };
  } catch {
    return null;
  }
}

export async function getPlayerWeaponRank(
  nickname: string,
  weaponId: string
): Promise<{ rank: number; kills: number; total: number } | null> {
  try {
    const playerStat = await prisma.weaponStats.findUnique({
      where: {
        playerId_weaponId: {
          playerId: nickname.toLowerCase(),
          weaponId,
        },
      },
    });

    if (!playerStat) {
      return null;
    }

    const totalPlayers = await prisma.weaponStats.count({
      where: { weaponId },
    });

    const betterPlayers = await prisma.weaponStats.count({
      where: {
        weaponId,
        kills: { gt: playerStat.kills },
      },
    });

    return {
      rank: betterPlayers + 1,
      kills: playerStat.kills,
      total: totalPlayers,
    };
  } catch {
    return null;
  }
}

export async function getTopWeapons(limit: number = 10): Promise<{
  weaponId: string;
  weaponName: string;
  totalKills: number;
  playersCount: number;
}[]> {
  try {
    const topWeapons = await prisma.weaponStats.groupBy({
      by: ['weaponId', 'weaponName'],
      _sum: { kills: true },
      _count: { playerId: true },
      orderBy: {
        _sum: { kills: 'desc' },
      },
      take: limit,
    });

    return topWeapons.map((w) => ({
      weaponId: w.weaponId,
      weaponName: w.weaponName,
      totalKills: w._sum.kills || 0,
      playersCount: w._count.playerId,
    }));
  } catch {
    return [];
  }
}
