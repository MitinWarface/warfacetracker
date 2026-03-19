// src/components/profile/KDChart.tsx
"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface HistoryPoint {
  date:  string;
  kd:    number;
  kills: number;
  wins:  number;
}

interface KDChartProps {
  history: HistoryPoint[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const pt = payload[0]?.payload;
  return (
    <div className="bg-wf-card border border-wf-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-wf-muted_text mb-1">{label}</p>
      <p className="text-wf-accent font-bold">K/D: {payload[0]?.value?.toFixed(3)}</p>
      {pt && (
        <>
          <p className="text-wf-text">Убийства: {pt.kills?.toLocaleString()}</p>
          <p className="text-wf-text">Победы: {pt.wins?.toLocaleString()}</p>
        </>
      )}
    </div>
  );
}

export default function KDChart({ history }: KDChartProps) {
  if (history.length < 2) {
    return (
      <div className="bg-wf-card border border-wf-border rounded-lg p-4 h-[268px] flex flex-col items-center justify-center text-center gap-2">
        <h3 className="text-sm font-semibold text-wf-muted_text uppercase tracking-widest mb-2">
          Динамика K/D
        </h3>
        <p className="text-wf-muted_text text-sm">Недостаточно данных для графика</p>
        <p className="text-wf-muted_text text-xs opacity-70">Зайдите после следующего обновления</p>
      </div>
    );
  }

  const avgKD = history.reduce((s, p) => s + p.kd, 0) / history.length;

  return (
    <div className="bg-wf-card border border-wf-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-wf-muted_text uppercase tracking-widest mb-4">
        Динамика K/D
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={history} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#8b949e", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis
            domain={([min, max]: [number, number]) => {
              const pad = Math.max((max - min) * 0.3, 0.05);
              return [
                Math.max(0, parseFloat((min - pad).toFixed(3))),
                parseFloat((max + pad).toFixed(3)),
              ];
            }}
            tickFormatter={(v: number) => v.toFixed(2)}
            tick={{ fill: "#8b949e", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avgKD}
            stroke="#8b949e"
            strokeDasharray="4 4"
            label={{ value: "сред", fill: "#8b949e", fontSize: 10, position: "right" }}
          />
          <Line
            type="monotone"
            dataKey="kd"
            stroke="#ff4400"
            strokeWidth={2}
            dot={{ fill: "#ff4400", r: 3 }}
            activeDot={{ r: 5, fill: "#ff6600" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
