// src/components/GoldWeaponProgress.tsx
"use client";

import { useState } from "react";
import { Trophy, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoldWeaponProgressData {
  weaponId: string;
  weaponName: string;
  currentKills: number;
  requiredKills: number;
  progress: number;
  isCompleted: boolean;
}

interface GoldWeaponProgressProps {
  progress: GoldWeaponProgressData[];
  summary: {
    totalWeapons: number;
    completedWeapons: number;
    averageProgress: number;
  };
}

export default function GoldWeaponProgress({ progress, summary }: GoldWeaponProgressProps) {
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all");

  const filtered = progress.filter((p) => {
    if (filter === "completed") return p.isCompleted;
    if (filter === "incomplete") return !p.isCompleted;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-wf-card border border-wf-border rounded-lg p-4 text-center">
          <p className="text-xs text-wf-muted_text uppercase">Всего оружий</p>
          <p className="text-2xl font-bold text-wf-text">{summary.totalWeapons}</p>
        </div>
        <div className="bg-wf-card border border-wf-border rounded-lg p-4 text-center">
          <p className="text-xs text-wf-muted_text uppercase">Золотых</p>
          <p className="text-2xl font-bold text-yellow-400">{summary.completedWeapons}</p>
        </div>
        <div className="bg-wf-card border border-wf-border rounded-lg p-4 text-center">
          <p className="text-xs text-wf-muted_text uppercase">Ср. прогресс</p>
          <p className="text-2xl font-bold text-wf-accent">{summary.averageProgress}%</p>
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
          Все ({progress.length})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={cn(
            "px-4 py-2 text-sm rounded-lg border transition-colors",
            filter === "completed"
              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
              : "bg-wf-card text-wf-muted_text border-wf-border hover:border-wf-accent/40"
          )}
        >
          <Check className="w-4 h-4 inline mr-1" />
          Золотые ({summary.completedWeapons})
        </button>
        <button
          onClick={() => setFilter("incomplete")}
          className={cn(
            "px-4 py-2 text-sm rounded-lg border transition-colors",
            filter === "incomplete"
              ? "bg-wf-card text-wf-text border-wf-border"
              : "bg-wf-card text-wf-muted_text border-wf-border hover:border-wf-accent/40"
          )}
        >
          <Lock className="w-4 h-4 inline mr-1" />
          В процессе ({progress.length - summary.completedWeapons})
        </button>
      </div>

      {/* Progress List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
        {filtered.map((weapon) => (
          <div
            key={weapon.weaponId}
            className={cn(
              "bg-wf-card border rounded-lg p-4",
              weapon.isCompleted
                ? "border-yellow-500/30 bg-yellow-500/10"
                : "border-wf-border"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-wf-text truncate">{weapon.weaponName}</h4>
              {weapon.isCompleted ? (
                <Trophy className="w-4 h-4 text-yellow-400" />
              ) : (
                <Lock className="w-3 h-3 text-wf-muted_text" />
              )}
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-xs text-wf-muted_text mb-1">
                <span>{weapon.currentKills.toLocaleString()} / {weapon.requiredKills.toLocaleString()}</span>
                <span>{weapon.progress}%</span>
              </div>
              <div className="h-2 bg-wf-muted/30 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    weapon.isCompleted ? "bg-yellow-400" : "bg-wf-accent"
                  )}
                  style={{ width: `${weapon.progress}%` }}
                />
              </div>
            </div>

            {!weapon.isCompleted && (
              <p className="text-xs text-wf-muted_text">
                Осталось: {(weapon.requiredKills - weapon.currentKills).toLocaleString()} убийств
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
