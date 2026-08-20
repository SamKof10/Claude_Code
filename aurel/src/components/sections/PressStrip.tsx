"use client";

import { useT } from "@/lib/i18n";
import { Marquee } from "@/components/ui/Marquee";
import { Mono } from "@/components/ui/Primitives";

export function PressStrip() {
  const t = useT();

  return (
    <section
      className="border-y py-6"
      style={{ borderColor: "var(--line)", background: "var(--color-paper-2)" }}
      aria-label={t.faqSection.kicker}
    >
      <Marquee duration={54} fadeColor="var(--color-paper-2)">
        {t.press.map((item) => (
          <div key={item.outlet} className="flex items-center gap-4 px-7 sm:gap-5 sm:px-9">
            <Mono className="shrink-0 text-ink">{item.outlet}</Mono>
            <span className="h-3 w-px shrink-0" style={{ background: "var(--line-strong)" }} />
            <span className="text-[14px] whitespace-nowrap text-ink-2 italic">
              “{item.quote}”
            </span>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
