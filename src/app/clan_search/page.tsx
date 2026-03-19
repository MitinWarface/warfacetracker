// src/app/clan_search/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchClanRating } from "@/services/wf-api.service";
import { Users, Search, Trophy } from "lucide-react";

export const metadata: Metadata = { title: "Поиск кланов" };
export const revalidate = 300;

type Props = { searchParams: Promise<{ q?: string }> };

async function SearchForm({ query }: { query: string }) {
  async function search(formData: FormData) {
    "use server";
    const q = (formData.get("q") as string | null)?.trim();
    if (q) redirect(`/clan_search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form action={search} className="flex gap-2 max-w-lg">
      <input
        name="q"
        defaultValue={query}
        placeholder="Введите название клана..."
        className="flex-1 px-4 py-2.5 bg-wf-card border border-wf-border rounded-lg text-wf-text placeholder-wf-muted_text focus:outline-none focus:border-wf-accent text-sm"
      />
      <button
        type="submit"
        className="px-4 py-2.5 bg-wf-accent text-black font-semibold rounded-lg hover:bg-wf-accent/90 transition-colors flex items-center gap-2 text-sm"
      >
        <Search className="w-4 h-4" /> Найти
      </button>
    </form>
  );
}

export default async function ClanSearchPage({ searchParams }: Props) {
  const sp    = await searchParams;
  const query = sp.q?.trim() ?? "";

  // If query provided, redirect directly to clan page
  if (query) {
    redirect(`/clan/${encodeURIComponent(query)}`);
  }

  // Show popular clans from rating
  const topClans = await fetchClanRating();

  return (
    <main className="min-h-screen bg-wf-bg text-wf-text">
      <div className="border-b border-wf-border bg-wf-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
            <Users className="w-6 h-6 text-wf-accent" /> Поиск кланов
          </h1>
          <p className="text-sm text-wf-muted_text mb-6">Найдите информацию о любом клане Warface</p>
          <SearchForm query={query} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {topClans.length > 0 && (
          <>
            <h2 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest mb-4 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5" /> Топ кланы по рейтингу
            </h2>
            <div className="bg-wf-card border border-wf-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-wf-surface border-b border-wf-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase w-12">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">Клан</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase hidden sm:table-cell">Лидер</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-wf-muted_text uppercase">
                      <Users className="inline w-3.5 h-3.5 mr-1" />Члены
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-wf-muted_text uppercase">Очки</th>
                  </tr>
                </thead>
                <tbody>
                  {topClans.map((c, i) => (
                    <tr key={c.clan} className="border-b border-wf-border/50 hover:bg-wf-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`font-bold tabular-nums ${
                          i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-wf-muted_text"
                        }`}>{i + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/clan/${encodeURIComponent(c.clan)}`} className="text-wf-accent hover:underline font-medium">
                          {c.clan}
                        </Link>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Link href={`/profile/${encodeURIComponent(c.clan_leader)}`} className="text-xs text-wf-text hover:text-wf-accent transition-colors">
                          {c.clan_leader}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-wf-muted_text text-xs">{c.members}</td>
                      <td className="px-4 py-3 text-right font-mono text-wf-accent font-semibold">
                        {parseInt(c.points).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
