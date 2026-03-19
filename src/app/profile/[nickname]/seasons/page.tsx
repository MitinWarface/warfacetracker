// src/app/profile/[nickname]/seasons/page.tsx
// Рейтинговые сезоны — чистый API без БД

import type { Metadata }   from "next";
import { notFound }         from "next/navigation";
import { fetchPlayerSeasons } from "@/services/wf-api.service";
import HeroSection          from "@/components/profile/HeroSection";
import ProfileNav           from "@/components/profile/ProfileNav";
import SeasonsGrid          from "@/components/profile/SeasonsGrid";
import { syncPlayer }       from "@/services/player-sync.service";

type Props = {
  params: Promise<{ nickname: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nickname } = await params;
  return { title: `${decodeURIComponent(nickname)} — Сезоны` };
}

export default async function SeasonsPage({ params }: Props) {
  const { nickname: rawNickname } = await params;
  const nickname = decodeURIComponent(rawNickname);

  // Fetch hero data (cached sync) + season data (direct from API) in parallel
  const [syncResult, seasonData] = await Promise.all([
    syncPlayer(nickname),
    fetchPlayerSeasons(nickname),
  ]);

  if (!syncResult.ok || !seasonData) notFound();

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      <HeroSection player={syncResult.data} />
      <ProfileNav nickname={nickname} activeTab="seasons" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SeasonsGrid
          seasons={seasonData.seasons}
          fetchedAt={seasonData.fetchedAt}
          nickname={nickname}
        />
      </div>
    </main>
  );
}
