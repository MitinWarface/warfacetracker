// src/components/RecentProfiles.tsx
"use client";

import Link from "next/link";
import { Clock, User } from "lucide-react";
import { getRankInfo } from "@/services/rank.service";

interface RecentProfile {
  nickname: string;
  displayNickname: string;
  viewedAt: Date;
  rankId: number;
}

interface RecentProfilesProps {
  profiles: RecentProfile[];
}

export default function RecentProfiles({ profiles }: RecentProfilesProps) {
  if (profiles.length === 0) {
    return (
      <div className="bg-wf-card border border-wf-border rounded-lg p-6 text-center">
        <Clock className="w-12 h-12 text-wf-muted_text/20 mx-auto mb-3" />
        <p className="text-sm text-wf-muted_text">Нет недавних профилей</p>
      </div>
    );
  }

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" /> Недавние профили
      </h3>
      <div className="space-y-2">
        {profiles.map((profile) => {
          const rank = getRankInfo(profile.rankId);
          const timeAgo = getTimeAgo(new Date(profile.viewedAt));

          return (
            <Link
              key={profile.nickname}
              href={`/profile/${encodeURIComponent(profile.displayNickname)}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-wf-muted/20 transition-colors"
            >
              <div className="w-8 h-8 rounded bg-wf-muted/30 flex items-center justify-center">
                <User className="w-4 h-4 text-wf-muted_text" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-wf-text truncate">
                  {profile.displayNickname}
                </p>
                <p className="text-xs text-wf-muted_text">{rank.name}</p>
              </div>
              <span className="text-xs text-wf-muted_text">{timeAgo}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Только что";
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  return `${diffDays} дн назад`;
}
