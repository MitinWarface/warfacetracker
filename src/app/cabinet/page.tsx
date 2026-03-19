// src/app/cabinet/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Settings, Users, Activity, Shield, LogOut, Upload, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import VerificationTab from "@/components/cabinet/VerificationTab";

export default function CabinetPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile settings
  const [bio, setBio] = useState("");
  const [bgColor, setBgColor] = useState("#0f172a");
  const [accentColor, setAccentColor] = useState("#22c55e");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [backgroundPreset, setBackgroundPreset] = useState("");
  const [bannerPreset, setBannerPreset] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Linked players & activity
  const [linkedPlayers, setLinkedPlayers] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setBgColor(user.bgColor);
      setAccentColor(user.accentColor);
      setAvatarUrl(user.avatarUrl || "");
      setBannerUrl(user.bannerUrl || "");
      setBackgroundPreset(user.backgroundPreset || "");
      setBannerPreset(user.bannerPreset || "");
      loadLinkedData();
    }
  }, [user]);

  async function loadLinkedData() {
    try {
      const res = await fetch("/api/linked-players");
      const data = await res.json();
      if (data.linkedPlayers) {
        setLinkedPlayers(data.linkedPlayers);
        setActivity(data.activity || []);
      }
    } catch (error) {
      console.error("Load linked data error:", error);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          bgColor,
          accentColor,
          avatarUrl,
          bannerUrl,
          backgroundPreset,
          bannerPreset,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Профиль сохранён!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Ошибка сохранения" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Ошибка сервера" });
    }
    setSaving(false);
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-wf-bg flex items-center justify-center">
        <p className="text-wf-muted_text">Загрузка...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      {/* Header */}
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Личный кабинет</h1>
              <p className="text-sm text-wf-muted_text mt-1">
                Управление профилем и привязанными аккаунтами
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-2",
              activeTab === "profile"
                ? "bg-wf-accent text-black"
                : "bg-wf-card text-wf-muted_text border border-wf-border hover:border-wf-accent/40"
            )}
          >
            <Settings className="w-4 h-4" />
            Профиль
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-2",
              activeTab === "verification"
                ? "bg-wf-accent text-black"
                : "bg-wf-card text-wf-muted_text border border-wf-border hover:border-wf-accent/40"
            )}
          >
            <Shield className="w-4 h-4" />
            Привязка аккаунтов
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-2",
              activeTab === "activity"
                ? "bg-wf-accent text-black"
                : "bg-wf-card text-wf-muted_text border border-wf-border hover:border-wf-accent/40"
            )}
          >
            <Activity className="w-4 h-4" />
            Активность
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={cn(
            "mb-6 p-4 rounded-lg border",
            message.type === "success" ? "bg-green-500/10 border-green-500/30 text-green-400" :
            message.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" :
            "bg-wf-accent/10 border-wf-accent/30 text-wf-accent"
          )}>
            {message.text}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-wf-card border border-wf-border rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-wf-accent" />
              Настройки профиля
            </h2>
            <div className="space-y-6">
              {/* Background Preset */}
              <div>
                <label className="block text-sm text-wf-muted_text mb-2">
                  Фон профиля (основной)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "none", name: "Нет", image: "" },
                    { id: "bg_cc98fb0127149f07", name: "Фон 1", image: "https://cdn.wfts.su/profile_backgrounds/bg_cc98fb0127149f07.jpg" },
                    { id: "bg_a7cac27f01eda5c1", name: "Фон 2", image: "https://cdn.wfts.su/profile_backgrounds/bg_a7cac27f01eda5c1.jpg" },
                    { id: "bg_5f962dcbca65c88f", name: "Фон 3", image: "https://cdn.wfts.su/profile_backgrounds/bg_5f962dcbca65c88f.jpg" },
                    { id: "bg_799b39b51dbb337f", name: "Фон 4", image: "https://cdn.wfts.su/profile_backgrounds/bg_799b39b51dbb337f.jpg" },
                    { id: "bg_d2d361e16c277dc6", name: "Фон 5", image: "https://cdn.wfts.su/profile_backgrounds/bg_d2d361e16c277dc6.jpg" },
                    { id: "bg_e3a463be6c586d33", name: "Фон 6", image: "https://cdn.wfts.su/profile_backgrounds/bg_e3a463be6c586d33.jpg" },
                    { id: "bg_20ab4a6ba195d7cb", name: "Фон 7", image: "https://cdn.wfts.su/profile_backgrounds/bg_20ab4a6ba195d7cb.jpg" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setBackgroundPreset(preset.id)}
                      className={cn(
                        "h-16 rounded-lg border-2 transition-all bg-cover bg-center",
                        preset.image ? "" : "bg-wf-bg",
                        backgroundPreset === preset.id
                          ? "border-wf-accent ring-2 ring-wf-accent"
                          : "border-wf-border hover:border-wf-accent/40"
                      )}
                      style={preset.image ? { backgroundImage: `url(${preset.image})` } : {}}
                    >
                      {preset.id === "none" && (
                        <span className="text-xs text-wf-muted_text font-medium drop-shadow">{preset.name}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Preset */}
              <div>
                <label className="block text-sm text-wf-muted_text mb-2">
                  Баннер профиля (шапка)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "none", name: "Нет", gradient: "bg-gradient-to-r from-wf-surface to-wf-card" },
                    { id: "sunset", name: "Закат", gradient: "bg-gradient-to-r from-orange-600 via-red-600 to-pink-600" },
                    { id: "ocean", name: "Океан", gradient: "bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600" },
                    { id: "forest", name: "Лес", gradient: "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600" },
                    { id: "night", name: "Ночь", gradient: "bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900" },
                    { id: "fire", name: "Огонь", gradient: "bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600" },
                    { id: "ice", name: "Лёд", gradient: "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600" },
                    { id: "gold", name: "Золото", gradient: "bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-600" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setBannerPreset(preset.id)}
                      className={cn(
                        "h-16 rounded-lg border-2 transition-all",
                        preset.gradient,
                        bannerPreset === preset.id
                          ? "border-wf-accent ring-2 ring-wf-accent"
                          : "border-wf-border hover:border-wf-accent/40"
                      )}
                    >
                      <span className="text-xs text-white font-medium drop-shadow">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-wf-muted_text mb-2">
                    Цвет акцента
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-10 rounded border border-wf-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 px-4 py-2 bg-wf-bg border border-wf-border rounded-lg text-wf-text font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar & Banner URLs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-wf-muted_text mb-2">
                    URL аватара
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-wf-bg border border-wf-border rounded-lg text-wf-text text-sm"
                  />
                  {avatarUrl && (
                    <img src={avatarUrl} alt="Avatar" className="mt-2 w-16 h-16 rounded-full object-cover border border-wf-border" />
                  )}
                </div>
                <div>
                  <label className="block text-sm text-wf-muted_text mb-2">
                    URL кастомного баннера
                  </label>
                  <input
                    type="text"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-wf-bg border border-wf-border rounded-lg text-wf-text text-sm"
                  />
                  {bannerUrl && !bannerPreset && (
                    <div
                      className="mt-2 h-20 rounded-lg bg-cover bg-center border border-wf-border"
                      style={{ backgroundImage: `url(${bannerUrl})` }}
                    />
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm text-wf-muted_text mb-2">
                  О себе
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Расскажите о себе..."
                  rows={4}
                  className="w-full px-4 py-2 bg-wf-bg border border-wf-border rounded-lg text-wf-text text-sm focus:outline-none focus:border-wf-accent"
                  maxLength={500}
                />
                <p className="text-xs text-wf-muted_text mt-1 text-right">
                  {bio.length}/500
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full py-3 bg-wf-accent text-black font-semibold rounded-lg hover:bg-wf-accent/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        )}

        {/* Verification Tab */}
        {activeTab === "verification" && (
          <div className="space-y-6">
            <VerificationTab />
            
            {/* Linked Players */}
            {linkedPlayers.length > 0 && (
              <div className="bg-wf-card border border-wf-border rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-wf-accent" />
                  Привязанные аккаунты
                </h2>
                <div className="space-y-3">
                  {linkedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-wf-bg rounded-lg border border-wf-border"
                    >
                      <div>
                        <p className="font-medium text-wf-text">{player.warfaceNick}</p>
                        <p className="text-xs text-wf-muted_text">
                          Привязан: {new Date(player.verifiedAt).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                      {player.isPrimary && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                          Основной
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="bg-wf-card border border-wf-border rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-wf-accent" />
              Последние действия
            </h2>
            <div className="space-y-3">
              {activity.length > 0 ? (
                activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-wf-bg rounded-lg border border-wf-border"
                  >
                    <div>
                      <p className="font-medium text-wf-text">{item.action}</p>
                      {item.details && (
                        <p className="text-xs text-wf-muted_text">{item.details}</p>
                      )}
                    </div>
                    <p className="text-xs text-wf-muted_text">
                      {new Date(item.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-wf-muted_text py-8">
                  Нет активности
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
