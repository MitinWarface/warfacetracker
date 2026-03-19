// src/components/HistoryChart.tsx
"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Snapshot {
  createdAt?: Date | string;
  date?: string;
  kdRatio?: number;
  kd?: number;
  wins?: number;
  accuracy?: number;
  rankId?: number;
  kills?: number;
  deaths?: number;
}

interface HistoryChartProps {
  snapshots: Snapshot[];
  metric?: "kdRatio" | "wins" | "accuracy" | "rankId";
}

const METRIC_LABELS: Record<string, string> = {
  kdRatio: "K/D Ratio",
  wins: "Победы",
  accuracy: "Точность %",
  rankId: "Ранг",
};

const METRIC_COLORS: Record<string, string> = {
  kdRatio: "#22c55e",
  wins: "#3b82f6",
  accuracy: "#eab308",
  rankId: "#a855f7",
};

export default function HistoryChart({ snapshots, metric = "kdRatio" }: HistoryChartProps) {
  const chartData = useMemo(() => {
    return snapshots
      .slice(0, 30) // Последние 30 записей
      .reverse()
      .map((snapshot) => ({
        date: snapshot.date || (snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
        }) : ""),
        value: (snapshot[metric as keyof Snapshot] as number) || (snapshot.kd as number) || 0,
        kills: snapshot.kills || 0,
        deaths: snapshot.deaths || 0,
      }));
  }, [snapshots, metric]);

  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const previousValue = chartData[chartData.length - 2]?.value || 0;
  const change = currentValue - previousValue;
  const changePercent = previousValue > 0 ? ((change / previousValue) * 100) : 0;
  const isPositive = change >= 0;

  if (chartData.length === 0) {
    return (
      <div className="bg-wf-card border border-wf-border rounded-lg p-8 text-center">
        <Activity className="w-12 h-12 text-wf-muted_text/20 mx-auto mb-3" />
        <p className="text-sm text-wf-muted_text">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-wf-muted_text uppercase">
            {METRIC_LABELS[metric]}
          </h3>
          <p className="text-2xl font-bold text-wf-text mt-1">
            {typeof currentValue === "number" ? currentValue.toFixed(2) : currentValue}
          </p>
        </div>
        
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold",
          isPositive 
            ? "bg-green-500/20 text-green-400" 
            : "bg-red-500/20 text-red-400"
        )}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {Math.abs(changePercent).toFixed(1)}%
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={METRIC_COLORS[metric]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={METRIC_COLORS[metric]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#9ca3af", marginBottom: "0.25rem" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={METRIC_COLORS[metric]}
              strokeWidth={2}
              fill={`url(#gradient-${metric})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="mt-3 pt-3 border-t border-wf-border/40 grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-wf-muted_text">Мин:</span>
          <span className="text-wf-text ml-1 font-semibold">
            {Math.min(...chartData.map(d => d.value)).toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-wf-muted_text">Макс:</span>
          <span className="text-wf-text ml-1 font-semibold">
            {Math.max(...chartData.map(d => d.value)).toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-wf-muted_text">Среднее:</span>
          <span className="text-wf-text ml-1 font-semibold">
            {(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
