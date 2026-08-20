"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Plus, ShoppingCart } from "lucide-react";
import {
  CONFIGURATIONS,
  EXTRAS,
  INSTALLS,
  SHELLS,
  WARRANTY_EXTENSION_CENTS,
  SHIPPING_CENTS,
  boxSku,
  extraIsIncluded,
  formatPrice,
  getConfiguration,
  getShell,
  specPriceCents,
  type ConfigId,
  type InstallId,
  type OptionId,
  type ShellId,
} from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";
import { WashScene } from "@/components/product/WashScene";
import { Button } from "@/components/ui/Button";
import { ChoiceCard } from "@/components/ui/Field";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { DemoNote, Mono, Section, SectionMarker } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";

export function BuySection() {
  const [config, setConfig] = useState<ConfigId>("pro");
  const [shell, setShell] = useState<ShellId>("graphite");
  const [extras, setExtras] = useState<OptionId[]>([]);
  const [install, setInstall] = useState<InstallId>("guided");
  const [warranty, setWarranty] = useState(false);

  const { add, pendingSku, open } = useCart();
  const { push } = useToast();
  const artRef = useRef<HTMLDivElement>(null);

  const spec = useMemo(
    () => ({ config, shell, extras, install, warrantyExtension: warranty }),
    [config, shell, extras, install, warranty],
  );
  const sku = boxSku(spec);
  const unit = specPriceCents(spec);
  const configuration = getConfiguration(config);
  const pending = pendingSku === sku;

  function toggleExtra(id: OptionId) {
    setExtras((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function addToCart() {
    add(sku, 1, artRef.current);
    push(`${configuration.name} added`);
  }

  return (
    <Section id="buy" tone="dark">
      <SectionMarker number="07" label="Buy" />
      <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end">
        <TextReveal text="Own the wash." className="h-section text-[clamp(2.1rem,5.6vw,4rem)]" />
        <Reveal>
          <p className="lede text-concrete/50">
            Configure the machine, see the price move, put it in the cart. No
            enquiry form standing between you and a number.
          </p>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        {/* ── the machine ──────────────────────────────────────────── */}
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <div
            ref={artRef}
            className="overflow-hidden rounded-[6px] border border-[var(--edge)] bg-[#0a0c0d] p-4 sm:p-6"
          >
            <WashScene progress={0.02} bikeless shell={getShell(shell).hex} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Mono className="text-concrete/40">Finish</Mono>
            <div className="flex gap-2">
              {SHELLS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShell(s.id)}
                  aria-label={s.name}
                  aria-pressed={shell === s.id}
                  title={s.name}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-[3px] border transition-colors",
                    shell === s.id ? "border-hivis" : "border-[var(--edge)] hover:border-[var(--edge-strong)]",
                  )}
                >
                  <span
                    className="h-6 w-6 rounded-[2px] ring-1 ring-inset ring-black/30"
                    style={{ background: s.hex }}
                  />
                </button>
              ))}
            </div>
            <span className="text-sm text-concrete/45">
              {getShell(shell).name} — {getShell(shell).note}
            </span>
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {configuration.includes.map((line) => (
              <li key={line} className="flex items-start gap-2 text-[13px] leading-relaxed text-concrete/50">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-hivis" strokeWidth={2.4} />
                {line}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* ── the configurator ─────────────────────────────────────── */}
        <Reveal index={1}>
          <fieldset>
            <legend className="mono text-concrete/40">Configuration</legend>
            <div className="mt-3 grid gap-2">
              {CONFIGURATIONS.map((c) => (
                <ChoiceCard
                  key={c.id}
                  selected={config === c.id}
                  onSelect={() => setConfig(c.id)}
                  title={`MUDROOM ${c.name}`}
                  meta={formatPrice(c.priceCents)}
                  blurb={`${c.strap} — ${c.bestFor}.`}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="mono text-concrete/40">Options</legend>
            <div className="mt-3 grid gap-2">
              {EXTRAS.map((extra) => {
                const included = extraIsIncluded(extra.id, config);
                const checked = included || extras.includes(extra.id);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => !included && toggleExtra(extra.id)}
                    aria-pressed={checked}
                    disabled={included}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-[4px] border p-4 text-left transition-colors duration-200",
                      checked
                        ? "border-hivis/60 bg-hivis/[0.05]"
                        : "border-[var(--edge)] bg-steel-2/40 hover:border-[var(--edge-strong)]",
                      included && "opacity-60",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border transition-colors",
                        checked ? "border-hivis bg-hivis text-steel" : "border-[var(--edge-strong)]",
                      )}
                    >
                      {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-semibold tracking-tight">{extra.name}</span>
                        <span className="tnum mono shrink-0 text-concrete/55">
                          {included ? "Included" : `+ ${formatPrice(extra.priceCents)}`}
                        </span>
                      </span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-concrete/45">
                        {extra.blurb}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="mono text-concrete/40">Installation</legend>
            <div className="mt-3 grid gap-2">
              {INSTALLS.map((i) => (
                <ChoiceCard
                  key={i.id}
                  selected={install === i.id}
                  onSelect={() => setInstall(i.id)}
                  title={i.name}
                  meta={i.priceCents === 0 ? "Included" : `+ ${formatPrice(i.priceCents)}`}
                  blurb={`${i.blurb} Lead time ${i.lead}.`}
                />
              ))}
            </div>
          </fieldset>

          {config === "core" ? (
            <button
              type="button"
              onClick={() => setWarranty((v) => !v)}
              aria-pressed={warranty}
              className={cn(
                "mt-8 flex w-full items-center justify-between gap-4 rounded-[4px] border p-4 text-left transition-colors",
                warranty ? "border-hivis/60 bg-hivis/[0.05]" : "border-[var(--edge)] bg-steel-2/40",
              )}
            >
              <span>
                <span className="text-sm font-semibold tracking-tight">Extend warranty to 5 years</span>
                <span className="mt-1 block text-[13px] text-concrete/45">
                  PRO and PARK include this as standard.
                </span>
              </span>
              <span className="tnum mono shrink-0 text-concrete/55">
                + {formatPrice(WARRANTY_EXTENSION_CENTS)}
              </span>
            </button>
          ) : null}

          {/* ── summary ────────────────────────────────────────────── */}
          <div className="mt-8 rounded-[5px] border border-[var(--edge-strong)] bg-steel-2/60 p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <Mono className="text-concrete/40">Your configuration</Mono>
                <p className="display mt-2 text-[clamp(1.8rem,4vw,2.6rem)] tnum">{formatPrice(unit)}</p>
                <p className="mt-1 text-xs text-concrete/40">
                  incl. VAT · + {formatPrice(SHIPPING_CENTS)} freight · from{" "}
                  {formatPrice(Math.round(unit / 48))}/mo over 48 months
                </p>
              </div>
              <Mono className="hidden shrink-0 text-hivis sm:block">
                {INSTALLS.find((i) => i.id === install)?.lead}
              </Mono>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button size="lg" full onClick={addToCart} disabled={pending} icon={<Plus className="h-4 w-4" strokeWidth={2.4} />}>
                {pending ? "Adding…" : "Add to cart"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={open}
                aria-label="Open cart"
                className="sm:w-auto sm:px-5"
                icon={<ShoppingCart className="h-4 w-4" strokeWidth={1.8} />}
              >
                <span className="sm:sr-only">View cart</span>
              </Button>
            </div>

            <DemoNote className="mt-4">
              Demo store — the checkout completes without taking a payment.
            </DemoNote>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
