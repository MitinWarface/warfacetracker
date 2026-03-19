// src/app/dashboard/[nickname]/DashboardClient.tsx
"use client";

import { Trophy, Target, Zap, Shield, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { NormalizedPlayerStats } from "@/types/warface";
import { getRankInfo } from "@/services/rank.service";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from "recharts";

const CLASS_NAMES: Record<string, string> = {
  Rifleman: "Штурм",
  Medic: "Медик",
  Sniper: "Снайпер",
  Engineer: "Инженер",
  SED: "Рейнджер",
};

const CLASS_COLORS: Record<string, string> = {
  Rifleman: "text-orange-400 bg-orange-400/10",
  Medic: "text-green-400 bg-green-400/10",
  Sniper: "text-blue-400 bg-blue-400/10",
  Engineer: "text-yellow-400 bg-yellow-400/10",
  SED: "text-purple-400 bg-purple-400/10",
};

export default function DashboardClient({ player }: { player: NormalizedPlayerStats }) {
  const topWeapons = player.weapons.slice(0, 10);
  const classStats = player.classPvpStats;

  return (
    <>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="K/D Ratio"
          value={player.kdRatio.toFixed(2)}
          subValue={`${player.kills.toLocaleString()} убийств`}
          color="text-green-400"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Точность"
          value={`${player.globalAccuracy}%`}
          subValue={`HS: ${player.globalHsRate}%`}
          color="text-blue-400"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="Время в игре"
          value={`${player.playtimeH}ч ${player.playtimeMin}м`}
          subValue="Всего"
          color="text-yellow-400"
        />
        <StatCard
          icon={<Shield className="w-5 h-5" />}
          label="Победы"
          value={player.pvpWins.toLocaleString()}
          subValue={`Поражений: ${player.pvpLosses.toLocaleString()}`}
          color="text-purple-400"
        />
      </div>

      {/* PvP Stats */}
      <div className="bg-wf-card border border-wf-border rounded-lg p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-wf-accent" />
          PvP Статистика
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem label="Победы" value={player.pvpWins.toLocaleString()} />
          <StatItem label="Поражения" value={player.pvpLosses.toLocaleString()} />
          <StatItem label="Ничьи" value={player.pvpDraws.toLocaleString()} />
          <StatItem label="Всего игр" value={player.pvpTotal.toLocaleString()} />
          <StatItem label="Убийства" value={player.kills.toLocaleString()} />
          <StatItem label="Смерти" value={player.deaths.toLocaleString()} />
          <StatItem label="K/D" value={player.kdRatio.toFixed(2)} />
          <StatItem label="Друж. убийства" value={player.friendlyKills.toLocaleString()} />
        </div>
      </div>

      {/* PvE Stats */}
      <div className="bg-wf-card border border-wf-border rounded-lg p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-wf-accent" />
          PvE Статистика
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem label="Победы" value={player.pveWins.toLocaleString()} />
          <StatItem label="Поражения" value={player.pveLosses.toLocaleString()} />
          <StatItem label="Всего миссий" value={player.pveTotal.toLocaleString()} />
          <StatItem label="Убийства" value={player.pveKills.toLocaleString()} />
          <StatItem label="Смерти" value={player.pveDeaths.toLocaleString()} />
          <StatItem label="K/D" value={(player.pveKills / (player.pveDeaths || 1)).toFixed(2)} />
          <StatItem label="Друж. убийства" value={player.pveFriendlyKills.toLocaleString()} />
          {player.pveGrade && (
            <StatItem label="Разряд PVE" value={`Разряд ${player.pveGrade.grade}`} highlight />
          )}
        </div>
      </div>

      {/* Class Distribution */}
      {classStats.length > 0 && (
        <>
          <div className="bg-wf-card border border-wf-border rounded-lg p-6 mt-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-wf-accent" />
              Классы
            </h2>
            <div className="space-y-3">
              {classStats.map((cls) => (
                <div key={cls.className} className="flex items-center gap-4">
                  <span className={`w-24 text-sm font-medium ${CLASS_COLORS[cls.className]?.split(" ")[0] || "text-wf-text"}`}>
                    {CLASS_NAMES[cls.className] || cls.className}
                  </span>
                  <div className="flex-1 bg-wf-muted/20 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${CLASS_COLORS[cls.className]?.split(" ")[1] || "bg-wf-accent"}`}
                      style={{ width: `${Math.min(100, (cls.playtimeMs / classStats[0].playtimeMs) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-wf-muted_text w-20 text-right">
                    {Math.floor(cls.playtimeMs / 3600000)}ч {Math.floor((cls.playtimeMs % 3600000) / 60000)}м
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-wf-card border border-wf-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4">Время по классам</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classStats.map(c => ({
                    name: CLASS_NAMES[c.className] || c.className,
                    hours: Math.round(c.playtimeMs / 3600000),
                  }))}>
                    <Bar dataKey="hours" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-wf-card border border-wf-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4">Убийства по классам</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classStats.map(c => ({
                        name: CLASS_NAMES[c.className] || c.className,
                        value: c.kills,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {classStats.map((_, i) => (
                        <Cell key={i} fill={['#f97316', '#22c55e', '#3b82f6', '#eab308', '#a855f7'][i % 5]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Top Weapons */}
      {topWeapons.length > 0 && (
        <>
          <div className="bg-wf-card border border-wf-border rounded-lg p-6 mt-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-wf-accent" />
              Топ оружия
            </h2>
            <div className="space-y-3">
              {topWeapons.map((wpn, i) => (
                <div key={wpn.weaponId} className="flex items-center gap-4">
                  <span className="w-6 text-sm text-wf-muted_text">#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-wf-text">{wpn.weaponName}</p>
                    <p className="text-xs text-wf-muted_text">
                      {CLASS_NAMES[wpn.weaponClass] || wpn.weaponClass}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-wf-accent">{wpn.kills.toLocaleString()}</p>
                    <p className="text-xs text-wf-muted_text">убийств</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-wf-card border border-wf-border rounded-lg p-6 mt-8">
            <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4">Топ-10 оружия по убийствам</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topWeapons.slice(0, 10).map(w => ({
                  name: w.weaponName.length > 25 ? w.weaponName.slice(0, 25) + '...' : w.weaponName,
                  kills: w.kills,
                }))} layout="vertical" margin={{ left: 100 }}>
                  <Bar dataKey="kills" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Support Stats */}
      {player.supportStats && (player.supportStats.healDone > 0 || player.supportStats.repairDone > 0) && (
        <div className="bg-wf-card border border-wf-border rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-wf-accent" />
            Поддержка
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem label="Лечение" value={player.supportStats.healDone.toLocaleString()} />
            <StatItem label="Ремонт" value={player.supportStats.repairDone.toLocaleString()} />
            <StatItem label="Реанимация" value={player.supportStats.ressurectsMade.toLocaleString()} />
            <StatItem label="Аптечки" value={player.supportStats.ammoRestored.toLocaleString()} />
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ icon, label, value, subValue, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue: string;
  color: string;
}) {
  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-xs text-wf-muted_text uppercase">{label}</span>
      </div>
      <p className="text-2xl font-bold text-wf-text">{value}</p>
      <p className="text-xs text-wf-muted_text mt-1">{subValue}</p>
    </div>
  );
}

function StatItem({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-wf-muted_text mb-1">{label}</p>
      <p className={`text-lg font-semibold ${highlight ? "text-wf-accent" : "text-wf-text"}`}>{value}</p>
    </div>
  );
}
