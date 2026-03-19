// src/components/profile/WeaponTable.tsx
"use client";

import { useMemo, useState } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react";
import type { NormalizedWeapon } from "@/types/warface";
import { cn } from "@/lib/utils";
import weaponNamesRaw from "@/lib/weapon-names.json";

const WEAPON_NAMES = weaponNamesRaw as Record<string, string>;
function getWeaponDisplayName(weaponId: string, fallback: string): string {
  const bare = weaponId.replace(/_shop$/, "");
  if (WEAPON_NAMES[bare]) return WEAPON_NAMES[bare];
  if (WEAPON_NAMES[weaponId]) return WEAPON_NAMES[weaponId];
  const base = bare.replace(/_[a-z0-9]+$/, "");
  if (base !== bare && WEAPON_NAMES[base]) {
    const skin = bare.slice(base.length + 1).replace(/_/g, " ");
    return `${WEAPON_NAMES[base]} | '${skin}'`;
  }
  return fallback;
}

const CLASS_COLORS: Record<string, string> = {
  Recon:     "text-blue-400",
  Sniper:    "text-blue-400",
  Medic:     "text-green-400",
  Rifleman:  "text-orange-400",
  Engineer:  "text-yellow-400",
  SED:       "text-purple-400",
};

const CLASS_RU: Record<string, string> = {
  Rifleman: "Штурмовик",
  Medic:    "Медик",
  Sniper:   "Снайпер",
  Recon:    "Снайпер",
  Engineer: "Инженер",
  SED:      "СЗД",
};

export default function WeaponTable({ weapons }: { weapons: NormalizedWeapon[] }) {
  const [sorting, setSorting]     = useState<SortingState>([{ id: "kills", desc: true }]);
  const [globalFilter, setFilter] = useState("");

  const columns = useMemo<ColumnDef<NormalizedWeapon>[]>(() => [
    {
      accessorKey: "weaponName",
      header: "Оружие",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-wf-text text-sm">
            {getWeaponDisplayName(row.original.weaponId, row.original.weaponName)}
          </div>
          <div className={cn("text-[11px]", CLASS_COLORS[row.original.weaponClass] ?? "text-wf-muted_text")}>
            {CLASS_RU[row.original.weaponClass] ?? row.original.weaponClass}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "kills",
      header: "Убийств",
      cell: ({ row, getValue }) => (
        <div>
          <span className="font-mono text-sm tabular-nums font-semibold text-wf-accent">
            {(getValue() as number).toLocaleString()}
          </span>
          {row.original.usage > 0 && (
            <div className="text-[10px] text-wf-muted_text">
              {row.original.usage.toLocaleString()} выстр.
            </div>
          )}
        </div>
      ),
    },
    {
      id: "share",
      header: "Доля",
      accessorFn: (row) => {
        const total = weapons.reduce((s, w) => s + (w.kills > 0 ? w.kills : w.usage), 0);
        const val   = row.kills > 0 ? row.kills : row.usage;
        return total > 0 ? (val / total) * 100 : 0;
      },
      cell: ({ getValue }) => {
        const v = getValue() as number;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-wf-muted rounded-full overflow-hidden w-20">
              <div className="h-full bg-wf-accent/70 rounded-full" style={{ width: `${Math.min(100, v * 5)}%` }} />
            </div>
            <span className="text-xs text-wf-muted_text w-10 text-right">{v.toFixed(1)}%</span>
          </div>
        );
      },
    },
  ], [weapons]);

  const table = useReactTable({
    data: weapons,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel:     getCoreRowModel(),
    getSortedRowModel:   getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-wf-border">
        <h3 className="text-sm font-semibold text-wf-muted_text uppercase tracking-widest">
          Арсенал <span className="font-normal text-xs">({weapons.length})</span>
        </h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-wf-muted_text" />
          <input
            type="text"
            placeholder="Поиск…"
            value={globalFilter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded bg-wf-muted border border-wf-border text-wf-text placeholder:text-wf-muted_text focus:outline-none focus:border-wf-accent/50 w-40 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-auto max-h-[480px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-wf-surface border-b border-wf-border z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 py-2.5 text-left text-[11px] font-semibold text-wf-muted_text uppercase tracking-wider",
                        header.column.getCanSort() && "cursor-pointer select-none hover:text-wf-text transition-colors"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          sorted === "asc" ? <ChevronUp className="w-3 h-3" /> :
                          sorted === "desc" ? <ChevronDown className="w-3 h-3" /> :
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-wf-border/50 hover:bg-wf-muted/30 transition-colors",
                  i % 2 === 0 ? "bg-transparent" : "bg-wf-surface/30"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {table.getRowModel().rows.length === 0 && (
          <div className="py-12 text-center text-wf-muted_text text-sm">Оружие не найдено.</div>
        )}
      </div>
    </div>
  );
}
