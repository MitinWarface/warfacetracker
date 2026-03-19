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
      cache: "no-store", // Real-time data
      next: { revalidate: 60 }, // Revalidate every minute
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data as WFSOnlineStats;
  } catch (error) {
    console.error("[WFS API] Error fetching online stats:", error);
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
