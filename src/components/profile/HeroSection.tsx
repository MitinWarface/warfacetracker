// src/components/profile/HeroSection.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Clock, Crosshair, Swords, Zap, Star, Medal, Trophy, Image as ImageIcon } from "lucide-react";
import { getRankInfo, getRankProgressPercent, TIER_COLORS, TIER_BG } from "@/services/rank.service";
import type { NormalizedPlayerStats } from "@/types/warface";
import { cn } from "@/lib/utils";
import RefreshButton from "./RefreshButton";
import ProfileCardGenerator from "./ProfileCardGenerator";

const GRADE_COLORS: Record<number, string> = {
  1: "text-yellow-300 border-yellow-500/60 bg-yellow-900/20",
  2: "text-orange-300 border-orange-500/60 bg-orange-900/20",
  3: "text-blue-300   border-blue-500/60   bg-blue-900/20",
  4: "text-green-300  border-green-500/60  bg-green-900/20",
  5: "text-teal-300   border-teal-500/60   bg-teal-900/20",
  6: "text-gray-300   border-gray-500/60   bg-gray-900/20",
  7: "text-gray-400   border-gray-600/60   bg-gray-900/10",
};

const CLASS_RU: Record<string, string> = {
  Rifleman: "Штурмовик", Medic: "Медик", Sniper: "Снайпер",
  Recon: "Снайпер", Engineer: "Инженер", SED: "СЗД", Heavy: "Тяжёлый",
};

function pveSeasonLabel(season: string): string {
  const MONTHS: Record<string, string> = {
    jan:"Янв", feb:"Фев", mar:"Мар", apr:"Апр", may:"Май", jun:"Июн",
    jul:"Июл", aug:"Авг", sep:"Сен", oct:"Окт", nov:"Ноя", dec:"Дек",
  };
  const m = season.match(/^pve_([a-z]+)(\d+)$/);
  if (!m) return season;
  return `${MONTHS[m[1]] ?? m[1]} ${m[2]}`;
}

export default function HeroSection({ 
  player, 
  showCardGenerator = false,
  backgroundPreset,
}: { 
  player: NormalizedPlayerStats; 
  showCardGenerator?: boolean;
  backgroundPreset?: string | null;
}) {
  const [showCardGen, setShowCardGen] = useState(false);
  const rank       = getRankInfo(player.rankId);
  const xpProgress = getRankProgressPercent(player.rankId, player.experience);
  const nextRank   = getRankInfo(player.rankId + 1);

  const pvpWinRate = player.pvpTotal > 0
    ? ((player.pvpWins / player.pvpTotal) * 100).toFixed(1)
    : "0";

  const currentSeason = player.seasonStats[0];
  const seasonKd = currentSeason && currentSeason.deaths > 0
    ? (currentSeason.kills / currentSeason.deaths).toFixed(2)
    : null;
  const seasonWr = currentSeason && (currentSeason.wins + currentSeason.losses) > 0
    ? ((currentSeason.wins / (currentSeason.wins + currentSeason.losses)) * 100).toFixed(0)
    : null;

  return (
    <section className="relative overflow-hidden border-b border-wf-border">
      {/* Background - Фон профиля (основной) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: backgroundPreset && backgroundPreset !== "none"
            ? `url(https://cdn.wfts.su/profile_backgrounds/${backgroundPreset}.jpg)`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-hero-gradient" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 50%)," +
              "repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── Left: rank icon + player core ─────────────────────────── */}
          <div className="flex gap-5 items-start flex-1 min-w-0">

            {/* Rank icon */}
            <div className={cn(
              "flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center border border-wf-border/60 shadow-lg",
              TIER_BG[rank.tier]
            )}>
              <div
                title={rank.name}
                style={{
                  width:  64,
                  height: 64,
                  backgroundImage:    "url('/ranks_all.png')",
                  backgroundRepeat:   "no-repeat",
                  backgroundSize:     "64px 6408px",
                  backgroundPosition: `0px ${-(rank.id - 1) * 64}px`,
                  imageRendering:     "auto",
                }}
              />
            </div>

            {/* Player info */}
            <div className="flex-1 min-w-0">

              {/* Name row */}
              <div className="flex items-center gap-2 flex-wrap">
                {player.clanName && (
                  <Link
                    href={`/clan/${encodeURIComponent(player.clanName)}`}
                    className="px-2 py-0.5 text-xs font-bold bg-wf-accent/20 text-wf-accent border border-wf-accent/40 rounded hover:bg-wf-accent/30 transition-colors shrink-0"
                  >
                    [{player.clanName}]
                  </Link>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold text-wf-text truncate">
                  {player.nickname}
                </h1>
              </div>

              {/* Rank title */}
              <p className={cn("text-sm font-semibold mt-0.5", TIER_COLORS[rank.tier])}>
                <Shield className="inline w-3.5 h-3.5 mr-1 opacity-80" />
                {rank.name}
              </p>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-wf-muted/30 text-wf-muted_text text-xs">
                  <Clock className="w-3 h-3" />
                  {player.playtimeH.toLocaleString()}ч {player.playtimeMin}м
                </span>
                {player.favPvP && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-wf-muted/30 text-wf-muted_text text-xs">
                    <Crosshair className="w-3 h-3" />
                    {CLASS_RU[player.favPvP] ?? player.favPvP}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-wf-muted/30 text-wf-muted_text text-xs">
                  {player.experience.toLocaleString()} XP
                </span>
              </div>

              {/* XP progress */}
              <div className="mt-3 space-y-1 max-w-sm">
                <div className="flex justify-between text-[11px] text-wf-muted_text">
                  <span className="opacity-70">
                    → {nextRank.name.startsWith("Rank ") ? `Ранг ${nextRank.id}` : nextRank.name}
                  </span>
                  <span className="font-medium">{xpProgress.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-wf-muted/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-wf-accent rounded-full transition-all"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>

              {/* Badges */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {player.pveGrade && (
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold",
                    GRADE_COLORS[player.pveGrade.grade] ?? GRADE_COLORS[7]
                  )}>
                    <Zap className="w-3 h-3" />
                    PVE Разряд {player.pveGrade.grade}
                    <span className="opacity-60 font-normal">· {pveSeasonLabel(player.pveGrade.season)}</span>
                  </span>
                )}

                {currentSeason && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold text-wf-accent border-wf-accent/40 bg-wf-accent/10">
                    <Swords className="w-3 h-3" />
                    РМ {currentSeason.label}
                    <span className="opacity-70 font-normal">
                      · {currentSeason.wins}В/{currentSeason.losses}П
                      {seasonWr && ` · ${seasonWr}%`}
                      {seasonKd && ` · K/D ${seasonKd}`}
                    </span>
                  </span>
                )}

                {player.clanRole && (
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold",
                    player.clanRole === "MASTER"
                      ? "text-yellow-300 border-yellow-500/50 bg-yellow-900/20"
                      : player.clanRole === "OFFICER"
                      ? "text-blue-300 border-blue-500/50 bg-blue-900/20"
                      : "text-gray-300 border-gray-500/50 bg-gray-900/20"
                  )}>
                    <Star className="w-3 h-3" />
                    {player.clanRole === "MASTER" ? "Командир" : player.clanRole === "OFFICER" ? "Офицер" : "Боец"}
                    {player.clanPoints && <span className="opacity-70 font-normal">· {player.clanPoints.toLocaleString()} оч.</span>}
                  </span>
                )}

                {player.top100 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold text-yellow-300 border-yellow-500/50 bg-yellow-900/20">
                    <Medal className="w-3 h-3" />
                    Топ-{player.top100.position} · {CLASS_RU[player.top100.className] ?? player.top100.className}
                  </span>
                )}

                {showCardGenerator && (
                  <button
                    onClick={() => setShowCardGen(true)}
                    className="inline-flex items-center gap-1 px-3 py-0.5 rounded border text-[11px] font-semibold text-white border-wf-accent/50 bg-wf-accent/30 hover:bg-wf-accent/50 transition-colors"
                  >
                    <ImageIcon className="w-3 h-3" />
                    Создать карточку
                  </button>
                )}
              </div>

              {/* Refresh + timestamp */}
              <div className="mt-3 space-y-1">
                <RefreshButton nickname={player.nickname} />
                {player.lastUpdatedAt && (() => {
                  const d = new Date(player.lastUpdatedAt);
                  if (isNaN(d.getTime())) return null;
                  return (
                    <p className="text-[11px] text-wf-muted_text opacity-50">
                      Актуально на{" "}
                      {d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      {", "}
                      {d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* ── Right: stats panel ─────────────────────────────────────── */}
          <div className="flex flex-row lg:flex-col gap-3 lg:w-44 shrink-0">
            {/* K/D */}
            <div className="flex-1 lg:flex-none bg-wf-card/80 border border-wf-border rounded-xl px-4 py-3 text-center backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold text-wf-accent tabular-nums">
                {player.kdRatio.toFixed(2)}
              </div>
              <div className="text-[10px] text-wf-muted_text uppercase tracking-widest mt-0.5">K/D</div>
              <div className="text-xs text-wf-muted_text mt-1 tabular-nums">
                {player.kills.toLocaleString()} / {player.deaths.toLocaleString()}
              </div>
            </div>
            {/* Win rate */}
            <div className="flex-1 lg:flex-none bg-wf-card/80 border border-wf-border rounded-xl px-4 py-3 text-center backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold text-green-400 tabular-nums">
                {pvpWinRate}%
              </div>
              <div className="text-[10px] text-wf-muted_text uppercase tracking-widest mt-0.5">Побед</div>
              <div className="text-xs text-wf-muted_text mt-1 tabular-nums flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3 text-green-400/70" />
                {player.pvpWins.toLocaleString()}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Card Generator Modal */}
      {showCardGenerator && showCardGen && (
        <ProfileCardGenerator
          player={player}
          onClose={() => setShowCardGen(false)}
        />
      )}
    </section>
  );
}
