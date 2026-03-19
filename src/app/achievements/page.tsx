// src/app/achievements/page.tsx
import type { Metadata } from "next";
import AchievementsGrid from "@/components/achievements/AchievementsGrid";
import { fetchPlayerAchievements, fetchPlayerStat, fetchAchievementCatalog } from "@/services/wf-api.service";
import { Search } from "lucide-react";

export const metadata: Metadata = { title: "Достижения" };

export type AchievementEntry = {
  id: string;
  name: string;
  description: string;
  iconUrls: string[];  // Массив URL для fallback
  progress?: string;
  completionTime?: string;
  isUnlocked: boolean;
};

const CDN_BASE = "https://cdn.wfts.su/wf_achievements";

// Proxy для изображений достижений
function getProxyUrl(url: string): string {
  return `/api/proxy/image?url=${encodeURIComponent(url)}`;
}

/** Генерируем все URL для достижения (с fallback) */
function getAchievementImageUrls(id: string): string[] {
  const key = id.replace(/_name$/i, "");
  const lower = key.toLowerCase();

  // Weapon kill achievements
  if (lower.endsWith("_kill")) {
    // Для оружия используем базовый URL
    const weaponId = key.replace(/_[Kk]ill$/, "");
    const bare = weaponId.replace(/_shop$/, "");
    const base = bare.replace(/_[a-z0-9]+$/i, "");
    const urls: string[] = [];
    urls.push(getProxyUrl(`https://cdn.wfts.su/weapons/weapons_${bare}.png`));
    urls.push(`https://cdn.wfts.su/weapons/weapons_${bare}.png`);
    if (base !== bare) {
      urls.push(getProxyUrl(`https://cdn.wfts.su/weapons/weapons_${base}.png`));
      urls.push(`https://cdn.wfts.su/weapons/weapons_${base}.png`);
    }
    return urls;
  }

  // 3. Badge/mark/stripe
  if (lower.includes("_badge")) {
    const base = key.replace(/_badge/i, "").replace(/^_|_$/g, "");
    const direct1 = `${CDN_BASE}/badge/challenge_badge_${key}.png`;
    const direct2 = `${CDN_BASE}/badge/challenge_badge_${base}.png`;
    return [
      getProxyUrl(direct1), direct1,
      getProxyUrl(direct2), direct2,
    ];
  }
  if (lower.includes("_mark")) {
    const base = key.replace(/_mark/i, "").replace(/^_|_$/g, "");
    const direct1 = `${CDN_BASE}/mark/challenge_mark_${key}.png`;
    const direct2 = `${CDN_BASE}/mark/challenge_mark_${base}.png`;
    return [
      getProxyUrl(direct1), direct1,
      getProxyUrl(direct2), direct2,
    ];
  }
  if (lower.includes("_stripe") || lower.includes("_strip_")) {
    const base = key.replace(/_stripe/i, "").replace(/_strip_/i, "_").replace(/^_|_$/g, "");
    const direct1 = `${CDN_BASE}/stripe/challenge_stripe_${key}.png`;
    const direct2 = `${CDN_BASE}/stripe/challenge_strip_${key}.png`;
    const direct3 = `${CDN_BASE}/stripe/challenge_stripe_${base}.png`;
    return [
      getProxyUrl(direct1), direct1,
      getProxyUrl(direct2), direct2,
      getProxyUrl(direct3), direct3,
    ];
  }

  return [];
}

// Категории достижений: значки (badge), жетоны (mark), нашивки (stripe)
function getCategory(achievementId: string): string {
  const lower = achievementId.toLowerCase();
  
  // Значки (badge)
  if (lower.includes("_badge") || lower.endsWith("_badge")) return "badge";
  
  // Жетоны (mark)
  if (lower.includes("_mark") || lower.endsWith("_mark")) return "mark";
  
  // Нашивки (stripe)
  if (lower.includes("_stripe") || lower.endsWith("_stripe") || 
      lower.includes("_strip_") || lower.endsWith("_strip")) return "stripe";
  
  // Остальные достижения (weapon, seasonal, etc.)
  if (achievementId.includes("wpn_")) return "weapon";
  if (achievementId.match(/\d+(bp|spring|summer|autumn|winter|xmas|fool|rating)/)) return "seasonal";
  if (achievementId.includes("prestige")) return "prestige";
  
  return "other";
}

const CATEGORY_LABELS: Record<string, string> = {
  badge: "Значки",
  mark: "Жетоны",
  stripe: "Нашивки",
  weapon: "Оружие",
  seasonal: "Сезонные",
  prestige: "Престиж",
  other: "Прочие",
};

export default async function AchievementsPage({
  searchParams
}: {
  searchParams: Promise<{ player?: string }>
}) {
  const { player } = await searchParams;
  let achievements: AchievementEntry[] = [];
  let playerName: string | undefined;
  let error: string | undefined;

  // Загружаем каталог достижений из API
  const achievementCatalog = await fetchAchievementCatalog();

  if (player) {
    try {
      // Загружаем достижения игрока
      const rawAchievements = await fetchPlayerAchievements(player);
      const playerStat = await fetchPlayerStat(player);

      if (playerStat) {
        playerName = playerStat.nickname;
      }

      // Создаем мапу полученных достижений
      const unlockedMap = new Map<string, { progress: string; completionTime: string }>();
      for (const ach of rawAchievements) {
        unlockedMap.set(ach.achievement_id, {
          progress: ach.progress,
          completionTime: ach.completion_time,
        });
      }

      // Строим список всех достижений с информацией о получении
      achievements = achievementCatalog.map((ach) => ({
        id: ach.id,
        name: ach.name,
        description: "",
        iconUrls: getAchievementImageUrls(ach.id),
        progress: unlockedMap.get(ach.id)?.progress,
        completionTime: unlockedMap.get(ach.id)?.completionTime,
        isUnlocked: unlockedMap.has(ach.id),
      })).sort((a, b) => {
        // Сначала полученные, потом остальные
        if (a.isUnlocked && !b.isUnlocked) return -1;
        if (!a.isUnlocked && b.isUnlocked) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (e) {
      error = e instanceof Error ? e.message : "Ошибка загрузки";
    }
  } else {
    // Без игрока — показываем все достижения из API
    achievements = achievementCatalog.map((ach) => ({
      id: ach.id,
      name: ach.name,
      description: "",
      iconUrls: getAchievementImageUrls(ach.id),
      isUnlocked: false,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  // Подсчет по категориям
  const categoryCounts: Record<string, number> = {};
  const unlockedCounts: Record<string, number> = {};
  
  for (const ach of achievements) {
    const cat = getCategory(ach.id);
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
    if (ach.isUnlocked) {
      unlockedCounts[cat] = (unlockedCounts[cat] ?? 0) + 1;
    }
  }

  const totalUnlocked = Object.values(unlockedCounts).reduce((a, b) => a + b, 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-wf-text mb-2">Достижения</h1>
        
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
          <div className="flex items-center gap-4 text-sm text-wf-muted_text mb-2">
            <span>
              Игрок: <span className="text-wf-accent font-medium">{playerName}</span>
            </span>
            <span className="text-wf-text">
              Получено: <span className="text-green-500 font-semibold">{totalUnlocked}</span> / {achievements.length}
            </span>
          </div>
        )}
        
        {error && (
          <p className="text-sm text-red-500 mb-2">Ошибка: {error}</p>
        )}

        {!player && (
          <p className="text-wf-muted_text text-sm mt-1">
            {achievements.length.toLocaleString()} достижений в базе
          </p>
        )}
      </div>

      <AchievementsGrid
        achievements={achievements}
        categoryLabels={CATEGORY_LABELS}
        categoryCounts={categoryCounts}
        unlockedCounts={unlockedCounts}
        showProgress={!!player}
      />
    </main>
  );
}
