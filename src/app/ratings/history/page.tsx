// src/app/ratings/history/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Trophy, TrendingUp, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { fetchTop100, fetchClanRating } from "@/services/wf-api.service";
import type { WFTop100Player, WFClanRating } from "@/types/warface";

const CLASS_NAMES: Record<string, string> = {
  "1": "Штурм",
  "2": "Медик",
  "3": "Снайпер",
  "4": "Инженер",
  "5": "СЭД",
};

function HistoryContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"players" | "clans">("players");
  const [topPlayers, setTopPlayers] = useState<WFTop100Player[]>([]);
  const [clanRating, setClanRating] = useState<WFClanRating[]>([]);
  const [loading, setLoading] = useState(false);

  const classFilter = searchParams.get("class") || "";

  useEffect(() => {
    loadData();
  }, [activeTab, classFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "players") {
        const data = await fetchTop100(classFilter ? parseInt(classFilter, 10) : undefined);
        setTopPlayers(data);
      } else {
        const data = await fetchClanRating();
        setClanRating(data);
      }
    } catch {
      // Error handled by empty state
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      {/* Header */}
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-wf-accent" />
            История рейтинга
          </h1>
          <p className="text-sm text-wf-muted_text mt-1">
            Архив рейтингов игроков и кланов
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-wf-border mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("players")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "players"
                ? "border-wf-accent text-wf-accent"
                : "border-transparent text-wf-muted_text hover:text-wf-text"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Игроки
          </button>
          <button
            onClick={() => setActiveTab("clans")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "clans"
                ? "border-wf-accent text-wf-accent"
                : "border-transparent text-wf-muted_text hover:text-wf-text"
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Кланы
          </button>
        </div>

        {/* Class Filter (Players only) */}
        {activeTab === "players" && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete("class");
                window.history.pushState({}, "", url);
                loadData();
              }}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                !classFilter
                  ? "bg-wf-accent text-white"
                  : "bg-wf-card border border-wf-border text-wf-muted_text hover:text-wf-text"
              }`}
            >
              Все классы
            </button>
            {Object.entries(CLASS_NAMES).map(([id, name]) => (
              <button
                key={id}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("class", id);
                  window.history.pushState({}, "", url);
                  loadData();
                }}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  classFilter === id
                    ? "bg-wf-accent text-white"
                    : "bg-wf-card border border-wf-border text-wf-muted_text hover:text-wf-text"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {/* Data Table */}
        <div className="bg-wf-card border border-wf-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-wf-muted/20 border-b border-wf-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">#</th>
                {activeTab === "players" ? (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Игрок</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Клан</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Класс</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Клан</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Лидер</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase">Участников</th>
                  </>
                )}
                <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase">
                  {activeTab === "players" ? "Сервер" : "Очки"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wf-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-wf-muted_text">
                    <p>Загрузка...</p>
                  </td>
                </tr>
              ) : activeTab === "players" ? (
                topPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-wf-muted_text">
                      <Trophy className="w-12 h-12 opacity-20 mx-auto mb-3" />
                      <p>Нет данных для отображения</p>
                    </td>
                  </tr>
                ) : (
                  topPlayers.map((player, i) => (
                    <tr key={i} className="hover:bg-wf-muted/30 transition-colors">
                      <td className="px-4 py-3 text-wf-muted_text text-xs tabular-nums">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/profile/${encodeURIComponent(player.nickname)}`}
                          className="text-wf-accent hover:underline font-medium"
                        >
                          {player.nickname}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-wf-muted_text">
                        {player.clan !== "-" ? (
                          <Link
                            href={`/clan/${encodeURIComponent(player.clan)}`}
                            className="text-wf-accent hover:underline"
                          >
                            [{player.clan}]
                          </Link>
                        ) : (
                          <span className="text-wf-muted_text/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded bg-wf-muted/20 text-wf-muted_text">
                          {CLASS_NAMES[player.class] || player.class}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-wf-muted_text">
                        {player.shard}
                      </td>
                    </tr>
                  ))
                )
              ) : (
                clanRating.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-wf-muted_text">
                      <Trophy className="w-12 h-12 opacity-20 mx-auto mb-3" />
                      <p>Нет данных для отображения</p>
                    </td>
                  </tr>
                ) : (
                  clanRating.map((clan, i) => (
                    <tr key={i} className="hover:bg-wf-muted/30 transition-colors">
                      <td className="px-4 py-3 text-wf-muted_text text-xs tabular-nums">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/clan/${encodeURIComponent(clan.clan)}`}
                          className="text-wf-accent hover:underline font-medium"
                        >
                          [{clan.clan}]
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/profile/${encodeURIComponent(clan.clan_leader)}`}
                          className="text-wf-accent hover:underline"
                        >
                          {clan.clan_leader}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-wf-text">
                        {parseInt(clan.members).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-wf-accent">
                        {parseInt(clan.points).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-wf-card border border-wf-border rounded-lg">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-wf-muted_text flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-wf-muted_text">
                📊 Рейтинг обновляется в реальном времени через API Warface.
              </p>
              <p className="text-xs text-wf-muted_text mt-1">
                💡 Для просмотра истории конкретного игрока используйте дашборд: <code className="bg-wf-muted/20 px-1 rounded">/dashboard/[ник]</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-wf-bg flex items-center justify-center">
        <p className="text-wf-muted_text">Загрузка...</p>
      </div>
    }>
      <HistoryContent />
    </Suspense>
  );
}
