// src/components/profile/AdditionalStatsCard.tsx
"use client";

import { Coins, Clock, Trophy, Target, Sword } from "lucide-react";
import type { NormalizedPlayerStats } from "@/types/warface";

interface AdditionalStatsCardProps {
  player: NormalizedPlayerStats;
}

export default function AdditionalStatsCard({ player }: AdditionalStatsCardProps) {
  const hasAnyStats = 
    player.gainedMoney > 0 ||
    player.maxSessionTime > 0 ||
    player.pvpKdRatio > 0 ||
    player.pveKdRatio > 0 ||
    player.pvpWinLossRatio > 0 ||
    player.totalKills > 0 ||
    player.totalPveKills > 0;

  if (!hasAnyStats) {
    return null;
  }

  const formatMoney = (amount: number) => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
    return amount.toString();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4 flex items-center gap-2">
        <Target className="w-4 h-4" />
        Дополнительная статистика
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Заработанные деньги */}
        {player.gainedMoney > 0 && (
          <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-400">
              {formatMoney(player.gainedMoney)}
            </p>
            <p className="text-xs text-wf-muted_text mt-1">Заработано ₩</p>
          </div>
        )}

        {/* Максимальное время сессии */}
        {player.maxSessionTime > 0 && (
          <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-400">
              {formatTime(player.maxSessionTime)}
            </p>
            <p className="text-xs text-wf-muted_text mt-1">Макс. сессия</p>
          </div>
        )}

        {/* PvP K/D из API */}
        {player.pvpKdRatio > 0 && (
          <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <Sword className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">
              {player.pvpKdRatio.toFixed(2)}
            </p>
            <p className="text-xs text-wf-muted_text mt-1">PvP K/D (API)</p>
          </div>
        )}

        {/* PvE K/D из API */}
        {player.pveKdRatio > 0 && (
          <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-400">
              {player.pveKdRatio.toFixed(2)}
            </p>
            <p className="text-xs text-wf-muted_text mt-1">PvE K/D (API)</p>
          </div>
        )}

        {/* Win/Loss Ratio */}
        {player.pvpWinLossRatio > 0 && (
          <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Trophy className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-400">
              {player.pvpWinLossRatio.toFixed(2)}
            </p>
            <p className="text-xs text-wf-muted_text mt-1">W/L Ratio</p>
          </div>
        )}

        {/* Общие убийства */}
        {player.totalKills > 0 && (
          <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <Sword className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-400">
              {player.totalKills.toLocaleString()}
            </p>
            <p className="text-xs text-wf-muted_text mt-1">Всего убийств</p>
          </div>
        )}

        {/* PvE убийства */}
        {player.totalPveKills > 0 && (
          <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-400">
              {player.totalPveKills.toLocaleString()}
            </p>
            <p className="text-xs text-wf-muted_text mt-1">PvE убийств</p>
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="mt-4 p-3 bg-wf-accent/10 border border-wf-accent/20 rounded-lg">
        <p className="text-xs text-wf-muted_text">
          💡 Данные получены напрямую из API Warface и могут отличаться от вычисленных значений
        </p>
      </div>
    </div>
  );
}
