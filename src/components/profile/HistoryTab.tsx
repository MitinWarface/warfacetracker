// src/components/profile/HistoryTab.tsx
"use client";

import { Trophy, TrendingUp, Swords, Clock, Star, ChevronUp, Zap } from "lucide-react";
import type { SeasonStat } from "@/types/warface";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type PvEDelta = { kills: number; deaths: number; wins: number; losses: number };

type Session = {
  date:        Date | string;
  kills:       number;
  deaths:      number;
  wins:        number;
  losses:      number;
  draws:       number;
  matches:     number;
  xpGain:      number;
  playtimeMin: number;
  sessionKD:   number;
  sessionWR:   number;
  overallKD:   number;
  rankId:      number;
  rankChanged: boolean;
  rankPrev:    number;
  pve:         PvEDelta;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function kdColor(kd: number) {
  if (kd >= 2)   return "text-green-400";
  if (kd >= 1.5) return "text-emerald-400";
  if (kd >= 1)   return "text-yellow-400";
  if (kd >= 0.7) return "text-orange-400";
  return "text-red-400";
}

function resultLabel(wins: number, losses: number) {
  if (wins > losses) return { text: "ПОБЕДА", color: "text-green-400", bar: "bg-green-500" };
  if (wins < losses) return { text: "ПОРАЖЕНИЕ", color: "text-red-400", bar: "bg-red-500" };
  return { text: "НИЧЬЯ", color: "text-yellow-400", bar: "bg-yellow-500" };
}

function fmtPlaytime(min: number) {
  if (min <= 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}ч ${m}м` : `${m}м`;
}

// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ s, index }: { s: Session; index: number }) {
  const dt       = new Date(s.date);
  const dateStr  = dt.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, ".");
  const timeStr  = dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const result   = resultLabel(s.wins, s.losses);
  const playtime = fmtPlaytime(s.playtimeMin);
  const hasPvE   = s.pve.wins > 0 || s.pve.kills > 0;
  const isPvEOnly = hasPvE && s.kills === 0 && s.wins === 0;

  return (
    <div className={cn(
      "group relative flex items-stretch gap-0 rounded-xl overflow-hidden border transition-all duration-200",
      "border-wf-border/50 hover:border-wf-border bg-wf-card hover:bg-wf-card/80",
    )}>
      {/* Result accent bar left */}
      <div className={cn("w-1 shrink-0 rounded-l-xl", result.bar)} />

      {/* Date block */}
      <div className="flex flex-col items-center justify-center px-4 py-4 min-w-[80px] border-r border-wf-border/30">
        <span className="text-[11px] text-wf-muted_text font-mono">{dateStr}</span>
        <span className="text-sm font-bold text-wf-text mt-0.5 font-mono">{timeStr}</span>
        {index === 0 && (
          <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-wf-accent/20 text-wf-accent border border-wf-accent/30">
            Последняя
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">

        {/* K/D block */}
        {!isPvEOnly && (
          <div className="flex flex-col items-start min-w-[70px]">
            <span className="text-[10px] text-wf-muted_text uppercase tracking-wider mb-1">K/D сессии</span>
            <span className={cn("text-2xl font-black tabular-nums leading-none", kdColor(s.sessionKD))}>
              {s.sessionKD}
            </span>
            <span className="text-xs text-wf-muted_text mt-1 tabular-nums">
              {s.kills > 0 ? `+${s.kills}` : s.kills} / {s.deaths > 0 ? `+${s.deaths}` : s.deaths}
            </span>
          </div>
        )}

        {/* Matches stats */}
        {!isPvEOnly && s.matches > 0 && (
          <div className="flex flex-col items-start min-w-[90px]">
            <span className="text-[10px] text-wf-muted_text uppercase tracking-wider mb-1">Матчи</span>
            <div className="flex items-baseline gap-1.5">
              <span className={cn("text-sm font-bold", result.color)}>{s.matches}</span>
              <span className="text-[10px] text-wf-muted_text">боёв</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {s.wins > 0 && (
                <span className="text-xs text-green-400 font-semibold">+{s.wins}П</span>
              )}
              {s.losses > 0 && (
                <span className="text-xs text-red-400 font-semibold">-{s.losses}П</span>
              )}
              {s.draws > 0 && (
                <span className="text-xs text-yellow-400">{s.draws}Н</span>
              )}
            </div>
          </div>
        )}

        {/* Win rate bar */}
        {!isPvEOnly && s.matches > 0 && (
          <div className="flex flex-col items-start min-w-[100px]">
            <span className="text-[10px] text-wf-muted_text uppercase tracking-wider mb-1">% Побед</span>
            <span className="text-sm font-bold tabular-nums">{s.sessionWR}%</span>
            <div className="w-full h-1.5 bg-wf-muted/30 rounded-full overflow-hidden mt-1.5 max-w-[100px]">
              <div
                className={cn("h-full rounded-full transition-all", result.bar)}
                style={{ width: `${s.sessionWR}%` }}
              />
            </div>
          </div>
        )}

        {/* PvE badge */}
        {hasPvE && (
          <div className="flex flex-col items-start min-w-[80px]">
            <span className="text-[10px] text-wf-muted_text uppercase tracking-wider mb-1">PvE</span>
            <span className="text-sm font-bold text-purple-400">{s.pve.wins > 0 ? `+${s.pve.wins}П` : `${s.pve.kills}У`}</span>
            <span className="text-xs text-wf-muted_text mt-0.5">
              {s.pve.kills > 0 && `${s.pve.kills} убийств`}
            </span>
          </div>
        )}

        {/* Playtime */}
        {playtime && (
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-wf-muted_text uppercase tracking-wider mb-1">Время</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-wf-muted_text" />
              <span className="text-sm font-semibold text-wf-muted_text">{playtime}</span>
            </div>
          </div>
        )}

        {/* Rank up badge */}
        {s.rankChanged && s.rankId > s.rankPrev && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <ChevronUp className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">Ранг {s.rankPrev} → {s.rankId}</span>
          </div>
        )}
      </div>

      {/* XP + right column */}
      <div className="flex flex-col items-end justify-center px-4 py-4 gap-2 shrink-0 border-l border-wf-border/30 min-w-[90px]">
        {s.xpGain > 0 && (
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 tabular-nums">
              +{s.xpGain.toLocaleString("ru-RU")} XP
            </span>
          </div>
        )}
        {/* Overall KD chip */}
        {!isPvEOnly && (
          <div className="text-right">
            <div className="text-[9px] text-wf-muted_text uppercase tracking-wider">Общий K/D</div>
            <div className={cn("text-xs font-bold tabular-nums", kdColor(s.overallKD))}>
              {s.overallKD.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Seasons table ────────────────────────────────────────────────────────────

function SeasonBadge({ current }: { current: boolean }) {
  return current ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-wf-accent/20 text-wf-accent border border-wf-accent/40">
      Активный
    </span>
  ) : null;
}

function SeasonsTable({ seasons }: { seasons: SeasonStat[] }) {
  return (
    <div className="bg-wf-card border border-wf-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-wf-border bg-wf-muted/20">
              {["Сезон", "Убийства", "Смерти", "K/D", "Победы", "Поражения", "% Побед", "Время", "Меткость"].map((h, i) => (
                <th key={h} className={cn(
                  "py-3 px-4 text-xs text-wf-muted_text font-semibold uppercase tracking-wider",
                  i === 0 ? "text-left" : "text-right"
                )}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {seasons.map((s) => {
              const kd       = s.deaths > 0 ? (s.kills / s.deaths).toFixed(2) : s.kills.toString();
              const wr       = (s.wins + s.losses) > 0 ? ((s.wins / (s.wins + s.losses)) * 100).toFixed(1) : "—";
              const accuracy = s.shots > 0 ? ((s.hits / s.shots) * 100).toFixed(1) : "—";
              const h        = Math.floor(s.playtimeMs / 3_600_000);
              const min      = Math.floor((s.playtimeMs % 3_600_000) / 60_000);
              const kdNum    = parseFloat(kd);
              return (
                <tr key={s.season} className={cn(
                  "border-b border-wf-border/40 hover:bg-wf-muted/10 transition-colors",
                  s.isCurrent && "bg-wf-accent/5"
                )}>
                  <td className="py-3 px-4 font-semibold whitespace-nowrap">
                    <div className="flex items-center gap-2">{s.label}<SeasonBadge current={s.isCurrent} /></div>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-semibold">{s.kills.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-wf-muted_text">{s.deaths.toLocaleString()}</td>
                  <td className={cn("py-3 px-4 text-right tabular-nums font-semibold", kdColor(kdNum))}>{kd}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-green-400">{s.wins.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-red-400">{s.losses.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{wr}{wr !== "—" ? "%" : ""}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-wf-muted_text whitespace-nowrap">{h > 0 ? `${h}ч ${min}м` : `${min}м`}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-wf-muted_text">{accuracy}{accuracy !== "—" ? "%" : ""}</td>
                </tr>
              );
            })}
          </tbody>
          {seasons.length > 1 && (() => {
            const t = seasons.reduce(
              (a, s) => ({ kills: a.kills + s.kills, deaths: a.deaths + s.deaths, wins: a.wins + s.wins, losses: a.losses + s.losses, playtimeMs: a.playtimeMs + s.playtimeMs, shots: a.shots + s.shots, hits: a.hits + s.hits }),
              { kills: 0, deaths: 0, wins: 0, losses: 0, playtimeMs: 0, shots: 0, hits: 0 }
            );
            const tKD  = t.deaths  > 0 ? (t.kills / t.deaths).toFixed(2) : "—";
            const tWR  = (t.wins + t.losses) > 0 ? ((t.wins / (t.wins + t.losses)) * 100).toFixed(1) + "%" : "—";
            const tAcc = t.shots   > 0 ? ((t.hits  / t.shots) * 100).toFixed(1) + "%" : "—";
            const tH   = Math.floor(t.playtimeMs / 3_600_000);
            const tMin = Math.floor((t.playtimeMs % 3_600_000) / 60_000);
            return (
              <tfoot>
                <tr className="bg-wf-muted/30 font-bold border-t border-wf-border">
                  <td className="py-3 px-4 text-xs text-wf-muted_text uppercase tracking-wider">Итого</td>
                  <td className="py-3 px-4 text-right tabular-nums">{t.kills.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-wf-muted_text">{t.deaths.toLocaleString()}</td>
                  <td className={cn("py-3 px-4 text-right tabular-nums", kdColor(parseFloat(tKD)))}>{tKD}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-green-400">{t.wins.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-red-400">{t.losses.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right tabular-nums">{tWR}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-wf-muted_text">{tH}ч {tMin}м</td>
                  <td className="py-3 px-4 text-right tabular-nums text-wf-muted_text">{tAcc}</td>
                </tr>
              </tfoot>
            );
          })()}
        </table>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HistoryTab({
  seasons,
  sessions,
}: {
  seasons:  SeasonStat[];
  sessions: Session[];
}) {
  return (
    <div className="space-y-10">

      {/* ── История сессий ───────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> История сессий
          </h2>
          {sessions.length > 0 && (
            <span className="text-xs text-wf-muted_text">{sessions.length} записей</span>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="bg-wf-card border border-wf-border rounded-xl p-10 text-center">
            <TrendingUp className="w-8 h-8 text-wf-muted_text/40 mx-auto mb-3" />
            <p className="text-wf-muted_text text-sm">Данные появятся после того, как профиль будет обновлён несколько раз с прогрессом в игре.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s, i) => (
              <SessionCard key={i} s={s} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* ── Рейтинговые сезоны ───────────────────────────────────────── */}
      {seasons.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" /> Рейтинговые сезоны
          </h2>
          <SeasonsTable seasons={seasons} />
        </div>
      )}

    </div>
  );
}
