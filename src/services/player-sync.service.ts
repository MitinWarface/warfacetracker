// src/services/player-sync.service.ts
// Orchestrates: Redis → PostgreSQL → Official API → WFS API (for hidden accounts)

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/redis";
import { fetchPlayerStat, normalizePlayerStat } from "./wf-api.service";
import { fetchWFSPlayerStats } from "./wfs-api.service"; // ← NEW! For hidden accounts
import type { NormalizedPlayerStats, NormalizedWeapon } from "@/types/warface";

export type { NormalizedWeapon };

const CACHE_TTL = Number(process.env.CACHE_TTL_PLAYER) || 900; // 15 min

export type SyncResult =
  | { ok: true;  data: NormalizedPlayerStats; source: "cache" | "db" | "api"; isHidden?: false }
  | { ok: true;  data: NormalizedPlayerStats; source: "last_saved"; isHidden: true; hiddenAt: Date }
  | { ok: false; error: string };

export type PlayerWithHiddenFlag = NormalizedPlayerStats & {
  _isHidden?: boolean;
  _hiddenAt?: Date;
  _dataSource?: string;
};

export const syncPlayer = cache(async function syncPlayer(nickname: string): Promise<SyncResult> {
  const key = `player:${nickname.toLowerCase()}`;

  console.log('[Sync] Starting sync for:', nickname);

  // 1. Redis cache - check first for better performance
  const cached = await getCache<NormalizedPlayerStats>(key);
  if (cached) {
    console.log('[Sync] Found in Redis cache');
    return { ok: true, data: cached, source: "cache", isHidden: false };
  }

  // 2. Fetch from Official Warface API
  const raw = await fetchPlayerStat(nickname);

  // Если API вернул данные - используем их
  if (raw) {
    console.log('[Sync] Successfully fetched from Official API');
    const normalized = normalizePlayerStat(raw);

    // Persist to DB
    try { await upsertPlayer(normalized); }
    catch (e: unknown) { console.error("[upsertPlayer]", (e as Error)?.message ?? e); }

    // Cache the result
    await setCache(key, normalized, CACHE_TTL);
    return { ok: true, data: normalized, source: "api", isHidden: false };
  }

  console.log('[Sync] Official API returned null (hidden account), checking WFS API...');

  // 3. WFS API - for hidden accounts!
  const wfsStats = await fetchWFSPlayerStats(nickname);
  
  if (wfsStats) {
    console.log('[Sync] Found in WFS API (hidden account)!');
    // WFS API вернул данные для скрытого аккаунта!
    // Преобразуем в наш формат
    const normalized: NormalizedPlayerStats = {
      userId: wfsStats.playerId,
      nickname: wfsStats.nickname || nickname,
      experience: BigInt(0),
      rankId: 1,
      clanId: undefined,
      clanName: undefined,
      kills: wfsStats.kills || 0,
      deaths: wfsStats.deaths || 0,
      friendlyKills: 0,
      pvpWins: wfsStats.wins || 0,
      pvpLosses: wfsStats.losses || 0,
      pvpDraws: 0,
      pvpTotal: (wfsStats.wins || 0) + (wfsStats.losses || 0),
      kdRatio: wfsStats.kdRatio || 0,
      pveKills: 0,
      pveDeaths: 0,
      pveFriendlyKills: 0,
      pveWins: 0,
      pveLosses: 0,
      pveTotal: 0,
      playtimeH: 0,
      playtimeMin: 0,
      pvpPlaytimeH: 0,
      pvpPlaytimeMin: 0,
      pvePlaytimeH: 0,
      pvePlaytimeMin: 0,
      favPvP: "",
      favPvE: "",
      weapons: [],
      classPvpStats: [],
      supportStats: { healDone: 0, repairDone: 0, ressurectsMade: 0, ammoRestored: 0 },
      seasonStats: [],
      pveGrade: undefined,
      lastUpdatedAt: new Date(),
      globalAccuracy: 0,
      globalHsRate: 0,
      clanRole: undefined,
      top100: undefined,
      sessionMvpCount: 0,
      maxKillStreak: 0,
      totalDamage: 0,
      maxDamage: 0,
      gainedMoney: 0,
      maxSessionTime: 0,
      pvpKdRatio: 0,
      pveKdRatio: 0,
      pvpWinLossRatio: 0,
      totalKills: 0,
      totalPveKills: 0,
      killsMelee: 0,
      killsClaymore: 0,
      killsDevice: 0,
      killsAi: 0,
      friendlyKillsPvp: 0,
      resurrectedByMedic: 0,
      resurrectedByCoin: 0,
      climbCoops: 0,
      climbAssists: 0,
      clutchSuccess: { clutch1: 0, clutch2: 0, clutch3: 0, clutch4: 0, clutch5: 0 },
      sessionsLeft: 0,
      sessionsKicked: 0,
      sessionsLostConnection: 0,
      onlineTimeSec: 0,
    };

    // Persist to DB
    try { await upsertPlayer(normalized); }
    catch (e: unknown) { console.error("[upsertPlayer]", (e as Error)?.message ?? e); }

    // Cache the result
    await setCache(key, normalized, CACHE_TTL);

    return {
      ok: true,
      data: normalized,
      source: "wfs" as const,
      isHidden: wfsStats.isHidden || false,
    };
  }

  console.log('[Sync] WFS API also returned null, checking DB...');

  // 4. Official API и WFS не вернули - проверяем БД
  const lastSaved = await getLastSavedPlayerData(nickname);
  if (lastSaved) {
    console.log('[Sync] Found in DB (last saved data)');
    return {
      ok: true,
      data: lastSaved.data,
      source: "last_saved" as const,
      isHidden: true,
      hiddenAt: lastSaved.hiddenAt
    };
  }

  console.log('[Sync] Player not found anywhere');
  // Нет данных ни в одном источнике
  return { ok: false, error: "Player not found or API unavailable" };
});

// ─── Get last saved player data from DB ───────────────────────────────────────

export async function getLastSavedPlayerData(nickname: string): Promise<{
  data: NormalizedPlayerStats;
  hiddenAt: Date;
} | null> {
  try {
    const lowerNickname = nickname.toLowerCase();
    console.log('[DB] Looking for player:', lowerNickname);
    
    // Сначала ищем точное совпадение
    let player = await prisma.player.findUnique({
      where: { nickname: lowerNickname },
      include: {
        snapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        weapons: {
          orderBy: { kills: 'desc' },
        },
        clan: true,
      },
    });

    // Если не нашли, пробуем case-insensitive поиск по displayNickname
    if (!player) {
      console.log('[DB] Not found by nickname, trying displayNickname...');
      const players = await prisma.player.findMany({
        where: {
          displayNickname: {
            equals: nickname,
            mode: 'insensitive',
          },
        },
        include: {
          snapshots: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          weapons: {
            orderBy: { kills: 'desc' },
          },
          clan: true,
        },
        take: 1,
      });
      player = players[0] || null;
    }

    if (!player) {
      console.log('[DB] Player not found in database');
      return null;
    }
    
    if (!player.snapshots || player.snapshots.length === 0) {
      console.log('[DB] Player found but no snapshots');
      return null;
    }

    console.log('[DB] Player found with snapshot:', player.displayNickname || player.nickname);

    const snapshot = player.snapshots[0];
    const lastUpdated = player.lastUpdated;

    // Build normalized stats from DB
    const data = buildFromDBWithTimestamps(player, lastUpdated);
    
    return {
      data,
      hiddenAt: lastUpdated,
    };
  } catch (error) {
    console.error('[DB] Error fetching player data:', error);
    return null;
  }
}

// ─── Search players in DB by partial nickname ─────────────────────────────────

export async function searchPlayersInDB(query: string): Promise<Array<{
  nickname: string;
  displayNickname: string;
  lastUpdated: Date;
  hasSnapshot: boolean;
}>> {
  try {
    const lowerQuery = query.toLowerCase();
    
    const players = await prisma.player.findMany({
      where: {
        OR: [
          { nickname: { contains: lowerQuery } },
          { displayNickname: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        snapshots: {
          take: 1,
        },
      },
      orderBy: {
        lastUpdated: 'desc',
      },
      take: 10,
    });

    return players.map(p => ({
      nickname: p.nickname,
      displayNickname: p.displayNickname || p.nickname,
      lastUpdated: p.lastUpdated,
      hasSnapshot: p.snapshots.length > 0,
    }));
  } catch (error) {
    console.error('[DB] Error searching players:', error);
    return [];
  }
}

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

// Build from DB with custom lastUpdated timestamp
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildFromDBWithTimestamps(player: any, lastUpdated: Date): NormalizedPlayerStats {
  const base = buildFromDB(player);
  return {
    ...base,
    lastUpdatedAt: lastUpdated,
  };
}
