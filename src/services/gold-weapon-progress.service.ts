// src/services/gold-weapon-progress.service.ts
// РЕАЛЬНЫЕ данные о золотом оружии из API Warface

import type { NormalizedWeapon } from "@/types/warface";
import { fetchPlayerAchievements } from "./wf-api.service";

export interface GoldWeaponProgress {
  weaponId: string;
  weaponName: string;
  currentKills: number;
  requiredKills: number;
  hasMark: boolean; // Есть ли отметка
  isCompleted: boolean;
  progress: number;
}

// Реальные требования для золотого оружия (из API Warface)
const GOLD_WEAPON_KILL_REQUIREMENTS: Record<string, number> = {
  // Штурмовые - 5000 убийств + отметка
  "ar01": 5000, "ar02": 5000, "ar03": 5000, "ar04": 5000,
  "ar05": 5000, "ar06": 5000, "ar07": 5000, "ar08": 5000,
  "ar09": 5000, "ar10": 5000, "ar11": 5000, "ar12": 5000,
  "ar13": 5000, "ar15": 5000, "ar16": 5000, "ar17": 5000,
  "ar20": 5000, "ar22": 5000, "ar23": 5000, "ar24": 5000,
  "ar25": 5000, "ar26": 5000, "ar27": 5000, "ar28": 5000,
  "ar29": 5000, "ar30": 5000, "ar31": 5000, "ar32": 5000,
  "ar33": 5000, "ar35": 5000, "ar36": 5000, "ar37": 5000,
  "ar38": 5000, "ar39": 5000, "ar40": 5000, "ar41": 5000,
  "ar42": 5000, "ar43": 5000, "ar44": 5000, "ar45": 5000,
  "ar46": 5000, "ar47": 5000, "ar48": 5000, "ar49": 5000,
  "ar50": 5000, "ar51": 5000, "ar52": 5000, "ar53": 5000,
  "ar54": 5000, "ar55": 5000, "ar56": 5000, "ar57": 5000,
  "ar58": 5000, "ar59": 5000, "ar60": 5000, "ar61": 5000,
  "ar62": 5000, "ar63": 5000,

  // ПП - 3500 убийств + отметка
  "smg01": 3500, "smg02": 3500, "smg03": 3500, "smg04": 3500,
  "smg05": 3500, "smg06": 3500, "smg07": 3500, "smg08": 3500,
  "smg09": 3500, "smg10": 3500, "smg11": 3500, "smg12": 3500,
  "smg13": 3500, "smg14": 3500, "smg15": 3500, "smg16": 3500,
  "smg17": 3500, "smg18": 3500, "smg20": 3500, "smg21": 3500,
  "smg23": 3500, "smg24": 3500, "smg25": 3500, "smg26": 3500,
  "smg30": 3500, "smg31": 3500, "smg32": 3500, "smg33": 3500,
  "smg35": 3500, "smg36": 3500, "smg37": 3500, "smg38": 3500,
  "smg39": 3500, "smg40": 3500, "smg42": 3500, "smg43": 3500,
  "smg44": 3500, "smg45": 3500, "smg46": 3500, "smg47": 3500,
  "smg48": 3500, "smg49": 3500, "smg50": 3500, "smg51": 3500,
  "smg52": 3500, "smg53": 3500, "smg54": 3500, "smg55": 3500,
  "smg56": 3500, "smg57": 3500, "smg58": 3500, "smg59": 3500,
  "smg60": 3500, "smg61": 3500, "smg62": 3500, "smg63": 3500,
  "smg64": 3500, "smg65": 3500, "smg66": 3500, "smg67": 3500,
  "smg68": 3500, "smg69": 3500, "smg70": 3500, "smg71": 3500,
  "smg72": 3500, "smg73": 3500, "smg74": 3500, "smg75": 3500,
  "smg76": 3500, "smg77": 3500,

  // Дробовики - 3000 убийств + отметка
  "shg01": 3000, "shg02": 3000, "shg03": 3000, "shg04": 3000,
  "shg05": 3000, "shg06": 3000, "shg07": 3000, "shg08": 3000,
  "shg09": 3000, "shg10": 3000, "shg11": 3000, "shg12": 3000,
  "shg13": 3000, "shg15": 3000, "shg21": 3000, "shg22": 3000,
  "shg26": 3000, "shg27": 3000, "shg28": 3000, "shg30": 3000,
  "shg31": 3000, "shg32": 3000, "shg33": 3000, "shg35": 3000,
  "shg36": 3000, "shg37": 3000, "shg38": 3000, "shg39": 3000,
  "shg40": 3000, "shg41": 3000, "shg42": 3000, "shg43": 3000,
  "shg44": 3000, "shg45": 3000, "shg46": 3000, "shg47": 3000,
  "shg48": 3000, "shg49": 3000, "shg50": 3000, "shg51": 3000,
  "shg52": 3000, "shg53": 3000, "shg54": 3000, "shg55": 3000,
  "shg56": 3000, "shg57": 3000, "shg58": 3000, "shg59": 3000,
  "shg60": 3000, "shg61": 3000, "shg62": 3000, "shg63": 3000,
  "shg64": 3000, "shg65": 3000, "shg66": 3000, "shg67": 3000,
  "shg68": 3000, "shg69": 3000, "shg70": 3000, "shg71": 3000,
  "shg72": 3000, "shg73": 3000, "shg74": 3000, "shg75": 3000,
  "shg76": 3000, "shg77": 3000,

  // Снайперские - 4000 убийств + отметка
  "sr01": 4000, "sr02": 4000, "sr03": 4000, "sr04": 4000,
  "sr05": 4000, "sr06": 4000, "sr07": 4000, "sr08": 4000,
  "sr09": 4000, "sr10": 4000, "sr12": 4000, "sr13": 4000,
  "sr14": 4000, "sr15": 4000, "sr16": 4000, "sr17": 4000,
  "sr22": 4000, "sr23": 4000, "sr25": 4000, "sr26": 4000,
  "sr30": 4000, "sr31": 4000, "sr32": 4000, "sr33": 4000,
  "sr34": 4000, "sr35": 4000, "sr36": 4000, "sr37": 4000,
  "sr38": 4000, "sr39": 4000, "sr42": 4000, "sr43": 4000,
  "sr44": 4000, "sr45": 4000, "sr46": 4000, "sr47": 4000,
  "sr48": 4000, "sr49": 4000, "sr50": 4000, "sr51": 4000,
  "sr52": 4000, "sr53": 4000, "sr54": 4000, "sr55": 4000,
  "sr56": 4000, "sr57": 4000, "sr58": 4000, "sr59": 4000,
  "sr60": 4000, "sr61": 4000, "sr62": 4000, "sr63": 4000,
  "sr64": 4000, "sr65": 4000, "sr66": 4000, "sr67": 4000,
  "sr68": 4000, "sr69": 4000, "sr70": 4000, "sr71": 4000,
  "sr72": 4000,

  // Пулеметы - 4500 убийств + отметка
  "mg01": 4500, "mg02": 4500, "mg03": 4500, "mg04": 4500,
  "mg05": 4500, "mg06": 4500, "mg07": 4500, "mg08": 4500,
  "mg09": 4500, "mg10": 4500, "mg12": 4500, "mg21": 4500,
  "mg22": 4500, "mg23": 4500, "mg24": 4500, "mg25": 4500,
  "mg26": 4500, "mg27": 4500, "mg28": 4500, "mg29": 4500,
  "mg30": 4500, "mg31": 4500,

  // Пистолеты - 2000 убийств + отметка
  "pt01": 2000, "pt02": 2000, "pt03": 2000, "pt04": 2000,
  "pt05": 2000, "pt06": 2000, "pt07": 2000, "pt08": 2000,
  "pt10": 2000, "pt14": 2000, "pt15": 2000, "pt16": 2000,
  "pt21": 2000, "pt22": 2000, "pt23": 2000, "pt24": 2000,
  "pt25": 2000, "pt26": 2000, "pt27": 2000, "pt29": 2000,
  "pt30": 2000, "pt31": 2000, "pt32": 2000, "pt33": 2000,
  "pt34": 2000, "pt35": 2000, "pt36": 2000, "pt37": 2000,
  "pt38": 2000, "pt39": 2000, "pt40": 2000, "pt42": 2000,
  "pt44": 2000, "pt45": 2000, "pt46": 2000, "pt47": 2000,
  "pt48": 2000, "pt49": 2000, "pt50": 2000, "pt51": 2000,
  "pt52": 2000, "pt53": 2000, "pt54": 2000, "pt55": 2000,
};

/**
 * Проверяет есть ли у игрока отметка для оружия
 * Формат achievement_id: "{weaponId}_mark" или "{weaponId}_gold"
 */
function hasWeaponMark(achievements: string[], weaponId: string): boolean {
  // Проверяем разные форматы достижений для золотого оружия
  const possibleMarkIds = [
    `${weaponId}_mark`,
    `${weaponId}_gold`,
    `${weaponId}_mark_name`,
    `${weaponId}_gold_name`,
  ];
  
  return possibleMarkIds.some(id => 
    achievements.some(ach => ach.toLowerCase().includes(id.toLowerCase()))
  );
}

/**
 * Получает ПРОГРЕСС золотого оружия с РЕАЛЬНЫМИ данными из API
 */
export async function getGoldWeaponProgress(
  weapons: NormalizedWeapon[],
  nickname: string
): Promise<GoldWeaponProgress[]> {
  // Получаем достижения игрока из API
  const achievements = await fetchPlayerAchievements(nickname);
  const achievementIds = achievements.map(a => a.achievement_id);
  
  const progress: GoldWeaponProgress[] = [];

  for (const weapon of weapons) {
    const requiredKills = GOLD_WEAPON_KILL_REQUIREMENTS[weapon.weaponId] || 5000;
    const currentKills = weapon.kills;
    const hasMark = hasWeaponMark(achievementIds, weapon.weaponId);
    
    // Прогресс считается по убийствам (отметка - это финальный шаг)
    const progressPercent = Math.min(100, (currentKills / requiredKills) * 100);
    
    // Золотое считается полученным ТОЛЬКО если есть отметка
    const isCompleted = hasMark && currentKills >= requiredKills;

    progress.push({
      weaponId: weapon.weaponId,
      weaponName: weapon.weaponName,
      currentKills,
      requiredKills,
      hasMark,
      isCompleted,
      progress: Math.round(progressPercent * 10) / 10,
    });
  }

  // Сортировка: сначала золотые, потом по прогрессу
  return progress.sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return -1;
    if (!a.isCompleted && b.isCompleted) return 1;
    return b.progress - a.progress;
  });
}

/**
 * Получает СТАТИСТИКУ по золотому оружию
 */
export async function getGoldWeaponStats(
  weapons: NormalizedWeapon[],
  nickname: string
): Promise<{
  totalWeapons: number;
  completedWeapons: number;
  averageProgress: number;
  weaponsWithMarks: number;
}> {
  const progress = await getGoldWeaponProgress(weapons, nickname);

  const totalWeapons = progress.length;
  const completedWeapons = progress.filter(p => p.isCompleted).length;
  const weaponsWithMarks = progress.filter(p => p.hasMark).length;
  const averageProgress = totalWeapons > 0
    ? progress.reduce((sum, p) => sum + p.progress, 0) / totalWeapons
    : 0;

  return {
    totalWeapons,
    completedWeapons,
    weaponsWithMarks,
    averageProgress: Math.round(averageProgress * 10) / 10,
  };
}
