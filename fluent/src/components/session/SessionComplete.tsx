"use client";

import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Mono } from "@/components/ui/Primitives";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useConfetti } from "@/hooks";
import type { SessionRecord } from "@/lib/store";

export function SessionComplete({ record }: { record: SessionRecord }) {
  const burst = useConfetti();

  useEffect(() => {
    burst(window.innerWidth / 2, window.innerHeight / 3, 34);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-16 text-center">
      <div className="glow-signal grid h-16 w-16 place-items-center rounded-full bg-signal/15">
        <Sparkles size={26} className="text-signal" />
      </div>
      <h1 className="display mt-6 text-[32px] text-ink-1">Session complete</h1>
      <p className="lede mt-2">You&rsquo;re getting closer.</p>

      <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Minutes", value: record.minutes },
          { label: "New words", value: record.newWords },
          { label: "Grammar patterns", value: record.grammarPatterns },
          { label: "Speaking reps", value: record.speakingExercises },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-[var(--line)] bg-surface-1 p-4">
            <p className="display text-[24px] text-ink-1 tnum">
              <AnimatedNumber value={s.value} />
            </p>
            <Mono className="mt-1 text-ink-3">{s.label}</Mono>
          </div>
        ))}
      </div>

      <div className="mt-4 w-full rounded-2xl border border-signal/25 bg-signal/[0.06] p-4">
        <Mono className="text-signal">C1 progress</Mono>
        <p className="mt-1 text-[22px] font-medium text-ink-1">+{record.progressGain}%</p>
      </div>

      <ButtonLink href="/" size="lg" className="mt-8" magnetic shimmer>
        Back to dashboard
      </ButtonLink>
    </div>
  );
}
