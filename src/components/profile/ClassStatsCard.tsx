// src/components/profile/ClassStatsCard.tsx
"use client";

import { Target, Clock, TrendingUp } from "lucide-react";
import type { DetailedClassStat } from "@/services/class-stats.service";
import { cn } from "@/lib/utils";

const CLASS_RU: Record<string, string> = {
  Rifleman: "Штурмовик",
  Medic: "Медик",
  Sniper: "Снайпер",
  Recon: "Снайпер",
  Engineer: "Инженер",
  SED: "СЗД",
  Heavy: "Тяжёлый",
};

const CLASS_COLORS: Record<string, string> = {
  Rifleman: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  Medic: "text-green-400 border-green-500/30 bg-green-500/10",
  Sniper: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  Recon: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  Engineer: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  SED: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  Heavy: "text-red-400 border-red-500/30 bg-red-500/10",
};

interface ClassStatsCardProps {
  classStats: DetailedClassStat[];
}

export default function ClassStatsCard({ classStats }: ClassStatsCardProps) {
  if (classStats.length === 0) {
    return null;
  }

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4 flex items-center gap-2">
        <Target className="w-4 h-4" /> Детальная статистика по классам
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classStats.map((stat) => {
          const hours = Math.floor(stat.playtimeMs / 3_600_000);
          const accuracy = stat.shots > 0 ? ((stat.hits / stat.shots) * 100).toFixed(1) : "—";
          const hsRate = stat.hits > 0 ? ((stat.headshots / stat.hits) * 100).toFixed(1) : "—";

          return (
            <div
              key={stat.className}
              className={cn("p-4 rounded-lg border", CLASS_COLORS[stat.className])}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold">{CLASS_RU[stat.className] ?? stat.className}</h4>
                <span className="text-xs opacity-70">
                  {hours}ч {Math.floor((stat.playtimeMs % 3_600_000) / 60_000)}м
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="opacity-70">K/D</span>
                  <span className="font-bold">{stat.kdRatio.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-70">Точность</span>
                  <span className="font-bold">{accuracy}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-70">HS</span>
                  <span className="font-bold">{hsRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-70">Убийства</span>
                  <span className="font-bold">{stat.kills.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
