// src/app/profile/[nickname]/ProfileClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { NormalizedPlayerStats } from "@/types/warface";
import HeroSection from "@/components/profile/HeroSection";
import ProfileNav from "@/components/profile/ProfileNav";
import StatsGrid from "@/components/profile/StatsGrid";
import KDChart from "@/components/profile/KDChart";
import WeaponTable from "@/components/profile/WeaponTable";
import SupportStatsCard from "@/components/profile/SupportStatsCard";
import ClassTimeCard from "@/components/profile/ClassTimeCard";
import ClassStatsCard from "@/components/profile/ClassStatsCard";
import WeaponAccuracyTable from "@/components/profile/WeaponAccuracyTable";
import GlobalRankingCard from "@/components/profile/GlobalRankingCard";
import PvPTab from "@/components/profile/PvPTab";
import PvETab from "@/components/profile/PvETab";
import WeaponsTab from "@/components/profile/WeaponsTab";
import AchievementsTab from "@/components/profile/AchievementsTab";
import HistoryTab from "@/components/profile/HistoryTab";
import GoldWeaponProgress from "@/components/GoldWeaponProgress";
import SeasonalRewards from "@/components/SeasonalRewards";
import SeasonComparison from "@/components/profile/SeasonComparison";
import StreakTracker from "@/components/profile/StreakTracker";
import ProfileCardGenerator from "@/components/profile/ProfileCardGenerator";

interface ProfileClientProps {
  nickname: string;
  tab: string;
  data: NormalizedPlayerStats;
  history: any[];
  achievements: any[];
  goldProgress: any[];
  goldStats: any;
  seasonalRewards: any[];
  seasonSummary: any;
  detailedClassStats: any[];
  weaponAccuracy: any[];
  seasonComparison: any;
  globalRanking: any;
  streaks: any;
}

export default function ProfileClient({
  nickname,
  tab,
  data,
  history,
  achievements,
  goldProgress,
  goldStats,
  seasonalRewards,
  seasonSummary,
  detailedClassStats,
  weaponAccuracy,
  seasonComparison,
  globalRanking,
  streaks,
}: ProfileClientProps) {
  const { user } = useAuth();
  const [userSettings, setUserSettings] = useState<any>(null);
  const [showCardGen, setShowCardGen] = useState(false);

  useEffect(() => {
    if (user) {
      setUserSettings(user);
    }
  }, [user]);

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      <HeroSection player={data} showCardGenerator={true} backgroundPreset={userSettings?.backgroundPreset} />
      <ProfileNav nickname={nickname} activeTab={tab} />

      {/* Banner - Баннер профиля (шапка) */}
      <div
        className="relative overflow-hidden border-b border-wf-border"
        style={{
          backgroundImage: userSettings?.bannerUrl && userSettings.bannerUrl !== ""
            ? `url(${userSettings.bannerUrl})`
            : userSettings?.bannerPreset && userSettings.bannerPreset !== "none"
            ? `url(https://cdn.wfts.su/profile_backgrounds/${userSettings.bannerPreset}.jpg)`
            : `url(https://cdn.wfts.su/profile_backgrounds/bg_cc98fb0127149f07.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "256px",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {tab === "summary" && (
          <div className="space-y-8">
            {/* Top badges row */}
            <div className="flex flex-wrap gap-3">
              {data.top100 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm">
                  🏆 Топ-{data.top100.position} в {data.top100.className}
                </div>
              )}
              {data.pveGrade && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm">
                  ⚡ PVE Разряд {data.pveGrade.grade}
                </div>
              )}
            </div>

            <StatsGrid player={data} />

            {/* Support stats for medic/engineer */}
            <SupportStatsCard stats={data.supportStats} />

            {/* Class time breakdown */}
            <ClassTimeCard classStats={data.classPvpStats} />

            {/* Detailed class stats */}
            {detailedClassStats.length > 0 && (
              <ClassStatsCard classStats={detailedClassStats} />
            )}

            {/* Global ranking */}
            {globalRanking && (
              <GlobalRankingCard ranking={globalRanking} />
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-1 space-y-6">
                <KDChart history={history} />
                {/* History Charts */}
                {history.length > 1 && (
                  <>
                    <div className="bg-wf-card border border-wf-border rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-wf-muted_text mb-2">K/D История</h3>
                    </div>
                    <div className="bg-wf-card border border-wf-border rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-wf-muted_text mb-2">Точность История</h3>
                    </div>
                  </>
                )}
              </div>
              <div className="xl:col-span-2">
                <WeaponTable weapons={data.weapons.slice(0, 50)} />
              </div>
            </div>
          </div>
        )}

        {tab === "pvp" && <PvPTab player={data} />}
        {tab === "pve" && <PvETab player={data} />}
        {tab === "weapons" && (
          <>
            <WeaponAccuracyTable weapons={weaponAccuracy} />
            <div className="bg-wf-card border border-wf-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-wf-muted_text mb-4">Лучшее/Худшее оружие</h3>
            </div>
          </>
        )}
        {tab === "achievements" && (
          <div className="space-y-6">
            <AchievementsTab achievements={achievements} />
          </div>
        )}
        {tab === "history" && (
          <div className="space-y-6">
            <div className="bg-wf-card border border-wf-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-wf-muted_text mb-4">Прогресс по сезонам</h3>
            </div>
            <SeasonComparison comparison={seasonComparison!} />
            <StreakTracker streaks={streaks!} />
          </div>
        )}
        {tab === "gold" && (
          <GoldWeaponProgress progress={goldProgress} summary={goldStats} />
        )}
        {tab === "rewards" && (
          <SeasonalRewards rewards={seasonalRewards} summary={seasonSummary} />
        )}
        </div>
      </div>
    </main>
  );
}