"use client";

import { useT } from "@/lib/i18n";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono, SectionKicker } from "@/components/ui/Primitives";

export function Faq() {
  const t = useT();

  return (
    <section
      id="faq"
      className="relative scroll-mt-20 border-t py-24 sm:py-32"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <SectionKicker index="10" label={t.faqSection.kicker} />
            </Reveal>
            <TextReveal
              as="h2"
              text={t.faqSection.title}
              className="h-section mt-8 max-w-[13ch] text-[clamp(2rem,1.3rem+2.8vw,3.2rem)]"
            />
            <Reveal index={1}>
              <p className="mt-5 max-w-[36ch] text-[15px] leading-relaxed text-ink-2">
{t.faqSection.lede}
              </p>
              <Mono className="mt-6 block text-ink-3">{t.faqSection.contact}</Mono>
            </Reveal>
          </div>

          <Reveal index={1}>
            <Accordion items={t.faq} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
