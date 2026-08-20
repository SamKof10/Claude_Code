"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useEscape, useFocusTrap, useScrollLock } from "@/hooks";
import { LineThumb } from "./LineThumb";
import { Mono } from "@/components/ui/Primitives";
import { fmt, useT } from "@/lib/i18n";
import { describeLine } from "@/lib/labels";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CartDrawer() {
  const { isOpen, close, lines, totals, setQuantity, remove } = useCart();
  const t = useT();

  useScrollLock(isOpen);
  useEscape(isOpen, close);
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            onClick={close}
            className="fixed inset-0 z-[140] bg-ink/35 backdrop-blur-[3px]"
            aria-hidden
          />

          <motion.aside
            key="drawer"
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.cart.title}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40, mass: 0.9 }}
            className="fixed inset-y-0 right-0 z-[150] flex w-full max-w-[440px] flex-col bg-paper shadow-[-24px_0_60px_-30px_rgba(19,18,17,0.5)]"
          >
            <header
              className="flex h-16 shrink-0 items-center justify-between border-b px-5 sm:px-6"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-[17px] font-medium tracking-[-0.02em]">{t.cart.title}</h2>
<Mono className="text-ink-3">{fmt(t.cart.items, { count: totals.itemCount })}</Mono>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t.cart.close}
                className="-mr-2 grid h-11 w-11 place-items-center rounded-full transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)]"
              >
                <X size={19} strokeWidth={1.6} />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <span
                  className="grid h-14 w-14 place-items-center rounded-full border"
                  style={{ borderColor: "var(--line-strong)" }}
                >
                  <ShoppingBag size={20} strokeWidth={1.4} className="text-ink-3" />
                </span>
                <div>
                  <p className="text-[16px] font-medium">{t.cart.emptyTitle}</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">
{t.cart.emptyBody}
                  </p>
                </div>
                <Link
                  href="/produkt"
                  onClick={close}
                  className="inline-flex h-11 items-center rounded-full bg-ink px-6 text-[14px] font-medium text-paper transition-transform duration-200 active:scale-[0.97]"
                >
                  {t.cart.emptyCta}
                </Link>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6">
                  <ul>
                    <AnimatePresence initial={false}>
                      {lines.map((line) => {
                        const label = describeLine(line, t);
                        return (
                          <motion.li
                            key={line.sku}
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.34, ease: EASE }}
                            className="overflow-hidden border-b"
                            style={{ borderColor: "var(--line)" }}
                          >
                            <div className="flex gap-4 py-5">
                              <div
                                className="grid h-[74px] w-[74px] shrink-0 place-items-center overflow-hidden rounded-lg"
                                style={{ background: "var(--color-paper-2)" }}
                              >
                                <LineThumb line={line} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate text-[14.5px] font-medium">{label.name}</p>
                                    <Mono className="mt-1 block text-ink-3">
                                      {label.subtitle} · {line.sku}
                                    </Mono>
                                  </div>
                                  <p className="shrink-0 text-[14.5px] tabular-nums">
                                    {formatPrice(line.unitPriceCents * line.quantity)}
                                  </p>
                                </div>

                                <div className="mt-3.5 flex items-center justify-between gap-3">
                                  <div
                                    className="inline-flex items-center rounded-full border"
                                    style={{ borderColor: "var(--line-strong)" }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => setQuantity(line.sku, line.quantity - 1)}
                                      aria-label={t.cart.decrease}
                                      className="grid h-9 w-9 place-items-center rounded-full transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)]"
                                    >
                                      <Minus size={13} strokeWidth={2} />
                                    </button>
                                    <span className="w-7 text-center text-[13.5px] tabular-nums">
                                      {line.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setQuantity(line.sku, line.quantity + 1)}
                                      aria-label={t.cart.increase}
                                      disabled={line.quantity >= 6}
                                      className="grid h-9 w-9 place-items-center rounded-full transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)] disabled:opacity-30"
                                    >
                                      <Plus size={13} strokeWidth={2} />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => remove(line.sku)}
                                    className="text-[12.5px] text-ink-3 underline underline-offset-4 transition-colors duration-150 hover:text-ink"
                                  >
                                    {t.cart.remove}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                </div>

                <footer
                  className="shrink-0 border-t px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6"
                  style={{ borderColor: "var(--line)" }}
                >
                  <dl className="space-y-2 text-[14px]">
                    <div className="flex justify-between">
                      <dt className="text-ink-2">{t.cart.subtotal}</dt>
                      <dd className="tabular-nums">{formatPrice(totals.subtotalCents)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="flex items-center gap-1.5 text-ink-2">
                        <Truck size={13} strokeWidth={1.6} />
                        {t.cart.shipping}
                      </dt>
                      <dd className="text-ember-deep">{t.cart.shippingIncluded}</dd>
                    </div>
                    <div
                      className="flex justify-between border-t pt-3 text-[16px] font-medium"
                      style={{ borderColor: "var(--line)" }}
                    >
                      <dt>{t.cart.total}</dt>
                      <dd className="tabular-nums">{formatPrice(totals.totalCents)}</dd>
                    </div>
                  </dl>
                  <p className="mono-label mt-2 text-ink-3">
{fmt(t.cart.vatIncluded, { amount: formatPrice(totals.vatCents) })}
                  </p>

                  <Link
                    href="/checkout"
                    onClick={close}
                    className="mt-4 flex h-13 min-h-[52px] w-full items-center justify-center rounded-full bg-ink text-[15px] font-medium text-paper transition-[transform,background-color] duration-200 hover:bg-black active:scale-[0.985]"
                  >
                    {t.cart.checkout}
                  </Link>
                  <p className="mt-3 text-center text-[12px] text-ink-3">
{t.cart.trial}
                  </p>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
