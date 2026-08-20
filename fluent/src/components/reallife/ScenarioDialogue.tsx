"use client";

import { useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, Mono, Badge } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";
import { useStore } from "@/lib/store";
import type { Scenario } from "@/lib/content/scenarios";

const QUALITY_TONE = { awkward: "coral", good: "amber", natural: "mint" } as const;

export function ScenarioDialogue({ scenario, onBack }: { scenario: Scenario; onBack: () => void }) {
  const { markActivity } = useStore();
  const [turnIndex, setTurnIndex] = useState(0);
  const [chosenOption, setChosenOption] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const turn = scenario.turns[turnIndex];

  const choose = (i: number) => setChosenOption(i);

  const next = () => {
    if (turnIndex + 1 < scenario.turns.length) {
      setTurnIndex((i) => i + 1);
      setChosenOption(null);
    } else {
      setFinished(true);
      markActivity("reallife");
    }
  };

  const restart = () => {
    setTurnIndex(0);
    setChosenOption(null);
    setFinished(false);
  };

  return (
    <Card className="mx-auto max-w-xl p-6 sm:p-8">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-3 hover:text-ink-1">
        <ArrowLeft size={14} /> All scenarios
      </button>

      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-[16px] font-medium text-ink-1">{scenario.title}</h2>
        <Mono className="text-ink-3">{turnIndex + 1}/{scenario.turns.length}</Mono>
      </div>
      <p className="mt-1 text-[13px] text-ink-3">{scenario.setting}</p>

      {finished ? (
        <div className="mt-8 flex flex-col items-center gap-3 py-4 text-center">
          <p className="text-[16px] font-medium text-ink-1">Scenario complete</p>
          <p className="text-[13px] text-ink-3">You handled the whole conversation in English.</p>
          <Button onClick={restart} variant="secondary" className="mt-2">
            <RotateCcw size={15} /> Replay scenario
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-2xl bg-surface-2/60 px-4 py-3.5">
            <p className="text-[14px] leading-relaxed text-ink-1">&ldquo;{turn.npc}&rdquo;</p>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {turn.options.map((opt, i) => {
              const isChosen = chosenOption === i;
              const revealed = chosenOption !== null;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={revealed}
                  onClick={() => choose(i)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left text-[13.5px] transition-colors",
                    revealed && isChosen ? "border-[var(--line-strong)] bg-surface-2" : "border-[var(--line)] text-ink-2 hover:border-[var(--line-strong)]",
                    revealed && !isChosen && "opacity-40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={isChosen ? "text-ink-1" : ""}>{opt.text}</span>
                    {isChosen ? <Badge tone={QUALITY_TONE[opt.quality]}>{opt.quality}</Badge> : null}
                  </div>
                </button>
              );
            })}
          </div>

          {chosenOption !== null ? (
            <>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{turn.options[chosenOption].feedback}</p>
              <Button onClick={next} className="mt-5 w-full" size="lg">
                {turnIndex + 1 < scenario.turns.length ? "Continue" : "Finish scenario"}
              </Button>
            </>
          ) : null}
        </>
      )}
    </Card>
  );
}
