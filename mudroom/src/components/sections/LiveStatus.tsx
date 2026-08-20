"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Mono, StatusDot } from "@/components/ui/Primitives";

/**
 * The retro accent, used once. It borrows the look of the panel on the
 * side of the machine — and says out loud that the numbers are a demo
 * feed, because a fleet dashboard on a concept site would otherwise be
 * a lie told in monospace.
 */
const BARS = [
  { label: "Water pressure", value: 82, unit: "%", tone: "water" as const },
  { label: "Brush system", value: 100, unit: "%", tone: "hivis" as const },
];

export function LiveStatus() {
  return (
    <section className="relative border-y border-[var(--edge)] bg-[#0a0c0d]">
      <div className="crt relative mx-auto grid w-full max-w-[1180px] gap-px px-5 py-6 sm:px-8 md:grid-cols-4 md:gap-8">
        <div className="flex items-center gap-2.5">
          <StatusDot />
          <Mono className="text-concrete/45">System status</Mono>
          <Mono className="text-hivis">Online</Mono>
        </div>

        {BARS.map((bar) => (
          <div key={bar.label} className="flex items-center gap-3">
            <Mono className="shrink-0 text-concrete/45">{bar.label}</Mono>
            <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-steel-3">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${bar.value}%`,
                  background: bar.tone === "water" ? "var(--color-water)" : "var(--color-hivis)",
                }}
              />
            </div>
            <Mono className="tnum shrink-0 text-concrete/75">
              {bar.value}
              {bar.unit}
            </Mono>
          </div>
        ))}

        <div className="flex items-center gap-2.5 md:justify-end">
          <Mono className="text-concrete/45">Bikes cleaned</Mono>
          <AnimatedNumber value={12482} className="tnum font-mono text-sm font-medium text-concrete" />
        </div>
      </div>
      <p className="mono absolute inset-x-0 -bottom-px hidden justify-center pb-1 text-[9px] !tracking-[0.18em] text-concrete/20 md:flex">
        Demo telemetry
      </p>
    </section>
  );
}
