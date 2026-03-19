// src/app/clan/[name]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchClanInfo } from "@/services/wf-api.service";
import { getRankInfo } from "@/services/rank.service";
import { Users, Crown, Star, Shield } from "lucide-react";

type Props = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  return { title: `Клан ${decodeURIComponent(name)}` };
}

const ROLE_LABEL: Record<string, string> = {
  MASTER:  "Лидер",
  OFFICER: "Офицер",
  REGULAR: "Участник",
};
const ROLE_ICON: Record<string, React.ReactNode> = {
  MASTER:  <Crown  className="w-3.5 h-3.5 text-wf-accent" />,
  OFFICER: <Star   className="w-3.5 h-3.5 text-blue-400" />,
  REGULAR: <Shield className="w-3.5 h-3.5 text-wf-muted_text" />,
};
const ROLE_ORDER: Record<string, number> = { MASTER: 0, OFFICER: 1, REGULAR: 2 };

export default async function ClanPage({ params }: Props) {
  const { name: rawName } = await params;
  const clanName = decodeURIComponent(rawName);
  const clan = await fetchClanInfo(clanName);
  if (!clan) notFound();

  const sorted = [...clan.members].sort((a, b) => {
    const roleDiff = (ROLE_ORDER[a.clan_role] ?? 2) - (ROLE_ORDER[b.clan_role] ?? 2);
    if (roleDiff !== 0) return roleDiff;
    return parseInt(b.clan_points) - parseInt(a.clan_points);
  });

  const totalPoints = sorted.reduce((s, m) => s + parseInt(m.clan_points || "0"), 0);

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      {/* Header */}
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-wf-card border border-wf-border flex items-center justify-center">
              <Users className="w-8 h-8 text-wf-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{clan.name}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-wf-muted_text">
                <span><Users className="inline w-3.5 h-3.5 mr-1" />{clan.members.length} участников</span>
                <span>ID: {clan.id}</span>
                <span>Всего очков: <span className="text-wf-accent font-semibold">{totalPoints.toLocaleString()}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-wf-card border border-wf-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-wf-surface border-b border-wf-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase tracking-wider">Игрок</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase tracking-wider">Роль</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase tracking-wider">Ранг</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase tracking-wider">Очки клана</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m, i) => {
                const rank = getRankInfo(parseInt(m.rank_id));
                return (
                  <tr key={m.nickname} className="border-b border-wf-border/50 hover:bg-wf-muted/30 transition-colors">
                    <td className="px-4 py-3 text-wf-muted_text text-xs tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link href={`/profile/${encodeURIComponent(m.nickname)}`} className="text-wf-accent hover:underline font-medium">
                        {m.nickname}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs">
                        {ROLE_ICON[m.clan_role]}
                        {ROLE_LABEL[m.clan_role] ?? m.clan_role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-wf-muted_text">{rank.name}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-wf-text">
                      {parseInt(m.clan_points).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
