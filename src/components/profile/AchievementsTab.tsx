// src/components/profile/AchievementsTab.tsx
"use client";

import { useState } from "react";
import { Award, Calendar, Search, Medal, Tag, Ribbon } from "lucide-react";
import type { WFPlayerAchievement } from "@/types/warface";
import { proxyImageUrl } from "@/lib/image-proxy";
import achNamesRaw from "@/lib/achievement-names.json";
import weaponNamesRaw from "@/lib/weapon-names.json";

const ACH_MAP  = achNamesRaw    as Record<string, { name: string; desc: string; img: string }>;
const WPN_MAP  = weaponNamesRaw as Record<string, string>;

const CDN_BASE  = "https://cdn.wfts.su/wf_achievements";
const WPN_CDN   = "https://cdn.wfts.su/weapons";

function getProxyUrl(url: string): string {
  return proxyImageUrl(url);
}

type AchType = "badge" | "mark" | "stripe" | "other";

/** Try multiple key variations to find an entry in ACH_MAP */
function lookupAch(id: string): { name: string; desc: string; img: string } | null {
  const stripped = id.replace(/_name$/i, "");

  // 1. Direct match
  if (ACH_MAP[stripped]) return ACH_MAP[stripped];

  // 2. Move trailing type word before a trailing number:
  //    e.g. sell_stripe_16 → sell_16_stripe, swarm_badge_04 → swarm_04_badge
  const reorder = stripped.match(/^(.+?)_(badge|mark|stripe)_(\d+)$/);
  if (reorder) {
    const key = `${reorder[1]}_${reorder[3]}_${reorder[2]}`;
    if (ACH_MAP[key]) return ACH_MAP[key];
  }

  // 3. Rotations (try placing each segment first)
  const parts = stripped.split("_");
  for (let i = 1; i < parts.length; i++) {
    const alt = [...parts.slice(i), ...parts.slice(0, i)].join("_");
    if (ACH_MAP[alt]) return ACH_MAP[alt];
  }

  // 4. Adjacent swaps
  for (let i = 0; i < parts.length - 1; i++) {
    const swapped = [...parts];
    [swapped[i], swapped[i + 1]] = [swapped[i + 1], swapped[i]];
    if (ACH_MAP[swapped.join("_")]) return ACH_MAP[swapped.join("_")];
  }

  return null;
}

/** Extract type from achievement_id */
function extractType(id: string): AchType {
  // First: use ACH_MAP img URL to determine type (most accurate)
  const entry = lookupAch(id);
  if (entry?.img) {
    if (entry.img.includes("/badge/"))  return "badge";
    if (entry.img.includes("/mark/"))   return "mark";
    if (entry.img.includes("/stripe/")) return "stripe";
  }
  // Fallback: check ID for type keyword
  const lower = id.toLowerCase();
  if (lower.includes("_badge")) return "badge";
  if (lower.includes("_mark"))  return "mark";
  if (lower.includes("_stripe") || lower.includes("_strip_")) return "stripe";
  return "other";
}

/** Weapon CDN URL with base fallback */
function weaponCdnUrls(weaponId: string): string[] {
  const bare = weaponId.replace(/_shop$/, "");
  const base = bare.replace(/_[a-z0-9]+$/i, "");
  const urls: string[] = [];

  // Проксируем все URL через helper
  urls.push(proxyImageUrl(`${WPN_CDN}/weapons_${bare}.png`));
  if (base !== bare) {
    urls.push(proxyImageUrl(`${WPN_CDN}/weapons_${base}.png`));
  }

  return urls;
}

/** Build ordered list of CDN image candidates for an achievement */
function guessImageUrls(id: string): string[] {
  // 1. Lookup via ACH_MAP (handles all key variations)
  const entry = lookupAch(id);
  if (entry?.img) {
    // Проксируем URL
    return [proxyImageUrl(entry.img)];
  }

  const key = id.replace(/_name$/i, "");
  const lower = key.toLowerCase();

  // 2. Weapon kill achievements: {weapon_id}_Kill_name or {weapon_id}_{variant}_Kill_name
  if (lower.endsWith("_kill")) {
    const weaponId = key.replace(/_[Kk]ill$/, "");
    return weaponCdnUrls(weaponId);
  }

  // 3. Badge/mark/stripe: construct CDN challenge URL using the key
  //    Try both with and without the type word in various positions
  if (lower.includes("_badge")) {
    const base = key.replace(/_badge/i, "").replace(/^_|_$/g, "");
    const direct1 = `${CDN_BASE}/badge/challenge_badge_${key}.png`;
    const direct2 = `${CDN_BASE}/badge/challenge_badge_${base}.png`;
    return [
      proxyImageUrl(direct1),
      proxyImageUrl(direct2),
    ];
  }
  if (lower.includes("_mark")) {
    const base = key.replace(/_mark/i, "").replace(/^_|_$/g, "");
    const direct1 = `${CDN_BASE}/mark/challenge_mark_${key}.png`;
    const direct2 = `${CDN_BASE}/mark/challenge_mark_${base}.png`;
    return [
      proxyImageUrl(direct1),
      proxyImageUrl(direct2),
    ];
  }
  if (lower.includes("_stripe") || lower.includes("_strip_")) {
    const base = key.replace(/_stripe/i, "").replace(/_strip_/i, "_").replace(/^_|_$/g, "");
    const direct1 = `${CDN_BASE}/stripe/challenge_stripe_${key}.png`;
    const direct2 = `${CDN_BASE}/stripe/challenge_strip_${key}.png`;
    const direct3 = `${CDN_BASE}/stripe/challenge_stripe_${base}.png`;
    return [
      proxyImageUrl(direct1),
      proxyImageUrl(direct2),
      proxyImageUrl(direct3),
    ];
  }

  return [];
}

/** Human-readable name */
function getAchName(id: string): { name: string; desc: string } {
  // Use centralized lookup (handles rotations, reordering, etc.)
  const entry = lookupAch(id);
  if (entry) return { name: entry.name, desc: entry.desc };

  const key = id.replace(/_name$/i, "");
  const parts = key.split("_");

  // Weapon + action fallback
  const wpnId = parts.slice(0, -1).join("_");
  const wpnName = WPN_MAP[wpnId] || WPN_MAP[wpnId.replace(/_shop$/, "")];
  if (wpnName) {
    const action = parts[parts.length - 1];
    const actionRu: Record<string, string> = {
      Kill: "Убийства", kill: "Убийства",
      shot: "Выстрелы", hit: "Попадания", headshot: "Хедшоты",
      badge: "Значок", mark: "Жетон", stripe: "Нашивка",
    };
    return { name: `${wpnName}: ${actionRu[action] ?? action}`, desc: "" };
  }

  // Format ID as fallback
  const formatted = key
    .replace(/_badge$|_mark$|_stripe$/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return { name: formatted, desc: "" };
}

/** Achievement image with multi-URL cascade fallback */
function AchImage({ id, name }: { id: string; name: string }) {
  const [idx, setIdx] = useState(0);
  const urls = guessImageUrls(id);
  if (idx >= urls.length) {
    return (
      <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-wf-muted/20 rounded-lg">
        <Award className="w-7 h-7 text-wf-muted_text/40" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={urls[idx]} alt={name} onError={() => setIdx((i) => i + 1)} className="w-14 h-14 flex-shrink-0 object-contain" loading="lazy" />;
}

/** Single achievement card */
function AchCard({ ach, dim }: { ach: WFPlayerAchievement; dim?: boolean }) {
  const { name, desc } = getAchName(ach.achievement_id);
  return (
    <div className={`bg-wf-card border border-wf-border rounded-lg p-3 flex gap-3 hover:border-wf-accent/30 transition-colors ${dim ? "opacity-55" : ""}`}>
      <AchImage id={ach.achievement_id} name={name} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-wf-text leading-snug line-clamp-2">{name}</p>
        {desc && <p className="text-xs text-wf-muted_text mt-0.5 leading-snug line-clamp-2">{desc}</p>}
        {ach.completion_time ? (
          <div className="flex items-center gap-1 text-xs text-wf-muted_text mt-1">
            <Calendar className="w-3 h-3" />
            {ach.completion_time.split(" ")[0]}
          </div>
        ) : parseInt(ach.progress) > 1 ? (
          <div className="text-xs text-wf-muted_text mt-1">{parseInt(ach.progress).toLocaleString()} очков</div>
        ) : null}
      </div>
    </div>
  );
}

const TYPE_TABS: { id: AchType | "all"; label: string; icon: React.ReactNode }[] = [
  { id: "all",    label: "Все",      icon: <Award className="w-4 h-4" /> },
  { id: "badge",  label: "Значки",   icon: <Medal className="w-4 h-4" /> },
  { id: "mark",   label: "Жетоны",   icon: <Tag className="w-4 h-4" /> },
  { id: "stripe", label: "Нашивки",  icon: <Ribbon className="w-4 h-4" /> },
  { id: "other",  label: "Прочие",   icon: <Award className="w-4 h-4" /> },
];

export default function AchievementsTab({ achievements }: { achievements: WFPlayerAchievement[] }) {
  const [search,  setSearch]  = useState("");
  const [typeTab, setTypeTab] = useState<AchType | "all">("all");

  if (achievements.length === 0) {
    return (
      <div className="bg-wf-card border border-wf-border rounded-lg py-20 text-center">
        <Award className="w-12 h-12 text-wf-muted_text/30 mx-auto mb-3" />
        <p className="text-wf-muted_text">Достижения не найдены или недоступны</p>
      </div>
    );
  }

  const sorted = [...achievements].sort((a, b) => {
    const hasA = !!a.completion_time, hasB = !!b.completion_time;
    if (hasA !== hasB) return hasA ? -1 : 1;
    if (!hasA) return 0;
    return b.completion_time.localeCompare(a.completion_time);
  });

  const completed  = sorted.filter((a) => !!a.completion_time);
  const inProgress = sorted.filter((a) => !a.completion_time);

  // Counts per type (completed only)
  const countByType = (type: AchType) =>
    completed.filter((a) => extractType(a.achievement_id) === type).length;

  const filterFn = (a: WFPlayerAchievement) => {
    if (typeTab !== "all" && extractType(a.achievement_id) !== typeTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const { name } = getAchName(a.achievement_id);
    return name.toLowerCase().includes(q) || a.achievement_id.toLowerCase().includes(q);
  };

  const shownCompleted  = completed.filter(filterFn);
  const shownInProgress = inProgress.filter(filterFn);

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="bg-wf-card border border-wf-border rounded-lg px-4 py-2.5 flex items-center gap-2.5">
          <Medal className="w-5 h-5 text-wf-accent" />
          <div>
            <div className="text-base font-bold text-wf-text">{countByType("badge").toLocaleString()}</div>
            <div className="text-xs text-wf-muted_text">Значки</div>
          </div>
        </div>
        <div className="bg-wf-card border border-wf-border rounded-lg px-4 py-2.5 flex items-center gap-2.5">
          <Tag className="w-5 h-5 text-blue-400" />
          <div>
            <div className="text-base font-bold text-wf-text">{countByType("mark").toLocaleString()}</div>
            <div className="text-xs text-wf-muted_text">Жетоны</div>
          </div>
        </div>
        <div className="bg-wf-card border border-wf-border rounded-lg px-4 py-2.5 flex items-center gap-2.5">
          <Ribbon className="w-5 h-5 text-purple-400" />
          <div>
            <div className="text-base font-bold text-wf-text">{countByType("stripe").toLocaleString()}</div>
            <div className="text-xs text-wf-muted_text">Нашивки</div>
          </div>
        </div>
        <div className="bg-wf-card border border-wf-border rounded-lg px-4 py-2.5 flex items-center gap-2.5">
          <Award className="w-5 h-5 text-wf-muted_text" />
          <div>
            <div className="text-base font-bold text-wf-text">{inProgress.length.toLocaleString()}</div>
            <div className="text-xs text-wf-muted_text">В процессе</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-wf-muted_text" />
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 text-sm bg-wf-card border border-wf-border rounded-lg text-wf-text placeholder:text-wf-muted_text focus:outline-none focus:border-wf-accent/60 w-48"
          />
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1 border-b border-wf-border">
        {TYPE_TABS.map((t) => {
          const cnt = t.id === "all"
            ? completed.length
            : t.id === "other"
            ? countByType("other")
            : t.id === "badge" ? countByType("badge")
            : t.id === "mark"  ? countByType("mark")
            : countByType("stripe");
          return (
            <button
              key={t.id}
              onClick={() => setTypeTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                typeTab === t.id
                  ? "border-wf-accent text-wf-accent"
                  : "border-transparent text-wf-muted_text hover:text-wf-text"
              }`}
            >
              {t.icon}
              {t.label}
              <span className="text-xs opacity-60 ml-0.5">({cnt})</span>
            </button>
          );
        })}
      </div>

      {/* Completed */}
      {shownCompleted.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest mb-3">
            Получено — {shownCompleted.length.toLocaleString()}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shownCompleted.map((ach) => <AchCard key={ach.achievement_id} ach={ach} />)}
          </div>
        </div>
      )}

      {/* In-progress */}
      {shownInProgress.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-wf-muted_text uppercase tracking-widest mb-3">
            В процессе — {shownInProgress.length.toLocaleString()}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shownInProgress.map((ach) => <AchCard key={ach.achievement_id} ach={ach} dim />)}
          </div>
        </div>
      )}

      {search && shownCompleted.length === 0 && shownInProgress.length === 0 && (
        <div className="text-center py-10 text-wf-muted_text text-sm">
          Ничего не найдено по запросу «{search}»
        </div>
      )}
    </div>
  );
}
