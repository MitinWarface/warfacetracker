// src/app/ratings/monthly/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Trophy, Users, Medal } from "lucide-react";
import Link from "next/link";
import { fetchMonthlyRating } from "@/services/wf-api.service";
import type { WFMonthlyRating } from "@/types/warface";

const LEAGUE_NAMES: Record<number, string> = {
  1: "Бронза",
  2: "Серебро",
  3: "Золото",
  4: "Платина",
  5: "Алмаз",
  6: "Мастер",
};

function MonthlyRatingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ratings, setRatings] = useState<WFMonthlyRating[]>([]);
  const [loading, setLoading] = useState(false);
  
  const league = searchParams.get("league");
  const page = searchParams.get("page") || "1";

  useEffect(() => {
    setLoading(true);
    const params: { league?: number; page?: number } = {};
    if (league) params.league = parseInt(league, 10);
    if (page) params.page = parseInt(page, 10);
    
    fetchMonthlyRating(params)
      .then((data) => {
        setRatings(data);
        setLoading(false);
      })
      .catch(() => {
        setRatings([]);
        setLoading(false);
      });
  }, [league, page]);

  const handleLeagueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    router.push(`/ratings/monthly${val ? `?league=${val}` : ""}`);
  };

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Medal className="w-6 h-6 text-wf-accent" /> Ежемесячный рейтинг кланов
          </h1>
          <p className="text-sm text-wf-muted_text mt-1">
            Рейтинг кланов за текущий месяц
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-wf-muted_text">Лига:</label>
            <select
              value={league || ""}
              onChange={handleLeagueChange}
              className="bg-wf-card border border-wf-border rounded px-3 py-1.5 text-sm text-wf-text"
            >
              <option value="">Все лиги</option>
              {Object.entries(LEAGUE_NAMES).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-wf-card border border-wf-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-wf-muted/20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Клан</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Лидер</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase">Участников</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase">Очки</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wf-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-wf-muted_text">
                    <p>Загрузка...</p>
                  </td>
                </tr>
              ) : ratings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-wf-muted_text">
                    <Trophy className="w-12 h-12 opacity-20 mx-auto mb-3" />
                    <p>Нет данных для отображения</p>
                  </td>
                </tr>
              ) : (
                ratings.map((r, i) => (
                  <tr key={i} className="hover:bg-wf-muted/10 transition-colors">
                    <td className="px-4 py-3 text-sm text-wf-muted_text">
                      {r.rank === "1" ? (
                        <span className="text-yellow-500 font-bold">🥇</span>
                      ) : r.rank === "2" ? (
                        <span className="text-gray-400 font-bold">🥈</span>
                      ) : r.rank === "3" ? (
                        <span className="text-orange-500 font-bold">🥉</span>
                      ) : (
                        r.rank
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/clan/${encodeURIComponent(r.clan)}`}
                        className="text-sm font-medium text-wf-text hover:text-wf-accent transition-colors"
                      >
                        [{r.clan}]
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/profile/${encodeURIComponent(r.clan_leader)}`}
                        className="text-sm text-wf-accent hover:underline"
                      >
                        {r.clan_leader}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-wf-text flex items-center justify-end gap-1">
                        <Users className="w-3 h-3" />
                        {parseInt(r.members).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-wf-accent">
                        {parseInt(r.points).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && ratings.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            {page > "1" && (
              <button
                onClick={() => {
                  const newPage = (parseInt(page, 10) - 1).toString();
                  router.push(`/ratings/monthly?league=${league || ""}&page=${newPage}`);
                }}
                className="px-4 py-2 text-sm bg-wf-card border border-wf-border rounded hover:bg-wf-muted transition-colors"
              >
                ← Назад
              </button>
            )}
            <span className="text-sm text-wf-muted_text">
              Страница {page}
            </span>
            {ratings.length === 100 && (
              <button
                onClick={() => {
                  const newPage = (parseInt(page, 10) + 1).toString();
                  router.push(`/ratings/monthly?league=${league || ""}&page=${newPage}`);
                }}
                className="px-4 py-2 text-sm bg-wf-card border border-wf-border rounded hover:bg-wf-muted transition-colors"
              >
                Вперёд →
              </button>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-wf-card border border-wf-border rounded-lg">
          <div className="flex items-start gap-3">
            <Medal className="w-5 h-5 text-wf-muted_text flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-wf-muted_text">
                📊 Рейтинг кланов обновляется ежемесячно через API Warface.
              </p>
              <p className="text-xs text-wf-muted_text mt-1">
                💡 Выберите лигу для фильтрации кланов по рангу.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MonthlyRatingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-wf-bg flex items-center justify-center">
        <p className="text-wf-muted_text">Загрузка...</p>
      </div>
    }>
      <MonthlyRatingContent />
    </Suspense>
  );
}
