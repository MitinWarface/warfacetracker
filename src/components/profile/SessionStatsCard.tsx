// src/components/profile/SessionStatsCard.tsx
"use client";

import { Trophy, Flame, Zap, Target } from "lucide-react";
import type { NormalizedPlayerStats } from "@/types/warface";

interface SessionStatsCardProps {
  player: NormalizedPlayerStats;
}

export default function SessionStatsCard({ player }: SessionStatsCardProps) {
  const { sessionMvpCount, maxKillStreak, totalDamage, maxDamage } = player;
  const hasStats = sessionMvpCount > 0 || maxKillStreak > 0 || totalDamage > 0 || maxDamage > 0;

  if (!hasStats) {
    return null;
  }

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4">
        Статистика сессий
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-400">
            {sessionMvpCount.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">MVP наград</p>
        </div>
        <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-400">
            {maxKillStreak.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">Лучшая серия</p>
        </div>
        <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <Zap className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-400">
            {totalDamage.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">Общий урон</p>
        </div>
        <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <Target className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-400">
            {maxDamage.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">Макс. урон</p>
        </div>
      </div>
    </div>
  );
}
