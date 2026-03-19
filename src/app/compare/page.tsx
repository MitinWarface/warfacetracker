// src/app/compare/page.tsx
"use client";

import { Suspense, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Trophy, Target, Zap, Shield, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { fetchPlayerStat, normalizePlayerStat } from "@/services/wf-api.service";
import type { NormalizedPlayerStats } from "@/types/warface";
import { getRankInfo } from "@/services/rank.service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import WeaponDamageCalculator from "@/components/WeaponDamageCalculator";
import FavoritesList from "@/components/FavoritesList";

function CompareContent() {
  const router = useRouter();
  const [player1Nick, setPlayer1Nick] = useState("");
  const [player2Nick, setPlayer2Nick] = useState("");
  const [player1, setPlayer1] = useState<NormalizedPlayerStats | null>(null);
  const [player2, setPlayer2] = useState<NormalizedPlayerStats | null>(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);

  const loadPlayer = async (nickname: string, setPlayer: any, setLoading: any, setError: any) => {
    if (!nickname.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlayerStat(nickname);
      if (data) {
        setPlayer(data);
      } else {
        setError("Игрок не найден");
        setPlayer(null);
      }
    } catch {
      setError("Ошибка загрузки");
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = () => {
    if (player1Nick.trim()) loadPlayer(player1Nick, setPlayer1, setLoading1, setError1);
    if (player2Nick.trim()) loadPlayer(player2Nick, setPlayer2, setLoading2, setError2);
  };

  // Radar chart data
  const radarData = useMemo(() => {
    if (!player1 || !player2) return [];
    
    const p1WR = player1.pvpTotal > 0 ? (player1.pvpWins / player1.pvpTotal) * 100 : 0;
    const p2WR = player2.pvpTotal > 0 ? (player2.pvpWins / player2.pvpTotal) * 100 : 0;
    
    return [
      { subject: 'K/D', A: Math.min(player1.kdRatio * 20, 100), B: Math.min(player2.kdRatio * 20, 100), fullMark: 100 },
      { subject: 'Win Rate', A: p1WR, B: p2WR, fullMark: 100 },
      { subject: 'Точность', A: player1.globalAccuracy, B: player2.globalAccuracy, fullMark: 100 },
      { subject: 'Хедшоты', A: player1.globalHsRate, B: player2.globalHsRate, fullMark: 100 },
      { subject: 'Победы', A: Math.min((player1.pvpWins / 1000) * 100, 100), B: Math.min((player2.pvpWins / 1000) * 100, 100), fullMark: 100 },
    ];
  }, [player1, player2]);

  // Bar chart data
  const barData = useMemo(() => {
    if (!player1 || !player2) return [];
    return [
      { name: 'Убийства', p1: player1.kills, p2: player2.kills },
      { name: 'Победы', p1: player1.pvpWins, p2: player2.pvpWins },
      { name: 'Время (ч)', p1: player1.playtimeH, p2: player2.playtimeH },
    ];
  }, [player1, player2]);

  const StatRow = ({ label, val1, val2, highlight = false }: { label: string; val1: string | number; val2: string | number; highlight?: boolean }) => {
    const n1 = typeof val1 === "number" ? val1 : parseFloat(val1) || 0;
    const n2 = typeof val2 === "number" ? val2 : parseFloat(val2) || 0;
    const better1 = n1 > n2;
    const better2 = n2 > n1;
    const equal = n1 === n2;

    return (
      <div className="grid grid-cols-3 gap-2 py-2 border-b border-wf-border/50">
        <div className={`text-right text-sm ${better1 && !equal ? "text-green-400 font-semibold" : "text-wf-text"}`}>
          {val1}
        </div>
        <div className="text-center text-xs text-wf-muted_text">{label}</div>
        <div className={`text-left text-sm ${better2 && !equal ? "text-green-400 font-semibold" : "text-wf-text"}`}>
          {val2}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      {/* Header */}
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-wf-accent" />
            Сравнение игроков
          </h1>
          <p className="text-sm text-wf-muted_text mt-1">
            Сравните статистику двух игроков
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Form */}
            <div className="bg-wf-card border border-wf-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-wf-muted_text mb-2">Игрок 1</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={player1Nick}
                      onChange={(e) => setPlayer1Nick(e.target.value)}
                      placeholder="Никнейм..."
                      className="flex-1 px-4 py-2 bg-wf-bg border border-wf-border rounded text-wf-text text-sm focus:outline-none focus:border-wf-accent/60"
                      onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                    />
                    <button
                      onClick={() => loadPlayer(player1Nick, setPlayer1, setLoading1, setError1)}
                      disabled={loading1}
                      className="px-4 py-2 bg-wf-accent text-black rounded text-sm font-medium hover:bg-wf-accent/90 disabled:opacity-50"
                    >
                      {loading1 ? "..." : "Загрузить"}
                    </button>
                  </div>
                  {error1 && <p className="text-xs text-red-400 mt-1">{error1}</p>}
                </div>
                <div>
                  <label className="block text-sm text-wf-muted_text mb-2">Игрок 2</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={player2Nick}
                      onChange={(e) => setPlayer2Nick(e.target.value)}
                      placeholder="Никнейм..."
                      className="flex-1 px-4 py-2 bg-wf-bg border border-wf-border rounded text-wf-text text-sm focus:outline-none focus:border-wf-accent/60"
                      onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                    />
                    <button
                      onClick={() => loadPlayer(player2Nick, setPlayer2, setLoading2, setError2)}
                      disabled={loading2}
                      className="px-4 py-2 bg-wf-accent text-black rounded text-sm font-medium hover:bg-wf-accent/90 disabled:opacity-50"
                    >
                      {loading2 ? "..." : "Загрузить"}
                    </button>
                  </div>
                  {error2 && <p className="text-xs text-red-400 mt-1">{error2}</p>}
                </div>
              </div>
              <button
                onClick={handleCompare}
                className="mt-4 w-full py-3 bg-wf-accent/20 border border-wf-accent text-wf-accent rounded text-sm font-medium hover:bg-wf-accent/30 transition-colors"
              >
                <Search className="w-4 h-4 inline mr-2" />
                Сравнить
              </button>
            </div>

            {/* Comparison Content */}
            {player1 && player2 && (
              <>
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-wf-card border border-wf-border rounded-lg p-4 text-center">
                    <Link href={`/profile/${player1.nickname}`} className="text-lg font-bold text-wf-accent hover:underline">
                      {player1.nickname}
                    </Link>
                    <p className="text-sm text-wf-muted_text mt-1">{getRankInfo(player1.rankId).name}</p>
                    <p className="text-xs text-wf-muted_text mt-2">Ранг: {player1.rankId}</p>
                  </div>
                  <div className="bg-wf-card border border-wf-border rounded-lg p-4 text-center">
                    <Link href={`/profile/${player2.nickname}`} className="text-lg font-bold text-wf-accent hover:underline">
                      {player2.nickname}
                    </Link>
                    <p className="text-sm text-wf-muted_text mt-1">{getRankInfo(player2.rankId).name}</p>
                    <p className="text-xs text-wf-muted_text mt-2">Ранг: {player2.rankId}</p>
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-wf-card border border-wf-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4">Сравнение по параметрам</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                        <Radar name={player1.nickname} dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                        <Radar name={player2.nickname} dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                        <Legend />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-wf-card border border-wf-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4">Общая статистика</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                        />
                        <Legend />
                        <Bar name={player1.nickname} dataKey="p1" fill="#22c55e" />
                        <Bar name={player2.nickname} dataKey="p2" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* PvP Stats */}
                <div className="bg-wf-card border border-wf-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> PvP Статистика
                  </h3>
                  <div className="space-y-1">
                    <StatRow label="Победы" val1={player1.pvpWins} val2={player2.pvpWins} />
                    <StatRow label="Поражения" val1={player1.pvpLosses} val2={player2.pvpLosses} />
                    <StatRow label="K/D" val1={player1.kdRatio.toFixed(2)} val2={player2.kdRatio.toFixed(2)} />
                    <StatRow label="Убийства" val1={player1.kills.toLocaleString()} val2={player2.kills.toLocaleString()} />
                    <StatRow label="Смерти" val1={player1.deaths.toLocaleString()} val2={player2.deaths.toLocaleString()} />
                    <StatRow label="Точность" val1={`${player1.globalAccuracy.toFixed(1)}%`} val2={`${player2.globalAccuracy.toFixed(1)}%`} />
                    <StatRow label="Хедшоты" val1={`${player1.globalHsRate.toFixed(1)}%`} val2={`${player2.globalHsRate.toFixed(1)}%`} />
                  </div>
                </div>

                {/* Damage Calculator */}
                <WeaponDamageCalculator />
              </>
            )}

            {/* Empty State */}
            {(!player1 && !player2) && (
              <div className="text-center py-20 text-wf-muted_text">
                <Users className="w-16 h-16 opacity-20 mx-auto mb-4" />
                <p className="text-lg">Введите ники игроков для сравнения</p>
                <p className="text-sm mt-2">Можно загрузить одного или обоих игроков сразу</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <FavoritesList />
            
            {/* Quick Stats */}
            {player1 && player2 && (
              <div className="bg-wf-card border border-wf-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-3">Кто лучше?</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-wf-muted_text">K/D:</span>
                    {player1.kdRatio > player2.kdRatio ? (
                      <span className="text-green-400 font-semibold">{player1.nickname} +{((player1.kdRatio / player2.kdRatio - 1) * 100).toFixed(0)}%</span>
                    ) : (
                      <span className="text-red-400 font-semibold">{player2.nickname} +{((player2.kdRatio / player1.kdRatio - 1) * 100).toFixed(0)}%</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-wf-muted_text">Победы:</span>
                    {player1.pvpWins > player2.pvpWins ? (
                      <span className="text-green-400 font-semibold">{player1.nickname} +{player1.pvpWins - player2.pvpWins}</span>
                    ) : (
                      <span className="text-red-400 font-semibold">{player2.nickname} +{player2.pvpWins - player1.pvpWins}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-wf-muted_text">Точность:</span>
                    {player1.globalAccuracy > player2.globalAccuracy ? (
                      <span className="text-green-400 font-semibold">{player1.nickname} +{(player1.globalAccuracy - player2.globalAccuracy).toFixed(1)}%</span>
                    ) : (
                      <span className="text-red-400 font-semibold">{player2.nickname} +{(player2.globalAccuracy - player1.globalAccuracy).toFixed(1)}%</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-wf-bg flex items-center justify-center">
        <p className="text-wf-muted_text">Загрузка...</p>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
