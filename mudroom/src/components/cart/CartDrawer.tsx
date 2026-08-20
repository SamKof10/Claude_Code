"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { describeSpec } from "@/lib/labels";
import { formatPrice } from "@/lib/products";
import { BoxThumb } from "@/components/product/BoxThumb";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Mono } from "@/components/ui/Primitives";
import { useEscape, useFocusTrap, useScrollLock } from "@/hooks";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CartDrawer() {
  const { isOpen, close, lines, totals, setQuantity, remove } = useCart();
  useScrollLock(isOpen);
  useEscape(isOpen, close);
  const panelRef = useFocusTrap<HTMLDivElement>(isOpen);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={close}
            className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-[2px]"
          />
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.42, ease: EASE }}
            className="fixed inset-y-0 right-0 z-[75] flex w-full max-w-[440px] flex-col border-l border-[var(--edge)] bg-steel"
          >
            <header className="flex items-center justify-between border-b border-[var(--edge)] px-5 py-4">
              <div className="flex items-baseline gap-3">
                <Mono className="text-concrete/45">Your cart</Mono>
                <span className="tnum mono text-hivis">
                  {String(totals.itemCount).padStart(2, "0")}
                </span>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close cart"
                className="flex h-11 w-11 items-center justify-center rounded-[3px] text-concrete/60 transition-colors hover:text-hivis"
              >
                <X className="h-5 w-5" strokeWidth={1.7} />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--edge)]">
                  <ShoppingCart className="h-6 w-6 text-concrete/30" strokeWidth={1.4} />
                </div>
                <div>
                  <p className="display text-xl">Nothing in here yet</p>
                  <p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-concrete/45">
                    Configure a box and it lands here. Renting for an event instead?
                    That runs through a quote.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <ButtonLink href="#buy" size="sm" onClick={close}>
                    Configure a box
                  </ButtonLink>
                  <ButtonLink href="#rent" size="sm" variant="outline" onClick={close}>
                    Rent for an event
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5">
                  <ul className="divide-y divide-[var(--edge)]">
                    {lines.map((line) => {
                      const d = describeSpec(line.spec);
                      return (
                        <li key={line.sku} className="flex gap-4 py-5">
                          <div className="h-14 w-16 shrink-0 overflow-hidden rounded-[3px] border border-[var(--edge)]">
                            <BoxThumb shell={line.spec.shell} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold tracking-tight">{d.title}</p>
                                <p className="mt-1 text-xs leading-relaxed text-concrete/40">
                                  {d.details.join(" · ")}
                                </p>
                              </div>
                              <span className="tnum shrink-0 text-sm font-medium">
                                {formatPrice(line.unitPriceCents * line.quantity)}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                              <div className="flex items-center rounded-[3px] border border-[var(--edge)]">
                                <button
                                  type="button"
                                  onClick={() => setQuantity(line.sku, line.quantity - 1)}
                                  aria-label="Reduce quantity"
                                  className="flex h-9 w-9 items-center justify-center text-concrete/60 transition-colors hover:text-hivis"
                                >
                                  <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                                </button>
                                <span className="tnum mono w-7 text-center text-concrete">
                                  {line.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setQuantity(line.sku, line.quantity + 1)}
                                  aria-label="Increase quantity"
                                  className="flex h-9 w-9 items-center justify-center text-concrete/60 transition-colors hover:text-hivis"
                                >
                                  <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(line.sku)}
                                className="mono flex items-center gap-1.5 text-concrete/35 transition-colors hover:text-[#ff8f6b]"
                              >
                                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.7} />
                                Remove
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <footer className="border-t border-[var(--edge)] px-5 py-5">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-concrete/45">Subtotal</dt>
                      <dd className="tnum">{formatPrice(totals.subtotalCents)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-concrete/45">Freight</dt>
                      <dd className="tnum">{formatPrice(totals.shippingCents)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-[var(--edge)] pt-3">
                      <dt className="display text-lg">Total</dt>
                      <dd className="tnum display text-lg">{formatPrice(totals.totalCents)}</dd>
                    </div>
                  </dl>
                  <p className="mono mt-2 !normal-case !tracking-[0.06em] text-concrete/30">
                    Incl. {formatPrice(totals.vatCents)} VAT · delivered 6–10 weeks
                  </p>
                  <Link href="/checkout" onClick={close} className="mt-4 block">
                    <Button full size="lg" tabIndex={-1}>
                      Checkout
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={close}
                    className="mono mt-3 w-full py-2 text-concrete/35 transition-colors hover:text-concrete"
                  >
                    Keep configuring
                  </button>
                </footer>
              </>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
