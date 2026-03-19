// src/components/SiteAchievements.tsx
"use client";

import { useState } from "react";
import { Trophy, Check, Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  required: number;
  isCompleted: boolean;
  completedAt?: Date;
  xpReward: number;
}

interface SiteAchievementsProps {
  achievements: SiteAchievement[];
  summary: {
    totalAchievements: number;
    completedAchievements: number;
    totalXp: number;
    completionPercent: number;
  };
}

export default function SiteAchievements({ achievements, summary }: SiteAchievementsProps) {
  const [filter, setFilter] = useState<"all" | "completed" | "locked">("all");

  const filtered = achievements.filter((a) => {
    if (filter === "completed") return a.isCompleted;
    if (filter === "locked") return !a.isCompleted;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-wf-card border border-wf-border rounded-lg p-4 text-center">
          <p className="text-xs text-wf-muted_text uppercase">Всего</p>
          <p className="text-2xl font-bold text-wf-text">{summary.totalAchievements}</p>
        </div>
        <div className="bg-wf-card border border-wf-border rounded-lg p-4 text-center">
          <p className="text-xs text-wf-muted_text uppercase">Выполнено</p>
          <p className="text-2xl font-bold text-green-400">{summary.completedAchievements}</p>
        </div>
        <div className="bg-wf-card border border-wf-border rounded-lg p-4 text-center">
          <p className="text-xs text-wf-muted_text uppercase">XP</p>
          <p className="text-2xl font-bold text-yellow-400">{summary.totalXp}</p>
        </div>
        <div className="bg-wf-card border border-wf-border rounded-lg p-4 text-center">
          <p className="text-xs text-wf-muted_text uppercase">Прогресс</p>
          <p className="text-2xl font-bold text-wf-accent">{summary.completionPercent}%</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-wf-card border border-wf-border rounded-lg p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-wf-muted_text">Общий прогресс</span>
          <span className="font-bold text-wf-accent">{summary.completionPercent}%</span>
        </div>
        <div className="h-3 bg-wf-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-wf-accent to-green-400 transition-all"
            style={{ width: `${summary.completionPercent}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-4 py-2 text-sm rounded-lg border transition-colors",
            filter === "all"
              ? "bg-wf-accent text-black border-wf-accent"
              : "bg-wf-card text-wf-muted_text border-wf-border hover:border-wf-accent/40"
          )}
        >
          Все ({achievements.length})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={cn(
            "px-4 py-2 text-sm rounded-lg border transition-colors",
            filter === "completed"
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-wf-card text-wf-muted_text border-wf-border hover:border-wf-accent/40"
          )}
        >
          <Check className="w-4 h-4 inline mr-1" />
          Выполнено ({summary.completedAchievements})
        </button>
        <button
          onClick={() => setFilter("locked")}
          className={cn(
            "px-4 py-2 text-sm rounded-lg border transition-colors",
            filter === "locked"
              ? "bg-wf-card text-wf-text border-wf-border"
              : "bg-wf-card text-wf-muted_text border-wf-border hover:border-wf-accent/40"
          )}
        >
          <Lock className="w-4 h-4 inline mr-1" />
          Заблокировано ({achievements.length - summary.completedAchievements})
        </button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
        {filtered.map((ach) => (
          <div
            key={ach.id}
            className={cn(
              "bg-wf-card border rounded-lg p-4 transition-colors",
              ach.isCompleted
                ? "border-green-500/30 bg-green-500/10"
                : "border-wf-border opacity-70"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{ach.icon}</div>
              {ach.isCompleted ? (
                <Trophy className="w-5 h-5 text-green-400" />
              ) : (
                <Lock className="w-4 h-4 text-wf-muted_text" />
              )}
            </div>

            <h4 className="text-sm font-bold text-wf-text mb-1">{ach.name}</h4>
            <p className="text-xs text-wf-muted_text mb-3">{ach.description}</p>

            {/* Progress */}
            {!ach.isCompleted && (
              <div className="mb-2">
                <div className="flex justify-between text-xs text-wf-muted_text mb-1">
                  <span>{ach.progress} / {ach.required}</span>
                  <span>{Math.round((ach.progress / ach.required) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-wf-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-wf-accent rounded-full transition-all"
                    style={{ width: `${(ach.progress / ach.required) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* XP Reward */}
            <div className="flex items-center gap-1 text-xs text-yellow-400">
              <Star className="w-3 h-3" />
              <span>+{ach.xpReward} XP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
