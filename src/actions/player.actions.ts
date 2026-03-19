// src/actions/player.actions.ts
"use server";

import { headers }   from "next/headers";
import { redirect }  from "next/navigation";
import { syncPlayer } from "@/services/player-sync.service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// ─── Search / navigate to profile ────────────────────────────────────────────

export async function searchPlayerAction(formData: FormData) {
  const nickname = (formData.get("nickname") as string)?.trim();
  if (!nickname || nickname.length < 2) return;
  redirect(`/profile/${encodeURIComponent(nickname)}`);
}

// ─── Force refresh from official API ─────────────────────────────────────────

export async function refreshPlayerAction(
  nickname: string
): Promise<{ ok: boolean; message: string }> {
  const ip = getClientIp(await headers());

  const limit = await checkRateLimit(`refresh:${ip}`);
  if (!limit.allowed) {
    return {
      ok:      false,
      message: `Rate limited. Try again in ${limit.resetAt - Math.floor(Date.now() / 1000)}s`,
    };
  }

  // Invalidate Redis cache
  const { invalidateCache } = await import("@/lib/redis");
  await invalidateCache(`player:${nickname.toLowerCase()}`);

  // Also mark DB record as stale so syncPlayer is forced to hit the API
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.player.updateMany({
      where: { nickname: nickname.toLowerCase() },
      data:  { lastUpdated: new Date(0) },
    });
  } catch { /* ignore if player not in DB yet */ }

  const result = await syncPlayer(nickname);

  if (!result.ok) {
    return { ok: false, message: (result as { ok: false; error: string }).error };
  }

  return { ok: true, message: `Updated — source: ${result.source}` };
}
