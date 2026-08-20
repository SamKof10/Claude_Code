import { Card, Mono } from "@/components/ui/Primitives";
import type { FalseFriend } from "@/lib/content/vocabulary";

export function FalseFriendCard({ item }: { item: FalseFriend }) {
  return (
    <Card className="p-5">
      <div className="flex items-baseline gap-2">
        <span className="text-[16px] font-medium text-ink-1">{item.german}</span>
        <span className="text-[12.5px] text-ink-3">looks like &ldquo;{item.looksLikeEnglish}&rdquo;</span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-coral">{item.trap}</p>
      <div className="mt-3 flex flex-col gap-1.5 text-[13px]">
        <p className="text-ink-3">{item.wrongExample}</p>
        <p className="text-mint">{item.rightExample}</p>
      </div>
      <div className="mt-3 rounded-lg bg-surface-2/60 p-3">
        <Mono className="text-ink-3">correct translation</Mono>
        <p className="mt-1 text-[13.5px] font-medium text-ink-1">{item.correctTranslation}</p>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-3">{item.englishWordActuallyMeans}</p>
    </Card>
  );
}
