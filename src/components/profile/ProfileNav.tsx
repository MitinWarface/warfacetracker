// src/components/profile/ProfileNav.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { LayoutDashboard, Crosshair, Zap, Package, Star, History, Trophy, Award, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TabEntry =
  | { id: string; label: string; icon: React.ElementType; type: "tab" }
  | { id: string; label: string; icon: React.ElementType; type: "page"; path: string };

const TABS: TabEntry[] = [
  { id: "summary",      label: "Сводка",      icon: LayoutDashboard, type: "tab"  },
  { id: "pvp",          label: "PvP",          icon: Crosshair,       type: "tab"  },
  { id: "pve",          label: "PvE",          icon: Zap,             type: "tab"  },
  { id: "weapons",      label: "Оружие",       icon: Package,         type: "tab"  },
  { id: "achievements", label: "Достижения",   icon: Star,            type: "tab"  },
  { id: "pve-achievements", label: "PvE Достижения", icon: Award,   type: "tab"  },
  { id: "seasons",      label: "Сезоны",       icon: Trophy,          type: "page", path: "/seasons" },
  { id: "history",      label: "История",      icon: History,         type: "tab"  },
  { id: "gold",         label: "Золото",       icon: Trophy,          type: "tab"  },
  { id: "rewards",      label: "Награды",      icon: Award,           type: "tab"  },
];

function Nav({ nickname, activeTab }: { nickname: string; activeTab: string }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [loadingTab, setLoadingTab] = useState<string | null>(null);

  useEffect(() => {
    setLoadingTab(null);
  }, [searchParams]);

  const base = `/profile/${encodeURIComponent(nickname)}`;

  function handleClick(tab: TabEntry) {
    if (tab.id === activeTab || loadingTab) return;
    setLoadingTab(tab.id);
    if (tab.type === "page") {
      // Для страниц типа сезонов - используем правильный путь относительно профиля
      router.push(`${base}/seasons`);
    } else {
      const href = tab.id === "summary" ? base : `${base}?tab=${tab.id}`;
      router.push(href);
    }
  }

  const loadingMeta = TABS.find((t) => t.id === loadingTab);

  return (
    <>
      {/* ── Loading overlay ───────────────────────────────────────── */}
      {loadingMeta && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-wf-bg/80 backdrop-blur-md">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-wf-accent/30 bg-wf-card shadow-2xl">
            <loadingMeta.icon className="h-9 w-9 text-wf-accent" />
          </div>
          <p className="text-2xl font-bold text-wf-text tracking-wide mb-1">
            {loadingMeta.label}
          </p>
          <p className="text-sm text-wf-muted_text mb-6">Загрузка данных...</p>
          <Loader2 className="h-5 w-5 animate-spin text-wf-accent" />
        </div>
      )}

      {/* ── Tab bar ───────────────────────────────────────────────── */}
      <div className="border-b border-wf-border bg-wf-surface sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleClick(tab)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    isActive
                      ? "border-wf-accent text-wf-accent"
                      : "border-transparent text-wf-muted_text hover:text-wf-text"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProfileNav(props: { nickname: string; activeTab: string }) {
  return (
    <Suspense fallback={
      <div className="border-b border-wf-border bg-wf-surface sticky top-14 z-40 h-12" />
    }>
      <Nav {...props} />
    </Suspense>
  );
}
