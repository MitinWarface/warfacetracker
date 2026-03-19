// src/components/profile/SupportStatsCard.tsx
"use client";

import { Heart, Shield, Zap, Package } from "lucide-react";
import type { SupportStats } from "@/types/warface";

interface SupportStatsCardProps {
  stats: SupportStats;
}

export default function SupportStatsCard({ stats }: SupportStatsCardProps) {
  const hasStats = stats.healDone > 0 || stats.repairDone > 0 || 
                   stats.ressurectsMade > 0 || stats.ammoRestored > 0;

  if (!hasStats) {
    return null;
  }

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4">
        Поддержка команды
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <Heart className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-400">
            {stats.healDone.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">ОЗ восстановлено</p>
        </div>
        <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-400">
            {stats.repairDone.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">ОБ восстановлено</p>
        </div>
        <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-400">
            {stats.ressurectsMade.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">Реанимаций</p>
        </div>
        <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <Package className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-400">
            {stats.ammoRestored.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">Аптечек выдано</p>
        </div>
      </div>
    </div>
  );
}
