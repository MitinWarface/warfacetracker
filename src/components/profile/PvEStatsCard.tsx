// src/components/profile/PvEStatsCard.tsx
// Карточка PvE статистики игрока

import { Crown, Target, Clock, Award, TrendingUp, Skull } from "lucide-react";

interface PvEStatsCardProps {
  missionsCompleted: number;
  crownsEarned: number;
  totalKills: number;
  totalDeaths: number;
  kdRatio: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  specialOperationsCompleted: number;
  survivalMissionsCompleted: number;
  favoriteClass?: string;
  favoriteWeapon?: string;
}

const CLASS_NAMES: Record<string, string> = {
  Rifleman: "Штурм",
  Medic: "Медик",
  Sniper: "Снайпер",
  Engineer: "Инженер",
  SED: "Рейнджер",
};

export default function PvEStatsCard({
  missionsCompleted,
  crownsEarned,
  totalKills,
  totalDeaths,
  kdRatio,
  totalWins,
  totalLosses,
  winRate,
  specialOperationsCompleted,
  survivalMissionsCompleted,
  favoriteClass,
  favoriteWeapon,
}: PvEStatsCardProps) {
  const totalMissions = missionsCompleted + specialOperationsCompleted + survivalMissionsCompleted;

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <h3 className="text-lg font-bold text-wf-text mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-wf-accent" />
        PvE Статистика
      </h3>

      {/* Основные статистики */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Короны */}
        <div className="bg-wf-muted/20 rounded-lg p-4 text-center">
          <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-wf-text">{crownsEarned.toLocaleString()}</p>
          <p className="text-xs text-wf-muted_text">Корон получено</p>
        </div>

        {/* Убийства */}
        <div className="bg-wf-muted/20 rounded-lg p-4 text-center">
          <Skull className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-wf-text">{totalKills.toLocaleString()}</p>
          <p className="text-xs text-wf-muted_text">Убийств</p>
        </div>

        {/* K/D */}
        <div className="bg-wf-muted/20 rounded-lg p-4 text-center">
          <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-wf-accent">{kdRatio.toFixed(2)}</p>
          <p className="text-xs text-wf-muted_text">K/D</p>
        </div>

        {/* Победы */}
        <div className="bg-wf-muted/20 rounded-lg p-4 text-center">
          <Award className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-wf-text">{totalWins.toLocaleString()}</p>
          <p className="text-xs text-wf-muted_text">Побед</p>
        </div>
      </div>

      {/* Пройдено миссий */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-wf-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-wf-muted_text">Обычные миссии</span>
            <Target className="w-4 h-4 text-wf-accent" />
          </div>
          <p className="text-xl font-bold text-wf-text">{missionsCompleted.toLocaleString()}</p>
          <div className="mt-2 h-2 bg-wf-muted/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-wf-accent transition-all"
              style={{ width: `${Math.min(100, (missionsCompleted / Math.max(1, totalMissions)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-wf-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-wf-muted_text">Спецоперации</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-wf-text">{specialOperationsCompleted.toLocaleString()}</p>
          <div className="mt-2 h-2 bg-wf-muted/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${Math.min(100, (specialOperationsCompleted / Math.max(1, totalMissions)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-wf-bg rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-wf-muted_text">Выживание</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-xl font-bold text-wf-text">{survivalMissionsCompleted.toLocaleString()}</p>
          <div className="mt-2 h-2 bg-wf-muted/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${Math.min(100, (survivalMissionsCompleted / Math.max(1, totalMissions)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Win Rate */}
      <div className="bg-wf-bg rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-wf-muted_text">Win Rate</span>
          <span className="text-sm font-bold text-wf-accent">{winRate.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-wf-muted/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-wf-accent to-green-400 transition-all"
            style={{ width: `${winRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-wf-muted_text">
          <span>Победы: {totalWins.toLocaleString()}</span>
          <span>Поражения: {totalLosses.toLocaleString()}</span>
        </div>
      </div>

      {/* Любимые класс и оружие */}
      {(favoriteClass || favoriteWeapon) && (
        <div className="grid grid-cols-2 gap-4">
          {favoriteClass && (
            <div className="bg-wf-muted/20 rounded-lg p-3">
              <p className="text-xs text-wf-muted_text mb-1">Любимый класс</p>
              <p className="text-sm font-bold text-wf-text">{CLASS_NAMES[favoriteClass] || favoriteClass}</p>
            </div>
          )}
          {favoriteWeapon && (
            <div className="bg-wf-muted/20 rounded-lg p-3">
              <p className="text-xs text-wf-muted_text mb-1">Любимое оружие</p>
              <p className="text-sm font-bold text-wf-text truncate">{favoriteWeapon}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
