"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { AccessibleChart } from "./accessible-chart";

export function ScoreLineChart({
  data,
  height = 180,
}: {
  data: { label: string; score: number; title?: string }[];
  height?: number;
}) {
  const first = data[0]?.score ?? 0;
  const last = data[data.length - 1]?.score ?? 0;
  const delta = last - first;
  const trend =
    data.length < 2
      ? "noch zu wenige Versuche für einen Trend"
      : delta > 0
        ? `${delta} Punkte mehr als beim ersten Versuch`
        : delta < 0
          ? `${Math.abs(delta)} Punkte weniger als beim ersten Versuch`
          : "unverändert seit dem ersten Versuch";

  return (
    <AccessibleChart
      summary={`Quiz-Ergebnisse aus ${data.length} abgeschlossenen Quiz, zuletzt ${last}% — ${trend}.`}
      columns={["Quiz", "Ergebnis"]}
      rows={data.map((d) => ({ label: d.title ?? d.label, value: `${d.score}%` }))}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "var(--chart-axis)" }} tick={{ fill: "var(--chart-muted)", fontSize: 12 }} />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "var(--chart-muted)", fontSize: 12 }} width={34} />
          <Tooltip
            cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1 }}
            content={({ active, payload, label }) => (
              <ChartTooltip active={active} label={label as string} payload={payload as never} formatter={(v) => `${v}%`} />
            )}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--signal-2)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--signal-2)", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </AccessibleChart>
  );
}
