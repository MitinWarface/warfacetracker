// src/app/armory/page.tsx
import type { Metadata } from "next";
import ArmoryGrid from "@/components/armory/ArmoryGrid";
import ArmoryPageClient from "@/components/armory/ArmoryPageClient";
import { fetchPlayerStat, cleanWeaponName, fetchWeaponCatalog } from "@/services/wf-api.service";
import weaponNamesRaw from "@/lib/weapon-names.json";
import { Search } from "lucide-react";

export const metadata: Metadata = { title: "Оружейная" };

export type WeaponEntry = {
  id: string;
  name: string;
  kills: number;
  className: string;
  shots?: number;
  hits?: number;
  headshots?: number;
  usage?: number;
  playtime?: number;
};

const WPN_MAP = weaponNamesRaw as Record<string, string>;

const CLASS_LABELS: Record<string, string> = {
  Rifleman: "Штурм",
  Medic: "Медик",
  Sniper: "Снайпер",
  Engineer: "Инженер",
  SED: "Рейнджер",
};

export default async function ArmoryPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ player?: string }> 
}) {
  const { player } = await searchParams;
  let weapons: WeaponEntry[] = [];
  let playerName: string | undefined;
  let error: string | undefined;

  // Загружаем каталог оружия из API
  let weaponCatalog: { id: string; name: string }[] = [];
  try {
    weaponCatalog = await fetchWeaponCatalog();
    // Если API вернуло пустой массив, используем локальные данные
    if (!weaponCatalog || weaponCatalog.length === 0) {
      weaponCatalog = Object.entries(WPN_MAP).map(([id, name]) => ({ id, name }));
    }
  } catch {
    // При ошибке используем локальные данные
    weaponCatalog = Object.entries(WPN_MAP).map(([id, name]) => ({ id, name }));
  }

  if (player) {
    try {
      const raw = await fetchPlayerStat(player);
      if (raw?.full_response) {
        const lines = raw.full_response.split("\n");
        const weaponData = new Map<string, { kills: number; className: string; usage: number; playtime: number }>();

        for (const line of lines) {
          const classMatch = line.match(/\[class\](\S+)/);
          const itemMatch = line.match(/\[item_type\](\S+)/);

          if (!classMatch || !itemMatch) continue;

          const className = classMatch[1];
          const itemId = itemMatch[1];

          // Пропускаем не-оружие (гранаты, патроны и т.д.)
          if (itemId.startsWith('ak0') || itemId.startsWith('ap0') ||
              itemId.startsWith('hp') || itemId.startsWith('av8')) continue;

          // Получаем текущие данные
          const existing = weaponData.get(itemId);
          const data = existing || { kills: 0, className, usage: 0, playtime: 0 };

          // Kills - player_wpn_hits_fatal (без mode/season)
          // Формат: [stat]player_wpn_hits_fatal (ts) = 150  или [stat]player_wpn_hits_fatal=150
          const killsMatch = line.match(/\[stat\]player_wpn_hits_fatal(?:\s*\([^)]*\))?\s*=\s*(-?\d+)/);
          if (killsMatch) {
            const kills = parseInt(killsMatch[1], 10);
            if (kills > data.kills) {
              data.kills = kills;
              data.className = className;
            }
          }

          // Usage (shots fired) - только mode="" season=""
          // Формат: [stat]player_wpn_usage (mode="" season="") (ts) = 100
          const usageMatch = line.match(/\[stat\]player_wpn_usage[^=]*=\s*(-?\d+)/);
          if (usageMatch && line.includes('mode=""') && line.includes('season=""')) {
            data.usage += parseInt(usageMatch[1], 10);
            if (!existing) data.className = className;
          }

          // Playtime
          // Формат: [stat]player_wpn_playtime (ts) = 500
          const playtimeMatch = line.match(/\[stat\]player_wpn_playtime[^=]*=\s*(-?\d+)/);
          if (playtimeMatch) {
            data.playtime += parseInt(playtimeMatch[1], 10);
            if (!existing) data.className = className;
          }

          // Сохраняем если есть хоть какие-то данные
          if (data.kills > 0 || data.usage > 0 || data.playtime > 0) {
            weaponData.set(itemId, data);
          }
        }

        weapons = [...weaponData.entries()].map(([id, data]) => ({
          id,
          name: cleanWeaponName(id),
          kills: data.kills,
          className: data.className,
          shots: data.usage > 0 ? data.usage : undefined,
        })).sort((a, b) => b.kills - a.kills);

        playerName = raw.nickname;
      }
    } catch (e) {
      error = e instanceof Error ? e.message : "Ошибка загрузки";
    }
  }

  // Если игрок не указан — показываем все оружие из API
  if (!player) {
    // Фильтруем служебные предметы (ремкомплекты, патроны, дефибриллятор)
    const EXCLUDED_PREFIXES = ['ak0', 'ap0', 'df', 'hp', 'av8'];
    weapons = weaponCatalog
      .filter((w) => !EXCLUDED_PREFIXES.some(prefix => w.id.startsWith(prefix)))
      .map((w) => ({
        id: w.id,
        name: w.name,
        kills: 0,
        className: "Unknown",
      }));
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-wf-text mb-2">Оружейная</h1>
        
        {/* Поиск игрока */}
        <form className="max-w-md mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wf-muted_text" />
            <input
              type="text"
              name="player"
              placeholder="Введите ник игрока..."
              defaultValue={player}
              className="w-full pl-9 pr-4 py-2 bg-wf-card border border-wf-border rounded-lg text-wf-text placeholder:text-wf-muted_text text-sm focus:outline-none focus:border-wf-accent/60"
            />
          </div>
        </form>

        {playerName && (
          <p className="text-sm text-wf-muted_text">
            Оружие игрока: <span className="text-wf-accent font-medium">{playerName}</span>
          </p>
        )}
        
        {error && (
          <p className="text-sm text-red-500 mb-2">Ошибка: {error}</p>
        )}

        <p className="text-wf-muted_text text-sm mt-1">
          {weapons.length > 0 
            ? `${weapons.length.toLocaleString()} ед. оружия` 
            : player 
              ? "У игрока нет статистики по оружию" 
              : `${Object.keys(WPN_MAP).length.toLocaleString()} единиц оружия в базе`}
        </p>
      </div>

      {weapons.length > 0 ? (
        <ArmoryPageClient
          weapons={weapons}
          showClass={!!player}
          showKills={!!player}
        />
      ) : (
        <div className="text-center py-20 text-wf-muted_text">
          {player ? "Игрок не найден" : "Загрузка оружия..."}
        </div>
      )}
    </main>
  );
}
