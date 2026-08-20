"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, Mono } from "@/components/ui/Primitives";
import { StepCard, StepKicker, FeedbackBanner } from "../StepChrome";
import { GRAMMAR_CHALLENGES, GRAMMAR_CATEGORY_LABELS } from "@/lib/content/grammar";
import { pickRandom, looseMatch } from "@/lib/utils";
import { useRandomOnMount } from "@/hooks";

const FALLBACK_CHALLENGES = GRAMMAR_CHALLENGES.slice(0, 3);

export function GrammarStep({ onComplete }: { onComplete: (patch: { grammarPatterns: number }) => void }) {
  const CHALLENGES = useRandomOnMount(() => pickRandom(GRAMMAR_CHALLENGES, 3), FALLBACK_CHALLENGES);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);

  const item = CHALLENGES[index];

  const submit = () => {
    if (!value.trim()) return;
    setChecked(looseMatch(value, item.fixed));
  };

  const next = () => {
    if (index + 1 < CHALLENGES.length) {
      setIndex(index + 1);
      setValue("");
      setChecked(null);
    } else {
      onComplete({ grammarPatterns: CHALLENGES.length });
    }
  };

  return (
    <StepCard>
      <div className="flex items-center justify-between">
        <StepKicker>Grammar · {index + 1} of {CHALLENGES.length}</StepKicker>
        <Badge tone="signal">{GRAMMAR_CATEGORY_LABELS[item.category]}</Badge>
      </div>

      <Mono className="text-ink-3">Fix the sentence</Mono>
      <p className="mt-2 rounded-xl border border-coral/25 bg-coral/[0.06] px-4 py-3 text-[14.5px] text-ink-1">{item.broken}</p>

      {checked === null ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type the corrected sentence..."
            className="h-12 flex-1 rounded-xl border border-[var(--line-strong)] bg-surface-2 px-4 text-[14.5px] text-ink-1 outline-none focus:border-signal"
          />
          <Button onClick={submit}>Check</Button>
        </div>
      ) : (
        <>
          <FeedbackBanner correct={checked}>
            <span className="flex items-center gap-2 font-medium">
              {checked ? <Check size={15} /> : <X size={15} />}
              {checked ? "Correct" : "Not quite"}
            </span>
          </FeedbackBanner>
          <div className="mt-3 rounded-xl bg-surface-2/60 p-4">
            <p className="text-[14px] font-medium text-mint">{item.fixed}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{item.explanation}</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">{item.germanNote}</p>
          </div>
          <Button onClick={next} className="mt-5 w-full" size="lg">
            {index + 1 < CHALLENGES.length ? "Next" : "Continue"}
          </Button>
        </>
      )}
    </StepCard>
  );
}
