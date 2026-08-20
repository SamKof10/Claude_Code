"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { ArcLamp } from "@/components/product/ArcLamp";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono, SectionKicker } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { FINISHES, MODELS, getModel, getVariant, type FinishId, type ModelId } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { fmt, useT } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/components/ui/cn";

export function Variants() {
  const [modelId, setModelId] = useState<ModelId>("arc");
  const t = useT();
  const { add, pendingSku, open } = useCart();
  const { push } = useToast();

  return (
    <section
      id="varianten"
      className="relative scroll-mt-20 border-t py-24 sm:py-32"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <SectionKicker index="07" label={t.variants.kicker} />
        </Reveal>

        <div className="mt-8 grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <TextReveal
            as="h2"
            text={t.variants.title}
            className="h-section max-w-[14ch] text-[clamp(2.2rem,1.4rem+3.4vw,4rem)]"
          />
          <Reveal index={1}>
            <p className="text-[16px] leading-relaxed text-ink-2">
{t.variants.lede}
            </p>
          </Reveal>
        </div>

        {/* length toggle */}
        <Reveal>
          <div
            className="mt-12 inline-flex rounded-full border p-1"
            style={{ borderColor: "var(--line-strong)" }}
            role="tablist"
            aria-label={t.variants.chooseModel}
          >
            {MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={modelId === m.id}
                onClick={() => setModelId(m.id)}
                className={cn(
                  "relative min-h-[44px] rounded-full px-6 py-2.5 text-[13.5px] transition-colors duration-200 sm:min-h-0 sm:px-5 sm:py-2",
                  modelId === m.id ? "text-paper" : "text-ink-2 hover:text-ink",
                )}
              >
                {modelId === m.id ? (
                  <motion.span
                    layoutId="variant-tab"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                ) : null}
                <span className="relative z-[2]">{m.name}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:gap-5 lg:grid-cols-3">
          {FINISHES.map((finish, i) => {
            const variant = getVariant(modelId, finish.id as FinishId);
            const isPending = pendingSku === variant.sku;
            return (
              <Reveal key={finish.id} index={i}>
                <div
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border transition-[border-color,box-shadow,transform] duration-400 hover:-translate-y-1 hover:shadow-[0_28px_60px_-40px_rgba(19,18,17,0.6)]"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div
                    className="relative grid place-items-center px-6 pt-10 pb-6"
                    style={{ background: "var(--color-paper-2)" }}
                  >
                    {!variant.inStock ? (
                      <span
                        className="absolute top-4 left-4 rounded-full border px-2.5 py-1 text-[11px] text-ink-2"
                        style={{ borderColor: "var(--line-strong)", background: "var(--color-paper)" }}
                      >
                        {variant.inStock ? t.common.inStock : t.common.restock}
                      </span>
                    ) : null}
                    <ArcLamp
                      finishId={finish.id}
                      modelId={modelId}
                      kelvin={3900}
                      intensity={0.55}
                      className="w-full max-w-[300px] transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[18px] font-medium tracking-[-0.02em]">{t.finishes[finish.id].name}</h3>
                      <span className="text-[17px] tabular-nums">{formatPrice(variant.priceCents)}</span>
                    </div>
                    <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-2">
{t.finishes[finish.id].note}
                    </p>

                    <Mono className="mt-4 block text-ink-3">{variant.sku}</Mono>

                    <Button
                      variant={variant.inStock ? "primary" : "secondary"}
                      size="lg"
                      className="mt-5 w-full"
                      disabled={!variant.inStock}
                      busy={isPending}
                      onClick={(e) => {
                        add(variant.sku, 1, e.currentTarget);
                        push(fmt(t.toast.added, { name: `AUREL ${getModel(modelId).name}` }), t.finishes[finish.id].name);
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
                      ) : variant.inStock ? (
                        t.common.addToCart
                      ) : (
                        t.common.soldOut
                      )}
                    </Button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
