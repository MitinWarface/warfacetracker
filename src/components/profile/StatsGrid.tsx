// src/components/profile/StatsGrid.tsx
"use client";

import { Target, Trophy, Skull, Swords, Timer, Zap, Crosshair, Star } from "lucide-react";
import type { NormalizedPlayerStats } from "@/types/warface";
import { cn } from "@/lib/utils";

function StatCard({
  label, value, sub, icon, variant = "default",
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; variant?: "default" | "green" | "red" | "gold";
}) {
  const borders: Record<string, string> = {
    default: "border-wf-border",
    green:   "border-green-800/50",
    red:     "border-red-800/50",
    gold:    "border-wf-accent/30",
  };
  return (
    <div className={cn("bg-card-gradient border rounded-lg p-4 flex flex-col gap-2 hover:border-opacity-80 transition-colors", borders[variant])}>
      <div className="flex items-center justify-between text-wf-muted_text">
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        <span className="opacity-60">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-wf-text tabular-nums">{value}</div>
      {sub && <div className="text-xs text-wf-muted_text">{sub}</div>}
    </div>
  );
}

export default function StatsGrid({ player }: { player: NormalizedPlayerStats }) {
  const pvpWinRate = player.pvpTotal > 0
    ? ((player.pvpWins / player.pvpTotal) * 100).toFixed(1)
    : "0.0";
  const pveWinRate = player.pveTotal > 0
    ? ((player.pveWins / player.pveTotal) * 100).toFixed(1)
    : "0.0";

  // Best ranked season (highest K/D with at least 10 kills)
  const bestSeason = player.seasonStats.length > 0
    ? [...player.seasonStats]
        .filter((s) => s.kills >= 10 && s.deaths > 0)
        .sort((a, b) => (b.kills / b.deaths) - (a.kills / a.deaths))[0]
    : null;

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest flex items-center gap-2">
        <Swords className="w-3.5 h-3.5" /> PvP
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard
          label="Убийства" value={player.kills.toLocaleString()}
          sub={`ОО: ${player.friendlyKills.toLocaleString()}`}
          icon={<Skull className="w-4 h-4" />} variant="red"
        />
        <StatCard
          label="Смерти" value={player.deaths.toLocaleString()}
          sub={`K/D ${player.kdRatio.toFixed(2)}`}
          icon={<Target className="w-4 h-4" />}
        />
        <StatCard
          label="Победы" value={player.pvpWins.toLocaleString()}
          sub={`Побед ${pvpWinRate}%`}
          icon={<Trophy className="w-4 h-4" />} variant="gold"
        />
        <StatCard
          label="Матчи" value={player.pvpTotal.toLocaleString()}
          sub={`В${player.pvpWins} / П${player.pvpLosses}`}
          icon={<Swords className="w-4 h-4" />}
        />
        {player.globalAccuracy > 0 && (
          <StatCard
            label="Меткость" value={`${player.globalAccuracy}%`}
            sub="Попаданий / Выстрелов"
            icon={<Crosshair className="w-4 h-4" />}
          />
        )}
        {player.globalHsRate > 0 && (
          <StatCard
            label="% Хедшотов" value={`${player.globalHsRate}%`}
            sub="Хедшотов / Попаданий"
            icon={<Target className="w-4 h-4" />} variant="red"
          />
        )}
        {bestSeason && (
          <StatCard
            label="Лучший сезон"
            value={bestSeason.label}
            sub={`K/D ${(bestSeason.kills / bestSeason.deaths).toFixed(2)} · ${bestSeason.wins}В/${bestSeason.losses}П`}
            icon={<Star className="w-4 h-4" />} variant="gold"
          />
        )}
      </div>

      <h2 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest flex items-center gap-2 pt-2">
        <Zap className="w-3.5 h-3.5" /> PvE
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard
          label="Убийства" value={player.pveKills.toLocaleString()}
          sub={`Смертей: ${player.pveDeaths.toLocaleString()}`}
          icon={<Skull className="w-4 h-4" />} variant="green"
        />
        <StatCard
          label="Победы" value={player.pveWins.toLocaleString()}
          sub={`Побед ${pveWinRate}%`}
          icon={<Trophy className="w-4 h-4" />} variant="green"
        />
        <StatCard
          label="Матчи" value={player.pveTotal.toLocaleString()}
          sub={`В${player.pveWins} / П${player.pveLosses}`}
          icon={<Swords className="w-4 h-4" />}
        />
        <StatCard
          label="Время в игре (PvE)" value={`${player.pvePlaytimeH.toLocaleString()}ч`}
          sub={`${player.pvePlaytimeMin} мин.`}
          icon={<Timer className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}
