import { Badge } from "@/components/ui/Primitives";
import type { SrsState } from "@/lib/store";

const CONFIG: Record<SrsState, { label: string; tone: "neutral" | "coral" | "amber" | "mint" }> = {
  new: { label: "new", tone: "neutral" },
  learning: { label: "learning", tone: "coral" },
  familiar: { label: "familiar", tone: "amber" },
  mastered: { label: "mastered", tone: "mint" },
};

export function WordStateBadge({ state }: { state: SrsState }) {
  const cfg = CONFIG[state];
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}

export function vocabState(map: Record<string, { state: SrsState }>, id: string): SrsState {
  return map[id]?.state ?? "new";
}
