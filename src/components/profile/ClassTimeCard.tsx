// src/components/profile/ClassTimeCard.tsx
"use client";

import { Clock } from "lucide-react";
import type { ClassStat } from "@/types/warface";
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
  Rifleman: "text-orange-400",
  Medic: "text-green-400",
  Sniper: "text-blue-400",
  Recon: "text-blue-400",
  Engineer: "text-yellow-400",
  SED: "text-purple-400",
  Heavy: "text-red-400",
};

interface ClassTimeCardProps {
  classStats: ClassStat[];
}

export default function ClassTimeCard({ classStats }: ClassTimeCardProps) {
  const totalMs = classStats.reduce((sum, c) => sum + c.playtimeMs, 0);

  if (totalMs === 0 || classStats.length === 0) {
    return null;
  }

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" /> Время по классам
      </h3>
      <div className="space-y-3">
        {[...classStats]
          .sort((a, b) => b.playtimeMs - a.playtimeMs)
          .map((stat) => {
            const pct = totalMs > 0 ? (stat.playtimeMs / totalMs) * 100 : 0;
            const hours = Math.floor(stat.playtimeMs / 3_600_000);
            const minutes = Math.floor((stat.playtimeMs % 3_600_000) / 60_000);

            return (
              <div key={stat.className} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={cn("font-medium", CLASS_COLORS[stat.className])}>
                    {CLASS_RU[stat.className] ?? stat.className}
                  </span>
                  <span className="text-wf-muted_text">
                    {hours > 0 ? `${hours}ч ` : ""}{minutes}м
                    <span className="ml-2 text-xs">({pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-wf-muted/30 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", 
                      stat.className === "Rifleman" ? "bg-orange-500" :
                      stat.className === "Medic" ? "bg-green-500" :
                      stat.className === "Sniper" || stat.className === "Recon" ? "bg-blue-500" :
                      stat.className === "Engineer" ? "bg-yellow-500" :
                      stat.className === "SED" ? "bg-purple-500" :
                      "bg-red-500"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
