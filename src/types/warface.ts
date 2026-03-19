// src/types/warface.ts
// Exact shapes returned by http://api.warface.ru/

// ─── /user/stat/?name=NAME ────────────────────────────────────────────────────

export interface WFPlayerStat {
  user_id:            string;
  nickname:           string;
  experience:         number;
  rank_id:            number;
  clan_id?:           string;
  clan_name?:         string;
  // PvP
  kill:               number;   // total kills (PvP + PvE)
  kills:              number;   // PvP kills
  death:              number;
  friendly_kills:     number;
  pvp:                number;   // PvP K/D ratio from API
  pvp_wins:           number;
  pvp_lost:           number;
  pvp_all:            number;
  pvpwl:              number;   // win/loss ratio
  // PvE
  pve_kill:           number;   // total PvE kills
  pve_kills:          number;   // PvE kills (player)
  pve_death:          number;
  pve_friendly_kills: number;
  pve:                number;   // PvE K/D ratio from API
  pve_wins:           number;
  pve_lost:           number;
  pve_all:            number;
  // Playtime
  playtime:           number;   // milliseconds
  playtime_h:         number;   // hours
  playtime_m:         number;   // minutes remainder
  // Favourite class
  favoritPVP:         string;   // e.g. "Recon"
  favoritPVE:         string;
  // Weapon stats as text lines: "<Sum> [class]X [item_type]Y [stat]Z (ts) = N"
  full_response?: string;
}

// ─── /rating/top100?class=CLASS ───────────────────────────────────────────────

export interface WFTop100Player {
  nickname: string;
  clan:     string;   // "-" if none
  class:    string;   // "1"–"5" (Assault/Medic/Sniper/Engineer/SED)
  shard:    string;
}

// class ID → display name
export const WF_CLASS_NAMES: Record<string, string> = {
  "1": "Rifleman",
  "2": "Medic",
  "3": "Sniper",
  "4": "Engineer",
  "5": "SED",
};

// ─── /rating/clan ─────────────────────────────────────────────────────────────

export interface WFClanRating {
  clan:        string;
  clan_leader: string;
  members:     string;   // number as string
  points:      string;   // number as string
  rank:        string;
  rank_change?: string;  // изменение позиции ("-" или "+N"/"-N")
}

// ─── /clan/members?clan=NAME ──────────────────────────────────────────────────

export interface WFClanMember {
  nickname:    string;
  rank_id:     string;
  clan_points: string;
  clan_role:   "REGULAR" | "OFFICER" | "MASTER";
}

export interface WFClanInfo {
  id:      string;
  name:    string;
  members: WFClanMember[];
}

// ─── /game/missions ───────────────────────────────────────────────────────────

export interface WFMission {
  name:                 string;   // localization key
  difficulty:           string;   // story, easy, normal, hard
  mission_type:         string;
  game_mode:            string;
  tutorial_mission:     string;   // "0" | "1"
  is_special_operation: string;   // "0" | "1"
  is_infinity_survival: string;   // "0" | "1"
  expire_at:            string;   // unix timestamp
  group?:               string;   // mission group (e.g., "whiteshark", "zombie")
  full?:                string;   // availability status
  UI?: {
    Description?: {
      text?: string;
      icon?: string;
    };
    GameMode?: {
      text?: string;
      icon?: string;
      task?: string;
    };
  };
}

// ─── /user/achievements/?name=NAME ───────────────────────────────────────────

export interface WFPlayerAchievement {
  achievement_id:  string;
  progress:        string;
  completion_time: string;   // "YYYY-MM-DD HH:MM:SS"
}

// ─── /weapon/catalog ──────────────────────────────────────────────────────────

export interface WFWeaponCatalog {
  id:   string;   // weapon ID (e.g., "ar04", "shg72_shop")
  name: string;   // Russian name
}

// ─── /achievement/catalog ─────────────────────────────────────────────────────

export interface WFAchievementCatalog {
  id:   string;   // achievement ID
  name: string;   // Russian name
}

// ─── /rating/monthly ──────────────────────────────────────────────────────────
// NOTE: Это рейтинг КЛАНОВ, не игроков!

export interface WFMonthlyRating {
  clan:         string;   // клан name
  clan_leader:  string;   // лидер клана
  members:      string;   // количество участников
  points:       string;   // очки клана
  rank:         string;   // позиция в рейтинге
  rank_change:  string;   // изменение позиции ("-" или "+N"/"-N")
}

// ─── Additional types from Wiki Parser ────────────────────────────────────────

export interface WikiWeaponInfo {
  name: string;
  description?: string;
  damage?: number;
  accuracy?: number;
  range?: number;
  fireRate?: number;
  imageUrl?: string;
}

export interface WikiAchievementInfo {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface WikiBadge {
  id: string;
  name: string;
  imageUrl: string;
}

export interface WikiMark {
  id: string;
  name: string;
  imageUrl: string;
}

export interface WikiStripe {
  id: string;
  name: string;
  imageUrl: string;
}

// ─── Internal normalized types ────────────────────────────────────────────────

export interface NormalizedPlayerStats {
  userId:        string;
  nickname:      string;
  experience:    number;
  rankId:        number;
  clanId?:       string;
  clanName?:     string;
  // PvP
  kills:         number;
  deaths:        number;
  friendlyKills: number;
  pvpWins:       number;
  pvpLosses:     number;
  pvpDraws:      number;
  pvpTotal:      number;
  kdRatio:       number;
  // PvE
  pveKills:         number;
  pveDeaths:        number;
  pveFriendlyKills: number;
  pveWins:          number;
  pveLosses:        number;
  pveTotal:         number;
  // Time
  playtimeH:     number;
  playtimeMin:   number;
  // PvP time (derived from classPvpStats)
  pvpPlaytimeH:  number;
  pvpPlaytimeMin: number;
  // PvE time (derived from total - pvp)
  pvePlaytimeH:  number;
  pvePlaytimeMin: number;
  // Classes
  favPvP:        string;
  favPvE:        string;
  // Weapons (top kills extracted from full_response)
  weapons:       NormalizedWeapon[];
  // Per-class breakdown extracted from full_response
  classPvpStats: ClassStat[];
  // Support stats (medic/engineer utility)
  supportStats:  SupportStats;
  // Per ranked-season history
  seasonStats:   SeasonStat[];
  // PVE season grade (разряд 1–7, derived from current PVE season kd_rank)
  pveGrade?:     PveGrade;
  // When this snapshot was last fetched from the API
  lastUpdatedAt: Date;
  // Global accuracy & headshot rate derived from classPvpStats
  globalAccuracy:   number;   // 0–100
  globalHsRate:     number;   // 0–100
  // Clan role & points (fetched separately)
  clanRole?:        "REGULAR" | "OFFICER" | "MASTER";
  clanPoints?:      number;
  // Top-100 position per class (if ranked)
  top100?:          { classId: number; className: string; position: number };
  // Additional stats from full_response
  // Session stats
  sessionMvpCount:      number;
  maxKillStreak:        number;
  totalDamage:          number;
  maxDamage:            number;
  // Kill types
  killsMelee:           number;
  killsClaymore:        number;
  killsDevice:          number;
  killsAi:              number;
  friendlyKillsPvp:     number;
  // Resurrect stats
  resurrectedByMedic:   number;
  resurrectedByCoin:    number;
  // Climb stats
  climbCoops:           number;
  climbAssists:         number;
  // Clutch stats (1v1, 1v2, 1v3, 1v4, 1v5)
  clutchSuccess:        { clutch1: number; clutch2: number; clutch3: number; clutch4: number; clutch5: number };
  // Session end stats
  sessionsLeft:         number;
  sessionsKicked:       number;
  sessionsLostConnection: number;
  // Online time in seconds
  onlineTimeSec:        number;
  // Additional stats from full_response
  gainedMoney:          number;   // player_gained_money
  maxSessionTime:       number;   // player_max_session_time (seconds)
  // Ratios from API
  pvpKdRatio:           number;   // PvP K/D from API (pvp field)
  pveKdRatio:           number;   // PvE K/D from API (pve field)
  pvpWinLossRatio:      number;   // PvP W/L from API (pvpwl field)
  totalKills:           number;   // Total kills (PvP + PvE) from API (kill field)
  totalPveKills:        number;   // Total PvE kills from API (pve_kill field)
}

export interface SupportStats {
  healDone:       number;   // player_heal  — ОЗ восстановлено
  repairDone:     number;   // player_repair — ОБ восстановлено
  ressurectsMade: number;   // player_resurrect_made — Реанимировано
  ammoRestored:   number;   // player_ammo_restored — Выдано аптечек
}

export interface SeasonStat {
  season:      string;   // e.g. "ranked_season_16"
  label:       string;   // e.g. "Сезон 16"
  isCurrent:   boolean;
  kills:       number;   // player_kills_player
  deaths:      number;
  wins:        number;   // player_sessions_won
  losses:      number;   // player_sessions_lost
  draws:       number;   // player_sessions_draw
  playtimeMs:  number;   // converted from 0.1s units
  shots:       number;
  hits:        number;
  headshots:   number;
}

export interface SessionDelta {
  date:    Date;
  kills:   number;   // delta vs previous snapshot
  deaths:  number;
  wins:    number;
  losses:  number;
  xpGain:  number;
}

export interface PveGrade {
  grade:  number;   // 1–7, 1 = best (derived from player_kd_rank percentile)
  season: string;   // e.g. "pve_mar26"
  kdRank: number;   // raw player_kd_rank value from full_response
}

export interface NormalizedWeapon {
  weaponId:    string;   // raw key e.g. "ar04_shop"
  weaponName:  string;   // cleaned display name
  weaponClass: string;   // "Recon" | "Medic" | "Rifleman" | "Engineer" | "SED"
  kills:       number;   // player_wpn_hits_fatal — actual kills with this weapon
  usage:       number;   // player_wpn_usage     — shots fired (ammo spent)
  playtimeMs:  number;
  playtimeH:   number;
  playtimeMin: number;
  shots:       number;   // player_shots per weapon (for accuracy calc)
  hits:        number;   // player_hits  per weapon
  headshots:   number;   // player_wpn_headshots
}

export interface ClassStat {
  className:  string;   // "Rifleman" | "Medic" | "Sniper" | "Recon" | "Engineer" | "SED"
  kills:      number;
  shots:      number;
  hits:       number;
  headshots:  number;
  playtimeMs: number;   // from player_playtime in full_response (value is already in 0.1s units, ×100 = ms)
}
