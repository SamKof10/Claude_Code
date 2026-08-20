"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, Mono } from "@/components/ui/Primitives";
import { StepCard, StepKicker, FeedbackBanner } from "../StepChrome";
import { VOCAB_WORDS } from "@/lib/content/vocabulary";
import { pickRandom, answersMatch } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useRandomOnMount } from "@/hooks";

const CLOZE_WORDS = VOCAB_WORDS.filter((w) => w.cloze);
const FALLBACK_WORDS = CLOZE_WORDS.slice(0, 3);

export function VocabStep({ onComplete }: { onComplete: (patch: { newWords: number }) => void }) {
  const { reviewWord } = useStore();
  const WORDS = useRandomOnMount(() => pickRandom(CLOZE_WORDS, 3), FALLBACK_WORDS);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);

  const word = WORDS[index];

  const submit = () => {
    if (!value.trim()) return;
    const correct = answersMatch(value, word.cloze.answer);
    setChecked(correct);
    reviewWord(word.id, correct);
  };

  const next = () => {
    if (index + 1 < WORDS.length) {
      setIndex(index + 1);
      setValue("");
      setChecked(null);
    } else {
      onComplete({ newWords: WORDS.length });
    }
  };

  return (
    <StepCard>
      <div className="flex items-center justify-between">
        <StepKicker>Vocabulary · {index + 1} of {WORDS.length}</StepKicker>
        <Badge tone="signal">{word.level}</Badge>
      </div>

      <p className="text-[15px] leading-relaxed text-ink-1">
        {word.cloze.sentence.split("______").map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 ? (
              <span className="mx-1 inline-block min-w-[90px] border-b-2 border-dashed border-signal/50 text-center text-signal">
                {checked !== null ? word.cloze.answer : " "}
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
          <FeedbackBanner correct={checked}>
            <span className="flex items-center gap-2 font-medium">
              {checked ? <Check size={15} /> : <X size={15} />}
              {checked ? "Correct" : `Not quite — the answer is "${word.cloze.answer}"`}
            </span>
          </FeedbackBanner>
          <div className="mt-4 rounded-xl bg-surface-2/60 p-4">
            <Mono className="text-ink-3">German trap</Mono>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{word.germanTrap}</p>
          </div>
          <Button onClick={next} className="mt-5 w-full" size="lg">
            {index + 1 < WORDS.length ? "Next word" : "Continue"}
          </Button>
        </>
      )}
    </StepCard>
  );
}
