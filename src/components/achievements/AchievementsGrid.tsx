// src/components/achievements/AchievementsGrid.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, Trophy } from "lucide-react";
import type { AchievementEntry } from "@/app/achievements/page";

type Category = string;

// Категории достижений: значки (badge), жетоны (mark), нашивки (stripe)
function getCategory(achievementId: string): string {
  const lower = achievementId.toLowerCase();
  
  // Значки (badge)
  if (lower.includes("_badge") || lower.endsWith("_badge")) return "badge";
  
  // Жетоны (mark)
  if (lower.includes("_mark") || lower.endsWith("_mark")) return "mark";
  
  // Нашивки (stripe)
  if (lower.includes("_stripe") || lower.endsWith("_stripe") || 
      lower.includes("_strip_") || lower.endsWith("_strip")) return "stripe";
  
  // Остальные достижения (weapon, seasonal, etc.)
  if (achievementId.includes("wpn_")) return "weapon";
  if (achievementId.match(/\d+(bp|spring|summer|autumn|winter|xmas|fool|rating)/)) return "seasonal";
  if (achievementId.includes("prestige")) return "prestige";
  
  return "other";
}

function AchievementIcon({ iconUrls, isUnlocked, category }: { iconUrls: string[]; isUnlocked: boolean; category?: string }) {
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  // Показываем иконку только если все URL не загрузились
  if (failed || iconUrls.length === 0) {
    return (
      <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-lg bg-wf-muted/10">
        <Trophy className="w-8 h-8 text-wf-muted_text/30" />
      </div>
    );
  }

  const currentUrl = iconUrls[idx];
  
  // Нашивки делаем крупнее (96x96 вместо 64x64)
  const sizeClass = category === "stripe" ? "w-24 h-24" : "w-16 h-16";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentUrl}
      alt=""
      onError={() => {
        if (idx < iconUrls.length - 1) {
          setIdx((i) => i + 1);
        } else {
          setFailed(true);
        }
      }}
      className={`${sizeClass} mx-auto object-contain`}
      loading="lazy"
    />
  );
}

export default function AchievementsGrid({
  achievements,
  categoryLabels,
  categoryCounts,
  unlockedCounts,
  showProgress = false,
}: {
  achievements: AchievementEntry[];
  categoryLabels: Record<string, string>;
  categoryCounts: Record<string, number>;
  unlockedCounts: Record<string, number>;
  showProgress?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 48;

  // Все доступные категории
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    achievements.forEach((a) => cats.add(getCategory(a.id)));
    return Array.from(cats).sort();
  }, [achievements, getCategory]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return achievements.filter((a) => {
      // Category filter
      if (category !== "all" && getCategory(a.id) !== category) return false;
      // Unlock filter
      if (filter === "unlocked" && !a.isUnlocked) return false;
      if (filter === "locked" && a.isUnlocked) return false;
      // Search
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    });
  }, [achievements, search, category, filter, getCategory]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleCategory(cat: Category) {
    setCategory(cat);
    setPage(1);
  }

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wf-muted_text" />
        <input
          type="text"
          placeholder="Поиск достижений..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-wf-card border border-wf-border rounded-lg text-wf-text placeholder:text-wf-muted_text text-sm focus:outline-none focus:border-wf-accent/60"
        />
      </div>

      {/* Filter tabs (all/unlocked/locked) */}
      {showProgress && (
        <div className="flex gap-1.5">
          {[
            { id: "all", label: "Все" },
            { id: "unlocked", label: "Полученные" },
            { id: "locked", label: "Заблокированные" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFilter(f.id as typeof filter);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.id
                  ? "bg-wf-accent text-white"
                  : "bg-wf-card border border-wf-border text-wf-muted_text hover:text-wf-text hover:border-wf-accent/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => handleCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            category === "all"
              ? "bg-wf-accent text-white"
              : "bg-wf-card border border-wf-border text-wf-muted_text hover:text-wf-text hover:border-wf-accent/40"
          }`}
        >
          Все
          <span className="ml-1.5 text-xs opacity-60">
            ({achievements.length.toLocaleString()})
          </span>
        </button>
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              category === cat
                ? "bg-wf-accent text-white"
                : "bg-wf-card border border-wf-border text-wf-muted_text hover:text-wf-text hover:border-wf-accent/40"
            }`}
          >
            {categoryLabels[cat] || cat}
            <span className="ml-1.5 text-xs opacity-60">
              ({(categoryCounts[cat] ?? 0).toLocaleString()})
            </span>
            {showProgress && (unlockedCounts[cat] ?? 0) > 0 && (
              <span className="ml-1 text-xs text-green-400">
                ✓ {(unlockedCounts[cat] ?? 0).toLocaleString()}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-xs text-wf-muted_text">
        Показано {Math.min(page * PAGE_SIZE, filtered.length).toLocaleString()} из {filtered.length.toLocaleString()}
      </p>

      {/* Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-20 text-wf-muted_text">Ничего не найдено</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {paginated.map((a) => (
            <div
              key={a.id}
              className={`bg-wf-card border rounded-lg p-3 flex flex-col gap-2 transition-colors ${
                a.isUnlocked
                  ? "border-wf-border hover:border-wf-accent/30"
                  : "border-wf-border/50 opacity-70"
              }`}
            >
              <AchievementIcon iconUrls={a.iconUrls} isUnlocked={a.isUnlocked} category={getCategory(a.id)} />
              
              <div className="flex-1 flex flex-col gap-1">
                <p className={`text-xs font-medium text-center leading-snug line-clamp-2 ${
                  a.isUnlocked ? "text-wf-text" : "text-wf-muted_text"
                }`}>
                  {a.name}
                </p>
                
                <p className="text-[10px] text-wf-muted_text text-center line-clamp-2">
                  {a.description}
                </p>

                {showProgress && a.progress && a.isUnlocked && (
                  <p className="text-[10px] text-green-500 text-center">
                    {a.progress}
                  </p>
                )}

                {a.completionTime && (
                  <p className="text-[10px] text-wf-muted_text text-center">
                    {new Date(a.completionTime).toLocaleDateString("ru-RU")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm bg-wf-card border border-wf-border rounded-lg text-wf-muted_text hover:text-wf-text disabled:opacity-30 transition-colors"
          >
            ← Назад
          </button>
          <span className="text-sm text-wf-muted_text">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm bg-wf-card border border-wf-border rounded-lg text-wf-muted_text hover:text-wf-text disabled:opacity-30 transition-colors"
          >
            Вперёд →
          </button>
        </div>
      )}
    </div>
  );
}
