// src/services/weapon-accuracy.service.ts
"use server";

import type { NormalizedWeapon } from "@/types/warface";

export interface WeaponAccuracyStats extends NormalizedWeapon {
  accuracy: number;
  hsRate: number;
  kdRatio: number;
  shotsPerKill: number;
}

export async function getWeaponAccuracyStats(weapons: NormalizedWeapon[]): Promise<WeaponAccuracyStats[]> {
  return weapons.map((weapon) => {
    const accuracy = weapon.shots > 0 ? (weapon.hits / weapon.shots) * 100 : 0;
    const hsRate = weapon.hits > 0 ? (weapon.headshots / weapon.hits) * 100 : 0;
    const kdRatio = weapon.kills > 0 ? weapon.kills / Math.max(1, weapon.usage - weapon.kills) : 0;
    const shotsPerKill = weapon.kills > 0 ? weapon.shots / weapon.kills : 0;

    return {
      ...weapon,
      accuracy: Math.round(accuracy * 10) / 10,
      hsRate: Math.round(hsRate * 10) / 10,
      kdRatio: Math.round(kdRatio * 100) / 100,
      shotsPerKill: Math.round(shotsPerKill * 10) / 10,
    };
  });
}

export async function getBestWeapons(weapons: WeaponAccuracyStats[], limit: number = 5): Promise<WeaponAccuracyStats[]> {
  return [...weapons]
    .filter(w => w.kills > 10) // Минимум 10 убийств
    .sort((a, b) => b.kdRatio - a.kdRatio)
    .slice(0, limit);
}

export async function getWorstWeapons(weapons: WeaponAccuracyStats[], limit: number = 5): Promise<WeaponAccuracyStats[]> {
  return [...weapons]
    .filter(w => w.kills > 10)
    .sort((a, b) => a.kdRatio - b.kdRatio)
    .slice(0, limit);
}

export async function getMostAccurateWeapons(weapons: WeaponAccuracyStats[], limit: number = 5): Promise<WeaponAccuracyStats[]> {
  return [...weapons]
    .filter(w => w.shots > 100) // Минимум 100 выстрелов
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, limit);
}
