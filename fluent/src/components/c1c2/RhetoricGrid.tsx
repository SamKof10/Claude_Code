import { Card, Mono } from "@/components/ui/Primitives";
import { RHETORICAL_DEVICES } from "@/lib/content/c1c2";

export function RhetoricGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {RHETORICAL_DEVICES.map((d) => (
        <Card key={d.id} className="p-5">
          <p className="text-[15px] font-medium text-ink-1">{d.name}</p>
          <p className="mt-1.5 text-[13px] text-ink-2">{d.description}</p>
          <div className="mt-3 rounded-lg bg-surface-2/60 p-3">
            <Mono className="text-ink-3">example</Mono>
            <p className="mt-1 text-[13px] text-ink-2">&ldquo;{d.example}&rdquo;</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
