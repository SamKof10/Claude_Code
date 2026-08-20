"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { AccessoryArt } from "@/components/product/AccessoryArt";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono, SectionKicker } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { SpotlightCard } from "@/components/ui/Spotlight";
import { ACCESSORIES, accessorySku, type AccessoryId, type FinishId } from "@/lib/products";
import { FinishSwatches } from "@/components/product/FinishSwatches";
import { formatPrice } from "@/lib/format";
import { fmt, useT } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";

export function Accessories() {
  const [finishes, setFinishes] = useState<Record<AccessoryId, FinishId>>({
    clip: "graphite",
    arch: "graphite",
  });
  const setFinish = (id: AccessoryId, finish: FinishId) =>
    setFinishes((prev) => ({ ...prev, [id]: finish }));
  const t = useT();
  const { add, pendingSku, open } = useCart();
  const { push } = useToast();

  return (
    <section
      id="zubehoer"
      className="relative scroll-mt-20 border-t py-24 sm:py-32"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <SectionKicker index="08" label={t.accessoriesSection.kicker} />
        </Reveal>

        <div className="mt-8 grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <TextReveal
            as="h2"
            text={t.accessoriesSection.title}
            className="h-section max-w-[15ch] text-[clamp(2.2rem,1.4rem+3.4vw,4rem)]"
          />
          <Reveal index={1}>
            <p className="text-[16px] leading-relaxed text-ink-2">
{t.accessoriesSection.lede}
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:gap-5 lg:grid-cols-2">
          {ACCESSORIES.map((accessory, index) => {
            const finishId = finishes[accessory.id];
            const sku = accessorySku(accessory.id, finishId);
            const isPending = pendingSku === sku;
            return (
              <Reveal key={accessory.id} index={index}>
                <SpotlightCard
                  className="flex h-full flex-col overflow-hidden rounded-2xl border transition-shadow duration-500 hover:shadow-[0_28px_60px_-42px_rgba(19,18,17,0.6)]"
                  glow="color-mix(in srgb, var(--color-ember) 13%, transparent)"
                >
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl border"
                    style={{ borderColor: "var(--line)" }}
                    aria-hidden
                  />

                  <div
                    className="relative z-[2] px-6 pt-8 pb-4 sm:px-10 sm:pt-10"
                    style={{ background: "var(--color-paper-2)" }}
                  >
                    <AccessoryArt
                      accessoryId={accessory.id}
                      finishId={finishId}
                      kelvin={3200}
                      intensity={0.8}
                      className="w-full"
                    />
                  </div>

                  <div
                    className="relative z-[2] flex flex-1 flex-col border-t p-6 sm:p-8"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <h3 className="text-[21px] font-medium tracking-[-0.025em]">
                          AUREL {accessory.name}
                        </h3>
                        <Mono className="mt-1.5 block text-ink-3">{t.accessories[accessory.id].title}</Mono>
                      </div>
                      <span className="shrink-0 text-[19px] tabular-nums">
                        {formatPrice(accessory.priceCents)}
                      </span>
                    </div>

                    <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
{t.accessories[accessory.id].summary}
                    </p>

                    <ul className="mt-5 space-y-2">
                      {t.accessories[accessory.id].bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 text-[13.5px] text-ink-2">
                          <Check size={13} strokeWidth={2} className="mt-1 shrink-0 text-ember-deep" />
                          {b}
                        </li>
                      ))}
                    </ul>

                    <dl
                      className="mt-6 grid gap-x-6 gap-y-2 border-t pt-5 sm:grid-cols-2"
                      style={{ borderColor: "var(--line)" }}
                    >
                      {t.accessories[accessory.id].specs.slice(0, 4).map((spec) => (
                        <div key={spec.label} className="flex items-baseline justify-between gap-3">
                          <dt className="mono-label text-ink-3">{spec.label}</dt>
                          <dd className="text-right text-[12.5px] text-ink-2">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-auto pt-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Mono className="text-ink-3">
                          {fmt(t.product.finishWith, { finish: t.finishes[finishId].name })}
                        </Mono>
                        <FinishSwatches
                          value={finishId}
                          onChange={(f) => setFinish(accessory.id, f)}
                          label={`AUREL ${accessory.name} — ${t.common.finishLabel}`}
                          size="sm"
                        />
                      </div>
                      <Mono className="mt-3 block text-ink-3">{sku}</Mono>
                      <Button
                        size="lg"
                        className="mt-3 w-full"
                        busy={isPending}
                        onClick={(e) => {
                          add(sku, 1, e.currentTarget);
                          push(fmt(t.toast.added, { name: `AUREL ${accessory.name}` }), `${t.accessories[accessory.id].title} · ${t.finishes[finishId].name}`);
                          setTimeout(open, 560);
                        }}
                      >
                        {isPending ? (
                          <motion.span
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-2"
                          >
                            <Check size={15} strokeWidth={2.5} />
                            {t.common.added}
                          </motion.span>
                        ) : (
                          fmt(t.product.addWithPrice, { price: formatPrice(accessory.priceCents) })
                        )}
                      </Button>
                    </div>
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
