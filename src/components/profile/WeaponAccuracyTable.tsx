// src/components/profile/WeaponAccuracyTable.tsx
"use client";

import { useState } from "react";
import { Crosshair, TrendingUp, Award } from "lucide-react";
import type { WeaponAccuracyStats } from "@/services/weapon-accuracy.service";
import { cn } from "@/lib/utils";

interface WeaponAccuracyTableProps {
  weapons: WeaponAccuracyStats[];
}

export default function WeaponAccuracyTable({ weapons }: WeaponAccuracyTableProps) {
  const [sortBy, setSortBy] = useState<"kills" | "accuracy" | "kd" | "hs">("kills");

  const sortedWeapons = [...weapons].sort((a, b) => {
    switch (sortBy) {
      case "accuracy": return b.accuracy - a.accuracy;
      case "kd": return b.kdRatio - a.kdRatio;
      case "hs": return b.hsRate - a.hsRate;
      default: return b.kills - a.kills;
    }
  });

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-wf-muted_text uppercase flex items-center gap-2">
          <Crosshair className="w-4 h-4" /> Точность оружия
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("kills")}
            className={cn(
              "px-3 py-1 text-xs rounded border transition-colors",
              sortBy === "kills"
                ? "bg-wf-accent text-black border-wf-accent"
                : "bg-wf-card text-wf-muted_text border-wf-border"
            )}
          >
            Убийства
          </button>
          <button
            onClick={() => setSortBy("accuracy")}
            className={cn(
              "px-3 py-1 text-xs rounded border transition-colors",
              sortBy === "accuracy"
                ? "bg-wf-accent text-black border-wf-accent"
                : "bg-wf-card text-wf-muted_text border-wf-border"
            )}
          >
            Точность
          </button>
          <button
            onClick={() => setSortBy("kd")}
            className={cn(
              "px-3 py-1 text-xs rounded border transition-colors",
              sortBy === "kd"
                ? "bg-wf-accent text-black border-wf-accent"
                : "bg-wf-card text-wf-muted_text border-wf-border"
            )}
          >
            K/D
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-wf-muted/20 border-b border-wf-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Оружие</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase">Убийства</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Точность
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase">
                <Award className="w-3 h-3 inline mr-1" />
                HS
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase">K/D</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase">Выстр/уб</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wf-border">
            {sortedWeapons.slice(0, 50).map((weapon) => (
              <tr key={weapon.weaponId} className="hover:bg-wf-muted/10 transition-colors">
                <td className="px-4 py-3 font-medium text-wf-text">{weapon.weaponName}</td>
                <td className="px-4 py-3 text-right">{weapon.kills.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={weapon.accuracy >= 35 ? "text-green-400 font-bold" : "text-wf-text"}>
                    {weapon.accuracy.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={weapon.hsRate >= 20 ? "text-yellow-400 font-bold" : "text-wf-text"}>
                    {weapon.hsRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={weapon.kdRatio >= 1.5 ? "text-green-400 font-bold" : "text-wf-text"}>
                    {weapon.kdRatio.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-wf-muted_text">
                  {weapon.shotsPerKill.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
