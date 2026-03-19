// src/components/RankCardGenerator.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Download, Share2, X, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getRankInfo } from "@/services/rank.service";
import { cn } from "@/lib/utils";

const RANK_CARD_STYLES = [
  { id: "bronze", name: "Бронза", gradient: "from-amber-900 via-amber-700 to-amber-900", accent: "border-amber-500" },
  { id: "silver", name: "Серебро", gradient: "from-gray-700 via-gray-500 to-gray-700", accent: "border-gray-400" },
  { id: "gold", name: "Золото", gradient: "from-yellow-600 via-yellow-400 to-yellow-600", accent: "border-yellow-300" },
  { id: "diamond", name: "Алмаз", gradient: "from-cyan-900 via-cyan-600 to-cyan-900", accent: "border-cyan-400" },
  { id: "master", name: "Мастер", gradient: "from-purple-900 via-purple-600 to-purple-900", accent: "border-purple-400" },
];

interface RankCardGeneratorProps {
  player: {
    rankId: number;
    nickname: string;
    kdRatio: number;
    pvpWins: number;
    globalAccuracy: number;
    globalHsRate: number;
    playtimeH: number;
    clanName?: string;
  };
  onClose: () => void;
}

export default function RankCardGenerator({ 
  player,
  onClose 
}: RankCardGeneratorProps) {
  const [selectedStyle, setSelectedStyle] = useState(RANK_CARD_STYLES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const rank = getRankInfo(player.rankId);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      // Цвета фона для каждого стиля
      const bgColors: Record<string, string> = {
        bronze: "#78350f",
        silver: "#374151",
        gold: "#78350f",
        diamond: "#164e63",
        master: "#581c87",
        default: "#0f172a",
      };

      const backgroundColor = bgColors[selectedStyle.id] || bgColors.default;

      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: backgroundColor,
      });

      // Конвертируем в JPG через canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const jpgUrl = canvas.toDataURL('image/jpeg', 0.95);
          
          const link = document.createElement('a');
          link.download = `warface-rank-${player.nickname}.jpg`;
          link.href = jpgUrl;
          link.click();
          
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        }
      };
      img.src = dataUrl;
    } catch (error) {
      console.error("Ошибка генерации:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [player.nickname, selectedStyle]);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const bgColors: Record<string, string> = {
        bronze: "#78350f",
        silver: "#374151",
        gold: "#78350f",
        diamond: "#164e63",
        master: "#581c87",
        default: "#0f172a",
      };

      const backgroundColor = bgColors[selectedStyle.id] || bgColors.default;

      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: backgroundColor,
      });

      // Конвертируем в JPG
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const jpgUrl = canvas.toDataURL('image/jpeg', 0.95);
          
          const blob = await (await fetch(jpgUrl)).blob();
          const file = new File([blob], "warface-rank.jpg", { type: "image/jpeg" });

          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `Мой ранг в Warface: ${rank.name}`,
              text: `${player.nickname} - ${rank.name} | K/D: ${player.kdRatio.toFixed(2)} | Побед: ${player.pvpWins}`,
              files: [file],
            });
          } else {
            const link = document.createElement("a");
            link.download = `warface-rank-${player.nickname}.jpg`;
            link.href = jpgUrl;
            link.click();
          }
          
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        }
      };
      img.src = dataUrl;
    } catch (error) {
      console.error("Ошибка шеринга:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [player.nickname, rank.name, player.kdRatio, player.pvpWins, selectedStyle]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Карточка ранга</h2>
          <div className="flex items-center gap-2">
            {showSuccess && (
              <span className="text-green-400 text-sm flex items-center gap-1">
                <Check className="w-4 h-4" /> Готово!
              </span>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-wf-card border border-wf-border rounded-lg p-6 mb-6">
          <div
            ref={cardRef}
            className={cn(
              "relative w-full aspect-square rounded-xl overflow-hidden border-2 shadow-2xl",
              selectedStyle.gradient,
              selectedStyle.accent
            )}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            {/* Content */}
            <div className="relative h-full p-8 flex flex-col items-center justify-center text-center">
              {/* Rank Icon */}
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center mb-4 overflow-hidden">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundImage: `url('/ranks_all.png')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: `32px 3204px`,
                    backgroundPosition: `0 ${(player.rankId - 1) * -32}px`,
                  }}
                />
              </div>

              {/* Rank Name */}
              <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">{rank.name}</h1>
              
              {/* Player Name */}
              <p className="text-white/80 text-lg mb-2">{player.nickname}</p>
              {player.clanName && (
                <p className="text-white/60 text-sm mb-4">[{player.clanName}]</p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-400">{player.kdRatio.toFixed(2)}</div>
                  <p className="text-white/60 text-[10px]">K/D</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-blue-400">{player.pvpWins.toLocaleString()}</div>
                  <p className="text-white/60 text-[10px]">Побед</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-yellow-400">{player.globalAccuracy.toFixed(1)}%</div>
                  <p className="text-white/60 text-[10px]">Точность</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-purple-400">{player.globalHsRate.toFixed(1)}%</div>
                  <p className="text-white/60 text-[10px]">HS</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-cyan-400">{player.playtimeH}ч</div>
                  <p className="text-white/60 text-[10px]">Время</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <QRCodeSVG
                    value={`https://warface-tracker.ru/profile/${player.nickname}`}
                    size={40}
                    level="L"
                    includeMargin={false}
                    className="mx-auto"
                  />
                  <p className="text-white/60 text-[10px] mt-1">QR</p>
                </div>
              </div>

              {/* Watermark */}
              <div className="absolute bottom-4 text-white/40 text-xs">
                warface-tracker.ru
              </div>
            </div>
          </div>
        </div>

        {/* Style Selection */}
        <div className="bg-wf-card border border-wf-border rounded-lg p-4 mb-6">
          <h3 className="text-xs font-semibold text-wf-muted_text uppercase mb-3">Стиль</h3>
          <div className="grid grid-cols-5 gap-2">
            {RANK_CARD_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style)}
                className={cn(
                  "p-2 rounded-lg border-2 transition-all",
                  selectedStyle.id === style.id
                    ? `${style.accent} bg-white/10`
                    : "border-wf-border hover:border-wf-accent/40"
                )}
                title={style.name}
              >
                <div className={`w-full aspect-square rounded bg-gradient-to-br ${style.gradient}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="py-3 bg-wf-accent text-black font-semibold rounded-lg hover:bg-wf-accent/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {isGenerating ? "..." : "Скачать"}
          </button>
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="py-3 bg-wf-card border border-wf-border text-white font-semibold rounded-lg hover:bg-wf-muted/30 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Поделиться
          </button>
        </div>
      </div>
    </div>
  );
}
