// src/services/wf-api.service.ts
// Client for the official Warface API: http://api.warface.ru/

import weaponNamesRaw from "@/lib/weapon-names.json";
import type {
  WFPlayerStat,
  WFTop100Player,
  WFClanRating,
  WFClanInfo,
  WFMission,
  WFPlayerAchievement,
  NormalizedPlayerStats,
  NormalizedWeapon,
  ClassStat,
  SupportStats,
  SeasonStat,
  PveGrade,
  WFWeaponCatalog,
  WFAchievementCatalog,
  WFMonthlyRating,
} from "@/types/warface";

const BASE_URL = "https://api.warface.ru";
const TIMEOUT  = 10_000;

// ─── Low-level fetch ──────────────────────────────────────────────────────────

async function wfFetch<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
      // Next.js 16: используем force-cache для лучшего кэширования
      cache: "force-cache",
      next: { revalidate: 300 }, // 5 минут кэш
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

// ─── API methods ──────────────────────────────────────────────────────────────

export async function fetchPlayerStat(nickname: string): Promise<WFPlayerStat | null> {
  try {
    const isServer = typeof window === 'undefined';

    if (isServer) {
      // Сервер — прямой запрос к API с full_response для полной статистики
      const url = `http://api.warface.ru/user/stat/?name=${encodeURIComponent(nickname)}&full_response=1`;
      console.log('[WF API] Fetching player stat:', url);

      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        cache: "force-cache",
        next: { revalidate: 300 },
      });

      console.log('[WF API] Response status:', res.status);

      if (!res.ok) {
        if (res.status === 404 || res.status === 500) {
          console.log('[WF API] Player not found or stats hidden');
          return null;
        }
        return null;
      }

      const data = await res.json() as Promise<WFPlayerStat>;
      console.log('[WF API] Successfully fetched data with full_response');
      
      // Проверяем что full_response действительно есть
      const statData = await data;
      if (statData && statData.full_response) {
        console.log('[WF API] full_response получен, длина:', statData.full_response.length);
        console.log('[WF API] Первые 200 символов full_response:', statData.full_response.substring(0, 200));
      } else {
        console.warn('[WF API] ВНИМАНИЕ: full_response отсутствует или пустой!');
      }
      
      return data;
    } else {
      // Клиент — через proxy с full_response
      const res = await fetch(`/api/warface?endpoint=/user/stat/&name=${encodeURIComponent(nickname)}&full_response=1`, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        },
        cache: "force-cache",
        next: { revalidate: 300 },
      });

      if (!res.ok) return null;
      return res.json() as Promise<WFPlayerStat>;
    }
  } catch (error) {
    console.error('[WF API] Error fetching player stat:', error);
    return null;
  }
}

export async function fetchPlayerAchievements(nickname: string): Promise<WFPlayerAchievement[]> {
  try {
    const isServer = typeof window === 'undefined';
    const url = isServer 
      ? `http://api.warface.ru/user/achievements/?name=${encodeURIComponent(nickname)}`
      : `/api/warface?endpoint=/user/achievements/&name=${encodeURIComponent(nickname)}`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 300 },
    });
    
    if (!res.ok) return [];
    return res.json() as Promise<WFPlayerAchievement[]>;
  } catch {
    return [];
  }
}

// Получить все достижения игрока с названиями
export async function fetchPlayerAchievementsWithNames(nickname: string): Promise<(WFPlayerAchievement & { name: string })[]> {
  try {
    const [achievements, catalog] = await Promise.all([
      fetchPlayerAchievements(nickname),
      fetchAchievementCatalog(),
    ]);

    // Создаём мапу ID → название
    const catalogMap = new Map(catalog.map(a => [a.id, a.name]));

    // Добавляем названия к достижениям игрока
    return achievements.map(a => ({
      ...a,
      name: catalogMap.get(a.achievement_id) || a.achievement_id,
    }));
  } catch {
    return [];
  }
}

/** classId: 1=Rifleman 2=Medic 3=Sniper 4=Engineer 5=SED (omit = all) */
export async function fetchTop100(classId?: number): Promise<WFTop100Player[]> {
  const q = classId ? `?class=${classId}` : "";
  try {
    // Используем прямой fetch с browser-compatible headers
    const res = await fetch(`http://api.warface.ru/rating/top100${q}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      // Кэшируем на 5 минут
      cache: "force-cache",
      next: { revalidate: 300 },
    });
    
    if (!res.ok) return [];
    return res.json() as Promise<WFTop100Player[]>;
  } catch {
    return [];
  }
}

export async function fetchClanRating(): Promise<WFClanRating[]> {
  try {
    return await wfFetch<WFClanRating[]>("/rating/clan");
  } catch {
    return [];
  }
}

export async function fetchClanInfo(clanName: string): Promise<WFClanInfo | null> {
  try {
    return await wfFetch<WFClanInfo>(`/clan/members?clan=${encodeURIComponent(clanName)}`);
  } catch {
    return null;
  }
}

export async function fetchMissions(): Promise<WFMission[]> {
  try {
    const raw = await wfFetch<WFMission[]>("/game/missions");
    const now = Math.floor(Date.now() / 1000);
    return raw.filter((m) => {
      const exp = parseInt(m.expire_at, 10);
      return isNaN(exp) || exp === 0 || exp > now;
    });
  } catch {
    return [];
  }
}

export async function fetchMonthlyRating(opts: {
  clan?:   string;
  league?: number;
  page?:   number;
} = {}): Promise<WFMonthlyRating[]> {
  const params = new URLSearchParams();
  if (opts.clan)   params.set("clan",   opts.clan);
  if (opts.league) params.set("league", String(opts.league));
  if (opts.page)   params.set("page",   String(opts.page));
  const q = params.toString() ? `?${params}` : "";
  try {
    const isServer = typeof window === 'undefined';
    const url = isServer
      ? `http://api.warface.ru/rating/monthly${q}`
      : `/api/warface?endpoint=/rating/monthly${q}`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];
    return res.json() as Promise<WFMonthlyRating[]>;
  } catch {
    return [];
  }
}

// ─── full_response text parser ────────────────────────────────────────────────
//
// full_response is a text string, one entry per line:
//   <Sum> [class]Rifleman [item_type]ar24_shop [mode] [season] [stat]player_wpn_usage (ts) = 110168
//   <Sum> [class]Medic [item_type]shg72_shop [stat]player_wpn_headshots (ts) = 31
//   <Sum> [stat]player_gained_money (ts) = 9690236

interface FRLine {
  cls?:      string;   // [class] value, undefined if absent
  itemType?: string;   // [item_type] value (may be ""); undefined if tag absent
  mode?:     string;   // [mode] value
  season?:   string;
  clutchType?: string; // [clutch_type] value (1-5)
  stat:      string;
  value:     number;
}

function parseFR(text: string): FRLine[] {
  const lines = text.split("\n");
  const result: FRLine[] = [];
  for (const raw of lines) {
    const statM = raw.match(/\[stat\](\S+)[^=]+=\s*(-?\d+)/);
    if (!statM) continue;
    const cls      = raw.match(/\[class\](\S*)/)?.[1];
    const itemType = raw.match(/\[item_type\](\S*)/)?.[1];
    const mode     = raw.match(/\[mode\](\S*)/)?.[1];
    const season   = raw.match(/\[season\](\S*)/)?.[1];
    const clutchType = raw.match(/\[clutch_type\](\d+)/)?.[1];
    result.push({ cls, itemType, mode, season, clutchType, stat: statM[1], value: parseInt(statM[2], 10) });
  }
  return result;
}

// ─── Extract per-class stats from full_response ────────────────────────────────

function extractClassStats(raw: WFPlayerStat): ClassStat[] {
  if (!raw.full_response) return [];
  const lines = parseFR(raw.full_response);
  const map = new Map<string, ClassStat>();

  const ensure = (cls: string) => {
    if (!map.has(cls)) map.set(cls, { className: cls, kills: 0, shots: 0, hits: 0, headshots: 0, playtimeMs: 0 });
    return map.get(cls)!;
  };

  for (const l of lines) {
    if (!l.cls || l.cls.trim() === "") continue;
    const e = ensure(l.cls);

    // Shots / hits / headshots per class (sum all modes/seasons, non-empty itemType)
    if      (l.stat === "player_shots"     && l.itemType && l.itemType.trim() !== "") { e.shots     += l.value; }
    else if (l.stat === "player_hits"      && l.itemType && l.itemType.trim() !== "") { e.hits      += l.value; }
    else if (l.stat === "player_headshots" && l.itemType && l.itemType.trim() !== "") { e.headshots += l.value; }
    // Playtime per class: player_playtime values are in 0.1-second units → ×100 = ms
    // Only count if itemType is empty or absent
    else if (l.stat === "player_playtime" && (!l.itemType || l.itemType.trim() === "")) { e.playtimeMs += l.value * 100; }
  }

  // Sort by playtime descending (most-played class first)
  return [...map.values()].sort((a, b) => b.playtimeMs - a.playtimeMs);
}

// ─── Extract support stats from full_response ─────────────────────────────────

function extractSupportStats(raw: WFPlayerStat): SupportStats {
  const empty: SupportStats = { healDone: 0, repairDone: 0, ressurectsMade: 0, ammoRestored: 0 };
  if (!raw.full_response) return empty;
  const lines = parseFR(raw.full_response);
  const out = { ...empty };
  for (const l of lines) {
    // Support stats have empty class ([class] ) and no itemType
    const hasNoClass = !l.cls || l.cls.trim() === "";
    const hasNoItem = !l.itemType || l.itemType.trim() === "";
    if (!hasNoClass || !hasNoItem) continue;
    
    if (l.stat === "player_heal")             out.healDone       += l.value;
    else if (l.stat === "player_repair")      out.repairDone     += l.value;
    else if (l.stat === "player_resurrect_made") out.ressurectsMade += l.value;
    else if (l.stat === "player_ammo_restored")  out.ammoRestored   += l.value;
  }
  return out;
}

// ─── Extract per-ranked-season stats ─────────────────────────────────────────

function extractSeasonStats(raw: WFPlayerStat): SeasonStat[] {
  if (!raw.full_response) return [];
  const lines = parseFR(raw.full_response);

  // Support both formats: ranked_season_05 (old) and ranked_season_16 (new)
  const map = new Map<string, SeasonStat>();

  const ensure = (season: string): SeasonStat => {
    if (!map.has(season)) {
      // Extract season number - support both formats
      const numMatch = season.match(/ranked_season_(\d+)/);
      const num = numMatch ? parseInt(numMatch[1], 10).toString() : "?";
      map.set(season, {
        season, label: `Сезон ${num}`, isCurrent: false,
        kills: 0, deaths: 0, wins: 0, losses: 0, draws: 0,
        playtimeMs: 0, shots: 0, hits: 0, headshots: 0,
      });
    }
    return map.get(season)!;
  };

  for (const l of lines) {
    if (!l.season || !/^ranked_season_\d+$/.test(l.season)) continue;
    const e = ensure(l.season);
    if      (l.stat === "player_kills_player")   e.kills      += l.value;
    else if (l.stat === "player_deaths")         e.deaths     += l.value;
    else if (l.stat === "player_sessions_won")   e.wins       += l.value;
    else if (l.stat === "player_sessions_lost")  e.losses     += l.value;
    else if (l.stat === "player_sessions_draw")  e.draws      += l.value;
    else if (l.stat === "player_playtime")       e.playtimeMs += l.value * 100;
    else if (l.stat === "player_shots")          e.shots      += l.value;
    else if (l.stat === "player_hits")           e.hits       += l.value;
    else if (l.stat === "player_headshots")      e.headshots  += l.value;
  }

  const sorted = [...map.values()].sort((a, b) => {
    const na = Number(a.season.match(/\d+/)?.[0] ?? 0);
    const nb = Number(b.season.match(/\d+/)?.[0] ?? 0);
    return nb - na;   // newest first
  });

  // Mark the highest season number as current
  if (sorted.length > 0) sorted[0].isCurrent = true;

  return sorted;
}

// ─── Extract PVE season grade (разряд 1–7) ───────────────────────────────────
//
// Warface PVE seasons are named pve_<mon><yy> (e.g. pve_mar26).
// The full_response includes:
//   <Avg> [mode]PVE [season]pve_mar26 [stat]player_kd_rank = 33
// Grade formula:  grade = ceil(kd_rank * 7 / 100) clamped to [1, 7]
// Verified: player_kd_rank=33 → grade=3, which matches wfts.su "Разряд 3".

function pveSeasonOrder(season: string): number {
  const MONTHS: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  };
  const m = season.match(/^pve_([a-z]+)(\d+)$/);
  if (!m) return 0;
  return parseInt(m[2], 10) * 100 + (MONTHS[m[1]] ?? 0);
}

function extractPveGrade(raw: WFPlayerStat): PveGrade | undefined {
  if (!raw.full_response) return undefined;
  const lines = parseFR(raw.full_response);

  // Collect the kd_rank per PVE season (no item_type, mode=PVE, season=pve_*)
  const bySeaon = new Map<string, number>();
  for (const l of lines) {
    if (!l.season || !/^pve_[a-z]/.test(l.season)) continue;
    if (l.stat !== "player_kd_rank") continue;
    // Check for empty or absent itemType
    const hasNoItem = !l.itemType || l.itemType.trim() === "";
    if (!hasNoItem) continue;
    bySeaon.set(l.season, l.value);
  }
  if (bySeaon.size === 0) return undefined;

  // Pick the most recent season
  const sorted = [...bySeaon.entries()].sort((a, b) => pveSeasonOrder(b[0]) - pveSeasonOrder(a[0]));
  const [season, kdRank] = sorted[0];
  const grade = Math.min(7, Math.max(1, Math.ceil(kdRank * 7 / 100)));
  return { grade, season, kdRank };
}

// ─── Extract session stats (MVP, damage, kill streak, money, time) ────────────────

interface SessionStats {
  sessionMvpCount: number;
  maxKillStreak: number;
  totalDamage: number;
  maxDamage: number;
  gainedMoney: number;
  maxSessionTime: number;
}

function extractSessionStats(raw: WFPlayerStat): SessionStats {
  if (!raw.full_response) {
    return { sessionMvpCount: 0, maxKillStreak: 0, totalDamage: 0, maxDamage: 0, gainedMoney: 0, maxSessionTime: 0 };
  }
  const lines = parseFR(raw.full_response);
  const stats = { sessionMvpCount: 0, maxKillStreak: 0, totalDamage: 0, maxDamage: 0, gainedMoney: 0, maxSessionTime: 0 };

  for (const l of lines) {
    if (l.stat === "player_session_mvp_count") {
      stats.sessionMvpCount += l.value;
    } else if (l.stat === "player_kill_streak") {
      // Use Max for kill_streak (best streak)
      const isMax = l.mode === "" && l.season === "";
      if (isMax) {
        stats.maxKillStreak = Math.max(stats.maxKillStreak, l.value);
      }
    } else if (l.stat === "player_damage") {
      stats.totalDamage += l.value;
    } else if (l.stat === "player_max_damage") {
      stats.maxDamage = Math.max(stats.maxDamage, l.value);
    } else if (l.stat === "player_gained_money") {
      stats.gainedMoney += l.value;
    } else if (l.stat === "player_max_session_time") {
      stats.maxSessionTime = Math.max(stats.maxSessionTime, l.value);
    }
  }
  return stats;
}

// ─── Extract kill type stats ──────────────────────────────────────────────────

interface KillStats {
  killsMelee: number;
  killsClaymore: number;
  killsDevice: number;
  killsAi: number;
  friendlyKillsPvp: number;
}

function extractKillStats(raw: WFPlayerStat): KillStats {
  if (!raw.full_response) {
    return { killsMelee: 0, killsClaymore: 0, killsDevice: 0, killsAi: 0, friendlyKillsPvp: 0 };
  }
  const lines = parseFR(raw.full_response);
  const stats = { killsMelee: 0, killsClaymore: 0, killsDevice: 0, killsAi: 0, friendlyKillsPvp: 0 };
  
  for (const l of lines) {
    const hasNoClass = !l.cls || l.cls.trim() === "";
    const hasNoItem = !l.itemType || l.itemType.trim() === "";
    
    if (l.stat === "player_kills_melee" && hasNoClass && hasNoItem) {
      stats.killsMelee += l.value;
    } else if (l.stat === "player_kills_claymore" && hasNoClass && hasNoItem) {
      stats.killsClaymore += l.value;
    } else if (l.stat === "player_kills_device" && hasNoClass && hasNoItem) {
      stats.killsDevice += l.value;
    } else if (l.stat === "player_kills_ai" && l.mode === "PVE" && hasNoClass && hasNoItem) {
      stats.killsAi += l.value;
    } else if (l.stat === "player_kills_player_friendly" && l.mode === "PVP" && hasNoClass && hasNoItem) {
      stats.friendlyKillsPvp += l.value;
    }
  }
  return stats;
}

// ─── Extract resurrect stats ──────────────────────────────────────────────────

interface ResurrectStats {
  resurrectedByMedic: number;
  resurrectedByCoin: number;
}

function extractResurrectStats(raw: WFPlayerStat): ResurrectStats {
  if (!raw.full_response) {
    return { resurrectedByMedic: 0, resurrectedByCoin: 0 };
  }
  const lines = parseFR(raw.full_response);
  const stats = { resurrectedByMedic: 0, resurrectedByCoin: 0 };
  
  for (const l of lines) {
    const hasNoClass = !l.cls || l.cls.trim() === "";
    const hasNoItem = !l.itemType || l.itemType.trim() === "";
    
    if (l.stat === "player_resurrected_by_medic" && hasNoClass && hasNoItem && l.mode === "PVP") {
      stats.resurrectedByMedic += l.value;
    } else if (l.stat === "player_resurrected_by_coin" && hasNoClass && hasNoItem && l.mode === "PVP") {
      stats.resurrectedByCoin += l.value;
    }
  }
  return stats;
}

// ─── Extract climb stats ──────────────────────────────────────────────────────

interface ClimbStats {
  climbCoops: number;
  climbAssists: number;
}

function extractClimbStats(raw: WFPlayerStat): ClimbStats {
  if (!raw.full_response) {
    return { climbCoops: 0, climbAssists: 0 };
  }
  const lines = parseFR(raw.full_response);
  const stats = { climbCoops: 0, climbAssists: 0 };
  
  for (const l of lines) {
    const hasNoClass = !l.cls || l.cls.trim() === "";
    const hasNoItem = !l.itemType || l.itemType.trim() === "";
    
    if (l.stat === "player_climb_coops" && hasNoClass && hasNoItem && l.mode === "PVP") {
      stats.climbCoops += l.value;
    } else if (l.stat === "player_climb_assists" && hasNoClass && hasNoItem && l.mode === "PVP") {
      stats.climbAssists += l.value;
    }
  }
  return stats;
}

// ─── Extract clutch stats ─────────────────────────────────────────────────────

interface ClutchStats {
  clutch1: number;
  clutch2: number;
  clutch3: number;
  clutch4: number;
  clutch5: number;
}

function extractClutchStats(raw: WFPlayerStat): ClutchStats {
  if (!raw.full_response) {
    return { clutch1: 0, clutch2: 0, clutch3: 0, clutch4: 0, clutch5: 0 };
  }
  const lines = parseFR(raw.full_response);
  const stats = { clutch1: 0, clutch2: 0, clutch3: 0, clutch4: 0, clutch5: 0 };
  
  for (const l of lines) {
    if (l.stat === "player_clutch_success" && l.clutchType) {
      const clutchNum = parseInt(l.clutchType, 10);
      if (clutchNum >= 1 && clutchNum <= 5) {
        stats[`clutch${clutchNum}` as keyof ClutchStats] += l.value;
      }
    }
  }
  return stats;
}

// ─── Extract session end stats ────────────────────────────────────────────────

interface SessionEndStats {
  sessionsLeft: number;
  sessionsKicked: number;
  sessionsLostConnection: number;
}

function extractSessionEndStats(raw: WFPlayerStat): SessionEndStats {
  if (!raw.full_response) {
    return { sessionsLeft: 0, sessionsKicked: 0, sessionsLostConnection: 0 };
  }
  const lines = parseFR(raw.full_response);
  const stats = { sessionsLeft: 0, sessionsKicked: 0, sessionsLostConnection: 0 };
  
  for (const l of lines) {
    const hasNoClass = !l.cls || l.cls.trim() === "";
    const hasNoItem = !l.itemType || l.itemType.trim() === "";
    
    if (l.stat === "player_sessions_left" && hasNoClass && hasNoItem) {
      stats.sessionsLeft += l.value;
    } else if (l.stat === "player_sessions_kicked" && hasNoClass && hasNoItem) {
      stats.sessionsKicked += l.value;
    } else if (l.stat === "player_sessions_lost_connection" && hasNoClass && hasNoItem) {
      stats.sessionsLostConnection += l.value;
    }
  }
  return stats;
}

// ─── Extract online time ──────────────────────────────────────────────────────

function extractOnlineTime(raw: WFPlayerStat): number {
  if (!raw.full_response) return 0;
  const lines = parseFR(raw.full_response);
  
  for (const l of lines) {
    const hasNoClass = !l.cls || l.cls.trim() === "";
    const hasNoItem = !l.itemType || l.itemType.trim() === "";
    
    if (l.stat === "player_online_time" && hasNoClass && hasNoItem && l.mode === "PVP") {
      return l.value; // Already in seconds
    }
  }
  return 0;
}

// ─── Extract weapons from full_response ───────────────────────────────────────

function extractWeapons(raw: WFPlayerStat): NormalizedWeapon[] {
  if (!raw.full_response) return [];
  const lines = parseFR(raw.full_response);

  // ── Maps keyed by "Class:weaponId" ──────────────────────────────────────
  // player_wpn_hits_fatal (no mode/season) = actual kills per weapon
  const fatalMap    = new Map<string, { cls: string; item: string; kills: number }>();
  // player_wpn_usage (mode="" season="")   = shots fired per weapon
  const usageMap    = new Map<string, number>();
  // player_wpn_playtime (0.1-second units → ×100 = ms) = time with weapon equipped
  const playtimeMap = new Map<string, number>();
  // accuracy stats
  const shotsMap    = new Map<string, number>();
  const hitsMap     = new Map<string, number>();
  const hsMap       = new Map<string, number>();

  for (const l of lines) {
    if (!l.cls || l.cls.trim() === "") continue;
    if (!l.itemType || l.itemType.trim() === "") continue;

    // Фильтруем служебные предметы (ремкомплекты, патроны, дефибриллятор, диспенсеры, инструменты)
    const itemType = l.itemType.trim();
    if (
      itemType.startsWith('ak0') ||  // ремкомплекты
      itemType.startsWith('ap0') ||  // патроны
      itemType.startsWith('df') ||   // дефибриллятор
      itemType.startsWith('hp') ||   // HP packs
      itemType.startsWith('av8') ||  // прочее
      itemType.startsWith('dispenser') || // диспенсеры
      itemType.startsWith('ft') ||   // полевые инструменты
      itemType.startsWith('mcg') ||  // прочее
      itemType.startsWith('mk') ||   // прочее
      itemType.startsWith('ms') ||   // прочее
      itemType.startsWith('sak') ||  // прочее
      itemType.startsWith('sap') ||  // прочее
      itemType.startsWith('sb') ||   // прочее
      itemType.startsWith('smk') ||  // прочее
      itemType.startsWith('stg') ||  // прочее
      itemType.startsWith('arl') ||  // прочее
      itemType.startsWith('gwg')     // прочее
    ) continue;

    const key = `${l.cls}:${itemType}`;

    if (l.stat === "player_wpn_hits_fatal" && !l.mode && !l.season) {
      // Actual kills — no mode/season means global total
      const prev = fatalMap.get(key);
      fatalMap.set(key, { cls: l.cls, item: itemType, kills: (prev?.kills ?? 0) + l.value });
    } else if (l.stat === "player_wpn_usage" && l.mode === "" && l.season === "") {
      usageMap.set(key, (usageMap.get(key) ?? 0) + l.value);
    } else if (l.stat === "player_wpn_playtime") {
      // Value is in 0.1-second units, multiply by 100 to get milliseconds
      playtimeMap.set(key, (playtimeMap.get(key) ?? 0) + l.value * 100);
    } else if (l.stat === "player_shots") {
      shotsMap.set(key, (shotsMap.get(key) ?? 0) + l.value);
    } else if (l.stat === "player_hits") {
      hitsMap.set(key, (hitsMap.get(key) ?? 0) + l.value);
    } else if (l.stat === "player_wpn_headshots") {
      hsMap.set(key, (hsMap.get(key) ?? 0) + l.value);
    }
  }

  // ── Build all known weapons (from kills, usage, OR playtime) ─────────────
  const allKeys = new Set([
    ...fatalMap.keys(),
    ...usageMap.keys(),
    ...playtimeMap.keys(),
  ]);

  // Merge per-class entries into per-weapon entries
  const merged = new Map<string, NormalizedWeapon>();

  for (const key of allKeys) {
    const fatal      = fatalMap.get(key);
    const usage      = usageMap.get(key) ?? 0;
    const kills      = fatal?.kills ?? 0;
    const playtimeMs = playtimeMap.get(key) ?? 0;
    const cls        = fatal?.cls ?? key.split(":")[0];
    const item       = fatal?.item ?? key.split(":").slice(1).join(":");

    // Skip entries with no meaningful data
    if (kills === 0 && usage === 0 && playtimeMs === 0) continue;

    const existing = merged.get(item);
    if (!existing) {
      const totalMs  = playtimeMs;
      const totalMin = Math.floor(totalMs / 60_000);
      merged.set(item, {
        weaponId:    item,
        weaponName:  cleanWeaponName(item),
        weaponClass: cls,
        kills,
        usage,
        playtimeMs:  totalMs,
        playtimeH:   Math.floor(totalMin / 60),
        playtimeMin: totalMin % 60,
        shots:       shotsMap.get(key) ?? 0,
        hits:        hitsMap.get(key) ?? 0,
        headshots:   hsMap.get(key) ?? 0,
      });
    } else {
      existing.kills      += kills;
      existing.usage      += usage;
      existing.playtimeMs += playtimeMs;
      existing.shots      += shotsMap.get(key) ?? 0;
      existing.hits       += hitsMap.get(key) ?? 0;
      existing.headshots  += hsMap.get(key) ?? 0;
      // Recompute derived playtime fields
      const totalMin = Math.floor(existing.playtimeMs / 60_000);
      existing.playtimeH   = Math.floor(totalMin / 60);
      existing.playtimeMin = totalMin % 60;
      // Assign class that contributed most kills (or most playtime if no kills)
      if (kills > 0 && kills > (fatalMap.get(`${existing.weaponClass}:${item}`)?.kills ?? 0)) {
        existing.weaponClass = cls;
      } else if (kills === 0 && playtimeMs > (playtimeMap.get(`${existing.weaponClass}:${item}`) ?? 0)) {
        existing.weaponClass = cls;
      }
    }
  }

  // Sort: primary = kills, secondary = playtime, tertiary = usage
  return [...merged.values()]
    .sort((a, b) =>
      b.kills !== a.kills       ? b.kills - a.kills :
      b.playtimeMs !== a.playtimeMs ? b.playtimeMs - a.playtimeMs :
      b.usage - a.usage
    );
}

const WEAPON_NAMES = weaponNamesRaw as Record<string, string>;

export function cleanWeaponName(id: string): string {
  // Strip _shop suffix for lookup
  const bare = id.replace(/_shop$/, "");
  // 1. Exact match
  if (WEAPON_NAMES[bare]) return WEAPON_NAMES[bare];
  // 2. Match with _shop suffix
  if (WEAPON_NAMES[id]) return WEAPON_NAMES[id];
  // 3. Base weapon without skin suffix (e.g. ar04_camo05 → ar04)
  const base = bare.replace(/_[a-z0-9]+$/, "");
  if (base !== bare && WEAPON_NAMES[base]) {
    const skin = bare.slice(base.length + 1).replace(/_/g, " ");
    return `${WEAPON_NAMES[base]} | '${skin}'`;
  }
  // 4. Fallback: formatted ID
  return bare.replace(/_/g, "-").toUpperCase();
}

export function normalizePlayerStat(raw: WFPlayerStat): NormalizedPlayerStats {
  const kd = raw.death > 0 ? raw.kills / raw.death : raw.kills;

  console.log('[Normalize] Начинаем нормализацию для:', raw.nickname);
  console.log('[Normalize] full_response есть:', !!raw.full_response);
  if (raw.full_response) {
    console.log('[Normalize] Длина full_response:', raw.full_response.length);
  }

  // Extract all additional stats
  const sessionStats = extractSessionStats(raw);
  const killStats = extractKillStats(raw);
  const resurrectStats = extractResurrectStats(raw);
  const climbStats = extractClimbStats(raw);
  const clutchStats = extractClutchStats(raw);
  const sessionEndStats = extractSessionEndStats(raw);
  const onlineTime = extractOnlineTime(raw);

  // Extract class stats first to compute PvP playtime
  const classPvpStats = extractClassStats(raw);
  console.log('[Normalize] Классов найдено:', classPvpStats.length);
  if (classPvpStats.length > 0) {
    console.log('[Normalize] Первый класс:', classPvpStats[0]);
  }
  
  const totalPvpMs = classPvpStats.reduce((s, c) => s + c.playtimeMs, 0);
  const pvpPlaytimeH = Math.floor(totalPvpMs / 3_600_000);
  const pvpPlaytimeMin = Math.floor((totalPvpMs % 3_600_000) / 60_000);

  // Compute PvE playtime (total - PvP)
  const totalMs = raw.playtime;
  const totalPveMs = Math.max(0, totalMs - totalPvpMs);
  const pvePlaytimeH = Math.floor(totalPveMs / 3_600_000);
  const pvePlaytimeMin = Math.floor((totalPveMs % 3_600_000) / 60_000);

  console.log('[Normalize] PvP время:', pvpPlaytimeH, 'ч', pvpPlaytimeMin, 'мин');
  console.log('[Normalize] PvE время:', pvePlaytimeH, 'ч', pvePlaytimeMin, 'мин');

  return {
    userId:        raw.user_id,
    nickname:      raw.nickname,
    experience:    raw.experience,
    rankId:        raw.rank_id,
    clanId:        raw.clan_id != null ? String(raw.clan_id) : undefined,
    clanName:      raw.clan_name,
    kills:         raw.kills,
    deaths:        raw.death,
    friendlyKills: raw.friendly_kills,
    pvpWins:       raw.pvp_wins,
    pvpLosses:     raw.pvp_lost,
    pvpDraws:      Math.max(0, raw.pvp_all - raw.pvp_wins - raw.pvp_lost),
    pvpTotal:      raw.pvp_all,
    kdRatio:       parseFloat(kd.toFixed(3)),
    pveKills:         raw.pve_kills,
    pveDeaths:        raw.pve_death,
    pveFriendlyKills: raw.pve_friendly_kills,
    pveWins:          raw.pve_wins,
    pveLosses:     raw.pve_lost,
    pveTotal:      raw.pve_all,
    playtimeH:     raw.playtime_h,
    playtimeMin:   raw.playtime_m,
    pvpPlaytimeH,
    pvpPlaytimeMin,
    pvePlaytimeH,
    pvePlaytimeMin,
    favPvP:        raw.favoritPVP,
    favPvE:        raw.favoritPVE,
    weapons:       extractWeapons(raw),
    classPvpStats,
    supportStats:  extractSupportStats(raw),
    seasonStats:   extractSeasonStats(raw),
    pveGrade:      extractPveGrade(raw),
    lastUpdatedAt: new Date(),
    ...computeGlobalRates(classPvpStats),
    clanRole:      undefined,
    top100:        undefined,
    // Additional stats from full_response
    sessionMvpCount:      sessionStats.sessionMvpCount,
    maxKillStreak:        sessionStats.maxKillStreak,
    totalDamage:          sessionStats.totalDamage,
    maxDamage:            sessionStats.maxDamage,
    gainedMoney:          sessionStats.gainedMoney,
    maxSessionTime:       sessionStats.maxSessionTime,
    // Ratios from API
    pvpKdRatio:           raw.pvp,
    pveKdRatio:           raw.pve,
    pvpWinLossRatio:      raw.pvpwl,
    totalKills:           raw.kill,
    totalPveKills:        raw.pve_kill,
    killsMelee:           killStats.killsMelee,
    killsClaymore:        killStats.killsClaymore,
    killsDevice:          killStats.killsDevice,
    killsAi:              killStats.killsAi,
    friendlyKillsPvp:     killStats.friendlyKillsPvp,
    resurrectedByMedic:   resurrectStats.resurrectedByMedic,
    resurrectedByCoin:    resurrectStats.resurrectedByCoin,
    climbCoops:           climbStats.climbCoops,
    climbAssists:         climbStats.climbAssists,
    clutchSuccess:        clutchStats,
    sessionsLeft:         sessionEndStats.sessionsLeft,
    sessionsKicked:       sessionEndStats.sessionsKicked,
    sessionsLostConnection: sessionEndStats.sessionsLostConnection,
    onlineTimeSec:        onlineTime,
  };
}

function computeGlobalRates(classStats: ClassStat[]): { globalAccuracy: number; globalHsRate: number } {
  const totalShots = classStats.reduce((s, c) => s + c.shots, 0);
  const totalHits  = classStats.reduce((s, c) => s + c.hits,  0);
  const totalHS    = classStats.reduce((s, c) => s + c.headshots, 0);
  return {
    globalAccuracy: totalShots > 0 ? parseFloat(((totalHits / totalShots) * 100).toFixed(2)) : 0,
    globalHsRate:   totalHits  > 0 ? parseFloat(((totalHS   / totalHits)  * 100).toFixed(2)) : 0,
  };
}

// ─── Fetch seasons directly from API (no DB cache) ──────────────────────────

export async function fetchPlayerSeasons(nickname: string): Promise<{
  nickname: string;
  seasons: SeasonStat[];
  fetchedAt: Date;
} | null> {
  try {
    const raw = await wfFetch<WFPlayerStat>(
      `/user/stat/?name=${encodeURIComponent(nickname)}&response=full_response`
    );
    if (!raw?.nickname) return null;
    return {
      nickname: raw.nickname,
      seasons:  extractSeasonStats(raw),
      fetchedAt: new Date(),
    };
  } catch {
    return null;
  }
}

// ─── Weapon Catalog ───────────────────────────────────────────────────────────

export async function fetchWeaponCatalog(): Promise<WFWeaponCatalog[]> {
  try {
    const isServer = typeof window === 'undefined';
    const url = isServer
      ? `http://api.warface.ru/weapon/catalog`
      : `/api/warface?endpoint=/weapon/catalog`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 3600 }, // Кэш на 1 час
    });
    
    if (!res.ok) return [];
    return res.json() as Promise<WFWeaponCatalog[]>;
  } catch {
    return [];
  }
}

// ─── Achievement Catalog ──────────────────────────────────────────────────────

export async function fetchAchievementCatalog(): Promise<WFAchievementCatalog[]> {
  try {
    const isServer = typeof window === 'undefined';
    const url = isServer
      ? `http://api.warface.ru/achievement/catalog`
      : `/api/warface?endpoint=/achievement/catalog`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
      cache: "force-cache",
      next: { revalidate: 3600 }, // Кэш на 1 час
    });
    
    if (!res.ok) return [];
    return res.json() as Promise<WFAchievementCatalog[]>;
  } catch {
    return [];
  }
}
