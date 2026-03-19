// src/services/recent-profiles.service.ts
"use server";

import { getCache, setCache } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export interface RecentProfile {
  nickname: string;
  displayNickname: string;
  viewedAt: Date;
  rankId: number;
}

const CACHE_KEY = "recent_profiles";
const MAX_PROFILES = 50;
const CACHE_TTL = 3600; // 1 hour

export async function getRecentProfiles(limit: number = 10): Promise<RecentProfile[]> {
  try {
    const cached = await getCache<RecentProfile[]>(CACHE_KEY);
    if (cached) {
      return cached.slice(0, limit);
    }

    const recent = await prisma.player.findMany({
      orderBy: { lastUpdated: 'desc' },
      take: limit,
      select: {
        nickname: true,
        displayNickname: true,
        lastUpdated: true,
        rankId: true,
      },
    });

    return recent.map(p => ({
      nickname: p.nickname,
      displayNickname: p.displayNickname,
      viewedAt: p.lastUpdated,
      rankId: p.rankId,
    }));
  } catch {
    return [];
  }
}

export async function trackProfileView(nickname: string, displayNickname: string, rankId: number): Promise<void> {
  try {
    // Обновляем lastUpdated в БД
    await prisma.player.update({
      where: { nickname: nickname.toLowerCase() },
      data: { lastUpdated: new Date() },
    }).catch(() => {
      // Игрок может не существовать в БД - это ок
    });

    // Получаем текущий список из кэша
    let recent = await getCache<RecentProfile[]>(CACHE_KEY) || [];

    // Удаляем если уже есть (чтобы переместить вверх)
    recent = recent.filter(p => p.nickname !== nickname.toLowerCase());

    // Добавляем в начало
    recent.unshift({
      nickname: nickname.toLowerCase(),
      displayNickname,
      viewedAt: new Date(),
      rankId,
    });

    // Ограничиваем размер
    if (recent.length > MAX_PROFILES) {
      recent = recent.slice(0, MAX_PROFILES);
    }

    // Сохраняем в кэш
    await setCache(CACHE_KEY, recent, CACHE_TTL);
  } catch {
    // Игнорируем ошибки
  }
}
