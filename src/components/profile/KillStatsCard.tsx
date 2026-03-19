// src/components/profile/KillStatsCard.tsx
"use client";

import { Skull, Crosshair, Bomb, Shield } from "lucide-react";
import type { NormalizedPlayerStats } from "@/types/warface";

interface KillStatsCardProps {
  player: NormalizedPlayerStats;
}

export default function KillStatsCard({ player }: KillStatsCardProps) {
  const { killsMelee, killsClaymore, killsDevice, killsAi, friendlyKillsPvp } = player;
  const hasStats = killsMelee > 0 || killsClaymore > 0 || killsDevice > 0 || killsAi > 0 || friendlyKillsPvp > 0;

  if (!hasStats) {
    return null;
  }

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4">
        Типы убийств
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <Skull className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-400">
            {killsMelee.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">Ближний бой</p>
        </div>
        <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <Bomb className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-400">
            {killsClaymore.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">Мины</p>
        </div>
        <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <Crosshair className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-400">
            {killsDevice.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">Техника</p>
        </div>
        <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-400">
            {killsAi.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">Убийства ИИ (PvE)</p>
        </div>
        <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <Skull className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-400">
            {friendlyKillsPvp.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">Тимкилы</p>
        </div>
      </div>
    </div>
  );
}
