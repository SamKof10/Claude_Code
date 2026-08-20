import { Badge, Mono } from "@/components/ui/Primitives";
import { WordStateBadge } from "./WordStateBadge";
import type { VocabWord } from "@/lib/content/vocabulary";
import type { SrsState } from "@/lib/store";

export function VocabCard({ word, state }: { word: VocabWord; state: SrsState }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="signal">{word.level}</Badge>
        <WordStateBadge state={state} />
        <span className="mono text-ink-3">{word.pos}</span>
      </div>

      <div>
        <h3 className="text-[22px] font-medium text-ink-1">{word.word}</h3>
        <p className="text-[12.5px] text-ink-3">{word.ipa}</p>
        <p className="mt-2 text-[14.5px] text-ink-2">{word.meaning}</p>
        <p className="text-[13px] text-ink-3">{word.meaningDe}</p>
      </div>

      <div>
        <Mono className="text-ink-3">Native examples</Mono>
        <ul className="mt-2 flex flex-col gap-1.5">
          {word.examples.map((ex) => (
            <li key={ex} className="text-[13.5px] leading-relaxed text-ink-2">&ldquo;{ex}&rdquo;</li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Mono className="text-ink-3">Common collocations</Mono>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {word.collocations.map((c) => (
              <span key={c} className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[12px] text-ink-2">{c}</span>
            ))}
          </div>
        </div>
        <div>
          <Mono className="text-ink-3">Synonyms</Mono>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {word.synonyms.map((s) => (
              <span key={s} className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[12px] text-ink-2">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-amber/20 bg-amber/[0.06] p-4">
        <Mono className="text-amber">German trap</Mono>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{word.germanTrap}</p>
      </div>
    </div>
  );
}
