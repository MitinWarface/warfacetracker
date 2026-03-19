// src/app/ratings/pve/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Trophy, Target, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { WFTop100Player } from "@/types/warface";
import { getRankInfo } from "@/services/rank.service";

const CLASS_NAMES: Record<string, string> = {
  "1": "Штурм",
  "2": "Медик",
  "3": "Снайпер",
  "4": "Инженер",
  "5": "СЭД",
};

function PvERatingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topPlayers, setTopPlayers] = useState<WFTop100Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeClass, setActiveClass] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const classFilter = searchParams.get("class") || "";

  useEffect(() => {
    setActiveClass(classFilter);
    loadTopPlayers(classFilter);
  }, [classFilter]);

  const loadTopPlayers = async (classId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Используем наш proxy для обхода CORS
      const res = await fetch(`/api/warface?endpoint=/rating/top100&class=${classId || ""}`);
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data && data.length > 0) {
        // Удаляем дубликаты по nickname
        const seen = new Set<string>();
        const unique = data.filter((player: WFTop100Player) => {
          if (seen.has(player.nickname)) return false;
          seen.add(player.nickname);
          return true;
        });
        setTopPlayers(unique);
      } else {
        setError("API Warface вернуло пустой ответ.");
        setTopPlayers([]);
      }
    } catch (err: any) {
      setError(`Ошибка: ${err.message || "Не удалось подключиться к API"}`);
      setTopPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassFilter = (classId: string) => {
    router.push(`/ratings/pve${classId ? `?class=${classId}` : ""}`);
  };

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      {/* Header */}
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-wf-accent" />
            PvE Рейтинг
          </h1>
          <p className="text-sm text-wf-muted_text mt-1">
            Топ-100 игроков по PvE статистике
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Filter */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => handleClassFilter("")}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                activeClass === ""
                  ? "bg-wf-accent text-white"
                  : "bg-wf-card border border-wf-border text-wf-muted_text hover:text-wf-text"
              }`}
            >
              Все классы
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
          
          <div className="flex items-center gap-2 text-sm text-wf-muted_text">
            <Zap className="w-4 h-4" />
            <span>Всего: <span className="text-wf-text font-semibold">{topPlayers.length}</span></span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-wf-card border border-wf-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-wf-muted/20 border-b border-wf-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Игрок</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Клан</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Класс</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Ранг</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase">Сервер</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wf-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-wf-muted_text">
                    <p>Загрузка...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <AlertCircle className="w-12 h-12 opacity-20 mx-auto mb-3 text-red-400" />
                    <p className="text-red-400 font-medium">{error}</p>
                    <p className="text-sm text-wf-muted_text mt-2">
                      API Warface: <code className="bg-wf-muted/20 px-2 py-1 rounded">http://api.warface.ru/rating/top100</code>
                    </p>
                    <button
                      onClick={() => loadTopPlayers(activeClass)}
                      className="mt-4 px-4 py-2 bg-wf-accent text-black rounded text-sm font-medium hover:bg-wf-accent/90"
                    >
                      Повторить
                    </button>
                  </td>
                </tr>
              ) : topPlayers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-wf-muted_text">
                    <Trophy className="w-12 h-12 opacity-20 mx-auto mb-3" />
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
                      <td className="px-4 py-3 text-right text-xs text-wf-muted_text">
                        {player.shard}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-wf-card border border-wf-border rounded-lg">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-wf-muted_text flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-wf-muted_text">
                📊 Рейтинг обновляется в реальном времени через API Warface.
              </p>
              <p className="text-xs text-wf-muted_text mt-1">
                💡 <strong>Примечание:</strong> API Warface не предоставляет отдельный PvE рейтинг. 
                Показываются лучшие игроки по классам из общего рейтинга Top-100.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PvERatingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-wf-bg flex items-center justify-center">
        <p className="text-wf-muted_text">Загрузка...</p>
      </div>
    }>
      <PvERatingContent />
    </Suspense>
  );
}
