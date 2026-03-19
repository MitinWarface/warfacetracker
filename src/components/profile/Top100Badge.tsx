// src/components/profile/Top100Badge.tsx
"use client";

import { Medal } from "lucide-react";

interface Top100BadgeProps {
  position: number;
  className: string;
}

const CLASS_RU: Record<string, string> = {
  Rifleman: "Штурмовик",
  Medic: "Медик",
  Sniper: "Снайпер",
  Recon: "Снайпер",
  Engineer: "Инженер",
  SED: "СЗД",
  Heavy: "Тяжёлый",
};

export default function Top100Badge({ position, className }: Top100BadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30">
      <Medal className="w-5 h-5 text-yellow-400" />
      <div>
        <p className="text-sm font-bold text-yellow-400">
          Топ-{position} в рейтинге
        </p>
        <p className="text-xs text-yellow-300/70">
          {CLASS_RU[className] ?? className}
        </p>
      </div>
    </div>
  );
}
