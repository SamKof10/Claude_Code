"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ArcLamp } from "@/components/product/ArcLamp";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono } from "@/components/ui/Primitives";
import { dayProgressToKelvin, formatPrice, kelvinToCss } from "@/lib/format";
import { fmt, useT } from "@/lib/i18n";
import { MODELS } from "@/lib/products";

export function FinalCta() {
  // Late evening — the state the whole argument has been building towards.
  const [kelvin] = useState(() => dayProgressToKelvin(0.97));
  const t = useT();
  const cheapest = Math.min(...MODELS.map((m) => m.priceCents));
  const glow = kelvinToCss(kelvin);

  return (
    <section
      data-nav-theme="dark"
      className="grain relative overflow-hidden bg-night pt-24 text-paper sm:pt-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(48% 42% at 50% 76%, color-mix(in srgb, ${glow} 26%, transparent), transparent 72%)`,
        }}
      />

      <div className="relative z-[2] mx-auto max-w-[1240px] px-5 text-center sm:px-8">
        <Reveal>
          <Mono className="text-ember">{t.finalCta.stamp}</Mono>
        </Reveal>

        <TextReveal
          as="h2"
          text={t.finalCta.title}
          className="h-section mx-auto mt-6 max-w-[16ch] text-[clamp(2.2rem,1.3rem+4vw,4.4rem)]"
        />

        <Reveal index={1}>
          <p className="mx-auto mt-6 max-w-[48ch] text-[16px] leading-relaxed text-paper/65 sm:text-[17px]">
{t.finalCta.lede}
          </p>
        </Reveal>

        <Reveal index={2}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/produkt" variant="night" size="lg" magnetic shimmer className="w-full sm:w-auto">
              {fmt(t.nav.buyFrom, { price: formatPrice(cheapest) })}
              <ArrowRight size={16} strokeWidth={1.75} />
            </ButtonLink>
            <ButtonLink href="#faq" variant="nightSecondary" size="lg" className="w-full sm:w-auto">
              {t.finalCta.secondary}
            </ButtonLink>
          </div>
          <Mono className="mt-6 block text-paper/40">
{t.common.trust.join(" · ")}
          </Mono>
        </Reveal>

        <Reveal index={3}>
          <div className="mx-auto mt-4 max-w-[620px] sm:mt-8">
            <ArcLamp finishId="graphite" modelId="arc-max" kelvin={kelvin} intensity={0.9} className="w-full" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
