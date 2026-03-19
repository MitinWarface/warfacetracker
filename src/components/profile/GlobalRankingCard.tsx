// src/components/profile/GlobalRankingCard.tsx
"use client";

import { Trophy, Globe, Award } from "lucide-react";
import type { GlobalRanking } from "@/services/global-ranking.service";
import { cn } from "@/lib/utils";

interface GlobalRankingCardProps {
  ranking: GlobalRanking;
}

export default function GlobalRankingCard({ ranking }: GlobalRankingCardProps) {
  const getPercentileColor = (percentile: number) => {
    if (percentile >= 99) return "text-yellow-400";
    if (percentile >= 95) return "text-orange-400";
    if (percentile >= 90) return "text-green-400";
    if (percentile >= 75) return "text-blue-400";
    if (percentile >= 50) return "text-wf-text";
    return "text-wf-muted_text";
  };

  const getRankingBar = (percentile: number) => (
    <div className="h-2 bg-wf-muted/30 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all",
          percentile >= 99 ? "bg-yellow-400" :
          percentile >= 95 ? "bg-orange-400" :
          percentile >= 90 ? "bg-green-400" :
          percentile >= 75 ? "bg-blue-400" :
          "bg-wf-accent"
        )}
        style={{ width: `${percentile}%` }}
      />
    </div>
  );

  const StatRow = ({ label, percentile, rank }: { label: string; percentile: number; rank: number }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-wf-muted_text">{label}</span>
        <span className={cn("font-bold", getPercentileColor(percentile))}>
          Топ {100 - percentile}%
        </span>
      </div>
      {getRankingBar(percentile)}
      <p className="text-xs text-wf-muted_text text-right">
        #{rank.toLocaleString()} глобально
      </p>
    </div>
  );

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4 flex items-center gap-2">
        <Globe className="w-4 h-4" /> Глобальный рейтинг
      </h3>

      {/* Overall */}
      <div className="mb-6 p-4 bg-gradient-to-r from-wf-accent/20 to-purple-500/20 rounded-lg border border-wf-accent/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-wf-muted_text">Общий рейтинг</span>
          <Award className="w-5 h-5 text-wf-accent" />
        </div>
        <p className={cn("text-3xl font-bold", getPercentileColor(ranking.overall.percentile))}>
          Топ {100 - ranking.overall.percentile}%
        </p>
        <p className="text-sm text-wf-muted_text mt-1">
          #{ranking.overall.rank.toLocaleString()} из ~100,000 игроков
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        <StatRow
          label="K/D Ratio"
          percentile={ranking.kdRatio.percentile}
          rank={ranking.kdRatio.rank}
        />
        <StatRow
          label="Точность"
          percentile={ranking.accuracy.percentile}
          rank={ranking.accuracy.rank}
        />
        <StatRow
          label="Win Rate"
          percentile={ranking.winRate.percentile}
          rank={ranking.winRate.rank}
        />
        <StatRow
          label="Время в игре"
          percentile={ranking.playtime.percentile}
          rank={ranking.playtime.rank}
        />
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-wf-border/40">
        <div className="flex items-center justify-between text-xs text-wf-muted_text">
          <span>👑 Топ 1%</span>
          <span>🏆 Топ 5%</span>
          <span>⭐ Топ 10%</span>
          <span>🎯 Топ 25%</span>
        </div>
      </div>
    </div>
  );
}
