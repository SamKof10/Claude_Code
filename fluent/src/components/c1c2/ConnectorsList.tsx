import { Card, Mono } from "@/components/ui/Primitives";
import { CONNECTORS, CONNECTOR_GROUPS, type Connector } from "@/lib/content/c1c2";

const ORDER: Connector["function"][] = ["addition", "contrast", "cause-effect", "concession", "emphasis", "example", "conclusion"];

export function ConnectorsList() {
  return (
    <div className="flex flex-col gap-6">
      {ORDER.map((fn) => (
        <div key={fn}>
          <Mono className="text-ink-3">{CONNECTOR_GROUPS[fn]}</Mono>
          <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {CONNECTORS.filter((c) => c.function === fn).map((c) => (
              <Card key={c.id} className="p-4">
                <p className="text-[14px] font-medium text-signal">{c.phrase}</p>
                <p className="mt-1 text-[13px] text-ink-2">&ldquo;{c.example}&rdquo;</p>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
