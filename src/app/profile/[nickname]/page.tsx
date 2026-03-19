// src/app/profile/[nickname]/page.tsx

import type { Metadata }    from "next";
import { notFound }          from "next/navigation";
import { syncPlayer, getPlayerHistory, getPlayerSessions } from "@/services/player-sync.service";
import { fetchPlayerAchievements, fetchClanInfo, fetchTop100 } from "@/services/wf-api.service";
import { getGoldWeaponProgress, getGoldWeaponStats } from "@/services/gold-weapon-progress.service";
import { getSeasonalRewards, getSeasonSummary } from "@/services/seasonal-rewards.service";
import { getUserProfileSettingsByNickname } from "@/services/auth.service";
import HeroSection          from "@/components/profile/HeroSection";
import StatsGrid            from "@/components/profile/StatsGrid";
import KDChart              from "@/components/profile/KDChart";
import WeaponTable          from "@/components/profile/WeaponTable";
import ProfileNav           from "@/components/profile/ProfileNav";
import PvPTab               from "@/components/profile/PvPTab";
import PvETab               from "@/components/profile/PvETab";
import WeaponsTab           from "@/components/profile/WeaponsTab";
import AchievementsTab      from "@/components/profile/AchievementsTab";
import HistoryTab           from "@/components/profile/HistoryTab";
import ProfileCardGenerator from "@/components/profile/ProfileCardGenerator";
import HistoryChart         from "@/components/HistoryChart";
import GoldWeaponProgress   from "@/components/GoldWeaponProgress";
import SeasonalRewards      from "@/components/SeasonalRewards";
import SupportStatsCard     from "@/components/profile/SupportStatsCard";
import ClassTimeCard        from "@/components/profile/ClassTimeCard";
import Top100Badge          from "@/components/profile/Top100Badge";
import PveGradeBadge        from "@/components/profile/PveGradeBadge";
import ClassStatsCard       from "@/components/profile/ClassStatsCard";
import WeaponAccuracyTable  from "@/components/profile/WeaponAccuracyTable";
import SeasonComparison     from "@/components/profile/SeasonComparison";
import GlobalRankingCard    from "@/components/profile/GlobalRankingCard";
import StreakTracker        from "@/components/profile/StreakTracker";
import BestWorstWeapons     from "@/components/profile/BestWorstWeapons";
import SeasonProgressChart  from "@/components/profile/SeasonProgressChart";
import { getDetailedClassStats } from "@/services/class-stats.service";
import { getWeaponAccuracyStats, getBestWeapons, getWorstWeapons } from "@/services/weapon-accuracy.service";
import { compareSeasons } from "@/services/season-comparison.service";
import { getGlobalRanking, getRankingLabel } from "@/services/global-ranking.service";
import { trackStreaks } from "@/services/streak-tracker.service";

// Next.js 15+ — params & searchParams are Promises
type Props = {
  params:       Promise<{ nickname: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nickname } = await params;
  const decoded = decodeURIComponent(nickname);
  return { title: decoded };
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const [{ nickname: rawNickname }, sp] = await Promise.all([params, searchParams]);

  // Properly decode nickname - handle Cyrillic characters correctly
  let nickname: string;
  try {
    // First try normal decoding
    nickname = decodeURIComponent(rawNickname);
  } catch {
    // If that fails, use as-is
    nickname = rawNickname;
  }

  // Replace + with space (common URL encoding issue)
  nickname = nickname.replace(/\+/g, ' ');

  // Convert to lowercase for database lookup
  const nicknameLower = nickname.toLowerCase();

  console.log('[Profile] Raw nickname:', rawNickname);
  console.log('[Profile] Decoded nickname:', nickname);
  console.log('[Profile] Lowercase nickname:', nicknameLower);

  const tab = sp.tab ?? "summary";

  // Get user profile settings from database by Warface nickname
  const userSettings = await getUserProfileSettingsByNickname(nicknameLower);
  const backgroundPreset = userSettings?.backgroundPreset;
  const bannerPreset = userSettings?.bannerPreset;
  const bannerUrl = userSettings?.bannerUrl;

  console.log('[Profile] Fetching player data...');
  const [resultPromise, history, sessions] = await Promise.all([
    syncPlayer(nicknameLower),
    getPlayerHistory(nicknameLower, 10),
    tab === "history" ? getPlayerSessions(nicknameLower, 100) : Promise.resolve([]),
  ]);

  // Если игрок не найден ни в API ни в БД - показываем 404
  let result = resultPromise;
  let isHidden = false;
  let hiddenAt: Date | null = null;

  console.log('[Profile] Initial result:', result.ok ? 'OK' : 'NOT OK');

  if (!result.ok) {
    console.log('[Profile] API returned null, checking DB...');
    // Проверяем есть ли сохраненные данные в БД
    const { getLastSavedPlayerData } = await import('@/services/player-sync.service');
    const lastSaved = await getLastSavedPlayerData(nicknameLower);

    if (lastSaved) {
      console.log('[Profile] Found in DB:', lastSaved.hiddenAt);
      // Есть сохраненные данные - используем их
      result = {
        ok: true as const,
        data: lastSaved.data,
        source: 'last_saved' as const,
        isHidden: true,
        hiddenAt: lastSaved.hiddenAt
      };
      isHidden = true;
      hiddenAt = lastSaved.hiddenAt;
    } else {
      console.log('[Profile] Not found in API or DB - showing 404');
      // Нет данных ни в API ни в БД
      notFound();
    }
  }
  
  const { data } = result;

  // Проверяем, скрыта ли статистика
  if ('isHidden' in result && result.isHidden) {
    isHidden = true;
    hiddenAt = result.hiddenAt;
  }

  // Fetch achievements only when on that tab (avoid extra API call)
  const achievements = tab === "achievements"
    ? await fetchPlayerAchievements(nickname)
    : [];

  // Gold weapon progress for gold tab
  const goldProgress = tab === "gold"
    ? await getGoldWeaponProgress(data.weapons)
    : [];
  const goldStats = tab === "gold"
    ? await getGoldWeaponStats(data.weapons)
    : { totalWeapons: 0, completedWeapons: 0, averageProgress: 0 };

  // Seasonal rewards
  const seasonalRewards = tab === "rewards"
    ? await getSeasonalRewards(data)
    : [];
  const seasonSummary = tab === "rewards"
    ? await getSeasonSummary(data)
    : { currentSeason: "", totalWins: 0, totalLosses: 0, winRate: 0, kdRatio: 0, bestWeapon: "" };

  // Class stats - uses REAL stats from data
  const detailedClassStats = tab === "summary"
    ? await getDetailedClassStats(data.classPvpStats)
    : [];

  // Weapon accuracy - uses REAL stats from data
  const weaponAccuracy = tab === "weapons"
    ? await getWeaponAccuracyStats(data.weapons)
    : [];

  // Season comparison - uses REAL stats from data
  const seasonComparison = tab === "history"
    ? await compareSeasons(data.seasonStats[0], data.seasonStats[1])
    : null;

  // Global ranking - uses REAL stats from data
  const globalRanking = tab === "summary"
    ? await getGlobalRanking(data)
    : null;

  // Streaks - uses REAL stats from data
  const streaks = tab === "history"
    ? await trackStreaks(data.seasonStats)
    : null;

  // Clan role & points — fetch only if player is in a clan
  if (data.clanName) {
    try {
      const clanInfo = await fetchClanInfo(data.clanName);
      const member = clanInfo?.members.find(
        (m) => m.nickname.toLowerCase() === nickname.toLowerCase()
      );
      if (member) {
        data.clanRole = member.clan_role;
        data.clanPoints = parseInt(member.clan_points);
      }
    } catch { /* non-critical */ }
  }

  // Top-100 check — check on all tabs now
  const CLASS_IDS: Record<string, number> = {
    Rifleman: 1, Medic: 2, Sniper: 3, Engineer: 4, SED: 5,
  };
  if (data.favPvP && CLASS_IDS[data.favPvP]) {
    try {
      const classId = CLASS_IDS[data.favPvP];
      const top = await fetchTop100(classId);
      const pos = top.findIndex(
        (p) => p.nickname.toLowerCase() === nickname.toLowerCase()
      );
      if (pos !== -1) {
        data.top100 = { classId, className: data.favPvP, position: pos + 1 };
      }
    } catch { /* non-critical */ }
  }

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      <HeroSection player={data} showCardGenerator={true} backgroundPreset={backgroundPreset} />
      <ProfileNav nickname={nickname} activeTab={tab} />

      {/* Alert: Статистика скрыта - показываем последние сохраненные данные */}
      {isHidden && hiddenAt && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-500">Статистика игрока скрыта</h3>
              <p className="text-sm text-amber-200/80 mt-1">
                Игрок скрыл свою статистику в настройках игры. Показываются последние сохраненные данные от{" "}
                <span className="font-mono text-amber-200">
                  {hiddenAt.toLocaleDateString("ru-RU", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
              <p className="text-xs text-amber-200/60 mt-2">
                Для обновления данных игрок должен открыть статистику в настройках Warface.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Banner - Баннер профиля (шапка) */}
      <div
        className="relative overflow-hidden border-b border-wf-border"
        style={{
          backgroundImage: bannerUrl && bannerUrl !== ""
            ? `url(${bannerUrl})`
            : bannerPreset && bannerPreset !== "none"
            ? `url(https://cdn.wfts.su/profile_backgrounds/${bannerPreset}.jpg)`
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
                <Top100Badge position={data.top100.position} className={data.top100.className} />
              )}
              {data.pveGrade && (
                <PveGradeBadge
                  grade={data.pveGrade.grade}
                  season={data.pveGrade.season}
                  kdRank={data.pveGrade.kdRank}
                />
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
                    <HistoryChart snapshots={history} metric="kdRatio" />
                    <HistoryChart snapshots={history} metric="accuracy" />
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
            <BestWorstWeapons weapons={weaponAccuracy} />
          </>
        )}
        {tab === "achievements" && (
          <AchievementsTab achievements={achievements} />
        )}
        {tab === "history" && (
          <div className="space-y-6">
            <SeasonProgressChart seasons={data.seasonStats} />
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
