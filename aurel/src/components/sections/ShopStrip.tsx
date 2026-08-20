"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, Plus } from "lucide-react";
import Link from "next/link";
import { AccessoryArt } from "@/components/product/AccessoryArt";
import { Reveal } from "@/components/ui/Reveal";
import { Mono, SectionKicker } from "@/components/ui/Primitives";
import { ACCESSORIES, accessorySku, type AccessoryId, type FinishId } from "@/lib/products";
import { FinishSwatches } from "@/components/product/FinishSwatches";
import { formatPrice } from "@/lib/format";
import { fmt, useT } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";

/**
 * Accessories within reach of the first screen: the full section further
 * down still makes the case, this is for people who already know.
 */
export function ShopStrip() {
  const [finishes, setFinishes] = useState<Record<AccessoryId, FinishId>>({
    clip: "graphite",
    arch: "graphite",
  });
  const setFinish = (id: AccessoryId, finish: FinishId) =>
    setFinishes((prev) => ({ ...prev, [id]: finish }));
  const { add, pendingSku } = useCart();
  const { push } = useToast();
  const t = useT();

  return (
    <section
      className="relative border-t py-14 sm:py-16"
      style={{ borderColor: "var(--line)", background: "var(--color-paper-2)" }}
      aria-label={t.shop.title}
    >
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div>
          <Reveal>
            <SectionKicker index="—" label={t.shop.kicker} />
          </Reveal>
          <Reveal index={1}>
            <h2 className="h-section mt-4 max-w-[18ch] text-[clamp(1.5rem,1.2rem+1.4vw,2.2rem)]">
              {t.shop.title}
            </h2>
            <p className="mt-3 max-w-[52ch] text-[14.5px] leading-relaxed text-ink-2">
              {t.shop.lede}
            </p>
          </Reveal>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {ACCESSORIES.map((accessory, i) => {
            const finishId = finishes[accessory.id];
            const sku = accessorySku(accessory.id, finishId);
            const isPending = pendingSku === sku;
            return (
              <Reveal key={accessory.id} index={i}>
                <li
                  className="flex items-center gap-4 rounded-2xl border bg-paper p-4 transition-shadow duration-400 hover:shadow-[0_18px_40px_-32px_rgba(19,18,17,0.6)] sm:p-5"
                  style={{ borderColor: "var(--line)" }}
                >
                  <span
                    className="grid h-[74px] w-[74px] shrink-0 place-items-center overflow-hidden rounded-xl"
                    style={{ background: "var(--color-paper-2)" }}
                  >
                    <AccessoryArt
                      accessoryId={accessory.id}
                      finishId={finishId}
                      showLight={false}
                      intensity={0.4}
                      className="w-full"
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15.5px] font-medium">
                      AUREL {accessory.name}
                    </span>
                    <Mono className="mt-1 block truncate text-ink-3">
                      {t.accessories[accessory.id].title}
                    </Mono>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[14px] tabular-nums">
                        {formatPrice(accessory.priceCents)}
                      </span>
                      <FinishSwatches
                        value={finishId}
                        onChange={(f) => setFinish(accessory.id, f)}
                        label={`AUREL ${accessory.name} — ${t.common.finishLabel}`}
                        size="sm"
                        offset="ring-offset-[var(--color-paper)]"
                        className="-ml-1"
                      />
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      add(sku, 1, e.currentTarget);
                      push(
                        fmt(t.toast.added, { name: `AUREL ${accessory.name}` }),
                        `${t.accessories[accessory.id].title} · ${t.finishes[finishId].name}`,
                      );
                    }}
                    aria-label={fmt(t.accessoriesSection.addAria, { name: accessory.name })}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full border transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)]"
                    style={{ borderColor: "var(--line-strong)" }}
                  >
                    {isPending ? (
                      <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                        <Check size={16} strokeWidth={2.5} className="text-ember-deep" />
                      </motion.span>
                    ) : (
                      <Plus size={16} strokeWidth={2} />
                    )}
                  </button>
                </li>
              </Reveal>
            );
          })}
        </ul>

        <Reveal index={2}>
          <Link
            href="#zubehoer"
            className="group mt-6 inline-flex items-center gap-2 text-[13.5px] text-ink-2 transition-colors duration-200 hover:text-ink"
          >
            {t.shop.seeAll}
            <ArrowRight
              size={14}
              strokeWidth={1.75}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
