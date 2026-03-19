// src/components/profile/SeasonsGrid.tsx
"use client";

import type { SeasonStat } from "@/types/warface";
import { cn } from "@/lib/utils";
import {
  Trophy, Swords, Shield, Target, Clock, Zap,
  TrendingUp, TrendingDown, Minus, RefreshCw,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtTime(ms: number): string {
  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}м`;
  return `${h}ч ${m}м`;
}

function fmtNum(n: number): string {
  return n.toLocaleString("ru-RU");
}

function accuracy(shots: number, hits: number): string {
  if (shots === 0) return "—";
  return ((hits / shots) * 100).toFixed(1) + "%";
}

function hsRate(hits: number, hs: number): string {
  if (hits === 0) return "—";
  return ((hs / hits) * 100).toFixed(1) + "%";
}

// ─── Single season card ───────────────────────────────────────────────────────

function SeasonCard({ s }: { s: SeasonStat }) {
  const total    = s.wins + s.losses + s.draws;
  const kd       = s.deaths > 0 ? (s.kills / s.deaths) : s.kills;
  const winRate  = total > 0 ? (s.wins / total) * 100 : 0;
  const acc      = accuracy(s.shots, s.hits);
  const hs       = hsRate(s.hits, s.headshots);
  const kdStr    = kd.toFixed(3);
  const kdColor  = kd >= 1.5 ? "text-green-400" : kd >= 1 ? "text-wf-accent" : "text-red-400";

  return (
    <div className={cn(
      "relative rounded-xl border bg-wf-card overflow-hidden transition-all duration-200",
      "hover:border-wf-accent/40 hover:shadow-lg hover:shadow-wf-accent/5",
      s.isCurrent
        ? "border-wf-accent/50 shadow-md shadow-wf-accent/10"
        : "border-wf-border"
    )}>
      {/* ── Header ── */}
      <div className={cn(
        "px-5 py-4 flex items-center justify-between",
        s.isCurrent
          ? "bg-gradient-to-r from-wf-accent/15 to-transparent border-b border-wf-accent/20"
          : "bg-wf-surface/50 border-b border-wf-border"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            s.isCurrent ? "bg-wf-accent/20" : "bg-wf-muted/20"
          )}>
            <Trophy className={cn("h-5 w-5", s.isCurrent ? "text-wf-accent" : "text-wf-muted_text")} />
          </div>
          <div>
            <h3 className="font-bold text-wf-text text-base leading-tight">{s.label}</h3>
            <p className="text-xs text-wf-muted_text">{fmtNum(total)} матчей · {fmtTime(s.playtimeMs)}</p>
          </div>
        </div>

        {s.isCurrent && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-wf-accent text-wf-bg">
            Текущий
          </span>
        )}
      </div>

      {/* ── Stats grid ── */}
      <div className="p-5 grid grid-cols-2 gap-4">

        {/* K/D */}
        <div className="col-span-2 flex items-center justify-between bg-wf-surface/40 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 text-wf-muted_text">
            <Swords className="h-4 w-4" />
            <span className="text-sm">Убийств / Смертей</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-wf-muted_text">
              {fmtNum(s.kills)} / {fmtNum(s.deaths)}
            </span>
            <span className={cn("font-bold text-lg tabular-nums", kdColor)}>
              {kdStr}
            </span>
          </div>
        </div>

        {/* Win rate */}
        <div className="col-span-2 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-wf-muted_text flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              Процент побед
            </span>
            <span className="font-semibold text-wf-text">{winRate.toFixed(1)}%</span>
          </div>
          {/* Win bar */}
          <div className="h-2 w-full rounded-full overflow-hidden bg-wf-muted/20 flex">
            {s.wins > 0 && (
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${(s.wins / total) * 100}%` }}
              />
            )}
            {s.draws > 0 && (
              <div
                className="h-full bg-yellow-500"
                style={{ width: `${(s.draws / total) * 100}%` }}
              />
            )}
            {s.losses > 0 && (
              <div
                className="h-full bg-red-500"
                style={{ width: `${(s.losses / total) * 100}%` }}
              />
            )}
          </div>
          {/* Counts */}
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1 text-green-400">
              <TrendingUp className="h-3 w-3" /> {fmtNum(s.wins)}
            </span>
            {s.draws > 0 && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Minus className="h-3 w-3" /> {fmtNum(s.draws)}
              </span>
            )}
            <span className="flex items-center gap-1 text-red-400">
              <TrendingDown className="h-3 w-3" /> {fmtNum(s.losses)}
            </span>
          </div>
        </div>

        {/* Accuracy */}
        <div className="flex flex-col gap-1 bg-wf-surface/40 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-wf-muted_text text-xs">
            <Target className="h-3.5 w-3.5" />
            Меткость
          </div>
          <span className="text-base font-semibold text-wf-text">{acc}</span>
          <span className="text-[11px] text-wf-muted_text">
            {fmtNum(s.hits)} / {fmtNum(s.shots)}
          </span>
        </div>

        {/* Headshots */}
        <div className="flex flex-col gap-1 bg-wf-surface/40 rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-wf-muted_text text-xs">
            <Zap className="h-3.5 w-3.5" />
            Хедшоты
          </div>
          <span className="text-base font-semibold text-wf-text">{hs}</span>
          <span className="text-[11px] text-wf-muted_text">
            {fmtNum(s.headshots)} попаданий
          </span>
        </div>

        {/* Playtime */}
        <div className="col-span-2 flex items-center justify-between text-sm border-t border-wf-border/50 pt-3 mt-1">
          <span className="flex items-center gap-1.5 text-wf-muted_text">
            <Clock className="h-3.5 w-3.5" />
            Время в игре
          </span>
          <span className="font-medium text-wf-text">{fmtTime(s.playtimeMs)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main grid component ──────────────────────────────────────────────────────

interface Props {
  seasons:   SeasonStat[];
  fetchedAt: Date;
  nickname:  string;
}

export default function SeasonsGrid({ seasons, fetchedAt, nickname: _nickname }: Props) {
  if (seasons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-wf-muted_text gap-4">
        <Trophy className="h-12 w-12 opacity-30" />
        <p className="text-lg font-medium">Нет данных о рейтинговых сезонах</p>
        <p className="text-sm">Игрок ещё не участвовал в рейтинговых матчах</p>
      </div>
    );
  }

  const fmt = fetchedAt.toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  // Summary across all seasons
  const totalKills  = seasons.reduce((s, x) => s + x.kills,  0);
  const totalDeaths = seasons.reduce((s, x) => s + x.deaths, 0);
  const totalWins   = seasons.reduce((s, x) => s + x.wins,   0);
  const totalGames  = seasons.reduce((s, x) => s + x.wins + x.losses + x.draws, 0);
  const overallKD   = totalDeaths > 0 ? (totalKills / totalDeaths) : totalKills;
  const overallWR   = totalGames  > 0 ? (totalWins  / totalGames)  * 100 : 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-wf-text flex items-center gap-2">
            <Trophy className="h-6 w-6 text-wf-accent" />
            Рейтинговые сезоны
          </h2>
          <p className="text-sm text-wf-muted_text mt-1 flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Данные из API · {fmt}
          </p>
        </div>

        {/* Overall summary pills */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-full bg-wf-card border border-wf-border text-sm">
            <span className="text-wf-muted_text">Сезонов:</span>{" "}
            <span className="font-semibold text-wf-text">{seasons.length}</span>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-wf-card border border-wf-border text-sm">
            <span className="text-wf-muted_text">Общий К/С:</span>{" "}
            <span className={cn(
              "font-semibold",
              overallKD >= 1.5 ? "text-green-400" : overallKD >= 1 ? "text-wf-accent" : "text-red-400"
            )}>{overallKD.toFixed(3)}</span>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-wf-card border border-wf-border text-sm">
            <span className="text-wf-muted_text">% побед:</span>{" "}
            <span className="font-semibold text-green-400">{overallWR.toFixed(1)}%</span>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-wf-card border border-wf-border text-sm">
            <span className="text-wf-muted_text">Матчей:</span>{" "}
            <span className="font-semibold text-wf-text">{fmtNum(totalGames)}</span>
          </span>
        </div>
      </div>

      {/* ── Season cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {seasons.map((s) => (
          <SeasonCard key={s.season} s={s} />
        ))}
      </div>
    </div>
  );
}
