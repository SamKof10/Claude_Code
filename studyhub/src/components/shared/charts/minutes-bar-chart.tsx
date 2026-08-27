"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { AccessibleChart } from "./accessible-chart";
import { formatMinutes } from "@/lib/utils";

export function MinutesBarChart({
  data,
  height = 180,
  label = "Study time",
}: {
  data: { label: string; minutes: number }[];
  height?: number;
  label?: string;
}) {
  const total = data.reduce((a, d) => a + d.minutes, 0);
  const best = data.reduce((a, d) => (d.minutes > a.minutes ? d : a), data[0] ?? { label: "—", minutes: 0 });

  return (
    <AccessibleChart
      summary={
        total > 0
          ? `${label} across ${data.length} periods: ${formatMinutes(total)} in total, with the most (${formatMinutes(best.minutes)}) on ${best.label}.`
          : `${label}: no study time recorded yet.`
      }
      columns={["Period", "Study time"]}
      rows={data.map((d) => ({ label: d.label, value: formatMinutes(d.minutes) }))}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "var(--chart-axis)" }}
            tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <Tooltip
            cursor={{ fill: "var(--surface-2)" }}
            content={({ active, payload, label: l }) => (
              <ChartTooltip active={active} label={l as string} payload={payload as never} formatter={(v) => formatMinutes(Number(v))} />
            )}
          />
          <Bar dataKey="minutes" fill="var(--signal-2)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </AccessibleChart>
  );
}
