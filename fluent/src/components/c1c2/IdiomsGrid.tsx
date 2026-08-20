import { Card, Mono } from "@/components/ui/Primitives";
import { ADVANCED_IDIOMS } from "@/lib/content/c1c2";

export function IdiomsGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {ADVANCED_IDIOMS.map((idiom) => (
        <Card key={idiom.id} className="p-5">
          <p className="text-[15px] font-medium text-ink-1">{idiom.phrase}</p>
          <p className="mt-1.5 text-[13px] text-ink-2">{idiom.meaning}</p>
          <p className="mt-1 text-[12.5px] text-ink-3">{idiom.meaningDe}</p>
          <div className="mt-3 rounded-lg bg-surface-2/60 p-3">
            <Mono className="text-ink-3">example</Mono>
            <p className="mt-1 text-[13px] text-ink-2">&ldquo;{idiom.example}&rdquo;</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
