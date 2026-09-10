type Point = { week: number; value: number; phase: string };

const W = 318;
const H = 170;
const PAD_TOP = 12;
const PAD_BOTTOM = 40;
const PAD_X = 20;

/**
 * Liniendiagramm über den Mesozyklus. Deload-Sessions werden hinterlegt, damit
 * der Einbruch in Woche 6 als Teil des Plans lesbar ist und nicht als Rückschritt.
 */
export function TrendChart({ points, unit, label }: { points: Point[]; unit: string; label: string }) {
  if (points.length === 0) return null;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.max(max * 0.2, 1);
  const lo = min - span * 0.25;
  const hi = max + span * 0.25;

  const plotHeight = H - PAD_TOP - PAD_BOTTOM;
  const x = (i: number) => (points.length === 1 ? W / 2 : PAD_X + (i * (W - PAD_X * 2)) / (points.length - 1));
  const y = (v: number) => PAD_TOP + plotHeight - ((v - lo) / (hi - lo)) * plotHeight;

  const line = points.map((p, i) => `${x(i)},${y(p.value)}`).join(" ");
  const baseline = PAD_TOP + plotHeight;
  const lastIndex = points.length - 1;

  const summary = `${label}: ${points.map((p) => `Woche ${p.week} ${fmt(p.value)} ${unit}`).join(", ")}`;

  return (
    <figure className="m-0 flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={summary}>
        {points.map((p, i) =>
          p.phase === "deload" ? (
            <rect
              key={`deload-${i}`}
              x={x(i) - 18}
              y={PAD_TOP - 12}
              width={36}
              height={plotHeight + 12}
              rx={4}
              fill="var(--color-warn)"
              opacity={0.1}
            />
          ) : null,
        )}

        <line x1={0} y1={baseline} x2={W} y2={baseline} stroke="var(--color-line)" strokeWidth={1} />
        <line x1={0} y1={PAD_TOP + plotHeight / 2} x2={W} y2={PAD_TOP + plotHeight / 2} stroke="var(--color-raised)" strokeWidth={1} strokeDasharray="3 5" />
        <line x1={0} y1={PAD_TOP} x2={W} y2={PAD_TOP} stroke="var(--color-raised)" strokeWidth={1} strokeDasharray="3 5" />

        {points.length > 1 && (
          <polyline points={line} fill="none" stroke="var(--color-go)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        )}

        {points.map((p, i) => {
          const isLast = i === lastIndex;
          const isDeload = p.phase === "deload";
          return (
            <circle
              key={`dot-${i}`}
              cx={x(i)}
              cy={y(p.value)}
              r={isLast ? 6 : 3.5}
              fill={isLast ? "var(--color-go)" : "var(--color-bg)"}
              stroke={isLast ? "none" : isDeload ? "var(--color-warn)" : "var(--color-go)"}
              strokeWidth={2.5}
            />
          );
        })}

        {points.map((p, i) => {
          const show = i === 0 || i === lastIndex || p.phase === "deload" || points.length <= 8;
          if (!show) return null;
          return (
            <text
              key={`label-${i}`}
              x={x(i)}
              y={H - 18}
              textAnchor="middle"
              fontSize="11"
              fontWeight={i === lastIndex || p.phase === "deload" ? 600 : 400}
              fill={p.phase === "deload" ? "var(--color-warn-bright)" : i === lastIndex ? "var(--color-ink)" : "var(--color-ink-3)"}
            >
              {p.week}
            </text>
          );
        })}
      </svg>

      <figcaption className="flex items-center gap-4 border-t border-line pt-3">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-[3px] w-2.5 rounded-sm bg-go" />
          <span className="text-[12px] leading-4 text-ink-2">Arbeitsgewicht</span>
        </span>
        {points.some((p) => p.phase === "deload") && (
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-sm bg-warn/25" />
            <span className="text-[12px] leading-4 text-ink-2">Deload</span>
          </span>
        )}
        <span className="ml-auto text-[12px] leading-4 text-ink-3">Woche</span>
      </figcaption>
    </figure>
  );
}

function fmt(value: number): string {
  return (Math.round(value * 10) / 10).toLocaleString("de-DE", { maximumFractionDigits: 1 });
}
