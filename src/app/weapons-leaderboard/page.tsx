// src/app/weapons-leaderboard/page.tsx
import type { Metadata } from "next";
import { getWeaponLeaderboard, getTopWeapons } from "@/services/weapon-leaderboard.service";
import { Trophy, Crosshair, Users } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Топ по оружию" };

export default async function WeaponsLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ weapon?: string }>;
}) {
  const { weapon } = await searchParams;
  const topWeapons = await getTopWeapons(20);
  const leaderboard = weapon ? await getWeaponLeaderboard(weapon, 100) : null;

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crosshair className="w-6 h-6 text-wf-accent" />
            Топ по оружию
          </h1>
          <p className="text-sm text-wf-muted_text mt-1">
            Рейтинг игроков по убийствам с каждым оружием
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Список оружия */}
          <div className="lg:col-span-1">
            <div className="bg-wf-card border border-wf-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Популярное оружие
              </h3>
              <div className="space-y-2">
                {topWeapons.map((w, i) => (
                  <Link
                    key={w.weaponId}
                    href={`/weapons-leaderboard?weapon=${w.weaponId}`}
                    className={`block p-3 rounded-lg border transition-colors ${
                      weapon === w.weaponId
                        ? "bg-wf-accent/20 border-wf-accent"
                        : "bg-wf-bg border-wf-border hover:border-wf-accent/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-wf-text truncate">{w.weaponName}</p>
                        <p className="text-xs text-wf-muted_text">
                          {w.totalKills.toLocaleString()} убийств
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-wf-muted_text">{w.playersCount} игр.</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Лидерборд */}
          <div className="lg:col-span-2">
            {leaderboard ? (
              <div className="bg-wf-card border border-wf-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Топ-100: {leaderboard.weaponName}
                </h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {leaderboard.topPlayers.map((player, i) => (
                    <div
                      key={player.nickname}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        i === 0
                          ? "bg-yellow-500/10 border-yellow-500/30"
                          : i === 1
                          ? "bg-gray-400/10 border-gray-400/30"
                          : i === 2
                          ? "bg-amber-600/10 border-amber-600/30"
                          : "bg-wf-bg border-wf-border"
                      }`}
                    >
                      <div className="w-8 text-center font-bold text-wf-muted_text">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </div>
                      <Link
                        href={`/profile/${encodeURIComponent(player.nickname)}`}
                        className="flex-1 font-medium text-wf-accent hover:underline"
                      >
                        {player.nickname}
                      </Link>
                      <div className="text-right">
                        <p className="font-bold text-wf-text">{player.kills.toLocaleString()}</p>
                        <p className="text-xs text-wf-muted_text">убийств</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-wf-card border border-wf-border rounded-lg p-12 text-center">
                <Crosshair className="w-16 h-16 text-wf-muted_text/20 mx-auto mb-4" />
                <p className="text-lg text-wf-muted_text">Выберите оружие из списка слева</p>
                <p className="text-sm text-wf-muted_text mt-2">
                  чтобы увидеть топ-100 игроков
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
