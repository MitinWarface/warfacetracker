// src/components/SeasonalRewards.tsx
"use client";

import { Trophy, Lock, Check } from "lucide-react";
import type { SeasonalReward } from "@/services/seasonal-rewards.service";
import { cn } from "@/lib/utils";

interface SeasonalRewardsProps {
  rewards: SeasonalReward[];
  summary: {
    currentSeason: string;
    totalWins: number;
    totalLosses: number;
    winRate: number;
    kdRatio: number;
    bestWeapon: string;
  };
}

const TIER_COLORS: Record<string, string> = {
  bronze: "from-amber-900/50 to-amber-700/30 border-amber-500/30",
  silver: "from-gray-700/50 to-gray-500/30 border-gray-400/30",
  gold: "from-yellow-700/50 to-yellow-500/30 border-yellow-400/30",
  platinum: "from-cyan-700/50 to-cyan-500/30 border-cyan-400/30",
  diamond: "from-purple-700/50 to-purple-500/30 border-purple-400/30",
};

export default function SeasonalRewards({ rewards, summary }: SeasonalRewardsProps) {
  return (
    <div className="space-y-6">
      {/* Season Summary */}
      <div className="bg-wf-card border border-wf-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4">
          {summary.currentSeason}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-wf-accent">{summary.totalWins}</p>
            <p className="text-xs text-wf-muted_text">Побед</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-wf-text">{summary.totalLosses}</p>
            <p className="text-xs text-wf-muted_text">Поражений</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{summary.winRate}%</p>
            <p className="text-xs text-wf-muted_text">Win Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-wf-text">{summary.kdRatio.toFixed(2)}</p>
            <p className="text-xs text-wf-muted_text">K/D</p>
          </div>
        </div>
      </div>

      {/* Rewards Track */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-wf-muted_text uppercase flex items-center gap-2">
          <Trophy className="w-4 h-4" /> Награды сезона
        </h3>

        {rewards.map((reward) => (
          <div
            key={reward.tier}
            className={cn(
              "relative overflow-hidden rounded-lg border p-4 bg-gradient-to-r",
              TIER_COLORS[reward.tier],
              reward.isCompleted ? "opacity-100" : "opacity-70"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {reward.isCompleted ? (
                  <Check className="w-6 h-6 text-green-400" />
                ) : (
                  <Lock className="w-5 h-5 text-wf-muted_text" />
                )}
                <div>
                  <h4 className="text-lg font-bold text-white">{reward.name}</h4>
                  <p className="text-xs text-white/70">{reward.reward}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">
                  {reward.currentWins} / {reward.winsRequired}
                </p>
                <p className="text-xs text-white/50">побед</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    reward.tier === "bronze" ? "bg-amber-500" :
                    reward.tier === "silver" ? "bg-gray-400" :
                    reward.tier === "gold" ? "bg-yellow-400" :
                    reward.tier === "platinum" ? "bg-cyan-400" :
                    "bg-purple-400"
                  )}
                  style={{ width: `${reward.progress}%` }}
                />
              </div>
              <p className="text-xs text-white/50 mt-1 text-right">{reward.progress}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
