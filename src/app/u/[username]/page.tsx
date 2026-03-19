// src/app/u/[username]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { syncPlayer } from "@/services/player-sync.service";
import { cn } from "@/lib/utils";
import { MapPin, Calendar, Shield } from "lucide-react";

type Props = {
  params: Promise<{ username: string }>;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  return { title: decodedUsername };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  // Properly decode username
  const decodedUsername = decodeURIComponent(username);
  
  // Get Warface stats
  const result = await syncPlayer(decodedUsername);
  
  if (!result.ok) {
    notFound();
  }
  
  const playerStats = result.data;

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      {/* Banner */}
      <div className="h-64 w-full bg-gradient-to-r from-wf-surface to-wf-card" />

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32">
        <div className="relative">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-40 h-40 rounded-full border-4 border-wf-bg flex items-center justify-center text-4xl font-bold bg-wf-accent text-white"
            >
              {decodedUsername[0].toUpperCase()}
            </div>
          </div>

          {/* Info */}
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              {decodedUsername}
            </h1>

            {playerStats.clanName && (
              <p className="text-wf-muted_text mt-1 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Клан: <span className="text-wf-accent">[{playerStats.clanName}]</span>
              </p>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-wf-muted_text">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Warface Tracker
                </span>
              </div>
            </div>
          </div>

          {/* Warface Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-wf-card/80 backdrop-blur-sm border border-wf-border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-wf-accent">
                {playerStats.kdRatio.toFixed(2)}
              </p>
              <p className="text-sm text-wf-muted_text mt-1">K/D Ratio</p>
            </div>
            <div className="bg-wf-card/80 backdrop-blur-sm border border-wf-border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-400">
                {playerStats.pvpWins.toLocaleString()}
              </p>
              <p className="text-sm text-wf-muted_text mt-1">Побед</p>
            </div>
            <div className="bg-wf-card/80 backdrop-blur-sm border border-wf-border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">
                {playerStats.globalAccuracy.toFixed(1)}%
              </p>
              <p className="text-sm text-wf-muted_text mt-1">Точность</p>
            </div>
            <div className="bg-wf-card/80 backdrop-blur-sm border border-wf-border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">
                {playerStats.playtimeH.toLocaleString()}ч
              </p>
              <p className="text-sm text-wf-muted_text mt-1">В игре</p>
            </div>
          </div>

          {/* More Stats Link */}
          <div className="mt-6">
            <a
              href={`/profile/${playerStats.nickname}`}
              className="inline-block px-6 py-3 rounded-lg font-medium transition-colors border bg-wf-accent text-black border-wf-accent"
            >
              Подробнее →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
