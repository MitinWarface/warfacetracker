// src/components/FavoritesList.tsx
"use client";

import Link from "next/link";
import { Star, Trash2, Users, ExternalLink } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

export default function FavoritesList() {
  const { favorites, loading, removeFavorite, isFavorite } = useFavorites();

  if (loading) {
    return (
      <div className="bg-wf-card border border-wf-border rounded-lg p-4">
        <p className="text-center text-wf-muted_text text-sm">Загрузка...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="bg-wf-card border border-wf-border rounded-lg p-6 text-center">
        <Star className="w-12 h-12 text-wf-muted_text/20 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-2">
          Избранные игроки
        </h3>
        <p className="text-xs text-wf-muted_text">
          Добавьте игроков в избранное,<br/>чтобы следить за их статистикой
        </p>
      </div>
    );
  }

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-wf-muted_text uppercase flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          Избранные ({favorites.length})
        </h3>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {favorites.map((fav) => (
          <div
            key={fav.nickname}
            className="flex items-center justify-between p-2 bg-wf-bg/50 rounded-lg group hover:bg-wf-muted/20 transition-colors"
          >
            <Link
              href={`/profile/${encodeURIComponent(fav.nickname)}`}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <div className={cn(
                "w-2 h-2 rounded-full",
                isFavorite(fav.nickname) ? "bg-green-400" : "bg-gray-400"
              )} />
              <span className="text-sm text-wf-text truncate font-medium">
                {fav.nickname}
              </span>
              <ExternalLink className="w-3 h-3 text-wf-muted_text opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <button
              onClick={() => removeFavorite(fav.nickname)}
              className="p-1.5 rounded hover:bg-red-500/20 text-wf-muted_text hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              title="Удалить из избранных"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-wf-border/40">
        <Link
          href="/compare"
          className="flex items-center justify-center gap-2 text-xs text-wf-accent hover:text-wf-accent/80 transition-colors"
        >
          <Users className="w-3 h-3" />
          Сравнить избранные
        </Link>
      </div>
    </div>
  );
}
