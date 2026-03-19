// src/app/pve-guild/page.tsx
import type { Metadata } from "next";
import { getPvEGuildLeaderboard } from "@/services/pve-guild.service";
import { Trophy, Skull, Clock, Target } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "PvE Гильдия" };

export default async function PvEGuildPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category = "kills" } = await searchParams;
  const leaderboard = await getPvEGuildLeaderboard(category as any, 100);

  const categories = [
    { id: "kills", label: "Убийства", icon: Skull },
    { id: "wins", label: "Победы", icon: Trophy },
    { id: "kd", label: "K/D", icon: Target },
    { id: "playtime", label: "Время", icon: Clock },
  ];

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-wf-accent" />
            PvE Гильдия
          </h1>
          <p className="text-sm text-wf-muted_text mt-1">
            Рейтинг игроков по PvE статистике
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id;
            return (
              <Link
                key={cat.id}
                href={`/pve-guild?category=${cat.id}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-wf-accent text-black border-wf-accent"
                    : "bg-wf-card text-wf-muted_text border-wf-border hover:border-wf-accent/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Leaderboard */}
        <div className="bg-wf-card border border-wf-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-wf-muted/20 border-b border-wf-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Игрок</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase">
                  {category === "kills" && "Убийства"}
                  {category === "wins" && "Победы"}
                  {category === "kd" && "K/D"}
                  {category === "playtime" && "Часов"}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase hidden sm:table-cell">
                  Ранг
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wf-border">
              {leaderboard.members.map((member, i) => (
                <tr key={member.nickname} className="hover:bg-wf-muted/10 transition-colors">
                  <td className="px-4 py-3 text-sm text-wf-muted_text">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/profile/${encodeURIComponent(member.nickname)}`}
                      className="text-sm font-medium text-wf-accent hover:underline"
                    >
                      {member.nickname}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-wf-text">
                      {category === "kills" && member.pveKills.toLocaleString()}
                      {category === "wins" && member.pveWins.toLocaleString()}
                      {category === "kd" && member.pveKd.toFixed(2)}
                      {category === "playtime" && member.playtimeHours.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="text-xs text-wf-muted_text">Ранг {member.rank}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {leaderboard.members.length === 0 && (
            <div className="py-12 text-center text-wf-muted_text">
              <Trophy className="w-12 h-12 opacity-20 mx-auto mb-3" />
              <p>Нет данных для отображения</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
