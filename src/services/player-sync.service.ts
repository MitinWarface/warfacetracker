// src/services/player-sync.service.ts
// Orchestrates: Redis → PostgreSQL → Official API

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/redis";
import { fetchPlayerStat, normalizePlayerStat } from "./wf-api.service";
import type { NormalizedPlayerStats, NormalizedWeapon } from "@/types/warface";

export type { NormalizedWeapon };

const CACHE_TTL = Number(process.env.CACHE_TTL_PLAYER) || 900; // 15 min

export type SyncResult =
  | { ok: true;  data: NormalizedPlayerStats; source: "cache" | "db" | "api" }
  | { ok: false; error: string };

export const syncPlayer = cache(async function syncPlayer(nickname: string): Promise<SyncResult> {
  const key = `player:${nickname.toLowerCase()}`;

  // 1. Redis cache - check first for better performance
  const cached = await getCache<NormalizedPlayerStats>(key);
  if (cached) return { ok: true, data: cached, source: "cache" };

  // 2. Fetch from API for fresh data
  const raw = await fetchPlayerStat(nickname);
  if (!raw) return { ok: false, error: "Player not found or API unavailable" };

  const normalized = normalizePlayerStat(raw);

  // Persist to DB (awaited so Next.js doesn't cancel it before completion)
  try { await upsertPlayer(normalized); }
  catch (e: unknown) { console.error("[upsertPlayer]", (e as Error)?.message ?? e); }

  // 3. Cache the result
  await setCache(key, normalized, CACHE_TTL);
  return { ok: true, data: normalized, source: "api" };
});

// ─── DB upsert ────────────────────────────────────────────────────────────────

async function upsertPlayer(data: NormalizedPlayerStats): Promise<void> {
  await prisma.$transaction(async (tx) => {
    let clanDbId: string | undefined;
    if (data.clanId && data.clanName) {
      const clan = await tx.clan.upsert({
        where:  { clanId: data.clanId },
        create: { clanId: data.clanId, name: data.clanName, tag: "" },
        update: { name: data.clanName, lastUpdated: new Date() },
      });
      clanDbId = clan.id;
    }

    const player = await tx.player.upsert({
      where:  { nickname: data.nickname.toLowerCase() },
      create: {
        nickname:        data.nickname.toLowerCase(),
        displayNickname: data.nickname,
        userId:          data.userId,
        rankId:          data.rankId,
        experience:      data.experience,
        clanId:          clanDbId,
        favPvP:          data.favPvP,
        favPvE:          data.favPvE,
        lastUpdated:     new Date(),
      },
      update: {
        displayNickname: data.nickname,
        userId:          data.userId,
        rankId:          data.rankId,
        experience:      data.experience,
        clanId:          clanDbId,
        favPvP:          data.favPvP,
        favPvE:          data.favPvE,
        lastUpdated:     new Date(),
      },
    });

    await tx.statSnapshot.create({
      data: {
        playerId:      player.id,
        kills:         data.kills,
        deaths:        data.deaths,
        assists:       0,
        friendlyKills: data.friendlyKills,
        wins:          data.pvpWins,
        losses:        data.pvpLosses,
        draws:         data.pvpDraws,
        playtime:      data.playtimeH * 60 + data.playtimeMin,
        accuracy:      0,
        headshotPct:   0,
        kdRatio:       data.kdRatio,
        rankId:        data.rankId,
        experience:    data.experience,
        pveKills:         data.pveKills,
        pveDeaths:        data.pveDeaths,
        pveFriendlyKills: data.pveFriendlyKills,
        pveWins:          data.pveWins,
        pveLosses:     data.pveLosses,
        pveTotal:      data.pveTotal,
      },
    });

    for (const w of data.weapons) {
      const accuracy    = w.shots > 0 ? w.hits / w.shots : 0;
      const headshotPct = w.hits  > 0 ? w.headshots / w.hits : 0;
      await tx.weaponStats.upsert({
        where:  { playerId_weaponId: { playerId: player.id, weaponId: w.weaponId } },
        create: {
          playerId:    player.id,
          weaponId:    w.weaponId,
          weaponName:  w.weaponName,
          weaponClass: w.weaponClass,
          kills:       w.kills,
          shots:       w.shots,
          hits:        w.hits,
          headshots:   w.headshots,
          headshotPct,
          accuracy,
          isGold:      false,
          goldProgress: 0,
        },
        update: {
          kills:       w.kills,
          shots:       w.shots,
          hits:        w.hits,
          headshots:   w.headshots,
          headshotPct,
          accuracy,
          weaponName:  w.weaponName,
          weaponClass: w.weaponClass,
        },
      });
    }
  });
}

// ─── K/D history for charts ───────────────────────────────────────────────────

export async function getPlayerHistory(nickname: string, limit = 10) {
  try {
    const player = await prisma.player.findUnique({
      where: { nickname: nickname.toLowerCase() },
    });
    if (!player) return [];

    const snaps = await prisma.statSnapshot.findMany({
      where:   { playerId: player.id },
      orderBy: { createdAt: "desc" },
      take:    limit,
      select:  { createdAt: true, kdRatio: true, kills: true, wins: true },
    });

    return snaps.reverse().map((s) => ({
      date:  s.createdAt.toISOString().split("T")[0],
      kd:    s.kdRatio,
      kills: s.kills,
      wins:  s.wins,
    }));
  } catch {
    return [];
  }
}

export async function getPlayerSessions(nickname: string, limit = 100) {
  try {
    const player = await prisma.player.findUnique({
      where: { nickname: nickname.toLowerCase() },
    });
    if (!player) return [];

    const snaps = await prisma.statSnapshot.findMany({
      where:   { playerId: player.id },
      orderBy: { createdAt: "asc" },
      take:    limit,
      select:  {
        createdAt: true,
        kills: true, deaths: true,
        wins: true, losses: true, draws: true,
        experience: true, kdRatio: true,
        playtime: true,
        rankId: true,
        pveKills: true, pveDeaths: true, pveWins: true, pveLosses: true,
      },
    });

    // Compute deltas between consecutive snapshots; skip zero-change pairs
    const sessions = [];
    for (let i = 1; i < snaps.length; i++) {
      const prev = snaps[i - 1];
      const curr = snaps[i];
      const dKills      = curr.kills  - prev.kills;
      const dDeaths     = curr.deaths - prev.deaths;
      const dWins       = curr.wins   - prev.wins;
      const dLosses     = curr.losses - prev.losses;
      const dDraws      = curr.draws  - prev.draws;
      const dXP         = Number(curr.experience) - Number(prev.experience);
      const dPlaytime   = curr.playtime - prev.playtime; // minutes
      const dPveKills   = curr.pveKills  - prev.pveKills;
      const dPveDeaths  = curr.pveDeaths - prev.pveDeaths;
      const dPveWins    = curr.pveWins   - prev.pveWins;
      const dPveLosses  = curr.pveLosses - prev.pveLosses;
      const rankChanged = curr.rankId !== prev.rankId;

      if (dKills === 0 && dWins === 0 && dXP === 0 && dPveWins === 0) continue;

      const totalMatches = dWins + dLosses + dDraws;
      const sessionKD    = dDeaths > 0
        ? parseFloat((dKills / dDeaths).toFixed(2))
        : dKills;
      const sessionWR    = totalMatches > 0
        ? parseFloat(((dWins / totalMatches) * 100).toFixed(1))
        : 0;

      sessions.push({
        date:        curr.createdAt,
        kills:       dKills,
        deaths:      dDeaths,
        wins:        dWins,
        losses:      dLosses,
        draws:       dDraws,
        matches:     totalMatches,
        xpGain:      dXP,
        playtimeMin: dPlaytime,
        sessionKD,
        sessionWR,
        overallKD:   curr.kdRatio,
        rankId:      curr.rankId,
        rankChanged,
        rankPrev:    prev.rankId,
        pve: {
          kills:  dPveKills,
          deaths: dPveDeaths,
          wins:   dPveWins,
          losses: dPveLosses,
        },
      });
    }
    return sessions.reverse(); // newest first
  } catch {
    return [];
  }
}

// ─── Build normalized shape from DB rows ─────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildFromDB(player: any): NormalizedPlayerStats {
  const snap = player.snapshots?.[0];
  const playtime = snap?.playtime ?? 0;
  return {
    userId:        player.userId ?? "",
    nickname:      (player as any).displayNickname || player.nickname,
    experience:    Number(player.experience),
    rankId:        player.rankId,
    clanId:        player.clanId ?? undefined,
    clanName:      player.clan?.name,
    kills:         snap?.kills         ?? 0,
    deaths:        snap?.deaths        ?? 0,
    friendlyKills: snap?.friendlyKills ?? 0,
    pvpWins:       snap?.wins          ?? 0,
    pvpLosses:     snap?.losses        ?? 0,
    pvpDraws:      snap?.draws         ?? 0,
    pvpTotal:      (snap?.wins ?? 0) + (snap?.losses ?? 0) + (snap?.draws ?? 0),
    kdRatio:       snap?.kdRatio       ?? 0,
    pveKills:         snap?.pveKills         ?? 0,
    pveDeaths:        snap?.pveDeaths        ?? 0,
    pveFriendlyKills: snap?.pveFriendlyKills ?? 0,
    pveWins:          snap?.pveWins          ?? 0,
    pveLosses:     snap?.pveLosses     ?? 0,
    pveTotal:      snap?.pveTotal      ?? 0,
    playtimeH:     Math.floor(playtime / 60),
    playtimeMin:   playtime % 60,
    pvpPlaytimeH:  0, // Not available from DB - only from API
    pvpPlaytimeMin: 0,
    pvePlaytimeH:  0, // Not available from DB - only from API
    pvePlaytimeMin: 0,
    favPvP:        player.favPvP ?? "",
    favPvE:        player.favPvE ?? "",
    weapons: (player.weapons ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (w: any): NormalizedWeapon => ({
        weaponId:    w.weaponId,
        weaponName:  w.weaponName,
        weaponClass: w.weaponClass,
        kills:       w.kills,
        usage:       w.usage ?? 0,
        playtimeMs:  0,
        playtimeH:   0,
        playtimeMin: 0,
        shots:       w.shots     ?? 0,
        hits:        w.hits      ?? 0,
        headshots:   w.headshots ?? 0,
      })
    ),
    classPvpStats:    [], // computed from full_response; not stored in DB
    supportStats:     { healDone: 0, repairDone: 0, ressurectsMade: 0, ammoRestored: 0 },
    seasonStats:      [],
    pveGrade:         undefined,
    lastUpdatedAt:    player.lastUpdated ?? new Date(),
    globalAccuracy:   0,
    globalHsRate:     0,
    clanRole:         undefined,
    top100:           undefined,
    // Additional stats from full_response - not available from DB
    sessionMvpCount:      0,
    maxKillStreak:        0,
    totalDamage:          0,
    maxDamage:            0,
    gainedMoney:          0,
    maxSessionTime:       0,
    // Ratios from API - not available from DB
    pvpKdRatio:           0,
    pveKdRatio:           0,
    pvpWinLossRatio:      0,
    totalKills:           0,
    totalPveKills:        0,
    killsMelee:           0,
    killsClaymore:        0,
    killsDevice:          0,
    killsAi:              0,
    friendlyKillsPvp:     0,
    resurrectedByMedic:   0,
    resurrectedByCoin:    0,
    climbCoops:           0,
    climbAssists:         0,
    clutchSuccess:        { clutch1: 0, clutch2: 0, clutch3: 0, clutch4: 0, clutch5: 0 },
    sessionsLeft:         0,
    sessionsKicked:       0,
    sessionsLostConnection: 0,
    onlineTimeSec:        0,
  };
}
