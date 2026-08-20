"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ProductViewer } from "@/components/product/ProductViewer";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono, SectionKicker } from "@/components/ui/Primitives";
import { FINISHES, MODELS, type FinishId } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { fmt, useT } from "@/lib/i18n";

export function ProductReveal() {
  const [finishId, setFinishId] = useState<FinishId>("graphite");
  const t = useT();

  return (
    <section id="produkt" className="relative scroll-mt-20 py-24 sm:py-32">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <SectionKicker index="03" label={t.productReveal.kicker} />
        </Reveal>

        <div className="mt-8 grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <TextReveal
            as="h2"
            text={t.productReveal.title}
            className="h-section max-w-[15ch] text-[clamp(2.2rem,1.4rem+3.4vw,4rem)]"
          />
          <Reveal index={1}>
            <p className="text-[16px] leading-relaxed text-ink-2">
{t.productReveal.lede}
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          <Reveal>
            <ProductViewer finishId={finishId} modelId="arc-max" onFinishChange={setFinishId} />
          </Reveal>

          <div className="lg:pt-4">
            <Reveal index={1}>
              <Mono className="text-ink-3">{t.productReveal.currentFinish}</Mono>
              <h3 className="mt-2 text-[26px] font-medium tracking-[-0.03em]">{t.finishes[finishId].name}</h3>
              <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-ink-2">
{t.finishes[finishId].note}
              </p>
            </Reveal>

            <div className="mt-9 grid gap-px" style={{ background: "var(--line)" }}>
              {MODELS.map((model) => (
                <Reveal key={model.id} index={2}>
                  <div className="bg-paper py-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <h4 className="text-[18px] font-medium tracking-[-0.02em]">
                        AUREL {model.name}
                      </h4>
                      <span className="text-[17px] tabular-nums">
                        {formatPrice(model.priceCents)}
                      </span>
                    </div>
                    <p className="mt-1 text-[13.5px] text-ink-3">{t.models[model.id].tagline}</p>
                    <ul className="mt-3.5 space-y-1.5">
                      {t.models[model.id].highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2.5 text-[13.5px] text-ink-2">
                          <Check size={13} strokeWidth={2} className="shrink-0 text-ember-deep" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal index={3}>
              <Link
                href={`/produkt?oberflaeche=${finishId}`}
                className="group mt-8 inline-flex h-13 min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-ink px-7 text-[15px] font-medium text-paper transition-[transform,background-color] duration-200 hover:bg-black active:scale-[0.985] sm:w-auto"
              >
                {t.productReveal.configure}
                <ArrowRight
                  size={16}
                  strokeWidth={1.75}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <p className="mono-label mt-4 text-ink-3">
{fmt(t.productReveal.summary, { finishes: FINISHES.length })}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
