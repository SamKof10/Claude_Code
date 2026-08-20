"use client";

import { useMemo, useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, Badge, Mono } from "@/components/ui/Primitives";
import { VOCAB_WORDS } from "@/lib/content/vocabulary";
import { useStore } from "@/lib/store";
import { vocabState } from "./WordStateBadge";
import { answersMatch } from "@/lib/utils";

const RANK: Record<string, number> = { new: 0, learning: 1, familiar: 2, mastered: 3 };
const ROUND_SIZE = 8;

function buildRound(vocabMap: Parameters<typeof vocabState>[0], seed: number) {
  return [...VOCAB_WORDS.filter((w) => w.cloze)]
    .sort((a, b) => {
      const diff = RANK[vocabState(vocabMap, a.id)] - RANK[vocabState(vocabMap, b.id)];
      if (diff !== 0) return diff;
      return (a.id.charCodeAt(0) + seed) % 7 - (b.id.charCodeAt(0) + seed) % 7;
    })
    .slice(0, ROUND_SIZE);
}

export function PracticeMode() {
  const { state, reviewWord } = useStore();
  const [seed, setSeed] = useState(0);
  const round = useMemo(() => buildRound(state.vocab, seed), [seed, state.vocab]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const word = round[index];
  const done = index >= round.length;

  const submit = () => {
    if (!value.trim() || !word) return;
    const correct = answersMatch(value, word.cloze.answer);
    setChecked(correct);
    reviewWord(word.id, correct);
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  };

  const next = () => {
    setIndex((i) => i + 1);
    setValue("");
    setChecked(null);
  };

  const restart = () => {
    setSeed((s) => s + 1);
    setIndex(0);
    setValue("");
    setChecked(null);
    setScore({ correct: 0, total: 0 });
  };

  if (done) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <p className="display text-[30px] text-ink-1">
          {score.correct}/{score.total}
        </p>
        <p className="mt-1 text-[13px] text-ink-3">correct this round</p>
        <Button onClick={restart} className="mt-6 w-full" size="lg">
          <RotateCcw size={15} /> Practice again
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <Mono className="text-ink-3">Card {index + 1} of {round.length}</Mono>
        <Badge tone="signal">{word.level}</Badge>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-ink-1">
        {word.cloze.sentence.split("______").map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 ? (
              <span className="mx-1 inline-block min-w-[90px] border-b-2 border-dashed border-signal/50 text-center text-signal">
                {checked !== null ? word.cloze.answer : " "}
              </span>
            ) : null}
          </span>
        ))}
      </p>

      {checked === null ? (
        <div className="mt-5 flex gap-2">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Type the missing word..."
            className="h-12 flex-1 rounded-xl border border-[var(--line-strong)] bg-surface-2 px-4 text-[14.5px] text-ink-1 outline-none focus:border-signal"
          />
          <Button onClick={submit}>Check</Button>
        </div>
      ) : (
        <>
          <div className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-[13.5px] font-medium ${checked ? "border-mint/30 bg-mint/[0.07] text-mint" : "border-coral/30 bg-coral/[0.07] text-coral"}`}>
            {checked ? <Check size={15} /> : <X size={15} />}
            {checked ? "Correct" : `Answer: "${word.cloze.answer}"`}
          </div>
          <Button onClick={next} className="mt-5 w-full" size="lg">
            {index + 1 < round.length ? "Next card" : "See results"}
          </Button>
        </>
      )}
    </Card>
  );
}
