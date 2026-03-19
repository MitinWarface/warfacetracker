// src/components/profile/ClutchCard.tsx
"use client";

import { Trophy, Users } from "lucide-react";
import type { NormalizedPlayerStats } from "@/types/warface";

interface ClutchCardProps {
  player: NormalizedPlayerStats;
}

export default function ClutchCard({ player }: ClutchCardProps) {
  const clutchSuccess = player.clutchSuccess;
  const hasStats = Object.values(clutchSuccess).some(v => v > 0);

  if (!hasStats) {
    return null;
  }

  const clutches = [
    { key: "clutch1", label: "1vs1", icon: "🎯" },
    { key: "clutch2", label: "1vs2", icon: "⚔️" },
    { key: "clutch3", label: "1vs3", icon: "🔥" },
    { key: "clutch4", label: "1vs4", icon: "💀" },
    { key: "clutch5", label: "1vs5", icon: "👑" },
  ] as const;

  const totalClutches = Object.values(clutchSuccess).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-wf-muted_text uppercase flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Выигранные клатчи
        </h3>
        <span className="text-xs text-wf-muted_text">
          Всего: {totalClutches.toLocaleString()}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {clutches.map((clutch) => {
          const value = clutchSuccess[clutch.key as keyof typeof clutchSuccess];
          return (
            <div
              key={clutch.key}
              className="text-center p-3 bg-wf-muted/20 rounded-lg border border-wf-border hover:border-wf-accent/50 transition-colors"
            >
              <div className="text-lg mb-1">{clutch.icon}</div>
              <div className="text-xs text-wf-muted_text mb-1">{clutch.label}</div>
              <div className="text-lg font-bold text-wf-text">
                {value > 0 ? value.toLocaleString() : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
