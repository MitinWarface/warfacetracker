// src/components/profile/PveGradeBadge.tsx
"use client";

import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PveGradeBadgeProps {
  grade: number;
  season?: string;
  kdRank?: number;
}

const GRADE_COLORS: Record<number, string> = {
  1: "text-yellow-300 border-yellow-500/60 bg-yellow-900/20",
  2: "text-orange-300 border-orange-500/60 bg-orange-900/20",
  3: "text-blue-300 border-blue-500/60 bg-blue-900/20",
  4: "text-green-300 border-green-500/60 bg-green-900/20",
  5: "text-teal-300 border-teal-500/60 bg-teal-900/20",
  6: "text-gray-300 border-gray-500/60 bg-gray-900/20",
  7: "text-gray-400 border-gray-600/60 bg-gray-900/10",
};

const GRADE_LABELS: Record<number, string> = {
  1: "Разряд 1 (Элита)",
  2: "Разряд 2",
  3: "Разряд 3",
  4: "Разряд 4",
  5: "Разряд 5",
  6: "Разряд 6",
  7: "Разряд 7 (Новичок)",
};

export default function PveGradeBadge({ grade, season, kdRank }: PveGradeBadgeProps) {
  if (!grade) return null;

  const seasonLabel = season ? season.replace("pve_", "") : "";

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-4 py-2 rounded-lg border",
      GRADE_COLORS[grade] ?? GRADE_COLORS[7]
    )}>
      <Zap className="w-5 h-5" />
      <div>
        <p className="text-sm font-bold">
          {GRADE_LABELS[grade] ?? `Разряд ${grade}`}
        </p>
        <p className="text-xs opacity-70">
          {seasonLabel && `Сезон: ${seasonLabel}`}
          {kdRank && ` • Место: ${kdRank}`}
        </p>
      </div>
    </div>
  );
}
