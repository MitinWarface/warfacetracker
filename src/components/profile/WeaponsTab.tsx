// src/components/profile/WeaponsTab.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import type { NormalizedWeapon } from "@/types/warface";
import { cn } from "@/lib/utils";
import { proxyImageUrl } from "@/lib/image-proxy";
import weaponNamesRaw from "@/lib/weapon-names.json";

const WEAPON_NAMES = weaponNamesRaw as Record<string, string>;

function getWeaponDisplayName(weaponId: string, fallback: string): string {
  const bare = weaponId.replace(/_shop$/, "");
  if (WEAPON_NAMES[bare]) return WEAPON_NAMES[bare];
  if (WEAPON_NAMES[weaponId]) return WEAPON_NAMES[weaponId];
  const base = bare.replace(/_[a-z0-9]+$/, "");
  if (base !== bare && WEAPON_NAMES[base]) {
    const skin = bare.slice(base.length + 1).replace(/_/g, " ");
    return `${WEAPON_NAMES[base]} | '${skin}'`;
  }
  return fallback;
}

const CLASS_RU: Record<string, string> = {
  Rifleman: "Штурмовик",
  Medic:    "Медик",
  Sniper:   "Снайпер",
  Recon:    "Снайпер",
  Engineer: "Инженер",
  SED:      "СЗД",
  Heavy:    "Тяжёлый",
};

const CLASS_COLORS: Record<string, string> = {
  Rifleman: "text-orange-400",
  Medic:    "text-green-400",
  Sniper:   "text-blue-400",
  Recon:    "text-blue-400",
  Engineer: "text-yellow-400",
  SED:      "text-purple-400",
  Heavy:    "text-red-400",
};

const CLASS_BORDER_ACTIVE: Record<string, string> = {
  Rifleman: "border-orange-500 text-orange-400",
  Medic:    "border-green-500  text-green-400",
  Sniper:   "border-blue-500   text-blue-400",
  Recon:    "border-blue-500   text-blue-400",
  Engineer: "border-yellow-500 text-yellow-400",
  SED:      "border-purple-500 text-purple-400",
  Heavy:    "border-red-500    text-red-400",
};

const WPN_CDN = "https://cdn.wfts.su/weapons";

function weaponImageUrls(weaponId: string): string[] {
  const bare = weaponId.replace(/_shop$/, "");
  const base = bare.replace(/_[a-z0-9]+$/i, "");
  const urls: string[] = [];

  // Проксируем все URL через helper
  urls.push(proxyImageUrl(`${WPN_CDN}/weapons_${bare}.png`));
  if (base !== bare) {
    urls.push(proxyImageUrl(`${WPN_CDN}/weapons_${base}.png`));
  }

  return urls;
}

function WeaponImage({ weaponId, name }: { weaponId: string; name: string }) {
  const urls = weaponImageUrls(weaponId);
  const [idx, setIdx] = useState(0);

  if (idx >= urls.length) {
    return (
      <div className="w-full h-20 flex items-center justify-center bg-wf-muted/30 rounded">
        <span className="text-[10px] text-wf-muted_text text-center px-2 leading-tight">{name}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={urls[idx]}
      alt={name}
      onError={() => setIdx((i) => i + 1)}
      className="w-full h-20 object-contain"
      loading="lazy"
    />
  );
}

export default function WeaponsTab({ weapons }: { weapons: NormalizedWeapon[] }) {
  const hasPlaytime = weapons.some((w) => w.playtimeMs > 0);
  const totalKills  = weapons.reduce((s, w) => s + w.kills, 0);
  const totalUsage  = weapons.reduce((s, w) => s + w.usage,  0);
  const totalShots  = weapons.reduce((s, w) => s + w.shots, 0);
  const totalHits   = weapons.reduce((s, w) => s + w.hits, 0);
  const totalHS     = weapons.reduce((s, w) => s + w.headshots, 0);

  // Classes sorted by kills descending
  const classes = useMemo(() => {
    const totals = new Map<string, number>();
    for (const w of weapons) {
      const val = hasPlaytime ? w.playtimeMs : w.kills > 0 ? w.kills : w.usage;
      totals.set(w.weaponClass, (totals.get(w.weaponClass) ?? 0) + val);
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([cls]) => cls);
  }, [weapons, hasPlaytime]);

  const [activeClass, setActiveClass] = useState<string>("");

  // Reset to first class whenever weapons (re)load
  useEffect(() => {
    if (classes.length > 0 && !classes.includes(activeClass)) {
      setActiveClass(classes[0]);
    }
  }, [classes, activeClass]);

  const classMeta = useMemo(() => {
    const map = new Map<string, { kills: number; usage: number; count: number; playtimeMs: number }>();
    for (const w of weapons) {
      const cur = map.get(w.weaponClass) ?? { kills: 0, usage: 0, count: 0, playtimeMs: 0 };
      map.set(w.weaponClass, {
        kills:      cur.kills + w.kills,
        usage:      cur.usage + w.usage,
        count:      cur.count + 1,
        playtimeMs: cur.playtimeMs + w.playtimeMs,
      });
    }
    return map;
  }, [weapons]);

  const filtered = useMemo(
    () => weapons.filter((w) => w.weaponClass === activeClass),
    [weapons, activeClass]
  );

  // Favorite weapon per class (top by kills, fallback usage)
  const favByClass = useMemo(() => {
    const map = new Map<string, NormalizedWeapon>();
    for (const cls of classes) {
      const clsWeapons = weapons.filter((w) => w.weaponClass === cls);
      if (clsWeapons.length === 0) continue;
      const top = clsWeapons.reduce((best, w) => {
        if (hasPlaytime) return w.playtimeMs > best.playtimeMs ? w : best;
        const wVal    = w.kills    > 0 ? w.kills    : w.usage;
        const bestVal = best.kills > 0 ? best.kills : best.usage;
        return wVal > bestVal ? w : best;
      });
      map.set(cls, top);
    }
    return map;
  }, [weapons, classes, hasPlaytime]);

  const totalAccuracy = totalShots > 0 ? ((totalHits / totalShots) * 100).toFixed(1) : null;
  const shotsPerHit   = totalHits > 0  ? (totalShots / totalHits).toFixed(1) : null;
  const shotsPerHS    = totalHS > 0    ? (totalShots / totalHS).toFixed(1) : null;

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-wf-card border border-wf-border rounded-lg p-4">
          <div className="text-xs text-wf-muted_text uppercase tracking-wider mb-1">Оружий всего</div>
          <div className="text-2xl font-bold text-wf-text">{weapons.length}</div>
        </div>
        <div className="bg-wf-card border border-wf-border rounded-lg p-4">
          <div className="text-xs text-wf-muted_text uppercase tracking-wider mb-1">Убийств всего</div>
          <div className="text-2xl font-bold text-wf-accent">{totalKills.toLocaleString()}</div>
          <div className="text-xs text-wf-muted_text mt-1">{totalUsage.toLocaleString()} выстрелов</div>
        </div>
        {totalShots > 0 && (
          <div className="bg-wf-card border border-wf-border rounded-lg p-4">
            <div className="text-xs text-wf-muted_text uppercase tracking-wider mb-1">Попаданий</div>
            <div className="text-2xl font-bold text-wf-text">{totalHits.toLocaleString()}</div>
            {totalAccuracy && (
              <div className="text-xs text-wf-muted_text mt-1">Меткость {totalAccuracy}%</div>
            )}
          </div>
        )}
        {totalHS > 0 && (
          <div className="bg-wf-card border border-wf-border rounded-lg p-4">
            <div className="text-xs text-wf-muted_text uppercase tracking-wider mb-1">Хедшоты</div>
            <div className="text-2xl font-bold text-wf-text">{totalHS.toLocaleString()}</div>
            {shotsPerHS && (
              <div className="text-xs text-wf-muted_text mt-1">{shotsPerHS} выстр./хедшот</div>
            )}
          </div>
        )}
      </div>

      {/* Accuracy breakdown */}
      {totalShots > 0 && (
        <div className="bg-wf-card border border-wf-border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest mb-3">Меткость</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-wf-muted_text mb-1">Выстрелов</div>
              <div className="text-lg font-bold text-wf-text">{totalShots.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-wf-muted_text mb-1">Попаданий</div>
              <div className="text-lg font-bold text-wf-text">{totalHits.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-wf-muted_text mb-1">Хедшотов</div>
              <div className="text-lg font-bold text-wf-text">{totalHS.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-wf-muted_text mb-1">Общая меткость</div>
              <div className="text-lg font-bold text-wf-accent">{totalAccuracy ?? "—"}%</div>
            </div>
          </div>
          {(shotsPerHit || shotsPerHS) && (
            <div className="mt-3 pt-3 border-t border-wf-border/40 grid grid-cols-2 gap-4 text-sm">
              {shotsPerHit && (
                <div className="text-wf-muted_text">
                  Выстрелов на попадание: <span className="text-wf-text font-semibold">{shotsPerHit}</span>
                </div>
              )}
              {shotsPerHS && (
                <div className="text-wf-muted_text">
                  Выстрелов на хедшот: <span className="text-wf-text font-semibold">{shotsPerHS}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Favorite weapon per class */}
      {favByClass.size > 0 && (
        <div className="bg-wf-card border border-wf-border rounded-lg p-4">
          <h3 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest mb-3">
            Любимое оружие по классам
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {classes.map((cls) => {
              const w = favByClass.get(cls);
              if (!w) return null;
              return (
                <div key={cls} className="text-center">
                  <div className={cn("text-xs font-semibold uppercase mb-2", CLASS_COLORS[cls] ?? "text-wf-muted_text")}>
                    {CLASS_RU[cls] ?? cls}
                  </div>
                  <div className="bg-wf-muted/30 rounded-lg p-2">
                    <WeaponImage weaponId={w.weaponId} name={getWeaponDisplayName(w.weaponId, w.weaponName)} />
                  </div>
                  <div className="text-xs text-wf-text font-medium mt-1 truncate" title={getWeaponDisplayName(w.weaponId, w.weaponName)}>
                    {getWeaponDisplayName(w.weaponId, w.weaponName)}
                  </div>
                  <div className="text-[10px] text-wf-muted_text">
                    {hasPlaytime && w.playtimeMs > 0
                      ? `${w.playtimeH}ч ${w.playtimeMin}м`
                      : w.kills > 0
                        ? `${w.kills.toLocaleString()} убийств`
                        : `${w.usage.toLocaleString()} выстрелов`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Class tab buttons */}
      <div className="flex gap-1 border-b border-wf-border overflow-x-auto">
        {classes.map((cls) => {
          const meta = classMeta.get(cls)!;
          const isActive = activeClass === cls;
          return (
            <button
              key={cls}
              onClick={() => setActiveClass(cls)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2",
                isActive
                  ? (CLASS_BORDER_ACTIVE[cls] ?? "border-wf-accent text-wf-accent")
                  : "border-transparent text-wf-muted_text hover:text-wf-text"
              )}
            >
              {CLASS_RU[cls] ?? cls}
              <span className="text-xs bg-wf-muted px-1.5 py-0.5 rounded tabular-nums">
                {meta.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Weapon cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((w, i) => {
          const meta       = classMeta.get(w.weaponClass);
          const classMs    = meta?.playtimeMs ?? 1;
          const classKills = meta?.kills ?? 0;
          const classUsage = meta?.usage ?? 1;
          const classShare = hasPlaytime && classMs > 0
            ? (w.playtimeMs / classMs) * 100
            : classKills > 0
              ? (w.kills / classKills) * 100
              : classUsage > 0 ? (w.usage / classUsage) * 100 : 0;
          const accuracy = w.shots > 0 ? ((w.hits / w.shots) * 100).toFixed(1) : null;

          return (
            <div
              key={w.weaponId}
              className="bg-wf-card border border-wf-border rounded-lg overflow-hidden hover:border-wf-accent/40 transition-colors"
            >
              {/* Weapon image */}
              <div className="bg-wf-muted/20 px-4 pt-3 pb-1 relative">
                <span className="absolute top-2 left-2 text-[10px] font-mono text-wf-muted_text bg-wf-surface/80 px-1 rounded">
                  #{i + 1}
                </span>
                <WeaponImage weaponId={w.weaponId} name={getWeaponDisplayName(w.weaponId, w.weaponName)} />
              </div>

              <div className="p-3">
                <h3 className="font-medium text-wf-text text-sm leading-tight truncate mb-2" title={getWeaponDisplayName(w.weaponId, w.weaponName)}>
                  {getWeaponDisplayName(w.weaponId, w.weaponName)}
                </h3>

                {/* Primary metric — kills */}
                {hasPlaytime && w.playtimeMs > 0 ? (
                  <div className="text-lg font-bold text-wf-accent tabular-nums">
                    {w.playtimeH}
                    <span className="text-xs text-wf-muted_text font-normal">ч </span>
                    {w.playtimeMin}
                    <span className="text-xs text-wf-muted_text font-normal">м</span>
                  </div>
                ) : w.kills > 0 ? (
                  <div className="text-lg font-bold text-wf-accent tabular-nums">
                    {w.kills.toLocaleString()}
                    <span className="text-xs text-wf-muted_text font-normal ml-1">убийств</span>
                  </div>
                ) : (
                  <div className="text-lg font-bold text-wf-muted_text tabular-nums">
                    {w.usage.toLocaleString()}
                    <span className="text-xs font-normal ml-1">выстрелов</span>
                  </div>
                )}

                {/* Secondary stats */}
                <div className="mt-1 text-[11px] text-wf-muted_text space-y-0.5">
                  {w.usage > 0 && (
                    <div>{w.usage.toLocaleString()} выстрелов</div>
                  )}
                  {accuracy && (
                    <div>Меткость: <span className="text-wf-text">{accuracy}%</span></div>
                  )}
                </div>

                {/* Class share bar */}
                <div className="mt-2 space-y-0.5">
                  <div className="flex justify-between text-[10px] text-wf-muted_text">
                    <span>% в классе</span>
                    <span>{Math.min(100, classShare).toFixed(1)}%</span>
                  </div>
                  <div className="h-1 bg-wf-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-wf-accent/70 rounded-full"
                      style={{ width: `${Math.min(100, classShare)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-wf-muted_text text-sm">
          Оружие не найдено
        </div>
      )}
    </div>
  );
}
