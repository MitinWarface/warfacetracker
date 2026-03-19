// src/components/profile/PvPTab.tsx

import { Target, Crosshair, Trophy, Swords, Flame, Skull, Heart, Shield, Zap, Package, Award, TrendingUp, Activity, Users, Coins, Clock } from "lucide-react";
import type { NormalizedPlayerStats, ClassStat } from "@/types/warface";
import { cn } from "@/lib/utils";
import SessionStatsCard from "./SessionStatsCard";
import KillStatsCard from "./KillStatsCard";
import ClutchCard from "./ClutchCard";
import SessionEndCard from "./SessionEndCard";
import AdditionalStatsCard from "./AdditionalStatsCard";

export const CLASS_RU: Record<string, string> = {
  Rifleman: "Штурмовик",
  Medic:    "Медик",
  Sniper:   "Снайпер",
  Recon:    "Снайпер",
  Engineer: "Инженер",
  SED:      "СЗД",
  Heavy:    "Тяжёлый",
};

const CLASS_COLORS: Record<string, string> = {
  Rifleman: "text-orange-400 border-orange-800/40 bg-orange-900/10",
  Medic:    "text-green-400  border-green-800/40  bg-green-900/10",
  Sniper:   "text-blue-400   border-blue-800/40   bg-blue-900/10",
  Recon:    "text-blue-400   border-blue-800/40   bg-blue-900/10",
  Engineer: "text-yellow-400 border-yellow-800/40 bg-yellow-900/10",
  SED:      "text-purple-400 border-purple-800/40 bg-purple-900/10",
  Heavy:    "text-red-400    border-red-800/40    bg-red-900/10",
};

function StatRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-wf-border/40 last:border-0">
      <span className="text-sm text-wf-muted_text">{label}</span>
      <span className={cn("text-sm font-semibold tabular-nums", highlight ? "text-wf-accent" : "text-wf-text")}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

function ClassCard({ stat, totalPvpMs }: { stat: ClassStat; totalPvpMs: number }) {
  const accuracy  = stat.shots > 0 ? ((stat.hits / stat.shots) * 100).toFixed(1) : "—";
  const hsRate    = stat.hits  > 0 ? ((stat.headshots / stat.hits) * 100).toFixed(1) : "—";
  const colorCls  = CLASS_COLORS[stat.className] ?? "text-wf-accent border-wf-border bg-wf-muted/20";
  const pct       = totalPvpMs > 0 && stat.playtimeMs > 0
    ? ((stat.playtimeMs / totalPvpMs) * 100).toFixed(1)
    : null;
  const h   = Math.floor(stat.playtimeMs / 3_600_000);
  const min = Math.floor((stat.playtimeMs % 3_600_000) / 60_000);

  return (
    <div className={cn("border rounded-lg p-4", colorCls)}>
      <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center justify-between">
        <span>{CLASS_RU[stat.className] ?? stat.className}</span>
        {pct && <span className="text-xs font-normal opacity-70">{pct}% времени</span>}
      </h3>
      {stat.playtimeMs > 0 && (
        <StatRow label="Время" value={`${h}ч ${min}м`} />
      )}
      {stat.shots > 0 && (
        <>
          <StatRow label="Выстрелов"  value={stat.shots} />
          <StatRow label="Попаданий"  value={stat.hits} />
          <StatRow label="Меткость"   value={`${accuracy}%`} highlight />
          <StatRow label="Хедшотов"   value={stat.headshots} />
          <StatRow label="% в голову" value={`${hsRate}%`} />
        </>
      )}
    </div>
  );
}

export default function PvPTab({ player }: { player: NormalizedPlayerStats }) {
  const winRate = player.pvpTotal > 0
    ? ((player.pvpWins / player.pvpTotal) * 100).toFixed(1)
    : "0.0";

  const totalPvpMs = player.classPvpStats.reduce((s, c) => s + c.playtimeMs, 0);

  const topCards = [
    { label: "Убийства",  value: player.kills.toLocaleString(),   icon: <Flame     className="w-4 h-4" /> },
    { label: "Смерти",    value: player.deaths.toLocaleString(),  icon: <Skull     className="w-4 h-4" /> },
    { label: "K/D",       value: player.kdRatio.toFixed(3),       icon: <Crosshair className="w-4 h-4" /> },
    { label: "Победы",    value: player.pvpWins.toLocaleString(), icon: <Trophy    className="w-4 h-4" /> },
    { label: "% побед",   value: `${winRate}%`,                   icon: <Target    className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
            <Swords className="inline w-3.5 h-3.5 mr-1" /> Бои
          </h3>
          <StatRow label="Матчей сыграно"  value={player.pvpTotal} />
          <StatRow label="Побед"           value={player.pvpWins} />
          <StatRow label="Поражений"       value={player.pvpLosses} />
          {player.pvpDraws > 0 && (
            <StatRow label="Вничью"        value={player.pvpDraws} />
          )}
          <StatRow label="% побед"         value={`${winRate}%`} />
          <StatRow label="Убийств союзников" value={player.friendlyKills} />
        </div>
        <div className="bg-wf-card border border-wf-border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest mb-3">
            <Crosshair className="inline w-3.5 h-3.5 mr-1" /> Статистика
          </h3>
          <StatRow label="Убийств"         value={player.kills} />
          <StatRow label="Смертей"         value={player.deaths} />
          <StatRow label="K/D"             value={player.kdRatio.toFixed(3)} highlight />
          <StatRow label="Любимый класс"   value={CLASS_RU[player.favPvP] ?? (player.favPvP || "—")} />
          <StatRow label="Время в игре (PvP)" value={`${player.pvpPlaytimeH.toLocaleString()}ч ${player.pvpPlaytimeMin}м`} />
        </div>
      </div>

      {/* Playtime bar chart by class */}
      {player.classPvpStats.length > 0 && totalPvpMs > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest">
            Время по классам
          </h2>
          <div className="bg-wf-card border border-wf-border rounded-lg p-4 space-y-3">
            {[...player.classPvpStats]
              .sort((a, b) => b.playtimeMs - a.playtimeMs)
              .map((stat) => {
                const pct = (stat.playtimeMs / totalPvpMs) * 100;
                const h   = Math.floor(stat.playtimeMs / 3_600_000);
                const min = Math.floor((stat.playtimeMs % 3_600_000) / 60_000);
                const colorBar: Record<string, string> = {
                  Rifleman: "bg-orange-500", Medic: "bg-green-500",
                  Sniper: "bg-blue-500",     Recon: "bg-blue-500",
                  Engineer: "bg-yellow-500", SED: "bg-purple-500", Heavy: "bg-red-500",
                };
                return (
                  <div key={stat.className} className="flex items-center gap-3">
                    <span className="text-xs text-wf-muted_text w-20 shrink-0">
                      {CLASS_RU[stat.className] ?? stat.className}
                    </span>
                    <div className="flex-1 h-3 bg-wf-muted/30 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", colorBar[stat.className] ?? "bg-wf-accent")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-wf-muted_text w-28 text-right tabular-nums shrink-0">
                      {h > 0 ? `${h}ч ` : ""}{min}м · {pct.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Per-class breakdown */}
      {player.classPvpStats.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest">
            Статистика по классам
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {player.classPvpStats.map((stat) => (
              <ClassCard key={stat.className} stat={stat} totalPvpMs={totalPvpMs} />
            ))}
          </div>
        </div>
      )}

      {/* Support stats */}
      {player.supportStats.healDone > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest">
            Поддержка
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "ОЗ восстановлено",  value: player.supportStats.healDone,       icon: <Heart   className="w-4 h-4 text-green-400" /> },
              { label: "ОБ восстановлено",  value: player.supportStats.repairDone,     icon: <Shield  className="w-4 h-4 text-blue-400"  /> },
              { label: "Реанимировано",     value: player.supportStats.ressurectsMade, icon: <Zap    className="w-4 h-4 text-yellow-400" /> },
              { label: "Выдано аптечек",    value: player.supportStats.ammoRestored,   icon: <Package className="w-4 h-4 text-orange-400" /> },
            ].map((s) => (
              <div key={s.label} className="bg-wf-card border border-wf-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-wf-muted_text mb-2 text-xs uppercase tracking-wider">
                  {s.icon} {s.label}
                </div>
                <div className="text-xl font-bold text-wf-text tabular-nums">
                  {s.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session stats */}
      <SessionStatsCard player={player} />

      {/* Kill types */}
      <KillStatsCard player={player} />

      {/* Clutch stats */}
      <ClutchCard player={player} />

      {/* Session end stats */}
      <SessionEndCard player={player} />

      {/* Additional stats from API */}
      <AdditionalStatsCard player={player} />
    </div>
  );
}
