// src/components/profile/SeasonComparison.tsx
"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SeasonComparison } from "@/services/season-comparison.service";
import { cn } from "@/lib/utils";

interface SeasonComparisonProps {
  comparison: SeasonComparison;
}

export default function SeasonComparison({ comparison }: SeasonComparisonProps) {
  if (!comparison.current || !comparison.previous) {
    return (
      <div className="text-center py-12 text-wf-muted_text">
        Недостаточно данных для сравнения сезонов
      </div>
    );
  }

  const ChangeIndicator = ({ value, percent, improved }: { value: number; percent: number; improved: boolean }) => (
    <div className={cn("flex items-center gap-1 font-bold", improved ? "text-green-400" : "text-red-400")}>
      {improved ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      )}
      <span>{value > 0 ? "+" : ""}{value.toFixed(2)}</span>
      <span className="text-xs">({percent}%)</span>
    </div>
  );

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4">
        Сравнение с прошлым сезоном
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-wf-muted/20 rounded-lg">
          <p className="text-xs text-wf-muted_text mb-1">Прошлый сезон</p>
          <p className="text-lg font-bold text-wf-text">{comparison.previous.label}</p>
          <p className="text-sm text-wf-muted_text mt-2">
            K/D: {comparison.previous.deaths > 0 
              ? (comparison.previous.kills / comparison.previous.deaths).toFixed(2)
              : comparison.previous.kills}
          </p>
        </div>
        <div className="text-center p-4 bg-wf-accent/10 rounded-lg border border-wf-accent/30">
          <p className="text-xs text-wf-muted_text mb-1">Текущий сезон</p>
          <p className="text-lg font-bold text-wf-accent">{comparison.current.label}</p>
          <p className="text-sm text-wf-muted_text mt-2">
            K/D: {comparison.current.deaths > 0 
              ? (comparison.current.kills / comparison.current.deaths).toFixed(2)
              : comparison.current.kills}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-wf-bg rounded border border-wf-border">
          <span className="text-sm text-wf-muted_text">K/D Ratio</span>
          <ChangeIndicator {...comparison.changes.kdRatio} />
        </div>
        <div className="flex items-center justify-between p-3 bg-wf-bg rounded border border-wf-border">
          <span className="text-sm text-wf-muted_text">Победы</span>
          <ChangeIndicator {...comparison.changes.wins} />
        </div>
        <div className="flex items-center justify-between p-3 bg-wf-bg rounded border border-wf-border">
          <span className="text-sm text-wf-muted_text">Поражения</span>
          <ChangeIndicator {...comparison.changes.losses} />
        </div>
        <div className="flex items-center justify-between p-3 bg-wf-bg rounded border border-wf-border">
          <span className="text-sm text-wf-muted_text">Точность</span>
          <ChangeIndicator {...comparison.changes.accuracy} />
        </div>
        <div className="flex items-center justify-between p-3 bg-wf-bg rounded border border-wf-border">
          <span className="text-sm text-wf-muted_text">Убийства</span>
          <ChangeIndicator {...comparison.changes.kills} />
        </div>
      </div>
    </div>
  );
}
