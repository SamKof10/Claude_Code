"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { formatMinutes } from "@/lib/utils";

export function MinutesBarChart({ data, height = 180 }: { data: { label: string; minutes: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <Tooltip
          cursor={{ fill: "var(--surface-2)" }}
          content={({ active, payload, label }) => (
            <ChartTooltip active={active} label={label as string} payload={payload as never} formatter={(v) => formatMinutes(Number(v))} />
          )}
        />
        <Bar dataKey="minutes" fill="var(--color-signal-2)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
