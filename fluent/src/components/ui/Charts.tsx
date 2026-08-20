"use client";

import { useId, useState } from "react";
import { cn } from "./cn";

/* ── Level ring — circular progress toward the target level ── */
export function LevelRing({
  value,
  size = 132,
  stroke = 9,
  label,
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
  sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--t-surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="display text-[26px] text-ink-1 tnum">{label}</span>
        {sublabel ? <span className="mono mt-1 text-ink-3">{sublabel}</span> : null}
      </div>
    </div>
  );
}

/* ── Horizontal magnitude bars — one hue, per dataviz "compare magnitude" spec ── */
export interface BarDatum {
  label: string;
  value: number;
  emphasis?: boolean;
}

export function BarRows({ data, max = 100, unit = "%" }: { data: BarDatum[]; max?: number; unit?: string }) {
  return (
    <div className="flex flex-col gap-4">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-[13px] text-ink-2">{d.label}</span>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
            <div
              className={cn("h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]", d.emphasis ? "bg-coral" : "bg-signal")}
              style={{ width: `${Math.max(2, (d.value / max) * 100)}%` }}
            />
          </div>
          <span className="mono w-9 shrink-0 text-right text-ink-3 tnum">
            {d.value}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Line trend — single series, sequential hue, hover crosshair + tooltip ── */
export function LineTrend({
  data,
  height = 160,
  suffix = "%",
}: {
  data: number[];
  height?: number;
  suffix?: string;
}) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);
  const width = 100;
  const min = Math.min(...data) - 4;
  const max = Math.max(...data) + 4;
  const span = Math.max(1, max - min);
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / span) * height,
    v,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${path} L${width},${height} L0,${height} Z`;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-40 w-full overflow-visible"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-signal)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--color-signal)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={width} y1={height * f} y2={height * f} stroke="var(--line)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        ))}
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path d={path} fill="none" stroke="var(--color-signal)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x - stepX / 2}
              y={0}
              width={stepX}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              className="cursor-pointer"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === i ? 3.2 : 2.2}
              fill="var(--t-surface-0)"
              stroke="var(--color-signal)"
              strokeWidth={1.6}
              vectorEffect="non-scaling-stroke"
              className="transition-[r] duration-150"
            />
          </g>
        ))}
      </svg>
      {hover !== null ? (
        <div
          className="glass pointer-events-none absolute top-0 rounded-lg border border-[var(--line-strong)] px-2.5 py-1.5 text-[12px] shadow-lg"
          style={{
            left: `${(points[hover].x / width) * 100}%`,
            transform: `translate(-50%, ${points[hover].y < 40 ? "8px" : "-115%"})`,
          }}
        >
          <span className="tnum font-medium text-ink-1">
            {points[hover].v}
            {suffix}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/* ── Score gauge — used on speaking / writing analysis breakdowns ── */
export function ScoreGauge({ label, value, tone = "signal" }: { label: string; value: number; tone?: "signal" | "mint" | "amber" | "coral" }) {
  const colors: Record<string, string> = { signal: "text-signal", mint: "text-mint", amber: "text-amber", coral: "text-coral" };
  const bars: Record<string, string> = { signal: "bg-signal", mint: "bg-mint", amber: "bg-amber", coral: "bg-coral" };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-ink-2">{label}</span>
        <span className={cn("tnum text-[15px] font-medium", colors[tone])}>{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div className={cn("h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]", bars[tone])} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
