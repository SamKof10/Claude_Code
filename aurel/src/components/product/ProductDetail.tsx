"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Check, Minus, Plus, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { ProductViewer } from "./ProductViewer";
import { Hotspots } from "./Hotspots";
import { SpecsTable } from "./SpecsTable";
import { AccessoryUpsell } from "./AccessoryUpsell";
import { Button } from "@/components/ui/Button";
import { Badge, Mono, Stars } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { REVIEW_STATS } from "@/lib/reviews";
import { fmt, useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import {
  FINISHES,
  MODELS,
  getModel,
  getVariant,
  type FinishId,
  type ModelId,
} from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/components/ui/cn";

const DELIVERY = [{ icon: Truck }, { icon: RotateCcw }, { icon: ShieldCheck }];

interface ProductDetailProps {
  initialModel: ModelId;
  initialFinish: FinishId;
}

export function ProductDetail({ initialModel, initialFinish }: ProductDetailProps) {
  const [modelId, setModelId] = useState<ModelId>(initialModel);
  const [finishId, setFinishId] = useState<FinishId>(initialFinish);
  const [quantity, setQuantity] = useState(1);
  const { t, locale } = useI18n();
  const router = useRouter();
  const { add, pendingSku, open } = useCart();
  const { push } = useToast();

  const model = getModel(modelId);
  const finishName = t.finishes[finishId].name;
  const variant = useMemo(() => getVariant(modelId, finishId), [modelId, finishId]);
  const isPending = pendingSku === variant.sku;

  const handleAdd = (thenOpen: boolean, origin?: HTMLElement | null) => {
    add(variant.sku, quantity, origin);
    push(
      fmt(t.toast.added, { name: `AUREL ${model.name} · ${finishName}` }),
      `${quantity} × ${formatPrice(variant.priceCents)}`,
    );
    if (thenOpen) setTimeout(open, 560);
  };

  return (
    <>
      <section className="pt-28 pb-16 sm:pt-32">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
            {/* ── visual column ──────────────────────────────────────── */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
              <ProductViewer finishId={finishId} modelId={modelId} onFinishChange={setFinishId} />
            </div>

            {/* ── purchase column ────────────────────────────────────── */}
            <div>
              <Badge>
                <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                {variant.inStock ? t.common.inStock : t.common.restock}
              </Badge>

              <h1 className="display mt-5 text-[clamp(2.2rem,1.6rem+2.2vw,3.2rem)]">
                AUREL {model.name}
              </h1>
              <p className="mt-3 max-w-[42ch] text-[16px] leading-relaxed text-ink-2">
                {fmt(t.product.subtitle, {
                  tagline: t.models[modelId].tagline,
                  coverage: t.models[modelId].coverage,
                  lumens: model.lumens.toLocaleString(locale === "de" ? "de-DE" : "en-GB"),
                })}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="text-[28px] leading-none font-medium tracking-[-0.03em] tabular-nums">
                  {formatPrice(variant.priceCents)}
                </span>
                <span className="flex items-center gap-2">
                  <Stars rating={REVIEW_STATS.average} size={13} />
                  <span className="text-[13px] text-ink-2">
                    {fmt(t.product.reviewsShort, {
                      rating: REVIEW_STATS.average.toLocaleString(locale === "de" ? "de-DE" : "en-GB", {
                        minimumFractionDigits: 1,
                      }),
                      count: REVIEW_STATS.count.toLocaleString(locale === "de" ? "de-DE" : "en-GB"),
                    })}
                  </span>
                </span>
              </div>
              <Mono className="mt-2 block text-ink-3">
{fmt(t.product.priceNote, { sku: variant.sku })}
              </Mono>

              {/* length */}
              <fieldset className="mt-8">
                <legend className="mono-label mb-3 text-ink-3">{t.product.length}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setModelId(m.id)}
                      aria-pressed={modelId === m.id}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-[border-color,background-color] duration-200",
                        modelId === m.id
                          ? "border-ink bg-[color-mix(in_srgb,var(--color-ink)_4%,transparent)]"
                          : "hover:border-[var(--line-strong)]",
                      )}
                      style={modelId === m.id ? undefined : { borderColor: "var(--line)" }}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-[15px] font-medium">{m.name}</span>
                        <span className="text-[14px] tabular-nums">{formatPrice(m.priceCents)}</span>
                      </span>
                      <Mono className="mt-1.5 block text-ink-3">{t.models[m.id].highlights[0]}</Mono>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* finish */}
              <fieldset className="mt-7">
                <legend className="mono-label mb-3 text-ink-3">
{fmt(t.product.finishWith, { finish: "" })}<span className="text-ink-2">{finishName}</span>
                </legend>
                <div className="flex flex-wrap gap-3">
                  {FINISHES.map((f) => {
                    const v = getVariant(modelId, f.id);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFinishId(f.id)}
                        aria-pressed={finishId === f.id}
                        className={cn(
                          "flex min-h-[48px] items-center gap-2.5 rounded-full border py-2 pr-4 pl-2 transition-[border-color] duration-200",
                          finishId === f.id ? "border-ink" : "hover:border-[var(--line-strong)]",
                          !v.inStock && "opacity-55",
                        )}
                        style={finishId === f.id ? undefined : { borderColor: "var(--line)" }}
                      >
                        <span
                          className="h-7 w-7 rounded-full border"
                          style={{ background: f.swatch, borderColor: "var(--line-strong)" }}
                        />
                        <span className="text-[13.5px]">{t.finishes[f.id].name}</span>
                      </button>
                    );
                  })}
                </div>
                {!variant.inStock ? (
                  <p className="mt-3 text-[13px] text-ember-deep">
{fmt(t.product.outOfStock, { finish: finishName, model: model.name, leadTime: t.common.restock })}
                  </p>
                ) : null}
              </fieldset>

              {/* quantity + buy */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div
                  className="inline-flex items-center rounded-full border"
                  style={{ borderColor: "var(--line-strong)" }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label={t.cart.decrease}
                    disabled={quantity <= 1}
                    className="grid h-12 w-12 place-items-center rounded-full transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)] disabled:opacity-30"
                  >
                    <Minus size={14} strokeWidth={2} />
                  </button>
                  <span className="w-8 text-center text-[15px] tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(6, q + 1))}
                    aria-label={t.cart.increase}
                    disabled={quantity >= 6}
                    className="grid h-12 w-12 place-items-center rounded-full transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)] disabled:opacity-30"
                  >
                    <Plus size={14} strokeWidth={2} />
                  </button>
                </div>

                <Button
                  size="lg"
                  shimmer
                  className="min-w-[200px] flex-1"
                  disabled={!variant.inStock}
                  busy={isPending}
                  onClick={(e) => handleAdd(true, e.currentTarget)}
                >
                  {isPending ? (
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Check size={16} strokeWidth={2.5} />
                      {t.common.added}
                    </motion.span>
                  ) : (
                    fmt(t.product.addWithPrice, { price: formatPrice(variant.priceCents * quantity) })
                  )}
                </Button>
              </div>

              <Button
                variant="secondary"
                size="lg"
                className="mt-3 w-full"
                disabled={!variant.inStock}
                onClick={(e) => {
                  handleAdd(false, e.currentTarget);
                  setTimeout(() => router.push("/checkout"), 520);
                }}
              >
                {t.product.buyNow}
              </Button>

              <AccessoryUpsell finishId={finishId} />

              {/* delivery */}
              <ul className="mt-9 grid gap-px" style={{ background: "var(--line)" }}>
                {DELIVERY.map((d, i) => {
                  const copy = t.product.delivery[i];
                  const Icon = d.icon;
                  return (
                    <li key={copy.title} className="flex items-start gap-3.5 bg-paper py-4">
                      <Icon size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ember-deep" />
                      <div>
                        <p className="text-[14px] font-medium">{copy.title}</p>
                        <p className="mt-0.5 text-[13px] text-ink-3">{copy.note}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── description + hotspots ───────────────────────────────────── */}
      <section className="border-t py-20 sm:py-24" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <Hotspots finishId={finishId} />
            </Reveal>

            <div className="lg:pt-4">
              <Reveal index={1}>
                <Mono className="text-ember-deep">{t.product.descriptionKicker}</Mono>
                <h2 className="h-section mt-4 text-[clamp(1.8rem,1.3rem+1.8vw,2.6rem)]">
{t.product.descriptionTitle}
                </h2>
                <div className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-ink-2">
                  {t.product.description.map((para) => (
                    <p key={para.slice(0, 24)}>{para}</p>
                  ))}
                </div>
              </Reveal>

              <Reveal index={2}>
                <h3 id="daten" className="mt-12 scroll-mt-24 text-[18px] font-medium tracking-[-0.02em]">
{t.product.specsTitle}
                </h3>
                <div className="mt-4">
                  <SpecsTable />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
