"use client";

import type { ReactNode } from "react";
import { useSlidingIndicator } from "@/hooks";
import { cn } from "./cn";

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200",
        checked ? "border-signal bg-signal/90" : "border-[var(--line-strong)] bg-surface-2",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  const { containerRef, register, rect } = useSlidingIndicator<HTMLDivElement>(value);

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-surface-2 p-1", className)}
    >
      {rect ? (
        <span
          aria-hidden
          className="absolute rounded-full bg-signal transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: rect.width, height: rect.height, transform: `translate(${rect.left}px, ${rect.top}px)` }}
        />
      ) : null}
      {options.map((opt) => (
        <button
          key={opt.value}
          ref={register(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200",
            value === opt.value ? "text-white" : "text-ink-2 hover:text-ink-1",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  const { containerRef, register, rect } = useSlidingIndicator<HTMLDivElement>(value);

  return (
    <div
      ref={containerRef}
      className={cn("no-scrollbar relative flex items-center gap-1 overflow-x-auto border-b border-[var(--line)]", className)}
    >
      {rect ? (
        <span
          aria-hidden
          className="absolute bottom-0 h-[2px] rounded-full bg-signal transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: rect.width - 32, transform: `translate(${rect.left + 16}px, 0)` }}
        />
      ) : null}
      {tabs.map((tab) => (
        <button
          key={tab.value}
          ref={register(tab.value)}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            "shrink-0 px-4 py-3 text-[14px] font-medium transition-colors duration-200",
            value === tab.value ? "text-ink-1" : "text-ink-3 hover:text-ink-2",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
