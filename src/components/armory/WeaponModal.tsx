// src/components/armory/WeaponModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, RotateCcw, Target, Crosshair, Skull } from "lucide-react";
import type { WeaponEntry } from "@/app/armory/page";
import { proxyImageUrl } from "@/lib/image-proxy";

interface WeaponModalProps {
  weapon: WeaponEntry | null;
  onClose: () => void;
}

function getWeaponCategory(id: string): string {
  if (id.startsWith("ar")) return "ar";
  if (id.startsWith("smg")) return "smg";
  if (id.startsWith("shg")) return "shg";
  if (id.startsWith("sr")) return "sr";
  if (id.startsWith("hmg") || id.startsWith("mg")) return "mg";
  if (id.startsWith("pt")) return "pt";
  return "default";
}

export default function WeaponModal({ weapon, onClose }: WeaponModalProps) {
  const [rotation, setRotation] = useState(0);

  // Блокируем прокрутку страницы при открытом модальном окне
  useEffect(() => {
    if (weapon) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [weapon]);

  // Закрытие по ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!weapon) return null;

  const category = getWeaponCategory(weapon.id);

  // Формируем URL изображения оружия через proxy
  const bare = weapon.id.replace(/_shop$/, "");
  const weaponImageUrl = proxyImageUrl(`https://cdn.wfts.su/weapons/weapons_${bare}.png`);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4 bg-wf-surface border border-wf-border rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-wf-border bg-wf-card">
          <div>
            <h2 className="text-2xl font-bold text-wf-text">{weapon.name}</h2>
            <p className="text-sm text-wf-muted_text capitalize">
              {weapon.className !== "Unknown" ? weapon.className : "Оружие"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-wf-muted transition-colors"
          >
            <X className="w-8 h-8 text-wf-muted_text" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-wf-text flex items-center gap-2">
              <RotateCcw className="w-6 h-6" />
              Просмотр оружия
            </h3>
          </div>

          <div className="relative h-80 flex items-center justify-center bg-wf-muted/5 rounded-lg overflow-hidden">
            {/* Weapon Image */}
            <img
              src={weaponImageUrl}
              alt={weapon.name}
              className="max-h-64 object-contain transition-transform duration-300"
              style={{
                transform: `rotateY(${rotation}deg) scaleX(${rotation > 90 || rotation < -90 ? -1 : 1})`
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />

            {/* Fallback if image fails */}
            <div className="absolute inset-0 flex items-center justify-center text-wf-muted_text">
              <span className="text-sm">{weapon.name}</span>
            </div>

            {/* Rotation Controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <button
                onClick={() => setRotation((r) => r - 45)}
                className="px-4 py-2 text-sm bg-wf-card border border-wf-border rounded hover:bg-wf-muted transition-colors"
              >
                ← Поворот
              </button>
              <button
                onClick={() => setRotation(0)}
                className="px-4 py-2 text-sm bg-wf-card border border-wf-border rounded hover:bg-wf-muted transition-colors"
              >
                Сброс
              </button>
              <button
                onClick={() => setRotation((r) => r + 45)}
                className="px-4 py-2 text-sm bg-wf-card border border-wf-border rounded hover:bg-wf-muted transition-colors"
              >
                Поворот →
              </button>
            </div>
          </div>

          {/* Stats */}
          {weapon.kills > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-wf-card border border-wf-border rounded-lg p-4">
                <p className="text-xs text-wf-muted_text">Убийства</p>
                <p className="text-xl font-bold text-wf-accent">{weapon.kills.toLocaleString()}</p>
              </div>
              <div className="bg-wf-card border border-wf-border rounded-lg p-4">
                <p className="text-xs text-wf-muted_text">Класс</p>
                <p className="text-xl font-bold text-wf-text capitalize">{weapon.className}</p>
              </div>
              {weapon.shots !== undefined && weapon.shots > 0 && (
                <div className="bg-wf-card border border-wf-border rounded-lg p-4">
                  <p className="text-xs text-wf-muted_text flex items-center gap-1">
                    <Crosshair className="w-3 h-3" /> Выстрелов
                  </p>
                  <p className="text-xl font-bold text-wf-text">{weapon.shots.toLocaleString()}</p>
                </div>
              )}
              {weapon.headshots !== undefined && weapon.headshots > 0 && (
                <div className="bg-wf-card border border-wf-border rounded-lg p-4">
                  <p className="text-xs text-wf-muted_text flex items-center gap-1">
                    <Skull className="w-3 h-3" /> Хедшотов
                  </p>
                  <p className="text-xl font-bold text-wf-accent">{weapon.headshots.toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {/* Note about damage multipliers */}
          <div className="mt-6 p-4 bg-wf-accent/10 border border-wf-accent/20 rounded-lg">
            <p className="text-sm text-wf-muted_text">
              ⚠️ API Warface не предоставляет множители урона по зонам.
              Для получения этой информации обратитесь к официальной вики.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
