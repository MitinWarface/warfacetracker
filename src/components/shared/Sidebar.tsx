// src/components/shared/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, Search, Trophy, Target, Medal, Users, Sword,
  TrendingUp, Award, Activity, Users2, Zap, Home, HelpCircle
} from "lucide-react";

const NAV: Array<{
  href: string;
  label: string;
  icon: React.ElementType;
  children?: Array<{ href: string; label: string }>;
}> = [
  { href: "/",                    label: "Главная",     icon: Home },
  { href: "/search",              label: "Поиск",       icon: Search },
  { href: "/ratings?tab=players", label: "Рейтинги",    icon: Trophy },
  { href: "/ratings/pve",         label: "PvE Рейтинг", icon: Target },
  { href: "/ratings/monthly",     label: "Ежемесячный", icon: Medal },
  { href: "/clan_search",         label: "Кланы",       icon: Users },
  {
    href: "/armory",
    label: "Оружейная",
    icon: Sword
    // children: [
    //   { href: "/armory/collection", label: "Коллекция" },
    // ]
  },
  {
    href: "/achievements",
    label: "Достижения",
    icon: Award
    // children: [
    //   { href: "/achievements/tracker", label: "Трекер" },
    // ]
  },
  { href: "/compare",             label: "Сравнение",   icon: Users2 },
  { href: "/faq",                 label: "FAQ",         icon: HelpCircle },
  // { href: "/missions",            label: "Миссии",      icon: Zap }, // В разработке
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 p-2 bg-wf-card border border-wf-border rounded-lg hover:bg-wf-muted transition-colors lg:hidden"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-wf-surface border-r border-wf-border z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pt-20 pb-4 px-4 border-b border-wf-border">
          <h2 className="text-sm font-semibold text-wf-muted_text uppercase tracking-wider">
            Навигация
          </h2>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-100px)]">
          {NAV.map((item) => {
            const active = isActive(item.href);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.href);

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                      toggleExpanded(item.href);
                    } else {
                      setOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                    active && !hasChildren
                      ? "bg-wf-accent/20 text-wf-accent font-medium"
                      : "text-wf-muted_text hover:text-wf-text hover:bg-wf-muted/50"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${active ? "text-wf-accent" : ""}`} />
                  <span className="flex-1">{item.label}</span>
                  {hasChildren && (
                    <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                  )}
                </Link>
                {hasChildren && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-wf-border/30 pl-3">
                    {item.children!.map((child) => {
                      const childActive = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            childActive
                              ? "text-wf-accent font-medium bg-wf-accent/10"
                              : "text-wf-muted_text hover:text-wf-text hover:bg-wf-muted/50"
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Spacer for desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
}
