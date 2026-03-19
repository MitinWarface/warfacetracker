// src/services/wiki-parser.service.ts
// Parser for https://ru.warface.com/wiki/ to get additional data not available from API

import { fetchWeaponCatalog, fetchAchievementCatalog } from "./wf-api.service";
import type { WFWeaponCatalog, WFAchievementCatalog } from "@/types/warface";

const WIKI_BASE = "https://ru.warface.com/wiki/index.php/";
const API_BASE = "http://api.warface.ru";

/**
 * Получает данные об оружии из Wiki Warface
 * Используется как fallback когда API не возвращает название
 */
export async function fetchWeaponInfoFromWiki(weaponId: string): Promise<{
  name: string;
  description?: string;
  damage?: number;
  accuracy?: number;
  range?: number;
  fireRate?: number;
  imageUrl?: string;
} | null> {
  try {
    // Пытаемся получить название из локального файла или API
    const catalog = await fetchWeaponCatalog();
    const weaponFromCatalog = catalog.find(w => w.id === weaponId);
    
    if (weaponFromCatalog) {
      return {
        name: weaponFromCatalog.name,
        imageUrl: `https://wf.cdn.gmru.net/wiki/images/${encodeURIComponent(weaponFromCatalog.name)}.png`,
      };
    }

    // Если не нашли в каталоге, пробуем спарсить из Wiki
    const response = await fetch(`${WIKI_BASE}${encodeURIComponent(weaponId)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      next: { revalidate: 3600 }, // Кэш на 1 час
    });

    if (!response.ok) return null;

    const html = await response.text();
    
    // Парсим название из заголовка
    const titleMatch = html.match(/<h1[^>]*class="firstHeading"[^>]*>([^<]+)<\/h1>/);
    const name = titleMatch ? titleMatch[1].trim() : weaponId;

    // Парсим изображение
    const imageMatch = html.match(/<img[^>]*src="([^"]*\.png)"[^>]*alt="[^"]*"/);
    const imageUrl = imageMatch ? imageMatch[1] : undefined;

    // Парсим характеристики из таблицы
    const damage = extractStat(html, /Урон[^<]*<\/td>[\s\n]*<td[^>]*>([^<]+)/);
    const accuracy = extractStat(html, /Точность[^<]*<\/td>[\s\n]*<td[^>]*>([^<]+)/);
    const range = extractStat(html, /Дальность[^<]*<\/td>[\s\n]*<td[^>]*>([^<]+)/);
    const fireRate = extractStat(html, /Скорострельность[^<]*<\/td>[\s\n]*<td[^>]*>([^<]+)/);

    return {
      name,
      description: undefined,
      damage: damage ? parseInt(damage, 10) : undefined,
      accuracy: accuracy ? parseInt(accuracy, 10) : undefined,
      range: range ? parseInt(range, 10) : undefined,
      fireRate: fireRate ? parseInt(fireRate, 10) : undefined,
      imageUrl,
    };
  } catch (error) {
    console.error("[Wiki Parser] Error fetching weapon info:", error);
    return null;
  }
}

/**
 * Получает информацию о достижении из Wiki
 */
export async function fetchAchievementInfoFromWiki(achievementId: string): Promise<{
  name: string;
  description?: string;
  imageUrl?: string;
} | null> {
  try {
    // Сначала пробуем из API
    const catalog = await fetchAchievementCatalog();
    const achFromCatalog = catalog.find(a => a.id === achievementId);
    
    if (achFromCatalog) {
      return {
        name: achFromCatalog.name,
        imageUrl: getAchievementImageUrl(achievementId),
      };
    }

    return null;
  } catch (error) {
    console.error("[Wiki Parser] Error fetching achievement info:", error);
    return null;
  }
}

/**
 * Получает URL изображения для достижения
 */
export function getAchievementImageUrl(achievementId: string): string {
  const CDN_BASE = "https://cdn.wfts.su/wf_achievements";
  const lower = achievementId.toLowerCase();

  // Weapon kill achievements
  if (lower.endsWith("_kill")) {
    const weaponId = achievementId.replace(/_[Kk]ill$/, "");
    const bare = weaponId.replace(/_shop$/, "");
    return `https://cdn.wfts.su/weapons/weapons_${bare}.png`;
  }

  // Badge
  if (lower.includes("_badge")) {
    const base = achievementId.replace(/_badge/i, "").replace(/^_|_$/g, "");
    return `${CDN_BASE}/badge/challenge_badge_${achievementId}.png`;
  }

  // Mark (жетон)
  if (lower.includes("_mark")) {
    return `${CDN_BASE}/mark/challenge_mark_${achievementId}.png`;
  }

  // Stripe (нашивка)
  if (lower.includes("_stripe") || lower.includes("_strip_")) {
    return `${CDN_BASE}/stripe/challenge_stripe_${achievementId}.png`;
  }

  // Default
  return `${CDN_BASE}/other/${achievementId}.png`;
}

/**
 * Парсер миссий из Wiki для получения дополнительных данных
 */
export async function fetchMissionInfoFromWiki(missionName: string): Promise<{
  name: string;
  description?: string;
  imageUrl?: string;
  difficulty?: string;
  rewards?: string;
} | null> {
  try {
    const response = await fetch(`${WIKI_BASE}${encodeURIComponent(missionName)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const html = await response.text();
    
    const titleMatch = html.match(/<h1[^>]*class="firstHeading"[^>]*>([^<]+)<\/h1>/);
    const name = titleMatch ? titleMatch[1].trim() : missionName;

    const imageMatch = html.match(/<img[^>]*src="([^"]*\.(png|jpg))"[^>]*alt="[^"]*"/);
    const imageUrl = imageMatch ? imageMatch[1] : undefined;

    return {
      name,
      description: undefined,
      imageUrl,
    };
  } catch (error) {
    console.error("[Wiki Parser] Error fetching mission info:", error);
    return null;
  }
}

// Helper функция для извлечения статов из HTML
function extractStat(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  if (match && match[1]) {
    return match[1].trim().replace(/[^0-9]/g, "");
  }
  return null;
}

/**
 * Получает список всех значков (badges) из Wiki
 */
export async function fetchBadgesFromWiki(): Promise<Array<{
  id: string;
  name: string;
  imageUrl: string;
}>> {
  try {
    const response = await fetch(`${WIKI_BASE}Значки`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      next: { revalidate: 86400 }, // Кэш на 24 часа
    });

    if (!response.ok) return [];

    const html = await response.text();
    const badges: Array<{ id: string; name: string; imageUrl: string }> = [];

    // Парсим таблицу значков
    const badgePattern = /<tr>[\s\n]*<td[^>]*>[\s\n]*<img[^>]*src="([^"]+)"[^>]*[\s\n]*<td[^>]*>([^<]+)<\/td>/g;
    let match;
    
    while ((match = badgePattern.exec(html)) !== null) {
      badges.push({
        id: match[2].trim().toLowerCase().replace(/\s+/g, "_"),
        name: match[2].trim(),
        imageUrl: match[1],
      });
    }

    return badges;
  } catch (error) {
    console.error("[Wiki Parser] Error fetching badges:", error);
    return [];
  }
}

/**
 * Получает список всех жетонов (marks) из Wiki
 */
export async function fetchMarksFromWiki(): Promise<Array<{
  id: string;
  name: string;
  imageUrl: string;
}>> {
  try {
    const response = await fetch(`${WIKI_BASE}Жетоны`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const marks: Array<{ id: string; name: string; imageUrl: string }> = [];

    const markPattern = /<tr>[\s\n]*<td[^>]*>[\s\n]*<img[^>]*src="([^"]+)"[^>]*[\s\n]*<td[^>]*>([^<]+)<\/td>/g;
    let match;
    
    while ((match = markPattern.exec(html)) !== null) {
      marks.push({
        id: match[2].trim().toLowerCase().replace(/\s+/g, "_"),
        name: match[2].trim(),
        imageUrl: match[1],
      });
    }

    return marks;
  } catch (error) {
    console.error("[Wiki Parser] Error fetching marks:", error);
    return [];
  }
}

/**
 * Получает список всех нашивок (stripes) из Wiki
 */
export async function fetchStripesFromWiki(): Promise<Array<{
  id: string;
  name: string;
  imageUrl: string;
}>> {
  try {
    const response = await fetch(`${WIKI_BASE}Нашивки`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const stripes: Array<{ id: string; name: string; imageUrl: string }> = [];

    const stripePattern = /<tr>[\s\n]*<td[^>]*>[\s\n]*<img[^>]*src="([^"]+)"[^>]*[\s\n]*<td[^>]*>([^<]+)<\/td>/g;
    let match;
    
    while ((match = stripePattern.exec(html)) !== null) {
      stripes.push({
        id: match[2].trim().toLowerCase().replace(/\s+/g, "_"),
        name: match[2].trim(),
        imageUrl: match[1],
      });
    }

    return stripes;
  } catch (error) {
    console.error("[Wiki Parser] Error fetching stripes:", error);
    return [];
  }
}

/**
 * Универсальная функция для получения изображения через прокси
 */
export function getProxyImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("/")) return url;
  return `/api/proxy/image?url=${encodeURIComponent(url)}`;
}
