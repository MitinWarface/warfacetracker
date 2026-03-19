// src/components/armory/ArmoryGrid.tsx
"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { WeaponEntry } from "@/app/armory/page";
import { proxyImageUrl } from "@/lib/image-proxy";

const WPN_CDN = "https://cdn.wfts.su/weapons";

function getWeaponImageUrls(id: string): string[] {
  const bare = id.replace(/_shop$/, "");
  const base = bare.replace(/_[a-z0-9]+$/i, "");
  const urls: string[] = [];

  // Проксируем все URL
  urls.push(proxyImageUrl(`${WPN_CDN}/weapons_${bare}.png`));
  if (base !== bare) {
    urls.push(proxyImageUrl(`${WPN_CDN}/weapons_${base}.png`));
  }

  return urls;
}

const CLASS_COLORS: Record<string, string> = {
  Rifleman: "text-green-500",
  Medic: "text-blue-500",
  Sniper: "text-yellow-500",
  Engineer: "text-orange-500",
  SED: "text-purple-500",
  Unknown: "text-wf-muted_text",
};

function getCategory(id: string): string {
  if (id.startsWith("ar"))  return "ar";
  if (id.startsWith("smg")) return "smg";
  if (id.startsWith("shg")) return "shg";
  if (id.startsWith("sr"))  return "sr";
  if (id.startsWith("hmg") || id.startsWith("mg")) return "mg";
  if (id.startsWith("pt"))  return "pt";
  if (id.startsWith("kn"))  return "kn";
  if (
    id.startsWith("sg") ||
    id.startsWith("gl") ||
    id.startsWith("rg") ||
    id.startsWith("smokegrenade") ||
    id.startsWith("explosivegrenade") ||
    id.startsWith("flashbang") ||
    id.startsWith("gasgrenade") ||
    id.startsWith("flamegrenade") ||
    id.startsWith("stonegrenade") ||
    id.startsWith("claymoreexplosive") ||
    id.startsWith("cm") ||
    id.startsWith("bullet")
  ) return "grenade";
  
  return "other";
}

function isClickableWeapon(id: string): boolean {
  const category = getCategory(id);
  return ["ar", "smg", "shg", "sr", "mg", "pt"].includes(category);
}

function WeaponImage({ id, name }: { id: string; name: string }) {
  const urls = useMemo(() => getWeaponImageUrls(id), [id]);
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed || idx >= urls.length) {
    return (
      <div className="w-full h-24 flex items-center justify-center bg-wf-muted/10 rounded">
        <span className="text-xs text-wf-muted_text/40 text-center px-1 break-all">{name || id}</span>
      </div>
    );
  }

  return (
    <img
      src={urls[idx]}
      alt={name}
      onError={() => {
        if (idx < urls.length - 1) {
          setIdx((i) => i + 1);
        } else {
          setFailed(true);
        }
      }}
      className="w-full h-24 object-contain"
      loading="lazy"
    />
  );
}

export default function ArmoryGrid({
  weapons,
  showClass = false,
  showKills = false,
  onWeaponClick,
}: {
  weapons: WeaponEntry[];
  showClass?: boolean;
  showKills?: boolean;
  onWeaponClick?: (weapon: WeaponEntry) => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | "ar" | "smg" | "shg" | "sr" | "mg" | "pt" | "kn" | "grenade" | "other">("all");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 60;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return weapons.filter((w) => {
      if (category !== "all" && getCategory(w.id) !== category) return false;
      if (!q) return true;
      return w.name.toLowerCase().includes(q) || w.id.toLowerCase().includes(q);
    });
  }, [weapons, search, category]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: weapons.length };
    weapons.forEach((w) => {
      const cat = getCategory(w.id);
      c[cat] = (c[cat] ?? 0) + 1;
    });
    return c;
  }, [weapons]);

  const CATEGORIES = [
    { id: "all", label: "Все" },
    { id: "ar", label: "Штурмовые" },
    { id: "smg", label: "ПП" },
    { id: "shg", label: "Дробовики" },
    { id: "sr", label: "Снайперские" },
    { id: "mg", label: "Пулемёты" },
    { id: "pt", label: "Пистолеты" },
    { id: "kn", label: "Холодное" },
    { id: "grenade", label: "Гранаты" },
    { id: "other", label: "Прочее" },
  ];

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wf-muted_text" />
        <input
          type="text"
          placeholder="Поиск оружия..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-wf-card border border-wf-border rounded-lg text-wf-text placeholder:text-wf-muted_text text-sm focus:outline-none focus:border-wf-accent/60"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => { setCategory(c.id as any); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              category === c.id
                ? "bg-wf-accent text-white"
                : "bg-wf-card border border-wf-border text-wf-muted_text hover:text-wf-text hover:border-wf-accent/40"
            }`}
          >
            {c.label}
            <span className="ml-1.5 text-xs opacity-60">({(counts[c.id] ?? 0).toLocaleString()})</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-wf-muted_text">
        Показано {Math.min(page * PAGE_SIZE, filtered.length).toLocaleString()} из {filtered.length.toLocaleString()}
      </p>

      {paginated.length === 0 ? (
        <div className="text-center py-20 text-wf-muted_text">Ничего не найдено</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {paginated.map((w) => {
            const clickable = onWeaponClick && isClickableWeapon(w.id);
            return (
              <div
                key={w.id}
                onClick={() => clickable && onWeaponClick(w)}
                className={`bg-wf-card border border-wf-border rounded-lg p-3 flex flex-col gap-2 transition-colors ${
                  clickable 
                    ? "cursor-pointer hover:border-wf-accent/50 hover:shadow-lg hover:shadow-wf-accent/10" 
                    : "hover:border-wf-accent/30"
                }`}
              >
                <WeaponImage id={w.id} name={w.name} />
                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-xs font-medium text-wf-text text-center leading-snug line-clamp-2 flex-1">{w.name}</p>
                  {showClass && w.className !== "Unknown" && (
                    <p className={`text-[10px] text-center font-medium ${CLASS_COLORS[w.className] || "text-wf-muted_text"}`}>
                      {w.className}
                    </p>
                  )}
                  {showKills && w.kills > 0 && (
                    <p className="text-xs text-center text-wf-accent font-semibold">
                      {w.kills.toLocaleString()} уб.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm bg-wf-card border border-wf-border rounded-lg text-wf-muted_text hover:text-wf-text disabled:opacity-30 transition-colors"
          >
            ← Назад
          </button>
          <span className="text-sm text-wf-muted_text">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm bg-wf-card border border-wf-border rounded-lg text-wf-muted_text hover:text-wf-text disabled:opacity-30 transition-colors"
          >
            Вперёд →
          </button>
        </div>
      )}
    </div>
  );
}
