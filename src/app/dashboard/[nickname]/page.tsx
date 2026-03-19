// src/app/dashboard/[nickname]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPlayerStat, normalizePlayerStat } from "@/services/wf-api.service";
import DashboardClient from "./DashboardClient";
import { Award } from "lucide-react";
import Link from "next/link";

type Props = { params: Promise<{ nickname: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nickname } = await params;
  return { title: `Дашборд: ${decodeURIComponent(nickname)}` };
}

export default async function DashboardPage({ params }: Props) {
  const { nickname } = await params;
  const decodedNick = decodeURIComponent(nickname);
  const rawPlayer = await fetchPlayerStat(decodedNick);

  if (!rawPlayer) {
    notFound();
  }

  const player = normalizePlayerStat(rawPlayer);

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      {/* Header */}
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{player.nickname}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-wf-muted_text">
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {player.rankId} ранг
                </span>
                <span>•</span>
                <span>Опыт: {player.experience.toLocaleString()}</span>
              </div>
            </div>
            {player.clanName && (
              <span className="px-3 py-1.5 bg-wf-accent/20 text-wf-accent rounded text-sm font-medium">
                [{player.clanName}]
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardClient player={player} />
      </div>
    </main>
  );
}
