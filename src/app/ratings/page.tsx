// src/app/ratings/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { fetchTop100, fetchClanRating } from "@/services/wf-api.service";
import { WF_CLASS_NAMES } from "@/types/warface";
import { Trophy, Users, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Рейтинги" };
export const revalidate = 300; // 5 min cache

// Next.js 15+: searchParams is a Promise
type Props = { searchParams: Promise<{ tab?: string; class?: string }> };

const CLASS_TABS = [
  { id: 0, label: "Все классы" },
  { id: 1, label: "Штурмовик" },
  { id: 2, label: "Медик" },
  { id: 3, label: "Снайпер" },
  { id: 4, label: "Инженер" },
  { id: 5, label: "SED" },
];

const RATING_TABS = [
  { id: "players", label: "Игроки (Top-100)" },
  { id: "pve",     label: "PvE Рейтинг" },
  { id: "monthly", label: "Ежемесячный" },
  { id: "clans",   label: "Кланы" },
];

const CLASS_COLORS: Record<string, string> = {
  Rifleman: "text-orange-400",
  Medic:    "text-green-400",
  Sniper:   "text-blue-400",
  Engineer: "text-yellow-400",
  SED:      "text-purple-400",
  "1": "text-orange-400",
  "2": "text-green-400",
  "3": "text-blue-400",
  "4": "text-yellow-400",
  "5": "text-purple-400",
};

const CLASS_LABELS: Record<string, string> = {
  "1": "Штурмовик",
  "2": "Медик",
  "3": "Снайпер",
  "4": "Инженер",
  "5": "SED",
};

export default async function RatingsPage({ searchParams }: Props) {
  const sp        = await searchParams;
  const activeTab = sp.tab ?? "players";
  const classId   = parseInt(sp.class ?? "0", 10);

  const [rawTop100, clanRating] = await Promise.all([
    fetchTop100(classId || undefined),
    fetchClanRating(),
  ]);

  // Deduplicate: keep first occurrence of each nickname (API sometimes returns same player multiple times)
  const seen = new Set<string>();
  const top100 = rawTop100.filter((p) => {
    if (seen.has(p.nickname)) return false;
    seen.add(p.nickname);
    return true;
  });

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      {/* Header */}
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-wf-accent" /> Рейтинги
          </h1>
          <p className="text-sm text-wf-muted_text mt-1">Топ игроков и кланов Warface RU</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Main tabs */}
        <div className="flex gap-0 border-b border-wf-border overflow-x-auto">
          {RATING_TABS.map((tab) => {
            const href = tab.id === "pve" ? "/ratings/pve" 
                 : tab.id === "monthly" ? "/ratings/monthly"
                 : `/ratings?tab=${tab.id}`;
            return (
              <Link
                key={tab.id}
                href={href}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-wf-accent text-wf-accent"
                    : "border-transparent text-wf-muted_text hover:text-wf-text"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Players tab */}
        {activeTab === "players" && (
          <>
            {/* Class filter */}
            <div className="flex gap-2 flex-wrap">
              {CLASS_TABS.map((c) => (
                <Link
                  key={c.id}
                  href={`/ratings?tab=players&class=${c.id}`}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    classId === c.id
                      ? "bg-wf-accent text-black"
                      : "bg-wf-card border border-wf-border text-wf-muted_text hover:text-wf-text"
                  }`}
                >
                  {c.label}
                </Link>
              ))}
            </div>

            <div className="bg-wf-card border border-wf-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-wf-surface border-b border-wf-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase tracking-wider w-12">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase tracking-wider">Игрок</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase tracking-wider hidden sm:table-cell">Клан</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase tracking-wider">Класс</th>
                  </tr>
                </thead>
                <tbody>
                  {top100.map((p, i) => (
                    <tr key={`${p.nickname}-${i}`} className="border-b border-wf-border/50 hover:bg-wf-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className={`text-sm font-bold tabular-nums flex items-center gap-1 ${
                          i === 0 ? "text-yellow-400" :
                          i === 1 ? "text-gray-300"   :
                          i === 2 ? "text-amber-600"  :
                          "text-wf-muted_text"
                        }`}>
                          {i < 3 ? <Medal className="w-3.5 h-3.5" /> : null}
                          {i + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/profile/${encodeURIComponent(p.nickname)}`} className="text-wf-accent hover:underline font-medium">
                          {p.nickname}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-wf-muted_text text-xs hidden sm:table-cell">
                        {p.clan !== "-" ? (
                          <Link href={`/clan/${encodeURIComponent(p.clan)}`} className="hover:text-wf-text transition-colors">
                            {p.clan}
                          </Link>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${CLASS_COLORS[p.class] ?? "text-wf-muted_text"}`}>
                          {CLASS_LABELS[p.class] ?? WF_CLASS_NAMES[p.class] ?? p.class}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {top100.length === 0 && (
                <div className="py-16 text-center text-wf-muted_text">Нет данных</div>
              )}
            </div>
          </>
        )}

        {/* Clans tab */}
        {activeTab === "clans" && (
          <div className="bg-wf-card border border-wf-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-wf-surface border-b border-wf-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase tracking-wider w-12">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase tracking-wider">Клан</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase tracking-wider hidden sm:table-cell">Лидер</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase tracking-wider">
                    <Users className="inline w-3.5 h-3.5 mr-1" />Члены
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase tracking-wider">Очки</th>
                </tr>
              </thead>
              <tbody>
                {clanRating.map((c, i) => (
                  <tr key={c.clan} className="border-b border-wf-border/50 hover:bg-wf-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold tabular-nums ${
                        i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-wf-muted_text"
                      }`}>{i + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/clan/${encodeURIComponent(c.clan)}`} className="text-wf-accent hover:underline font-medium">
                        {c.clan}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Link href={`/profile/${encodeURIComponent(c.clan_leader)}`} className="text-wf-text hover:text-wf-accent transition-colors text-xs">
                        {c.clan_leader}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-wf-muted_text text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {c.members}
                        {c.rank_change && c.rank_change !== "-" && (
                          <span className={cn(
                            "text-[10px] font-medium",
                            c.rank_change.startsWith("+") ? "text-green-400" :
                            c.rank_change.startsWith("-") ? "text-red-400" : "text-wf-muted_text"
                          )}>
                            {c.rank_change.startsWith("+") ? "↑" : c.rank_change.startsWith("-") ? "↓" : ""}{c.rank_change}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-wf-accent text-sm font-semibold">
                      {parseInt(c.points).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
