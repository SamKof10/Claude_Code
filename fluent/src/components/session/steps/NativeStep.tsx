"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Mono } from "@/components/ui/Primitives";
import { StepCard, StepKicker } from "../StepChrome";
import { NATURAL_UPGRADES } from "@/lib/content/natural";
import { pickRandom } from "@/lib/utils";
import { useRandomOnMount } from "@/hooks";

const FALLBACK_ITEMS = NATURAL_UPGRADES.slice(0, 3);

export function NativeStep({ onComplete }: { onComplete: () => void }) {
  const ITEMS = useRandomOnMount(() => pickRandom(NATURAL_UPGRADES, 3), FALLBACK_ITEMS);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const item = ITEMS[index];

  const next = () => {
    if (index + 1 < ITEMS.length) {
      setIndex(index + 1);
      setRevealed(false);
    } else {
      onComplete();
    }
  };

  return (
    <StepCard>
      <StepKicker>Native English · {index + 1} of {ITEMS.length}</StepKicker>
      <Mono className="text-ink-3">{item.context}</Mono>

      <div className="mt-4 rounded-xl border border-[var(--line)] px-4 py-3">
        <Mono className="text-ink-3">Basic</Mono>
        <p className="mt-1 text-[15px] text-ink-1">{item.basic}</p>
      </div>

      {!revealed ? (
        <Button onClick={() => setRevealed(true)} className="mt-4 w-full" size="lg">
          Reveal upgrade
        </Button>
      ) : (
        <>
          <div className="mt-3 rounded-xl border border-signal/25 bg-signal/[0.06] px-4 py-3">
            <Mono className="text-signal">Natural</Mono>
            <p className="mt-1 text-[15px] text-ink-1">{item.natural}</p>
          </div>
          <div className="mt-3 rounded-xl border border-mint/25 bg-mint/[0.06] px-4 py-3">
            <Mono className="text-mint">Advanced</Mono>
            <p className="mt-1 text-[15px] text-ink-1">{item.advanced}</p>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-3">{item.toneNote}</p>
          <Button onClick={next} className="mt-5 w-full" size="lg">
            {index + 1 < ITEMS.length ? "Next" : "Finish session"}
          </Button>
        </>
      )}
    </StepCard>
  );
}
