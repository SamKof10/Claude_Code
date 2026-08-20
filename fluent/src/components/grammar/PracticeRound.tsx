"use client";

import { useMemo, useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, Badge, Mono } from "@/components/ui/Primitives";
import { GRAMMAR_CHALLENGES, GRAMMAR_CATEGORY_LABELS, type GrammarCategory } from "@/lib/content/grammar";
import { looseMatch } from "@/lib/utils";
import { cn } from "@/components/ui/cn";

const CATEGORIES: (GrammarCategory | "all")[] = ["all", ...(Object.keys(GRAMMAR_CATEGORY_LABELS) as GrammarCategory[])];

export function PracticeRound() {
  const [category, setCategory] = useState<GrammarCategory | "all">("all");
  const items = useMemo(
    () => (category === "all" ? GRAMMAR_CHALLENGES : GRAMMAR_CHALLENGES.filter((c) => c.category === category)),
    [category],
  );
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const item = items[index];
  const done = index >= items.length;

  const selectCategory = (c: GrammarCategory | "all") => {
    setCategory(c);
    setIndex(0);
    setValue("");
    setChecked(null);
    setScore({ correct: 0, total: 0 });
  };

  const submit = () => {
    if (!value.trim() || !item) return;
    const correct = looseMatch(value, item.fixed);
    setChecked(correct);
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  };

  const next = () => {
    setIndex((i) => i + 1);
    setValue("");
    setChecked(null);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => selectCategory(c)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              category === c ? "border-signal/50 bg-signal/10 text-signal-soft" : "border-[var(--line)] text-ink-3 hover:text-ink-1",
            )}
          >
            {c === "all" ? "All" : GRAMMAR_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <Card className="mx-auto mt-5 max-w-xl p-6 sm:p-8">
        {done ? (
          <div className="text-center">
            <p className="display text-[30px] text-ink-1">{score.correct}/{score.total}</p>
            <p className="mt-1 text-[13px] text-ink-3">correct this round</p>
            <Button onClick={() => selectCategory(category)} className="mt-6 w-full" size="lg">
              <RotateCcw size={15} /> Practice again
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Mono className="text-ink-3">Item {index + 1} of {items.length}</Mono>
              <Badge tone="signal">{GRAMMAR_CATEGORY_LABELS[item.category]}</Badge>
            </div>

            <Mono className="mt-3 block text-ink-3">Fix the sentence</Mono>
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
                <div className={cn("mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-[13.5px] font-medium", checked ? "border-mint/30 bg-mint/[0.07] text-mint" : "border-coral/30 bg-coral/[0.07] text-coral")}>
                  {checked ? <Check size={15} /> : <X size={15} />}
                  {checked ? "Correct" : "Not quite"}
                </div>
                <div className="mt-3 rounded-xl bg-surface-2/60 p-4">
                  <p className="text-[14px] font-medium text-mint">{item.fixed}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{item.explanation}</p>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-ink-3">{item.germanNote}</p>
                </div>
                <Button onClick={next} className="mt-5 w-full" size="lg">
                  {index + 1 < items.length ? "Next" : "See results"}
                </Button>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
