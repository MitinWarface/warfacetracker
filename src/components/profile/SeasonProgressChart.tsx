// src/components/profile/SeasonProgressChart.tsx
"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Trophy } from "lucide-react";
import type { SeasonStat } from "@/types/warface";

interface SeasonProgressChartProps {
  seasons: SeasonStat[];
}

export default function SeasonProgressChart({ seasons }: SeasonProgressChartProps) {
  const chartData = useMemo(() => {
    return [...seasons]
      .reverse()
      .slice(0, 10)
      .map((season) => ({
        season: season.label.replace("Сезон ", "S"),
        kd: season.deaths > 0 ? season.kills / season.deaths : season.kills,
        wins: season.wins,
        accuracy: season.shots > 0 ? (season.hits / season.shots) * 100 : 0,
      }));
  }, [seasons]);

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12 text-wf-muted_text">
        Нет данных о сезонах
      </div>
    );
  }

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-wf-muted_text uppercase mb-4 flex items-center gap-2">
        <Trophy className="w-4 h-4" /> Прогресс по сезонам
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="season" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                fontSize: '12px',
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="kd"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: '#22c55e', r: 4 }}
              name="K/D"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accuracy"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              name="Точность %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-wf-muted_text">K/D Ratio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-wf-muted_text">Точность %</span>
        </div>
      </div>
    </div>
  );
}
