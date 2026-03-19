// src/services/rank.service.ts
// Maps numeric rank IDs (1–100) to official Russian names.
// Source: https://ru.warface.com/wiki/index.php/Звания

export interface RankInfo {
  id:    number;
  name:  string;
  tier:  RankTier;
  xpMin: number;
  iconPath: string;
}

export type RankTier =
  | "enlisted"   //  1–15   Новобранец → Разведчик
  | "nco"        // 16–30   Сержанты
  | "officer"    // 31–50   Уорент-офицеры, Лейтенанты, Капитаны, Майор, Полковник
  | "general"    // 51–60   Генералы, Маршал, Warface
  | "marshal"    // 61–80   Бессмертные, Владыки Войны
  | "legend";    // 81–100  Вестники Смерти, Стальной Легион

// ─── Rank table ───────────────────────────────────────────────────────────────

const RANK_TABLE: Omit<RankInfo, "iconPath">[] = [
  // ── Enlisted (1–15) ──────────────────────────────────────────────────────
  { id:  1, name: "Новобранец",                    tier: "enlisted", xpMin:         0 },
  { id:  2, name: "Младший рекрут",                tier: "enlisted", xpMin:       500 },
  { id:  3, name: "Рекрут",                        tier: "enlisted", xpMin:     1_500 },
  { id:  4, name: "Старший рекрут",                tier: "enlisted", xpMin:     3_000 },
  { id:  5, name: "Рекрут 1 класса",               tier: "enlisted", xpMin:     5_500 },
  { id:  6, name: "Солдат",                        tier: "enlisted", xpMin:     9_000 },
  { id:  7, name: "Рядовой-рекрут",                tier: "enlisted", xpMin:    13_500 },
  { id:  8, name: "Рядовой 2 класса",              tier: "enlisted", xpMin:    19_000 },
  { id:  9, name: "Рядовой",                       tier: "enlisted", xpMin:    26_000 },
  { id: 10, name: "Рядовой 1 класса",              tier: "enlisted", xpMin:    35_000 },
  { id: 11, name: "Специалист",                    tier: "enlisted", xpMin:    46_500 },
  { id: 12, name: "Старший специалист",             tier: "enlisted", xpMin:    60_000 },
  { id: 13, name: "Техник",                        tier: "enlisted", xpMin:    76_000 },
  { id: 14, name: "Специалист 1 класса",            tier: "enlisted", xpMin:    95_000 },
  { id: 15, name: "Разведчик",                     tier: "enlisted", xpMin:   117_000 },

  // ── NCO — Сержанты (16–30) ───────────────────────────────────────────────
  { id: 16, name: "Младший капрал",                tier: "nco", xpMin:   142_000 },
  { id: 17, name: "Капрал",                        tier: "nco", xpMin:   170_000 },
  { id: 18, name: "Командир звена",                tier: "nco", xpMin:   201_000 },
  { id: 19, name: "Сержант 3 класса",              tier: "nco", xpMin:   236_000 },
  { id: 20, name: "Сержант 2 класса",              tier: "nco", xpMin:   275_000 },
  { id: 21, name: "Сержант",                       tier: "nco", xpMin:   318_000 },
  { id: 22, name: "Штаб-сержант",                  tier: "nco", xpMin:   366_000 },
  { id: 23, name: "Сержант 1 класса",              tier: "nco", xpMin:   420_000 },
  { id: 24, name: "Комендор-сержант",              tier: "nco", xpMin:   480_000 },
  { id: 25, name: "Мастер-сержант",                tier: "nco", xpMin:   546_000 },
  { id: 26, name: "Первый сержант",                tier: "nco", xpMin:   619_000 },
  { id: 27, name: "Команд-сержант",                tier: "nco", xpMin:   700_000 },
  { id: 28, name: "Мастер-комендор-сержант",       tier: "nco", xpMin:   789_000 },
  { id: 29, name: "Сержант-майор",                 tier: "nco", xpMin:   887_000 },
  { id: 30, name: "Команд-сержант-майор",          tier: "nco", xpMin:   994_000 },

  // ── Officer (31–50) ───────────────────────────────────────────────────────
  { id: 31, name: "Младший уорент-офицер",         tier: "officer", xpMin: 1_111_000 },
  { id: 32, name: "Уорент-офицер",                 tier: "officer", xpMin: 1_238_000 },
  { id: 33, name: "Старший уорент-офицер",         tier: "officer", xpMin: 1_376_000 },
  { id: 34, name: "Старший уорент-офицер 1 кл.",  tier: "officer", xpMin: 1_526_000 },
  { id: 35, name: "Мастер-уорент-офицер",          tier: "officer", xpMin: 1_688_000 },
  { id: 36, name: "Квартирмейстер",                tier: "officer", xpMin: 1_863_000 },
  { id: 37, name: "Младший офицер",                tier: "officer", xpMin: 2_051_000 },
  { id: 38, name: "Старший офицер",                tier: "officer", xpMin: 2_253_000 },
  { id: 39, name: "Младший лейтенант",             tier: "officer", xpMin: 2_470_000 },
  { id: 40, name: "Второй лейтенант",              tier: "officer", xpMin: 2_703_000 },
  { id: 41, name: "Первый лейтенант",              tier: "officer", xpMin: 2_952_000 },
  { id: 42, name: "Лейтенант",                     tier: "officer", xpMin: 3_218_000 },
  { id: 43, name: "Ст. лейтенант",                 tier: "officer", xpMin: 3_502_000 },
  { id: 44, name: "Капитан-лейтенант",             tier: "officer", xpMin: 3_804_000 },
  { id: 45, name: "Капитан",                       tier: "officer", xpMin: 4_125_000 },
  { id: 46, name: "Капитан разведки",              tier: "officer", xpMin: 4_466_000 },
  { id: 47, name: "Капитан спецназа",              tier: "officer", xpMin: 4_828_000 },
  { id: 48, name: "Майор",                         tier: "officer", xpMin: 5_212_000 },
  { id: 49, name: "Подполковник",                  tier: "officer", xpMin: 5_619_000 },
  { id: 50, name: "Полковник",                     tier: "officer", xpMin: 6_050_000 },

  // ── General (51–60) ───────────────────────────────────────────────────────
  { id: 51, name: "Бригадный генерал",             tier: "general", xpMin:  6_506_000 },
  { id: 52, name: "Генерал-майор",                 tier: "general", xpMin:  6_988_000 },
  { id: 53, name: "Генерал-лейтенант",             tier: "general", xpMin:  7_497_000 },
  { id: 54, name: "Генерал-полковник",             tier: "general", xpMin:  8_034_000 },
  { id: 55, name: "Генерал",                       tier: "general", xpMin:  8_600_000 },
  { id: 56, name: "Генерал армии",                 tier: "general", xpMin:  9_196_000 },
  { id: 57, name: "Главнокомандующий",             tier: "general", xpMin:  9_823_000 },
  { id: 58, name: "Маршал",                        tier: "general", xpMin: 10_482_000 },
  { id: 59, name: "Верховный главнокомандующий",   tier: "general", xpMin: 11_174_000 },
  { id: 60, name: "Warface",                       tier: "general", xpMin: 11_900_000 },

  // ── Бессмертные (61–70) ───────────────────────────────────────────────────
  { id: 61, name: "Бессмертные: Лейтенант",        tier: "marshal", xpMin: 12_661_000 },
  { id: 62, name: "Бессмертные: Ст. лейтенант",    tier: "marshal", xpMin: 13_458_000 },
  { id: 63, name: "Бессмертные: Капитан",          tier: "marshal", xpMin: 14_293_000 },
  { id: 64, name: "Бессмертные: Майор",            tier: "marshal", xpMin: 15_167_000 },
  { id: 65, name: "Бессмертные: Подполковник",     tier: "marshal", xpMin: 16_081_000 },
  { id: 66, name: "Бессмертные: Полковник",        tier: "marshal", xpMin: 17_037_000 },
  { id: 67, name: "Бессмертные: Генерал-майор",    tier: "marshal", xpMin: 18_037_000 },
  { id: 68, name: "Бессмертные: Генерал-лейт.",    tier: "marshal", xpMin: 19_083_000 },
  { id: 69, name: "Бессмертные: Генерал-полк.",    tier: "marshal", xpMin: 20_177_000 },
  { id: 70, name: "Бессмертные: Маршал",           tier: "marshal", xpMin: 21_321_000 },

  // ── Владыки Войны (71–80) ─────────────────────────────────────────────────
  { id: 71, name: "Владыки Войны: Лейтенант",      tier: "marshal", xpMin: 22_517_000 },
  { id: 72, name: "Владыки Войны: Ст. лейтенант",  tier: "marshal", xpMin: 23_767_000 },
  { id: 73, name: "Владыки Войны: Капитан",        tier: "marshal", xpMin: 25_073_000 },
  { id: 74, name: "Владыки Войны: Майор",          tier: "marshal", xpMin: 26_437_000 },
  { id: 75, name: "Владыки Войны: Подполковник",   tier: "marshal", xpMin: 27_861_000 },
  { id: 76, name: "Владыки Войны: Полковник",      tier: "marshal", xpMin: 29_347_000 },
  { id: 77, name: "Владыки Войны: Генерал-майор",  tier: "marshal", xpMin: 30_897_000 },
  { id: 78, name: "Владыки Войны: Генерал-лейт.",  tier: "marshal", xpMin: 32_514_000 },
  { id: 79, name: "Владыки Войны: Генерал-полк.",  tier: "marshal", xpMin: 34_200_000 },
  { id: 80, name: "Владыки Войны: Маршал",         tier: "marshal", xpMin: 35_957_000 },

  // ── Вестники Смерти (81–90) ───────────────────────────────────────────────
  { id: 81, name: "Вестники Смерти: Лейтенант",    tier: "legend",  xpMin: 37_787_000 },
  { id: 82, name: "Вестники Смерти: Ст. лейтенант",tier: "legend",  xpMin: 39_693_000 },
  { id: 83, name: "Вестники Смерти: Капитан",      tier: "legend",  xpMin: 41_678_000 },
  { id: 84, name: "Вестники Смерти: Майор",        tier: "legend",  xpMin: 43_744_000 },
  { id: 85, name: "Вестники Смерти: Подполковник", tier: "legend",  xpMin: 45_894_000 },
  { id: 86, name: "Вестники Смерти: Полковник",    tier: "legend",  xpMin: 48_131_000 },
  { id: 87, name: "Вестники Смерти: Генерал-майор",tier: "legend",  xpMin: 50_458_000 },
  { id: 88, name: "Вестники Смерти: Генерал-лейт.",tier: "legend",  xpMin: 52_878_000 },
  { id: 89, name: "Вестники Смерти: Генерал-полк.",tier: "legend",  xpMin: 55_394_000 },
  { id: 90, name: "Вестники Смерти: Маршал",       tier: "legend",  xpMin: 58_010_000 },

  // ── Стальной Легион (91–100) ──────────────────────────────────────────────
  { id:  91, name: "Стальной Легион: Лейтенант",   tier: "legend",  xpMin:  60_737_000 },
  { id:  92, name: "Стальной Легион: Ст. лейтенант",tier:"legend",  xpMin:  63_577_000 },
  { id:  93, name: "Стальной Легион: Капитан",     tier: "legend",  xpMin:  66_535_000 },
  { id:  94, name: "Стальной Легион: Майор",       tier: "legend",  xpMin:  69_614_000 },
  { id:  95, name: "Стальной Легион: Подполковник",tier: "legend",  xpMin:  72_817_000 },
  { id:  96, name: "Стальной Легион: Полковник",   tier: "legend",  xpMin:  76_148_000 },
  { id:  97, name: "Стальной Легион: Генерал-майор",tier:"legend",  xpMin:  79_611_000 },
  { id:  98, name: "Стальной Легион: Генерал-лейт.",tier:"legend",  xpMin:  83_209_000 },
  { id:  99, name: "Стальной Легион: Генерал-полк.",tier:"legend",  xpMin:  86_947_000 },
  { id: 100, name: "Стальной Легион: Маршал",      tier: "legend",  xpMin:  90_830_000 },
];

// ─── Lookups ──────────────────────────────────────────────────────────────────

const CDN = "https://cdn.wfts.su/ranks/ranks_all.png";

const rankMap = new Map<number, RankInfo>(
  RANK_TABLE.map((r) => [
    r.id,
    { ...r, iconPath: `${CDN}?v=${r.id}` },
  ])
);

export function getRankInfo(rankId: number): RankInfo {
  return (
    rankMap.get(rankId) ?? {
      id:       rankId,
      name:     `Ранг ${rankId}`,
      tier:     "legend",
      xpMin:    0,
      iconPath: `${CDN}?v=${rankId}`,
    }
  );
}

export function getRankProgressPercent(
  rankId: number,
  currentXp: number
): number {
  const current = rankMap.get(rankId);
  const next    = rankMap.get(rankId + 1);
  if (!current || !next) return 100;

  const range = next.xpMin - current.xpMin;
  const done  = currentXp - current.xpMin;
  if (range <= 0) return 100;
  return Math.min(100, Math.max(0, (done / range) * 100));
}

// Tier color mapping (Tailwind classes)
export const TIER_COLORS: Record<RankTier, string> = {
  enlisted: "text-gray-400",
  nco:      "text-green-400",
  officer:  "text-blue-400",
  general:  "text-purple-400",
  marshal:  "text-wf-accent",
  legend:   "text-red-400",
};

export const TIER_BG: Record<RankTier, string> = {
  enlisted: "bg-gray-800",
  nco:      "bg-green-900/30",
  officer:  "bg-blue-900/30",
  general:  "bg-purple-900/30",
  marshal:  "bg-amber-900/30",
  legend:   "bg-red-900/30",
};
