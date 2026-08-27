"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./chart-tooltip";

export function ScoreLineChart({ data, height = 180 }: { data: { label: string; score: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "var(--chart-axis)" }} tick={{ fill: "var(--chart-muted)", fontSize: 11 }} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "var(--chart-muted)", fontSize: 11 }} width={32} />
        <Tooltip
          cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1 }}
          content={({ active, payload, label }) => (
            <ChartTooltip active={active} label={label as string} payload={payload as never} formatter={(v) => `${v}%`} />
          )}
        />
        <Line type="monotone" dataKey="score" stroke="var(--color-signal-2)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-signal-2)", strokeWidth: 0 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
