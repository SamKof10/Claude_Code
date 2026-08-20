"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { LevelRing } from "@/components/ui/Charts";
import { Mono } from "@/components/ui/Primitives";
import { Reveal, ShinyText } from "@/components/ui/Reveal";
import { useStore } from "@/lib/store";

export function Hero() {
  const { state } = useStore();
  const [greeting, setGreeting] = useState("Welcome back.");

  useEffect(() => {
    const h = new Date().getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only read (server has no local time), runs once on mount
    setGreeting(h < 12 ? "Good morning." : h < 18 ? "Good afternoon." : "Good evening.");
  }, []);

  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-surface-1 p-6 sm:p-9">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-signal), transparent 70%)" }}
        />
        <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="max-w-lg">
            <Mono className="text-signal">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</Mono>
            <h1 className="display mt-3 text-[34px] sm:text-[44px]">
              <ShinyText text={greeting} />
            </h1>
            <p className="lede mt-3">
              Your English is getting sharper. You&rsquo;re{" "}
              <span className="font-medium text-ink-1">{state.c1Progress}%</span> of the way to {state.targetLevel}.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink href="/session" size="lg" magnetic shimmer ripple>
                Start today&rsquo;s session <ArrowRight size={16} />
              </ButtonLink>
              <ButtonLink href="/progress" variant="secondary" size="lg">
                View progress
              </ButtonLink>
            </div>
          </div>

          <div className="shrink-0 self-center">
            <BorderBeam className="rounded-full" duration={6}>
              <LevelRing value={state.c1Progress} label={state.level} sublabel={`→ ${state.targetLevel}`} />
            </BorderBeam>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
