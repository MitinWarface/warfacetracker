// src/services/wfs-api.service.ts
// Client for WFS API (https://wfs.globalart.dev)
// Provides stats for hidden accounts + server online!

const WFS_BASE_URL = "https://wfs.globalart.dev/api";

export interface WFSPlayerStats {
  playerId: string;
  nickname: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  totalScore: number;
  averageScore: number;
  rank: string;
  isHidden: boolean;
  kills?: number;
  deaths?: number;
  kdRatio?: number;
}

export interface WFSPlayerSummary {
  playerId: string;
  nickname: string;
  gamesPlayed: number;
  wins: number;
  rank: string;
}

export interface WFSCompetitiveStats {
  playerId: string;
  competitiveGames: number;
  competitiveWins: number;
  mmr: number;
  tier: number;
  division: number;
}

export interface WFSSeasonalStats {
  playerId: string;
  seasonId: string;
  seasonGames: number;
  seasonWins: number;
  seasonRank: string;
}

export interface WFSStatsHistory {
  playerId: string;
  history: Array<{
    date: string;
    gamesPlayed: number;
    wins: number;
    rank: string;
  }>;
}

// ─── Server Online ────────────────────────────────────────────────────────────

export interface WFSServerOnline {
  serverId: string;
  serverName: string;
  online: number;
  capacity: number;
  region: string;
}

export interface WFSOnlineStats {
  totalOnline: number;
  totalServers: number;
  servers: WFSServerOnline[];
  lastUpdated: string;
}

/**
 * Get server online stats
 */
export async function fetchWFSOnlineStats(): Promise<WFSOnlineStats | null> {
  try {
    const url = `${WFS_BASE_URL}/online/stats`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "no-store",
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as WFSOnlineStats;
  } catch (error) {
    console.error("[WFS API] Error fetching online stats:", error);
    return null;
  }
}

// ─── PvE Stats ────────────────────────────────────────────────────────────────

export interface WFSPvEStats {
  playerId: string;
  nickname: string;
  missionsCompleted: number;
  crownsEarned: number;
  totalKills: number;
  totalDeaths: number;
  kdRatio: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  favoriteClass: string;
  favoriteWeapon: string;
  specialOperationsCompleted: number;
  survivalMissionsCompleted: number;
}

/**
 * Get player PvE stats (missions, crowns, operations)
 */
export async function fetchWFSPvEStats(nickname: string): Promise<WFSPvEStats | null> {
  try {
    const url = `${WFS_BASE_URL}/player/${encodeURIComponent(nickname)}/pve`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as WFSPvEStats;
  } catch (error) {
    console.error("[WFS API] Error fetching PvE stats:", error);
    return null;
  }
}

// ─── PvE Achievements ─────────────────────────────────────────────────────────

export interface WFSPvEAchievement {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  completedDate?: string;
  progress: number;
  maxProgress: number;
  icon?: string;
}

export interface WFSPvEAchievements {
  playerId: string;
  nickname: string;
  totalAchievements: number;
  completedAchievements: number;
  completionRate: number;
  achievements: WFSPvEAchievement[];
}

/**
 * Get player PvE achievements (special operations)
 */
export async function fetchWFSPvEAchievements(nickname: string): Promise<WFSPvEAchievements | null> {
  try {
    const url = `${WFS_BASE_URL}/player/${encodeURIComponent(nickname)}/pveAchievements`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as WFSPvEAchievements;
  } catch (error) {
    console.error("[WFS API] Error fetching PvE achievements:", error);
    return null;
  }
}

// ─── Player Search ────────────────────────────────────────────────────────────

export interface WFSSearchedPlayer {
  playerId: string;
  nickname: string;
  isHidden: boolean;
  lastSeen?: string;
}

/**
 * Search for players by nickname
 */
export async function searchWFSPlayers(query: string): Promise<WFSSearchedPlayer[] | null> {
  try {
    const url = `${WFS_BASE_URL}/player/search?query=${encodeURIComponent(query)}`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "no-store",
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as WFSSearchedPlayer[];
  } catch (error) {
    console.error("[WFS API] Error searching players:", error);
    return null;
  }
}

// ─── Ratings ──────────────────────────────────────────────────────────────────

export interface WFSRatingEntry {
  rank: number;
  rankChange: number;
  playerId: string;
  nickname: string;
  value: number;
  isHidden: boolean;
}

export interface WFSRatings {
  category: string;
  total: number;
  lastUpdated: string;
  entries: WFSRatingEntry[];
}

/**
 * Get player ratings (PvP, PvE, K/D, Wins)
 */
export async function fetchWFSRatings(
  category: 'pvp' | 'pve' | 'kd' | 'wins' | 'rating',
  limit: number = 100
): Promise<WFSRatings | null> {
  try {
    const url = `${WFS_BASE_URL}/ratings/players?category=${category}&limit=${limit}`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as WFSRatings;
  } catch (error) {
    console.error("[WFS API] Error fetching ratings:", error);
    return null;
  }
}

// ─── Clan Ratings ─────────────────────────────────────────────────────────────

export interface WFSClanRatingEntry {
  rank: number;
  rankChange: number;
  clanId: string;
  clanName: string;
  clanTag: string;
  points: number;
  members: number;
}

export interface WFSClanRatings {
  total: number;
  lastUpdated: string;
  entries: WFSClanRatingEntry[];
}

/**
 * Get clan ratings
 */
export async function fetchWFSClanRatings(limit: number = 100): Promise<WFSClanRatings | null> {
  try {
    const url = `${WFS_BASE_URL}/ratings/clans?limit=${limit}`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as WFSClanRatings;
  } catch (error) {
    console.error("[WFS API] Error fetching clan ratings:", error);
    return null;
  }
}

// ─── Clan Info ────────────────────────────────────────────────────────────────

export interface WFSClanMember {
  playerId: string;
  nickname: string;
  role: string;
  joinDate: string;
  isHidden: boolean;
}

export interface WFSClanInfo {
  clanId: string;
  clanName: string;
  clanTag: string;
  description?: string;
  createdDate: string;
  members: WFSClanMember[];
  totalMembers: number;
  rating: number;
  wins: number;
  losses: number;
}

/**
 * Get clan information
 */
export async function fetchWFSClanInfo(clanId: string): Promise<WFSClanInfo | null> {
  try {
    const url = `${WFS_BASE_URL}/clan/${encodeURIComponent(clanId)}`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as WFSClanInfo;
  } catch (error) {
    console.error("[WFS API] Error fetching clan info:", error);
    return null;
  }
}

// ─── Weapon Stats ─────────────────────────────────────────────────────────────

export interface WFSWeaponStats {
  weaponId: string;
  weaponName: string;
  weaponClass: string;
  kills: number;
  headshots: number;
  headshotRate: number;
  accuracy: number;
  shotsFired: number;
  shotsHit: number;
  playtimeSeconds: number;
}

/**
 * Get player weapon stats
 */
export async function fetchWFSWeaponStats(nickname: string): Promise<WFSWeaponStats[] | null> {
  try {
    const url = `${WFS_BASE_URL}/player/${encodeURIComponent(nickname)}/weapons`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as WFSWeaponStats[];
  } catch (error) {
    console.error("[WFS API] Error fetching weapon stats:", error);
    return null;
  }
}

// ─── Player Compare ───────────────────────────────────────────────────────────

export interface WFSComparedPlayer {
  playerId: string;
  nickname: string;
  kills: number;
  deaths: number;
  kdRatio: number;
  wins: number;
  losses: number;
  winRate: number;
  rank: string;
  isHidden: boolean;
}

export interface WFSPlayerComparison {
  players: WFSComparedPlayer[];
  comparison: {
    kills: { best: string; values: number[] };
    kdRatio: { best: string; values: number[] };
    winRate: { best: string; values: number[] };
  };
}

/**
 * Compare multiple players
 */
export async function compareWFSPlayers(nicknames: string[]): Promise<WFSPlayerComparison | null> {
  try {
    const ids = nicknames.map(n => encodeURIComponent(n)).join(',');
    const url = `${WFS_BASE_URL}/players/compare?ids=${ids}`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "no-store",
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as WFSPlayerComparison;
  } catch (error) {
    console.error("[WFS API] Error comparing players:", error);
    return null;
  }
}

// ─── API Methods ──────────────────────────────────────────────────────────────

/**
 * Get full player stats (works for hidden accounts!)
 */
export async function fetchWFSPlayerStats(nickname: string): Promise<WFSPlayerStats | null> {
  try {
    const url = `${WFS_BASE_URL}/player/${encodeURIComponent(nickname)}/stats`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 300 }, // 5 minutes
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null; // Player not found
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data as WFSPlayerStats;
  } catch (error) {
    console.error("[WFS API] Error fetching player stats:", error);
    return null;
  }
}

/**
 * Get player stats summary (works for hidden accounts!)
 */
export async function fetchWFSPlayerSummary(nickname: string): Promise<WFSPlayerSummary | null> {
  try {
    const url = `${WFS_BASE_URL}/player/${encodeURIComponent(nickname)}/stats/summary`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as WFSPlayerSummary;
  } catch (error) {
    console.error("[WFS API] Error fetching player summary:", error);
    return null;
  }
}

/**
 * Get competitive stats (works for hidden accounts!)
 */
export async function fetchWFSCompetitiveStats(nickname: string): Promise<WFSCompetitiveStats | null> {
  try {
    const url = `${WFS_BASE_URL}/player/${encodeURIComponent(nickname)}/stats/competitive`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as WFSCompetitiveStats;
  } catch (error) {
    console.error("[WFS API] Error fetching competitive stats:", error);
    return null;
  }
}

/**
 * Get seasonal stats (works for hidden accounts!)
 */
export async function fetchWFSSeasonalStats(
  nickname: string,
  seasonId?: string
): Promise<WFSSeasonalStats | null> {
  try {
    const url = new URL(`${WFS_BASE_URL}/player/${encodeURIComponent(nickname)}/stats/seasonal`);
    if (seasonId) {
      url.searchParams.set("seasonId", seasonId);
    }
    
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as WFSSeasonalStats;
  } catch (error) {
    console.error("[WFS API] Error fetching seasonal stats:", error);
    return null;
  }
}

/**
 * Get stats history (works for hidden accounts!)
 */
export async function fetchWFSStatsHistory(
  nickname: string,
  limit: number = 10
): Promise<WFSStatsHistory | null> {
  try {
    const url = new URL(`${WFS_BASE_URL}/player/${encodeURIComponent(nickname)}/stats/history`);
    url.searchParams.set("limit", limit.toString());
    
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as WFSStatsHistory;
  } catch (error) {
    console.error("[WFS API] Error fetching stats history:", error);
    return null;
  }
}

/**
 * Search for player by nickname
 */
export async function searchWFSPlayer(nickname: string): Promise<{
  playerId: string;
  nickname: string;
  isHidden: boolean;
} | null> {
  try {
    // Try to get summary - if player exists, we'll get data
    const summary = await fetchWFSPlayerSummary(nickname);
    
    if (summary) {
      return {
        playerId: summary.playerId,
        nickname: summary.nickname || nickname,
        isHidden: false,
      };
    }

    return null;
  } catch (error) {
    console.error("[WFS API] Error searching player:", error);
    return null;
  }
}
