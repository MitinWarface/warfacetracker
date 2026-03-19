// src/services/verification.service.ts
"use server";

import { prisma } from "@/lib/prisma";
import { fetchPlayerAchievementsWithNames } from "./wf-api.service";

// Достижения которые МОЖНО использовать для верификации (ID)
const VERIFICATION_BADGE_IDS = [
  "zombiemod_kill_zombies_01",
  "ranking1",
  "headSniper",
  "winTDM1",
  "healer1",
  "winTDM2",
  "winFFA1",
  "winFFA2",
  "headSniper2",
  "healer2",
];

export interface VerificationSession {
  id: string;
  userId: string;
  warfaceNick: string;
  badges: string[];
  expiresAt: Date;
  createdAt: Date;
}

export async function startVerification(
  userId: string,
  warfaceNick: string
): Promise<{ 
  success: boolean; 
  sessionId?: string; 
  badges?: string[];
  expiresAt?: Date;
  error?: string;
}> {
  try {
    // Проверяем что ник не привязан к другому пользователю
    const existing = await prisma.linkedPlayer.findFirst({
      where: { 
        warfaceNick: warfaceNick.toLowerCase(),
      },
    });

    if (existing && existing.userId !== userId) {
      return { success: false, error: "Этот ник уже привязан к другому аккаунту" };
    }

    // Получаем ВСЕ достижения игрока из API с названиями
    const playerAchievements = await fetchPlayerAchievementsWithNames(warfaceNick);
    const achievedIds = playerAchievements.map(a => a.achievement_id);

    // Находим достижения которые есть у игрока из нашего списка
    const availableBadges = achievedIds.filter(id => VERIFICATION_BADGE_IDS.includes(id));

    if (availableBadges.length < 3) {
      return { 
        success: false, 
        error: `Недостаточно достижений. Найдено ${availableBadges.length} из 3 требуемых.`
      };
    }

    // Выбираем 3 случайных достижения из доступных
    const shuffled = availableBadges.sort(() => 0.5 - Math.random());
    const selectedBadges = shuffled.slice(0, 3);

    // Создаём сессию верификации (20 минут)
    const session = await prisma.verificationSession.create({
      data: {
        userId,
        warfaceNick,
        badges: selectedBadges,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 минут
      },
    });

    return {
      success: true,
      sessionId: session.id,
      badges: selectedBadges,
      expiresAt: session.expiresAt,
    };
  } catch (error) {
    console.error("Start verification error:", error);
    return { success: false, error: "Ошибка начала верификации" };
  }
}

export async function checkVerification(
  sessionId: string,
  warfaceNick: string,
  userId: string
): Promise<{
  success: boolean;
  verified?: boolean;
  equipped?: string[];
  missing?: string[];
  error?: string;
}> {
  try {
    // Находим сессию
    const session = await prisma.verificationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return { success: false, error: "Сессия не найдена" };
    }

    // Проверяем не истекла ли сессия
    if (session.expiresAt < new Date()) {
      await prisma.verificationSession.delete({ where: { id: sessionId } });
      return { success: false, error: "Время сессии истекло. Начните заново." };
    }

    // Проверяем ник совпадает
    if (session.warfaceNick.toLowerCase() !== warfaceNick.toLowerCase()) {
      return { success: false, error: "Ник не совпадает" };
    }

    // Получаем ВСЕ достижения игрока из API
    const playerAchievements = await fetchPlayerAchievementsWithNames(warfaceNick);
    const achievedIds = playerAchievements.map(a => a.achievement_id);

    // Проверяем какие значки из сессии есть у игрока
    const equipped = session.badges.filter(b => achievedIds.includes(b));
    const missing = session.badges.filter(b => !achievedIds.includes(b));

    // Если все значки есть - верифицируем
    if (missing.length === 0) {
      // Проверяем есть ли уже привязка
      const existingLink = await prisma.linkedPlayer.findFirst({
        where: { 
          userId,
          warfaceNick: warfaceNick.toLowerCase(),
        },
      });

      if (!existingLink) {
        // Создаём новую привязку
        await prisma.linkedPlayer.create({
          data: {
            userId,
            warfaceNick: warfaceNick.toLowerCase(),
            isPrimary: false,
          },
        });
      }

      // Удаляем сессию
      await prisma.verificationSession.delete({ where: { id: sessionId } });

      // Логируем активность
      await prisma.userActivity.create({
        data: {
          userId,
          action: "linked_player",
          details: warfaceNick,
        },
      });

      return { success: true, verified: true };
    }

    return { 
      success: true, 
      verified: false,
      equipped,
      missing,
    };
  } catch (error) {
    console.error("Check verification error:", error);
    return { success: false, error: "Ошибка проверки" };
  }
}

export async function getActiveVerification(userId: string): Promise<VerificationSession | null> {
  try {
    const session = await prisma.verificationSession.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return session;
  } catch (error) {
    console.error("Get active verification error:", error);
    return null;
  }
}

export async function cancelVerification(sessionId: string): Promise<boolean> {
  try {
    await prisma.verificationSession.delete({
      where: { id: sessionId },
    });
    return true;
  } catch (error) {
    console.error("Cancel verification error:", error);
    return false;
  }
}

export async function getLinkedPlayers(userId: string) {
  try {
    const linked = await prisma.linkedPlayer.findMany({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    });

    return linked;
  } catch (error) {
    console.error("Get linked players error:", error);
    return [];
  }
}

export async function getUserActivity(userId: string, limit: number = 20) {
  try {
    const activity = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activity;
  } catch (error) {
    console.error("Get user activity error:", error);
    return [];
  }
}
