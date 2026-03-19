// src/components/AddToFavoritesButton.tsx
"use client";

import { useState } from "react";
import { Star, Check } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

interface AddToFavoritesButtonProps {
  playerNickname: string;
  size?: "sm" | "md" | "lg";
}

export default function AddToFavoritesButton({ 
  playerNickname, 
  size = "md" 
}: AddToFavoritesButtonProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [animating, setAnimating] = useState(false);

  const favorite = isFavorite(playerNickname);

  const handleClick = () => {
    setAnimating(true);
    if (favorite) {
      removeFavorite(playerNickname);
    } else {
      addFavorite(playerNickname);
    }
    setTimeout(() => setAnimating(false), 300);
  };

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "rounded-lg transition-all",
        sizeClasses[size],
        favorite
          ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
          : "bg-wf-card border border-wf-border text-wf-muted_text hover:text-yellow-400 hover:border-yellow-500/50"
      )}
      title={favorite ? "Удалить из избранных" : "Добавить в избранные"}
    >
      {favorite ? (
        <Check className={cn(iconSizes[size], animating ? "animate-bounce" : "")} />
      ) : (
        <Star className={cn(iconSizes[size], animating ? "animate-ping" : "")} />
      )}
    </button>
  );
}
