// src/hooks/useFavorites.ts
"use client";

import { useState, useEffect, useCallback } from "react";

export interface FavoritePlayer {
  nickname: string;
  addedAt: string;
}

export function useFavorites(playerNickname?: string) {
  const [favorites, setFavorites] = useState<FavoritePlayer[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка из localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("wf_favorites");
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Ошибка загрузки избранных:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Сохранение в localStorage
  const saveFavorites = useCallback((newFavorites: FavoritePlayer[]) => {
    try {
      localStorage.setItem("wf_favorites", JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error("Ошибка сохранения избранных:", error);
    }
  }, []);

  // Добавить в избранные
  const addFavorite = useCallback((nickname: string) => {
    const normalized = nickname.toLowerCase();
    if (favorites.some(f => f.nickname.toLowerCase() === normalized)) {
      return false; // Уже в избранных
    }
    
    const newFavorites = [
      ...favorites,
      { nickname, addedAt: new Date().toISOString() }
    ];
    saveFavorites(newFavorites);
    return true;
  }, [favorites, saveFavorites]);

  // Удалить из избранных
  const removeFavorite = useCallback((nickname: string) => {
    const normalized = nickname.toLowerCase();
    const newFavorites = favorites.filter(
      f => f.nickname.toLowerCase() !== normalized
    );
    saveFavorites(newFavorites);
  }, [favorites, saveFavorites]);

  // Проверка наличия
  const isFavorite = useCallback((nickname: string) => {
    return favorites.some(
      f => f.nickname.toLowerCase() === nickname.toLowerCase()
    );
  }, [favorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    count: favorites.length,
  };
}
