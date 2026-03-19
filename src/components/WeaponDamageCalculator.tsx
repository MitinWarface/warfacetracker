// src/components/WeaponDamageCalculator.tsx
"use client";

import { useState, useMemo } from "react";
import { Crosshair, Target, Zap, Shield } from "lucide-react";

interface WeaponStats {
  id: string;
  name: string;
  damage: number;
  fireRate: number; // выстрелов в минуту
  accuracy: number; // базовая точность %
  headshotMultiplier: number;
}

const WEAPONS: WeaponStats[] = [
  { id: "ar1", name: "AK-12", damage: 32, fireRate: 650, accuracy: 75, headshotMultiplier: 1.6 },
  { id: "ar2", name: "SCAR-H", damage: 40, fireRate: 550, accuracy: 80, headshotMultiplier: 1.6 },
  { id: "smg1", name: "MP5A5", damage: 22, fireRate: 800, accuracy: 70, headshotMultiplier: 1.5 },
  { id: "smg2", name: "Kriss", damage: 28, fireRate: 700, accuracy: 72, headshotMultiplier: 1.5 },
  { id: "sr1", name: "AWM", damage: 120, fireRate: 60, accuracy: 95, headshotMultiplier: 2.5 },
  { id: "sr2", name: "SV-98", damage: 100, fireRate: 70, accuracy: 92, headshotMultiplier: 2.5 },
  { id: "shg1", name: "USAS-12", damage: 18, fireRate: 400, accuracy: 50, headshotMultiplier: 1.5 },
  { id: "mg1", name: "M249", damage: 30, fireRate: 750, accuracy: 65, headshotMultiplier: 1.7 },
];

const DISTANCE_MODIFIERS = {
  close: { name: "Близко (0-20м)", modifier: 1.0 },
  medium: { name: "Средне (20-50м)", modifier: 0.85 },
  long: { name: "Далеко (50м+)", modifier: 0.7 },
};

export default function WeaponDamageCalculator() {
  const [weapon1, setWeapon1] = useState<WeaponStats>(WEAPONS[0]);
  const [weapon2, setWeapon2] = useState<WeaponStats>(WEAPONS[1]);
  const [distance, setDistance] = useState<keyof typeof DISTANCE_MODIFIERS>("close");
  const [shotsFired, setShotsFired] = useState(10);

  const calculateDPS = (weapon: WeaponStats, dist: keyof typeof DISTANCE_MODIFIERS) => {
    const distMod = DISTANCE_MODIFIERS[dist].modifier;
    const effectiveDamage = weapon.damage * distMod * (weapon.accuracy / 100);
    return (effectiveDamage * weapon.fireRate) / 60;
  };

  const calculateTTK = (dps: number, targetHealth: number = 100) => {
    if (dps <= 0) return Infinity;
    return (targetHealth / dps) * 1000; // в миллисекундах
  };

  const weapon1DPS = useMemo(() => calculateDPS(weapon1, distance), [weapon1, distance]);
  const weapon2DPS = useMemo(() => calculateDPS(weapon2, distance), [weapon2, distance]);
  
  const weapon1TTK = calculateTTK(weapon1DPS);
  const weapon2TTK = calculateTTK(weapon2DPS);

  const weapon1TotalDamage = weapon1DPS * (shotsFired / (weapon1.fireRate / 60));
  const weapon2TotalDamage = weapon2DPS * (shotsFired / (weapon2.fireRate / 60));

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4 flex items-center gap-2">
        <Crosshair className="w-4 h-4" />
        Калькулятор урона
      </h3>

      {/* Weapon Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs text-wf-muted_text mb-2 block">Оружие 1</label>
          <select
            value={weapon1.id}
            onChange={(e) => setWeapon1(WEAPONS.find(w => w.id === e.target.value) || WEAPONS[0])}
            className="w-full px-3 py-2 bg-wf-bg border border-wf-border rounded text-white text-sm focus:outline-none focus:border-wf-accent"
          >
            {WEAPONS.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-wf-muted_text mb-2 block">Оружие 2</label>
          <select
            value={weapon2.id}
            onChange={(e) => setWeapon2(WEAPONS.find(w => w.id === e.target.value) || WEAPONS[1])}
            className="w-full px-3 py-2 bg-wf-bg border border-wf-border rounded text-white text-sm focus:outline-none focus:border-wf-accent"
          >
            {WEAPONS.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Distance Selection */}
      <div className="mb-6">
        <label className="text-xs text-wf-muted_text mb-2 block flex items-center gap-2">
          <Target className="w-3 h-3" />
          Дистанция
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(DISTANCE_MODIFIERS) as [keyof typeof DISTANCE_MODIFIERS, typeof DISTANCE_MODIFIERS['close']][]).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setDistance(key)}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                distance === key
                  ? "bg-wf-accent text-black border-wf-accent"
                  : "bg-wf-bg text-wf-muted_text border-wf-border hover:border-wf-accent/40"
              }`}
            >
              {data.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Weapon 1 Stats */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-green-400">{weapon1.name}</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-wf-muted_text">DPS:</span>
              <span className="text-white font-semibold">{weapon1DPS.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-wf-muted_text">TTK:</span>
              <span className="text-white font-semibold">{weapon1TTK.toFixed(0)} мс</span>
            </div>
            <div className="flex justify-between">
              <span className="text-wf-muted_text">Урон за {shotsFired} выстрелов:</span>
              <span className="text-white font-semibold">{weapon1TotalDamage.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Weapon 2 Stats */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-red-400">{weapon2.name}</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-wf-muted_text">DPS:</span>
              <span className="text-white font-semibold">{weapon2DPS.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-wf-muted_text">TTK:</span>
              <span className="text-white font-semibold">{weapon2TTK.toFixed(0)} мс</span>
            </div>
            <div className="flex justify-between">
              <span className="text-wf-muted_text">Урон за {shotsFired} выстрелов:</span>
              <span className="text-white font-semibold">{weapon2TotalDamage.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Winner */}
      <div className={`p-3 rounded-lg border ${
        weapon1DPS > weapon2DPS 
          ? "bg-green-900/20 border-green-500/30" 
          : weapon2DPS > weapon1DPS 
            ? "bg-red-900/20 border-red-500/30"
            : "bg-gray-900/20 border-gray-500/30"
      }`}>
        <div className="flex items-center gap-2 text-sm">
          <Zap className={`w-4 h-4 ${
            weapon1DPS > weapon2DPS ? "text-green-400" : weapon2DPS > weapon1DPS ? "text-red-400" : "text-gray-400"
          }`} />
          <span>
            {weapon1DPS > weapon2DPS 
              ? `${weapon1.name} лучше на ${((weapon1DPS / weapon2DPS - 1) * 100).toFixed(1)}%`
              : weapon2DPS > weapon1DPS
                ? `${weapon2.name} лучше на ${((weapon2DPS / weapon1DPS - 1) * 100).toFixed(1)}%`
                : "Оружие равнозначно"
            }
          </span>
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-wf-muted_text mt-4 text-center">
        💡 DPS = урон в секунду, TTK = время до убийства (100 HP)
      </p>
    </div>
  );
}
