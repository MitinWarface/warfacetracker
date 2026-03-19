// src/components/profile/BestWorstWeapons.tsx
"use client";

import { Trophy, Award, TrendingUp, TrendingDown } from "lucide-react";
import type { WeaponAccuracyStats } from "@/services/weapon-accuracy.service";

interface BestWorstWeaponsProps {
  weapons: WeaponAccuracyStats[];
}

export default function BestWorstWeapons({ weapons }: BestWorstWeaponsProps) {
  const best = weapons
    .filter(w => w.kills >= 50)
    .sort((a, b) => b.kdRatio - a.kdRatio)
    .slice(0, 5);

  const worst = weapons
    .filter(w => w.kills >= 50)
    .sort((a, b) => a.kdRatio - b.kdRatio)
    .slice(0, 5);

  const mostAccurate = weapons
    .filter(w => w.shots >= 500)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Best K/D */}
      <div className="bg-wf-card border border-wf-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" /> Лучшее (K/D)
        </h3>
        <div className="space-y-3">
          {best.map((weapon, i) => (
            <div key={weapon.weaponId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-wf-muted_text w-4">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <span className="text-sm text-wf-text">{weapon.weaponName}</span>
              </div>
              <span className="text-sm font-bold text-green-400">{weapon.kdRatio.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Most Accurate */}
      <div className="bg-wf-card border border-wf-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-400" /> Точное
        </h3>
        <div className="space-y-3">
          {mostAccurate.map((weapon, i) => (
            <div key={weapon.weaponId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-wf-muted_text w-4">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <span className="text-sm text-wf-text">{weapon.weaponName}</span>
              </div>
              <span className="text-sm font-bold text-yellow-400">{weapon.accuracy.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Worst K/D */}
      <div className="bg-wf-card border border-wf-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-400" /> Худшее (K/D)
        </h3>
        <div className="space-y-3">
          {worst.map((weapon, i) => (
            <div key={weapon.weaponId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-wf-muted_text w-4">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <span className="text-sm text-wf-text">{weapon.weaponName}</span>
              </div>
              <span className="text-sm font-bold text-red-400">{weapon.kdRatio.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
