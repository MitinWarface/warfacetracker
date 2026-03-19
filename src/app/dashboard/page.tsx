// src/app/dashboard/page.tsx
// Dashboard с РЕАЛЬНЫМИ данными из API Warface

import { Suspense } from "react";
import { Search, Trophy, Users, BarChart3, Crosshair, Target } from "lucide-react";
import Link from "next/link";
import { fetchTop100, fetchClanRating, fetchWeaponCatalog, fetchMissions } from "@/services/wf-api.service";

async function StatsOverview() {
  // Загружаем реальные данные из API
  const [top100, clanRating, weaponCatalog, missions] = await Promise.all([
    fetchTop100(),
    fetchClanRating(),
    fetchWeaponCatalog(),
    fetchMissions(),
  ]);

  const stats = {
    topPlayers: top100.length,
    clans: clanRating.length,
    weapons: weaponCatalog.length,
    activeMissions: missions.filter(m => !m.expire_at || parseInt(m.expire_at) > Date.now() / 1000).length,
  };

  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-wf-card border border-wf-border rounded-lg p-4 text-center">
        <p className="text-3xl font-bold text-wf-accent">{stats.topPlayers}</p>
        <p className="text-sm text-wf-muted_text mt-1">Игроков в Top-100</p>
      </div>
      <div className="bg-wf-card border border-wf-border rounded-lg p-4 text-center">
        <p className="text-3xl font-bold text-green-400">{stats.clans}</p>
        <p className="text-sm text-wf-muted_text mt-1">Кланов в рейтинге</p>
      </div>
      <div className="bg-wf-card border border-wf-border rounded-lg p-4 text-center">
        <p className="text-3xl font-bold text-yellow-400">{stats.weapons}</p>
        <p className="text-sm text-wf-muted_text mt-1">Единиц оружия</p>
      </div>
      <div className="bg-wf-card border border-wf-border rounded-lg p-4 text-center">
        <p className="text-3xl font-bold text-blue-400">{stats.activeMissions}</p>
        <p className="text-sm text-wf-muted_text mt-1">Активных миссий</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-wf-accent" />
            Панель управления Warface
          </h1>
          <p className="text-sm text-wf-muted_text mt-1">
            Статистика из официального API Warface
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wf-muted_text" />
            <form action="/search" method="GET">
              <input
                type="text"
                name="q"
                placeholder="Поиск игрока..."
                className="w-full pl-12 pr-4 py-3 bg-wf-card border border-wf-border rounded-lg text-wf-text focus:outline-none focus:border-wf-accent"
              />
            </form>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/search"
            className="group p-6 bg-wf-card border border-wf-border rounded-lg hover:border-wf-accent/40 transition-colors"
          >
            <Search className="w-8 h-8 mb-4 text-blue-400" />
            <h3 className="text-lg font-bold mb-2 group-hover:text-wf-accent transition-colors">
              Поиск игрока
            </h3>
            <p className="text-sm text-wf-muted_text">
              Найти статистику игрока
            </p>
          </Link>
          <Link
            href="/ratings"
            className="group p-6 bg-wf-card border border-wf-border rounded-lg hover:border-wf-accent/40 transition-colors"
          >
            <Trophy className="w-8 h-8 mb-4 text-yellow-400" />
            <h3 className="text-lg font-bold mb-2 group-hover:text-wf-accent transition-colors">
              Рейтинги
            </h3>
            <p className="text-sm text-wf-muted_text">
              Топ-100 игроков по классам
            </p>
          </Link>
          <Link
            href="/pve-guild"
            className="group p-6 bg-wf-card border border-wf-border rounded-lg hover:border-wf-accent/40 transition-colors"
          >
            <Users className="w-8 h-8 mb-4 text-green-400" />
            <h3 className="text-lg font-bold mb-2 group-hover:text-wf-accent transition-colors">
              PvE Гильдия
            </h3>
            <p className="text-sm text-wf-muted_text">
              Рейтинг PvE игроков
            </p>
          </Link>
          <Link
            href="/weapons-leaderboard"
            className="group p-6 bg-wf-card border border-wf-border rounded-lg hover:border-wf-accent/40 transition-colors"
          >
            <Crosshair className="w-8 h-8 mb-4 text-purple-400" />
            <h3 className="text-lg font-bold mb-2 group-hover:text-wf-accent transition-colors">
              Оружие
            </h3>
            <p className="text-sm text-wf-muted_text">
              Статистика по оружию
            </p>
          </Link>
        </div>

        {/* Real Stats from API */}
        <Suspense fallback={
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-wf-card border border-wf-border rounded-lg p-4 animate-pulse">
                <div className="h-8 bg-wf-muted/30 rounded w-16 mx-auto mb-2" />
                <div className="h-4 bg-wf-muted/30 rounded w-24 mx-auto" />
              </div>
            ))}
          </div>
        }>
          <StatsOverview />
        </Suspense>

        {/* Info */}
        <div className="mt-8 p-4 bg-wf-accent/10 border border-wf-accent/20 rounded-lg">
          <p className="text-sm text-wf-muted_text">
            💡 Все данные загружаются из официального API Warface: <code className="bg-wf-muted/20 px-2 py-1 rounded">http://api.warface.ru/</code>
          </p>
        </div>
      </div>
    </main>
  );
}
