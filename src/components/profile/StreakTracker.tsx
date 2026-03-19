// src/components/profile/StreakTracker.tsx
"use client";

import { Flame, TrendingUp, TrendingDown } from "lucide-react";
import type { StreakData } from "@/services/streak-tracker.service";
import { cn } from "@/lib/utils";

interface StreakTrackerProps {
  streaks: StreakData;
}

export default function StreakTracker({ streaks }: StreakTrackerProps) {
  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4 flex items-center gap-2">
        <Flame className="w-4 h-4" /> Серии игр
      </h3>

      {/* Current Streak */}
      <div className={cn(
        "mb-6 p-4 rounded-lg border text-center",
        streaks.currentStreak > 0
          ? "bg-green-500/10 border-green-500/30"
          : streaks.currentStreak < 0
          ? "bg-red-500/10 border-red-500/30"
          : "bg-wf-muted/20 border-wf-border"
      )}>
        <div className="flex items-center justify-center gap-2 mb-2">
          {streaks.currentStreak > 0 ? (
            <TrendingUp className="w-6 h-6 text-green-400" />
          ) : streaks.currentStreak < 0 ? (
            <TrendingDown className="w-6 h-6 text-red-400" />
          ) : (
            <Flame className="w-6 h-6 text-wf-muted_text" />
          )}
        </div>
        <p className="text-3xl font-bold">
          {streaks.currentStreak > 0 ? (
            <span className="text-green-400">+{streaks.currentStreak} побед</span>
          ) : streaks.currentStreak < 0 ? (
            <span className="text-red-400">{streaks.currentStreak} поражений</span>
          ) : (
            <span className="text-wf-muted_text">Нет серии</span>
          )}
        </p>
        <p className="text-sm text-wf-muted_text mt-1">Текущая серия</p>
      </div>

      {/* Best/Worst Streaks */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30 text-center">
          <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-400">{streaks.bestWinStreak}</p>
          <p className="text-xs text-wf-muted_text mt-1">Лучшая серия побед</p>
        </div>
        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30 text-center">
          <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-400">{streaks.worstLossStreak}</p>
          <p className="text-xs text-wf-muted_text mt-1">Худшая серия поражений</p>
        </div>
      </div>

      {/* Last 10 Games */}
      <div>
        <p className="text-sm text-wf-muted_text mb-2">Последние 10 игр</p>
        <div className="flex gap-1 flex-wrap">
          {streaks.last10Games.map((result, i) => (
            <div
              key={i}
              className={cn(
                "w-8 h-8 rounded flex items-center justify-center font-bold text-sm",
                result === "W"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              )}
              title={result === "W" ? "Победа" : "Поражение"}
            >
              {result}
            </div>
          ))}
          {streaks.last10Games.length === 0 && (
            <p className="text-sm text-wf-muted_text">Нет данных</p>
          )}
        </div>
      </div>
    </div>
  );
}
