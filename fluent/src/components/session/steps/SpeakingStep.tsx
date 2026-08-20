"use client";

import { useEffect, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Mono, Badge } from "@/components/ui/Primitives";
import { ScoreGauge } from "@/components/ui/Charts";
import { StepCard, StepKicker } from "../StepChrome";
import { SPEAKING_PROMPTS } from "@/lib/content/speaking";
import { mockSpeakingAnalysis, type SpeakingAnalysis } from "@/lib/scoring";
import { pickOne } from "@/lib/utils";
import { useRandomOnMount } from "@/hooks";

const RECORD_MS = 3200;

export function SpeakingStep({ onComplete }: { onComplete: () => void }) {
  const PROMPT = useRandomOnMount(() => pickOne(SPEAKING_PROMPTS), SPEAKING_PROMPTS[0]);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [analysis, setAnalysis] = useState<SpeakingAnalysis | null>(null);

  useEffect(() => {
    if (!recording) return;
    const start = Date.now();
    const id = setInterval(() => {
      const t = Date.now() - start;
      setElapsed(t);
      if (t >= RECORD_MS) {
        setRecording(false);
        setAnalysis(mockSpeakingAnalysis(PROMPT.id, 1));
        clearInterval(id);
      }
    }, 60);
    return () => clearInterval(id);
  }, [recording, PROMPT.id]);

  return (
    <StepCard>
      <StepKicker>Speaking</StepKicker>
      <Badge tone="signal">{PROMPT.level}</Badge>
      <h2 className="mt-3 text-[19px] leading-snug font-medium text-ink-1">{PROMPT.prompt}</h2>
      <ul className="mt-3 flex flex-col gap-1">
        {PROMPT.tips.map((tip) => (
          <li key={tip} className="text-[12.5px] text-ink-3">· {tip}</li>
        ))}
      </ul>

      {!analysis ? (
        <div className="mt-7 flex flex-col items-center gap-4 py-4">
          <button
            type="button"
            onClick={() => (recording ? null : setRecording(true))}
            className="relative grid h-20 w-20 place-items-center rounded-full bg-signal text-white transition-transform active:scale-95"
            aria-label={recording ? "Recording" : "Start recording"}
          >
            {recording ? <span className="mic-ring absolute inset-0 rounded-full border-2 border-signal" /> : null}
            {recording ? <Square size={22} fill="currentColor" /> : <Mic size={26} />}
          </button>
          <Mono className="text-ink-3">{recording ? `Recording… ${(elapsed / 1000).toFixed(1)}s` : "Tap to speak"}</Mono>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <ScoreGauge label="Fluency" value={analysis.fluency} tone="signal" />
            <ScoreGauge label="Vocabulary" value={analysis.vocabulary} tone="signal" />
            <ScoreGauge label="Grammar" value={analysis.grammar} tone="mint" />
            <ScoreGauge label="Naturalness" value={analysis.naturalness} tone="amber" />
            <ScoreGauge label="Pronunciation" value={analysis.pronunciation} tone="mint" />
          </div>

          <div className="rounded-xl bg-surface-2/60 p-4">
            <Mono className="text-ink-3">Sound more natural</Mono>
            <p className="mt-2 text-[13.5px] text-ink-3 line-through decoration-coral/60">{PROMPT.sampleRewrite.before}</p>
            <p className="mt-1.5 text-[13.5px] font-medium text-mint">{PROMPT.sampleRewrite.after}</p>
          </div>

          <Button onClick={onComplete} size="lg">Continue</Button>
        </div>
      )}
    </StepCard>
  );
}
