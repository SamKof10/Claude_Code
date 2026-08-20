"use client";

import { useEffect, useState } from "react";
import { Zap, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, Mono, Badge } from "@/components/ui/Primitives";
import { ScoreGauge } from "@/components/ui/Charts";
import { ABROAD_PROMPTS } from "@/lib/content/scenarios";
import { scoreAbroadResponse, type AbroadScore } from "@/lib/scoring";
import { useStore } from "@/lib/store";

function average(scores: AbroadScore[]): AbroadScore {
  const n = scores.length || 1;
  const sum = scores.reduce(
    (acc, s) => ({
      comprehension: acc.comprehension + s.comprehension,
      speed: acc.speed + s.speed,
      vocabulary: acc.vocabulary + s.vocabulary,
      naturalness: acc.naturalness + s.naturalness,
      confidence: acc.confidence + s.confidence,
    }),
    { comprehension: 0, speed: 0, vocabulary: 0, naturalness: 0, confidence: 0 },
  );
  return {
    comprehension: Math.round(sum.comprehension / n),
    speed: Math.round(sum.speed / n),
    vocabulary: Math.round(sum.vocabulary / n),
    naturalness: Math.round(sum.naturalness / n),
    confidence: Math.round(sum.confidence / n),
  };
}

export function AbroadRun() {
  const { markActivity } = useStore();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [scores, setScores] = useState<AbroadScore[]>([]);
  const [finished, setFinished] = useState(false);

  const prompt = ABROAD_PROMPTS[index];

  const submit = () => {
    const timeUsed = prompt.timeLimitSec - remaining;
    const score = scoreAbroadResponse(value, Math.max(1, timeUsed), prompt.timeLimitSec, prompt.keywords);
    const nextScores = [...scores, score];
    setScores(nextScores);
    setValue("");

    if (index + 1 < ABROAD_PROMPTS.length) {
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
      markActivity("abroad");
    }
  };

  useEffect(() => {
    if (!started || finished) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the per-prompt countdown, not derived render state
    setRemaining(prompt.timeLimitSec);
  }, [started, index, finished, prompt]);

  useEffect(() => {
    if (!started || finished) return;
    if (remaining <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- auto-submits when the per-prompt countdown reaches zero
      submit();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, started, finished]);

  const restart = () => {
    setStarted(false);
    setIndex(0);
    setValue("");
    setScores([]);
    setFinished(false);
  };

  if (!started) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <Zap size={28} className="mx-auto text-amber" />
        <h2 className="mt-4 text-[19px] font-medium text-ink-1">Abroad Mode</h2>
        <p className="lede mt-2">
          Ten fast, realistic lines — casual, quick, and a little messy, like real conversation. Type a reply before the timer runs out.
        </p>
        <Button onClick={() => setStarted(true)} className="mt-6 w-full" size="lg" shimmer>
          Start
        </Button>
      </Card>
    );
  }

  if (finished) {
    const avg = average(scores);
    return (
      <Card className="mx-auto max-w-lg p-8">
        <p className="text-center text-[16px] font-medium text-ink-1">You made it through</p>
        <div className="mt-6 grid grid-cols-1 gap-4">
          <ScoreGauge label="Comprehension" value={avg.comprehension} tone="signal" />
          <ScoreGauge label="Response speed" value={avg.speed} tone="amber" />
          <ScoreGauge label="Vocabulary" value={avg.vocabulary} tone="signal" />
          <ScoreGauge label="Naturalness" value={avg.naturalness} tone="mint" />
          <ScoreGauge label="Confidence" value={avg.confidence} tone="mint" />
        </div>
        <Button onClick={restart} variant="secondary" className="mt-6 w-full" size="lg">
          <RotateCcw size={15} /> Run it again
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <Mono className="text-ink-3">{index + 1} of {ABROAD_PROMPTS.length}</Mono>
        <Badge tone={remaining <= 3 ? "coral" : "amber"}>{remaining}s</Badge>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-amber transition-[width] duration-1000 ease-linear"
          style={{ width: `${(remaining / prompt.timeLimitSec) * 100}%` }}
        />
      </div>

      <p className="mt-4 text-[12.5px] text-ink-3">{prompt.context}</p>
      <p className="mt-1 text-[16px] leading-relaxed text-ink-1">&ldquo;{prompt.line}&rdquo;</p>
      <p className="mt-1 text-[12px] text-ink-3">— {prompt.speaker}</p>

      <div className="mt-4 flex gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Type your reply..."
          className="h-12 flex-1 rounded-xl border border-[var(--line-strong)] bg-surface-2 px-4 text-[14.5px] text-ink-1 outline-none focus:border-signal"
        />
        <Button onClick={submit}>Reply</Button>
      </div>
    </Card>
  );
}
