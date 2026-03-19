// src/components/profile/SessionEndCard.tsx
"use client";

import { LogOut, UserX, WifiOff } from "lucide-react";
import type { NormalizedPlayerStats } from "@/types/warface";

interface SessionEndCardProps {
  player: NormalizedPlayerStats;
}

export default function SessionEndCard({ player }: SessionEndCardProps) {
  const { sessionsLeft, sessionsKicked, sessionsLostConnection } = player;
  const hasStats = sessionsLeft > 0 || sessionsKicked > 0 || sessionsLostConnection > 0;

  if (!hasStats) {
    return null;
  }

  const totalSessions = sessionsLeft + sessionsKicked + sessionsLostConnection;

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-wf-muted_text uppercase flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Завершения сессий
        </h3>
        <span className="text-xs text-wf-muted_text">
          Всего: {totalSessions.toLocaleString()}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <LogOut className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-400">
            {sessionsLeft.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">Выходы</p>
        </div>
        <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
          <UserX className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-400">
            {sessionsKicked.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">Кики</p>
        </div>
        <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <WifiOff className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-400">
            {sessionsLostConnection.toLocaleString()}
          </p>
          <p className="text-xs text-wf-muted_text mt-1">Обрывы</p>
        </div>
      </div>
    </div>
  );
}
