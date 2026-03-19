// src/components/ClanWars.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Swords, Trophy, Users, Target } from "lucide-react";
import type { ClanWarComparison } from "@/services/clan-wars.service";

interface ClanWarsProps {
  initialComparison?: ClanWarComparison | null;
}

export default function ClanWars({ initialComparison }: ClanWarsProps) {
  const router = useRouter();
  const [clan1, setClan1] = useState("");
  const [clan2, setClan2] = useState("");
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<ClanWarComparison | null>(initialComparison || null);

  const handleCompare = async () => {
    if (!clan1.trim() || !clan2.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/clan-wars?clan1=${encodeURIComponent(clan1)}&clan2=${encodeURIComponent(clan2)}`);
      const data = await res.json();
      setComparison(data);
    } catch (error) {
      console.error("Ошибка сравнения кланов:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-wf-card border border-wf-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4 flex items-center gap-2">
          <Swords className="w-4 h-4" /> Сравнение кланов
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-wf-muted_text mb-2">Клан 1</label>
            <input
              type="text"
              value={clan1}
              onChange={(e) => setClan1(e.target.value)}
              placeholder="Название клана"
              className="w-full px-4 py-2 bg-wf-bg border border-wf-border rounded text-wf-text text-sm focus:outline-none focus:border-wf-accent"
              onKeyDown={(e) => e.key === "Enter" && handleCompare()}
            />
          </div>
          <div>
            <label className="block text-xs text-wf-muted_text mb-2">Клан 2</label>
            <input
              type="text"
              value={clan2}
              onChange={(e) => setClan2(e.target.value)}
              placeholder="Название клана"
              className="w-full px-4 py-2 bg-wf-bg border border-wf-border rounded text-wf-text text-sm focus:outline-none focus:border-wf-accent"
              onKeyDown={(e) => e.key === "Enter" && handleCompare()}
            />
          </div>
        </div>
        <button
          onClick={handleCompare}
          disabled={loading || !clan1.trim() || !clan2.trim()}
          className="w-full py-3 bg-wf-accent text-black font-semibold rounded-lg hover:bg-wf-accent/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          <Swords className="w-5 h-5" />
          {loading ? "Сравнение..." : "Сравнить кланы"}
        </button>
      </div>

      {/* Results */}
      {comparison && (
        <>
          {/* Stats Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Clan 1 */}
            <div className="bg-wf-card border border-wf-border rounded-lg p-4">
              <h4 className="text-lg font-bold text-green-400 mb-3">{comparison.clan1.name}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-wf-muted_text" />
                  <span>{comparison.clan1.members.length} участников</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-wf-muted_text" />
                  <span>K/D: {comparison.clan1.avgKd.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-wf-muted_text" />
                  <span>{comparison.clan1.totalWins} побед</span>
                </div>
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-wf-muted_text" />
                  <span>{comparison.clan1.totalKills.toLocaleString()} убийств</span>
                </div>
              </div>
            </div>

            {/* Clan 2 */}
            <div className="bg-wf-card border border-wf-border rounded-lg p-4">
              <h4 className="text-lg font-bold text-blue-400 mb-3">{comparison.clan2.name}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-wf-muted_text" />
                  <span>{comparison.clan2.members.length} участников</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-wf-muted_text" />
                  <span>K/D: {comparison.clan2.avgKd.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-wf-muted_text" />
                  <span>{comparison.clan2.totalWins} побед</span>
                </div>
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-wf-muted_text" />
                  <span>{comparison.clan2.totalKills.toLocaleString()} убийств</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="p-4 bg-wf-accent/10 border border-wf-accent/20 rounded-lg">
            <p className="text-sm text-wf-muted_text">
              💡 Сравнение показывает реальную статистику кланов. Победитель определяется по вашему усмотрению на основе представленных данных.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
