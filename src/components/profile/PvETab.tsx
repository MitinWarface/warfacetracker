// src/components/profile/PvETab.tsx

import { Zap, Trophy, Skull, Swords, Timer } from "lucide-react";
import type { NormalizedPlayerStats } from "@/types/warface";
import { CLASS_RU } from "./PvPTab";

function StatRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-wf-border/40 last:border-0">
      <span className="text-sm text-wf-muted_text">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${highlight ? "text-wf-accent" : "text-wf-text"}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

export default function PvETab({ player }: { player: NormalizedPlayerStats }) {
  const winRate = player.pveTotal > 0
    ? ((player.pveWins / player.pveTotal) * 100).toFixed(1)
    : "0.0";
  const pveKD = player.pveDeaths > 0
    ? (player.pveKills / player.pveDeaths).toFixed(3)
    : player.pveKills.toString();

  const topCards = [
    { label: "Убийства",      value: player.pveKills.toLocaleString(),  icon: <Skull  className="w-4 h-4" /> },
    { label: "Смерти",        value: player.pveDeaths.toLocaleString(), icon: <Zap    className="w-4 h-4" /> },
    { label: "Победы",        value: player.pveWins.toLocaleString(),   icon: <Trophy className="w-4 h-4" /> },
    { label: "% выполнения",  value: `${winRate}%`,                     icon: <Swords className="w-4 h-4" /> },
  ];

  const pveClassStats = player.classPvpStats.filter((c) => c.kills > 0 || c.shots > 0);

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {topCards.map((card) => (
          <div key={card.label} className="bg-wf-card border border-wf-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-wf-muted_text mb-2 text-xs uppercase tracking-wider">
              {card.icon} {card.label}
            </div>
            <div className="text-2xl font-bold text-wf-text tabular-nums">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Detail tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-wf-card border border-wf-border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest mb-3">
            <Zap className="inline w-3.5 h-3.5 mr-1" /> Миссии
          </h3>
          <StatRow label="Сыграно миссий"  value={player.pveTotal} />
          <StatRow label="Пройдено"        value={player.pveWins} />
          <StatRow label="Провалено"       value={player.pveLosses} />
          <StatRow label="% выполнения"    value={`${winRate}%`} highlight />
          <StatRow label="Любимый класс"   value={CLASS_RU[player.favPvE] ?? (player.favPvE || "—")} />
        </div>
        <div className="bg-wf-card border border-wf-border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest mb-3">
            <Skull className="inline w-3.5 h-3.5 mr-1" /> Боевая статистика
          </h3>
          <StatRow label="Убийств"           value={player.pveKills} />
          <StatRow label="Смертей"           value={player.pveDeaths} />
          <StatRow label="K/D (PvE)"         value={pveKD} highlight />
          <StatRow label="Убийств союзников" value={player.pveFriendlyKills} />
          <StatRow label="Время в игре"
            value={`${player.playtimeH.toLocaleString()}ч ${player.playtimeMin}м`} />
        </div>
      </div>

      {/* Per-class PvE breakdown */}
      {pveClassStats.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest">
            Статистика по классам
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {pveClassStats.map((stat) => {
              const accuracy = stat.shots > 0 ? ((stat.hits / stat.shots) * 100).toFixed(1) : "—";
              const h   = Math.floor(stat.playtimeMs / 3_600_000);
              const min = Math.floor((stat.playtimeMs % 3_600_000) / 60_000);
              return (
                <div key={stat.className} className="bg-wf-card border border-wf-border rounded-lg p-4">
                  <h3 className="text-xs font-bold text-wf-accent uppercase tracking-wider mb-3">
                    {CLASS_RU[stat.className] ?? stat.className}
                  </h3>
                  {stat.playtimeMs > 0 && (
                    <StatRow label="Время" value={`${h}ч ${min}м`} />
                  )}
                  {stat.shots > 0 && (
                    <>
                      <StatRow label="Выстрелов" value={stat.shots} />
                      <StatRow label="Попаданий" value={stat.hits} />
                      <StatRow label="Меткость"  value={`${accuracy}%`} highlight />
                      <StatRow label="Хедшотов"  value={stat.headshots} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Playtime card */}
      <div className="bg-wf-card border border-wf-border rounded-lg p-4">
        <h3 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest mb-4 flex items-center gap-2">
          <Timer className="w-3.5 h-3.5" /> Время в игре
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-wf-accent">
            {player.playtimeH.toLocaleString()}
            <span className="text-lg text-wf-muted_text font-normal">ч</span>
          </div>
          <div className="text-xl font-semibold text-wf-text">
            {player.playtimeMin}
            <span className="text-sm text-wf-muted_text font-normal ml-1">мин</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-wf-muted_text text-xs">PvP убийства</span>
            <div className="font-semibold">{player.kills.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-wf-muted_text text-xs">PvE убийства</span>
            <div className="font-semibold">{player.pveKills.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
