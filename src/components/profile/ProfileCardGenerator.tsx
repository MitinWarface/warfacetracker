// src/components/profile/ProfileCardGenerator.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Download, Share2, Image as ImageIcon, X, Check, Type, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getRankInfo } from "@/services/rank.service";
import type { NormalizedPlayerStats } from "@/types/warface";
import { cn } from "@/lib/utils";

const CARD_STYLES = [
  { id: "default", name: "Классический", gradient: "from-slate-900 via-purple-900 to-slate-900", accent: "border-purple-500", glow: "shadow-purple-500/50" },
  { id: "fire", name: "Огонь", gradient: "from-orange-900 via-red-900 to-orange-900", accent: "border-orange-500", glow: "shadow-orange-500/50" },
  { id: "ice", name: "Лёд", gradient: "from-blue-900 via-cyan-900 to-blue-900", accent: "border-cyan-500", glow: "shadow-cyan-500/50" },
  { id: "forest", name: "Лес", gradient: "from-green-900 via-emerald-900 to-green-900", accent: "border-green-500", glow: "shadow-green-500/50" },
  { id: "gold", name: "Золото", gradient: "from-yellow-900 via-amber-800 to-yellow-900", accent: "border-yellow-400", glow: "shadow-yellow-400/50" },
  { id: "dark", name: "Тьма", gradient: "from-gray-950 via-neutral-900 to-gray-950", accent: "border-red-500", glow: "shadow-red-500/50" },
  { id: "ocean", name: "Океан", gradient: "from-indigo-900 via-blue-800 to-cyan-900", accent: "border-indigo-400", glow: "shadow-indigo-500/50" },
  { id: "sunset", name: "Закат", gradient: "from-pink-900 via-rose-800 to-orange-900", accent: "border-pink-400", glow: "shadow-pink-500/50" },
  { id: "neon", name: "Неон", gradient: "from-fuchsia-900 via-purple-800 to-pink-900", accent: "border-fuchsia-400", glow: "shadow-fuchsia-500/50" },
  { id: "military", name: "Милитари", gradient: "from-stone-900 via-green-900 to-stone-800", accent: "border-green-600", glow: "shadow-green-600/50" },
  { id: "royal", name: "Королевский", gradient: "from-violet-950 via-purple-900 to-indigo-950", accent: "border-violet-300", glow: "shadow-violet-400/50" },
  { id: "cyber", name: "Киберпанк", gradient: "from-lime-900 via-yellow-800 to-amber-900", accent: "border-lime-400", glow: "shadow-lime-500/50" },
];

const CLASS_ICONS: Record<string, string> = {
  Rifleman: "🎯",
  Medic: "💉",
  Sniper: "🔫",
  Recon: "👁️",
  Engineer: "🔧",
  SED: "⚡",
  Heavy: "💪",
};

interface ProfileCardGeneratorProps {
  player: NormalizedPlayerStats;
  onClose: () => void;
}

export default function ProfileCardGenerator({ player, onClose }: ProfileCardGeneratorProps) {
  const [selectedStyle, setSelectedStyle] = useState(CARD_STYLES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQR, setShowQR] = useState(true);
  const [customText, setCustomText] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const rank = getRankInfo(player.rankId);
  const pvpWinRate = player.pvpTotal > 0 ? ((player.pvpWins / player.pvpTotal) * 100).toFixed(1) : "0";

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "transparent",
      });
      
      const link = document.createElement("a");
      link.download = `warface-${player.nickname}-card.png`;
      link.href = dataUrl;
      link.click();
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Ошибка генерации:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [player.nickname]);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "warface-card.png", { type: "image/png" });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Профиль ${player.nickname}`,
          text: `Моя статистика в Warface: K/D ${player.kdRatio.toFixed(2)} | ${player.pvpWins} побед\n${customText || ''}`,
          files: [file],
        });
      } else {
        // Fallback - скачивание
        const link = document.createElement("a");
        link.download = `warface-${player.nickname}-card.png`;
        link.href = dataUrl;
        link.click();
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Ошибка шеринга:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [player.nickname, player.kdRatio, player.pvpWins, customText]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-wf-accent" />
            Создать карточку профиля
          </h2>
          <div className="flex items-center gap-2">
            {showSuccess && (
              <span className="text-green-400 text-sm flex items-center gap-1">
                <Check className="w-4 h-4" /> Готово!
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-wf-card border border-wf-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4">Предпросмотр</h3>
              
              {/* Card Preview */}
              <div 
                ref={cardRef}
                className={cn(
                  "relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 shadow-2xl",
                  selectedStyle.gradient,
                  selectedStyle.accent
                )}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div 
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative h-full p-8 flex flex-col justify-between">
                  {/* Top Row */}
                  <div className="flex items-start justify-between">
                    {/* Player Info */}
                    <div className="flex items-center gap-4">
                      {/* Rank Icon */}
                      <div className="w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            backgroundImage: "url('/ranks_all.png')",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "64px 6408px",
                            backgroundPosition: `0px -${(rank.id - 1) * 64}px`,
                          }}
                        />
                      </div>
                      
                      {/* Name & Rank */}
                      <div>
                        <h1 className="text-3xl font-bold text-white drop-shadow-lg">{player.nickname}</h1>
                        <p className="text-white/80 text-sm">{rank.name}</p>
                        {player.clanName && (
                          <p className="text-white/60 text-xs mt-1">[{player.clanName}]</p>
                        )}
                      </div>
                    </div>

                    {/* K/D Badge */}
                    <div className="text-right">
                      <div className="text-5xl font-bold text-white drop-shadow-lg">
                        {player.kdRatio.toFixed(2)}
                      </div>
                      <p className="text-white/60 text-sm">K/D Ratio</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    {/* Wins */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                      <div className="text-2xl font-bold text-green-400">{player.pvpWins.toLocaleString()}</div>
                      <p className="text-white/60 text-xs mt-1">Победы</p>
                    </div>

                    {/* Losses */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                      <div className="text-2xl font-bold text-red-400">{player.pvpLosses.toLocaleString()}</div>
                      <p className="text-white/60 text-xs mt-1">Поражения</p>
                    </div>

                    {/* Win Rate */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                      <div className="text-2xl font-bold text-blue-400">{pvpWinRate}%</div>
                      <p className="text-white/60 text-xs mt-1">Win Rate</p>
                    </div>

                    {/* Kills */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                      <div className="text-2xl font-bold text-yellow-400">{player.kills.toLocaleString()}</div>
                      <p className="text-white/60 text-xs mt-1">Убийства</p>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between">
                    {/* Favorite Class */}
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                      <span className="text-2xl">{CLASS_ICONS[player.favPvP] || "🎮"}</span>
                      <div>
                        <p className="text-white/60 text-xs">Любимый класс</p>
                        <p className="text-white font-semibold text-sm">
                          {player.favPvP === "Rifleman" ? "Штурмовик" :
                           player.favPvP === "Medic" ? "Медик" :
                           player.favPvP === "Sniper" || player.favPvP === "Recon" ? "Снайпер" :
                           player.favPvP === "Engineer" ? "Инженер" :
                           player.favPvP === "SED" ? "СЭД" :
                           player.favPvP === "Heavy" ? "Тяжёлый" : player.favPvP || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Playtime */}
                    <div className="text-right">
                      <p className="text-white/60 text-xs">Время в игре</p>
                      <p className="text-white font-semibold">
                        {player.playtimeH.toLocaleString()}ч {player.playtimeMin}м
                      </p>
                    </div>
                  </div>
                </div>

                {/* Watermark */}
                <div className="absolute bottom-2 right-4 text-white/40 text-xs flex items-center gap-2">
                  warface-tracker.ru
                  {showQR && (
                    <QRCodeSVG
                      value={`https://warface-tracker.ru/profile/${player.nickname}`}
                      size={32}
                      level="L"
                      includeMargin={false}
                      className="inline-block ml-2 opacity-80"
                    />
                  )}
                </div>

                {/* Custom Text */}
                {customText && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-white/20 text-lg font-medium italic max-w-md drop-shadow-lg">
                      "{customText}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Style Selection */}
            <div className="bg-wf-card border border-wf-border rounded-lg p-6">
              <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Стиль карточки
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {CARD_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={cn(
                      "p-2 rounded-lg border-2 transition-all flex items-center gap-2",
                      selectedStyle.id === style.id
                        ? `${style.accent} bg-white/10 ${style.glow} shadow-lg`
                        : "border-wf-border hover:border-wf-accent/40"
                    )}
                  >
                    <div className={`w-6 h-6 rounded bg-gradient-to-br ${style.gradient}`} />
                    <span className="text-white text-xs font-medium">{style.name}</span>
                    {selectedStyle.id === style.id && (
                      <Check className="w-3 h-3 text-green-400 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Options */}
            <div className="bg-wf-card border border-wf-border rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-semibold text-wf-muted_text uppercase flex items-center gap-2">
                <Type className="w-4 h-4" /> Настройки
              </h3>

              {/* QR Code Toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-wf-muted_text" />
                  <span className="text-sm text-white">QR-код</span>
                </div>
                <input
                  type="checkbox"
                  checked={showQR}
                  onChange={(e) => setShowQR(e.target.checked)}
                  className="w-4 h-4 rounded border-wf-border bg-wf-card text-wf-accent focus:ring-wf-accent/50"
                />
              </label>

              {/* Custom Text Input */}
              <div>
                <label className="flex items-center gap-2 text-sm text-white mb-2">
                  <Type className="w-4 h-4 text-wf-muted_text" />
                  Кастомная надпись
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value.slice(0, 50))}
                  placeholder="Ваша цитата (до 50 символов)"
                  className="w-full px-3 py-2 bg-wf-bg border border-wf-border rounded text-white text-sm placeholder:text-wf-muted_text focus:outline-none focus:border-wf-accent"
                  maxLength={50}
                />
                <p className="text-xs text-wf-muted_text mt-1 text-right">
                  {customText.length}/50
                </p>
              </div>

              {/* QR Code Info */}
              <div className="flex items-center gap-2 text-xs text-wf-muted_text">
                <QRCodeSVG
                  value={`https://warface-tracker.ru/profile/${player.nickname}`}
                  size={16}
                  level="L"
                  includeMargin={false}
                />
                <span>QR ведёт на ваш профиль</span>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-wf-card border border-wf-border rounded-lg p-6 space-y-3">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full py-3 bg-wf-accent text-black font-semibold rounded-lg hover:bg-wf-accent/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {isGenerating ? "Генерация..." : "Скачать PNG"}
              </button>

              <button
                onClick={handleShare}
                disabled={isGenerating}
                className="w-full py-3 bg-wf-card border border-wf-border text-white font-semibold rounded-lg hover:bg-wf-muted/30 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Поделиться
              </button>

              <p className="text-xs text-wf-muted_text text-center">
                PNG: высокое качество (2x)
              </p>
            </div>

            {/* Tips */}
            <div className="bg-wf-card border border-wf-border rounded-lg p-4">
              <h4 className="text-xs font-semibold text-wf-muted_text uppercase mb-2">💡 Советы</h4>
              <ul className="text-xs text-wf-muted_text space-y-1">
                <li>• 12 стилей на выбор</li>
                <li>• QR-код ведёт на ваш профиль</li>
                <li>• Добавьте цитату для уникальности</li>
                <li>• Поделитесь в Discord или VK</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
