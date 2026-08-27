import * as React from "react";

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: { value: number | string; name?: string; color?: string }[];
  label?: string;
  formatter?: (value: number | string, name?: string) => React.ReactNode;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-[var(--surface-overlay)] px-3 py-2 shadow-xl">
      {label && <p className="mb-1 t-caption font-medium text-ink-2">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5 t-caption text-ink">
          {p.color && <span className="size-1.5 rounded-full" style={{ background: p.color }} />}
          <span className="tabular-nums font-medium">{formatter ? formatter(p.value, p.name) : p.value}</span>
        </div>
      ))}
    </div>
  );
}
