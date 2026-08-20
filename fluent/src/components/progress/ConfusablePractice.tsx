"use client";

import { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, Mono } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";
import { CONFUSABLE_PAIRS } from "@/lib/content/review";

export function ConfusablePractice() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<"a" | "b" | null>(null);
  const done = index >= CONFUSABLE_PAIRS.length;
  const pair = CONFUSABLE_PAIRS[index];

  const next = () => {
    setIndex((i) => i + 1);
    setChoice(null);
  };

  if (done) {
    return (
      <Card className="p-6 text-center">
        <p className="text-[14px] text-ink-2">You&rsquo;ve been through every confusable pair.</p>
        <Button
          onClick={() => {
            setIndex(0);
            setChoice(null);
          }}
          variant="secondary"
          className="mt-4"
        >
          <RotateCcw size={15} /> Start over
        </Button>
      </Card>
    );
  }

  const parts = pair.exercise.sentence.split("______");

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <Mono className="text-ink-3">Confusable {index + 1} of {CONFUSABLE_PAIRS.length}</Mono>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-1">
        {parts[0]}
        <span className="mx-1 inline-block min-w-[70px] border-b-2 border-dashed border-signal/50 text-center text-signal">
          {choice ? pair[pair.exercise.correct].word : " "}
        </span>
        {parts[1]}
      </p>

      <div className="mt-4 flex gap-2">
        {(["a", "b"] as const).map((key) => {
          const opt = pair[key];
          const isCorrect = pair.exercise.correct === key;
          const revealed = choice !== null;
          return (
            <button
              key={key}
              type="button"
              disabled={revealed}
              onClick={() => setChoice(key)}
              className={cn(
                "flex-1 rounded-xl border px-4 py-3 text-[14px] font-medium transition-colors",
                revealed && isCorrect
                  ? "border-mint/40 bg-mint/[0.08] text-mint"
                  : revealed && choice === key
                    ? "border-coral/40 bg-coral/[0.08] text-coral"
                    : "border-[var(--line)] text-ink-2 hover:border-[var(--line-strong)]",
              )}
            >
              {opt.word}
            </button>
          );
        })}
      </div>

      {choice ? (
        <>
          <div className={cn("mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px]", choice === pair.exercise.correct ? "border-mint/30 bg-mint/[0.07] text-mint" : "border-coral/30 bg-coral/[0.07] text-coral")}>
            {choice === pair.exercise.correct ? <Check size={15} /> : <X size={15} />}
            {pair.explanation}
          </div>
          <Button onClick={next} className="mt-4 w-full" size="lg">
            {index + 1 < CONFUSABLE_PAIRS.length ? "Next" : "Finish"}
          </Button>
        </>
      ) : null}
    </Card>
  );
}
