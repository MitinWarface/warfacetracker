// src/app/search/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Users, Trophy, Target, AlertTriangle, Database } from "lucide-react";
import Link from "next/link";
import { fetchTop100 } from "@/services/wf-api.service";
import type { WFTop100Player } from "@/types/warface";
import { getRankInfo } from "@/services/rank.service";

const CLASS_NAMES: Record<string, string> = {
  "1": "Штурм",
  "2": "Медик",
  "3": "Снайпер",
  "4": "Инженер",
  "5": "СЭД",
};

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [topPlayers, setTopPlayers] = useState<WFTop100Player[]>([]);
  const [savedPlayers, setSavedPlayers] = useState<Array<{
    nickname: string;
    displayNickname: string;
    lastUpdated: string;
    hasHiddenStats: boolean;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [activeClass, setActiveClass] = useState<string>("");
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const classFilter = searchParams.get("class") || "";
    setActiveClass(classFilter);
    loadTopPlayers(classFilter);
  }, [searchParams]);

  const loadTopPlayers = async (classId: string) => {
    setLoading(true);
    try {
      const classParam = classId ? `?class=${classId}` : "";
      const res = await fetch(`/api/warface?endpoint=/rating/top100${classParam}`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      const seen = new Set<string>();
      const unique = data.filter((player: WFTop100Player) => {
        if (seen.has(player.nickname)) return false;
        seen.add(player.nickname);
        return true;
      });

      setTopPlayers(unique);
    } catch {
      setTopPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  // Поиск сохраненных игроков в БД через API
  const searchSavedPlayers = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSavedPlayers([]);
      setShowSaved(false);
      return;
    }

    try {
      const res = await fetch(`/api/search/players?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        throw new Error('Search failed');
      }
      const players = await res.json();
      setSavedPlayers(players.map((p: any) => ({
        nickname: p.nickname,
        displayNickname: p.displayNickname,
        lastUpdated: p.lastUpdated,
        hasHiddenStats: true,
      })));
      setShowSaved(players.length > 0);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/profile/${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClassFilter = (classId: string) => {
    router.push(`/search${classId ? `?class=${classId}` : ""}`);
  };

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      {/* Header */}
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="w-6 h-6 text-wf-accent" />
            Поиск игроков
          </h1>
          <p className="text-sm text-wf-muted_text mt-1">
            Поиск по нику и топ игроков
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search Form */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-wf-muted_text mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Быстрый поиск
          </h2>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wf-muted_text" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                searchSavedPlayers(e.target.value);
              }}
              placeholder="Введите ник игрока..."
              className="w-full pl-12 pr-4 py-4 bg-wf-card border border-wf-border rounded-lg text-wf-text placeholder:text-wf-muted_text text-base focus:outline-none focus:border-wf-accent/60 focus:ring-2 focus:ring-wf-accent/20 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-wf-accent text-white rounded-md text-sm font-medium hover:bg-wf-accent/90 transition-colors"
            >
              Найти
            </button>
          </form>

          {/* Info about hidden stats */}
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/70">
              Если игрок скрыл статистику в настройках игры, будут показаны последние сохраненные данные.
            </p>
          </div>

          {/* Saved Players Results */}
          {showSaved && savedPlayers.length > 0 && (
            <div className="mt-4 bg-wf-card border border-wf-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Сохраненные игроки ({savedPlayers.length})
              </h3>
              <div className="space-y-2">
                {savedPlayers.map((player) => (
                  <Link
                    key={player.nickname}
                    href={`/profile/${encodeURIComponent(player.displayNickname)}`}
                    className="block p-3 rounded-lg border border-wf-border hover:border-wf-accent/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-wf-text">{player.displayNickname}</p>
                        <p className="text-xs text-wf-muted_text">
                          Обновлен: {new Date(player.lastUpdated).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      {player.hasHiddenStats && (
                        <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                          Статистика скрыта
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Top Players */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-wf-muted_text flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Топ-100 игроков
            </h2>
            
            {/* Class Filter */}
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => handleClassFilter("")}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  activeClass === ""
                    ? "bg-wf-accent text-white"
                    : "bg-wf-card border border-wf-border text-wf-muted_text hover:text-wf-text"
                }`}
              >
                Все
              </button>
              {Object.entries(CLASS_NAMES).map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => handleClassFilter(id)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    activeClass === id
                      ? "bg-wf-accent text-white"
                      : "bg-wf-card border border-wf-border text-wf-muted_text hover:text-wf-text"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-wf-card border border-wf-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-wf-muted/20 border-b border-wf-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Игрок</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Клан</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Класс</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Ранг</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wf-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-wf-muted_text">
                      <p>Загрузка...</p>
                    </td>
                  </tr>
                ) : topPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-wf-muted_text">
                      <Users className="w-12 h-12 opacity-20 mx-auto mb-3" />
                      <p>Нет данных для отображения</p>
                    </td>
                  </tr>
                ) : (
                  topPlayers.map((player, i) => {
                    const rank = getRankInfo(parseInt(player.class));
                    return (
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
                        <td className="px-4 py-3 text-xs text-wf-muted_text">
                          {rank.name}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-wf-bg flex items-center justify-center">
        <p className="text-wf-muted_text">Загрузка...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
