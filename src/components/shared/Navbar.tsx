// src/components/shared/Navbar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut, Settings, Users, Activity } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { fetchWFSOnlineStats } from "@/services/wfs-api.service";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [linkedNick, setLinkedNick] = useState<string | null>(null);
  const [onlineStats, setOnlineStats] = useState<{ totalOnline: number } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLinkedNick();
    }
  }, [isAuthenticated]);

  // Load online stats
  useEffect(() => {
    loadOnlineStats();
    // Refresh every 60 seconds
    const interval = setInterval(loadOnlineStats, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadOnlineStats() {
    try {
      // Пытаемся получить онлайн (может не работать если WFS API недоступен)
      const stats = await fetchWFSOnlineStats();
      if (stats) {
        setOnlineStats({ totalOnline: stats.totalOnline });
      }
    } catch (error) {
      // Тихо игнорируем ошибку - онлайн просто не показывается
      // console.error("Load online stats error:", error);
    }
  }

  async function fetchLinkedNick() {
    try {
      const res = await fetch("/api/linked-players");
      const data = await res.json();
      if (data.linkedPlayers && data.linkedPlayers.length > 0) {
        const primary = data.linkedPlayers.find((p: any) => p.isPrimary) || data.linkedPlayers[0];
        setLinkedNick(primary.warfaceNick);
      }
    } catch (error) {
      console.error("Fetch linked nick error:", error);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-wf-border bg-wf-surface/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            WF <span className="text-wf-accent">Tracker</span>
          </Link>

          {/* Online Stats - ОПЦИОНАЛЬНО (может не работать) */}
          <div className="hidden md:flex items-center gap-4">
            {onlineStats && onlineStats.totalOnline > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-wf-card border border-wf-border rounded-lg">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-xs text-wf-muted_text">Онлайн:</span>
                <span className="text-sm font-bold text-wf-accent">
                  {onlineStats.totalOnline.toLocaleString()}
                </span>
              </div>
            )}
            {isAuthenticated && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-wf-card border border-wf-border rounded-lg">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-wf-muted_text">Игрок:</span>
                <span className="text-sm font-medium text-wf-text truncate max-w-[150px]">
                  {linkedNick || user?.username}
                </span>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Cabinet Link */}
                <Link
                  href="/cabinet"
                  className="text-sm text-wf-muted_text hover:text-wf-accent transition-colors flex items-center gap-1"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Кабинет</span>
                </Link>

                {/* Profile Link (linked player) */}
                {linkedNick && (
                  <Link
                    href={`/profile/${encodeURIComponent(linkedNick)}`}
                    className="text-sm text-wf-accent hover:text-wf-accent/80 transition-colors flex items-center gap-1 font-medium"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{linkedNick}</span>
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-wf-muted/30 transition-colors"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: user?.accentColor || "#22c55e" }}
                      >
                        {user?.username[0].toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-wf-surface border border-wf-border rounded-lg shadow-lg z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-wf-border">
                          <p className="text-sm font-medium text-wf-text truncate">
                            {user?.username}
                          </p>
                          <p className="text-xs text-wf-muted_text truncate">
                            {user?.email}
                          </p>
                        </div>

                        <div className="py-2">
                          <Link
                            href="/cabinet"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-wf-muted_text hover:bg-wf-muted/30 hover:text-wf-text transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="w-4 h-4" />
                            Кабинет
                          </Link>
                          <Link
                            href={linkedNick ? `/profile/${encodeURIComponent(linkedNick)}` : "/cabinet"}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-wf-accent hover:bg-wf-muted/30 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className="w-4 h-4" />
                            {linkedNick ? "Профиль" : "Привязать аккаунт"}
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-wf-muted/30 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Выйти
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-wf-accent rounded-lg hover:bg-wf-accent/90 transition-colors"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}
