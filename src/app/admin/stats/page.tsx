// src/app/admin/stats/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { Activity, Server, Database, Clock, TrendingUp } from "lucide-react";

interface ApiStats {
  status: string;
  version: string;
  uptime: number;
  timestamp: string;
  requests: {
    total: number;
    today: number;
    byEndpoint: Record<string, number>;
  };
  cache: {
    enabled: boolean;
    ttl: Record<string, number>;
  };
  api: {
    warface: {
      baseUrl: string;
      status: string;
    };
  };
}

function StatsContent() {
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
      setLoading(false);
    } catch {
      setError("Ошибка загрузки статистики");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wf-bg flex items-center justify-center">
        <p className="text-wf-muted_text">Загрузка...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-wf-bg flex items-center justify-center">
        <p className="text-red-400">{error || "Ошибка"}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      {/* Header */}
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-wf-accent" />
            Статистика API
          </h1>
          <p className="text-sm text-wf-muted_text mt-1">
            Мониторинг состояния системы
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatusCard
            icon={<Server className="w-6 h-6" />}
            label="Статус"
            value={stats.status.toUpperCase()}
            subValue={`Версия ${stats.version}`}
            color={stats.status === "ok" ? "text-green-400" : "text-red-400"}
          />
          <StatusCard
            icon={<Clock className="w-6 h-6" />}
            label="Uptime"
            value={formatUptime(stats.uptime)}
            subValue="Время работы"
            color="text-blue-400"
          />
          <StatusCard
            icon={<Database className="w-6 h-6" />}
            label="Кэш"
            value={stats.cache.enabled ? "Включен" : "Выключен"}
            subValue="TTL: 15-30 мин"
            color="text-purple-400"
          />
        </div>

        {/* Request Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-wf-card border border-wf-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-wf-accent" />
              Запросы
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-wf-muted_text">Всего</span>
                <span className="text-lg font-bold text-wf-text">{stats.requests.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-wf-muted_text">Сегодня</span>
                <span className="text-lg font-bold text-wf-accent">{stats.requests.today.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-wf-border">
                <p className="text-xs text-wf-muted_text mb-2">Популярные endpoint'ы:</p>
                <div className="space-y-1">
                  {Object.entries(stats.requests.byEndpoint)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([endpoint, count]) => (
                      <div key={endpoint} className="flex justify-between text-sm">
                        <span className="text-wf-muted_text font-mono text-xs">{endpoint}</span>
                        <span className="text-wf-text">{count.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-wf-card border border-wf-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-wf-accent" />
              Warface API
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-wf-muted_text">Статус</span>
                <span className={`text-sm font-bold ${stats.api.warface.status === "online" ? "text-green-400" : "text-red-400"}`}>
                  {stats.api.warface.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-wf-muted_text">URL</span>
                <span className="text-sm font-mono text-wf-muted_text">{stats.api.warface.baseUrl}</span>
              </div>
              <div className="pt-4 border-t border-wf-border">
                <p className="text-xs text-wf-muted_text mb-2">Время кэширования:</p>
                <div className="space-y-2">
                  {Object.entries(stats.cache.ttl).map(([key, ttl]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-wf-muted_text capitalize">{key}</span>
                      <span className="text-wf-text">{Math.floor(ttl / 60)} мин</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-xs text-wf-muted_text">
          Последнее обновление: {new Date(stats.timestamp).toLocaleString("ru-RU")}
        </div>
      </div>
    </main>
  );
}

function StatusCard({ icon, label, value, subValue, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue: string;
  color: string;
}) {
  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className={color}>{icon}</span>
        <span className="text-sm text-wf-muted_text uppercase">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-wf-muted_text mt-1">{subValue}</p>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}д ${hours % 24}ч`;
  }
  return `${hours}ч ${minutes}м ${secs}с`;
}

export default function StatsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-wf-bg flex items-center justify-center">
        <p className="text-wf-muted_text">Загрузка...</p>
      </div>
    }>
      <StatsContent />
    </Suspense>
  );
}
