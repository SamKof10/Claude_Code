import { Card, Mono } from "@/components/ui/Primitives";
import { NUANCE_LADDERS } from "@/lib/content/c1c2";

export function NuanceLadders() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {NUANCE_LADDERS.map((ladder) => (
        <Card key={ladder.id} className="p-5">
          <Mono className="text-ink-3">instead of</Mono>
          <p className="text-[15px] font-medium text-ink-3 line-through decoration-[var(--line-strong)]">{ladder.basic}</p>
          <div className="mt-3 flex flex-col gap-2.5">
            {ladder.words.map((w) => (
              <div key={w.word} className="rounded-xl bg-surface-2/60 p-3.5">
                <p className="text-[14.5px] font-medium text-signal">{w.word}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-3">{w.nuance}</p>
                <p className="mt-1.5 text-[13px] text-ink-2">&ldquo;{w.example}&rdquo;</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
