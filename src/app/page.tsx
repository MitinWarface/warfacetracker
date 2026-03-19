// src/app/page.tsx
import Link from "next/link";
import { searchPlayerAction } from "@/actions/player.actions";
import { Search, Trophy, Users, Zap, ChevronRight } from "lucide-react";

const NAV_LINKS = [
  { href: "/ratings?tab=players", label: "Top-100", icon: Trophy },
  { href: "/ratings?tab=clans",   label: "Кланы",   icon: Users  },
  { href: "/missions",            label: "Миссии",  icon: Zap    },
];

const FEATURES = [
  { title: "Детальная статистика", desc: "PvP и PvE раздельно, K/D история, арсенал оружия" },
  { title: "Арсенал оружия",       desc: "Топ оружие по киллам с разбивкой по классам" },
  { title: "Рейтинги",             desc: "Top-100 игроков и рейтинг кланов в реальном времени" },
  { title: "Страницы кланов",      desc: "Все участники, роли, личный вклад в очках клана" },
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-wf-bg text-wf-text flex flex-col items-center justify-center px-4 py-16">
      <div className="mb-8 text-center max-w-xl">
        <h1 className="text-5xl font-extrabold tracking-tight">
          WF <span className="text-wf-accent">Tracker</span>
        </h1>
        <p className="mt-3 text-wf-muted_text">
          Расширенная статистика Warface — K/D история, арсенал оружия, рейтинги кланов.
        </p>
      </div>

      {/* Search */}
      <form action={searchPlayerAction} className="w-full max-w-lg">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wf-muted_text" />
          <input
            name="nickname"
            type="text"
            placeholder="Введите никнейм игрока…"
            autoComplete="off"
            autoFocus
            required
            minLength={2}
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-wf-card border border-wf-border text-wf-text placeholder:text-wf-muted_text text-base focus:outline-none focus:border-wf-accent/60 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="mt-3 w-full py-3 rounded-xl bg-wf-accent hover:bg-wf-accent-dim text-black font-bold text-sm uppercase tracking-widest transition-colors"
        >
          Поиск
        </button>
      </form>

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-wf-card border border-wf-border rounded-lg p-4">
            <div className="font-semibold text-sm text-wf-text">{f.title}</div>
            <div className="text-xs text-wf-muted_text mt-1">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-6 flex-wrap justify-center">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 text-sm text-wf-muted_text hover:text-wf-accent transition-colors group"
          >
            <Icon className="w-4 h-4" />
            {label}
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      <p className="mt-10 text-xs text-wf-muted_text text-center max-w-sm">
        Неофициальный сервис. Данные загружаются из API Warface и кешируются на 15 минут.
      </p>
    </div>
  );
}
