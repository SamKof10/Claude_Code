"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { useCart } from "@/lib/cart";
import { describeSpec } from "@/lib/labels";
import { formatPrice, getInstall } from "@/lib/products";
import {
  getPaymentProvider,
  type OrderCustomer,
  type OrderDelivery,
  type PaymentResult,
} from "@/lib/payments";
import { BoxThumb } from "@/components/product/BoxThumb";
import { WashScene } from "@/components/product/WashScene";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, SelectField, TextAreaField, ChoiceCard } from "@/components/ui/Field";
import { Mono, Seam } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";

const STEPS = ["Customer", "Delivery", "Payment", "Review", "Done"] as const;

const COUNTRIES = [
  "Germany", "Austria", "Switzerland", "France", "Italy", "Spain", "Netherlands",
  "Belgium", "Denmark", "Sweden", "Norway", "Finland", "Poland", "Czechia",
  "United Kingdom", "Ireland", "Portugal", "Slovenia",
];

type Errors = Record<string, string>;

const emptyCustomer: OrderCustomer = { firstName: "", lastName: "", email: "", phone: "", company: "" };
const emptyDelivery: OrderDelivery = {
  address: "", postalCode: "", city: "", country: "Germany", option: "kerb", notes: "",
};

function formatCard(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function Checkout() {
  const { lines, totals, clear } = useCart();
  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<OrderCustomer>(emptyCustomer);
  const [delivery, setDelivery] = useState<OrderDelivery>(emptyDelivery);
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", holder: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);

  /* The cart is cleared on success, so the summary is frozen first —
     otherwise the confirmation would render an empty order. */
  const [placed, setPlaced] = useState<{ lines: typeof lines; totals: typeof totals } | null>(null);
  const summary = placed ?? { lines, totals };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const empty = lines.length === 0 && !result;

  function validate(which: number): Errors {
    const e: Errors = {};
    if (which === 0) {
      if (!customer.firstName.trim()) e.firstName = "Required";
      if (!customer.lastName.trim()) e.lastName = "Required";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) e.email = "Check this";
      if (customer.phone.replace(/\D/g, "").length < 6) e.phone = "Check this";
    }
    if (which === 1) {
      if (!delivery.address.trim()) e.address = "Required";
      if (!/^\d{4,6}$/.test(delivery.postalCode.trim())) e.postalCode = "4–6 digits";
      if (!delivery.city.trim()) e.city = "Required";
    }
    if (which === 2) {
      if (card.number.replace(/\D/g, "").length !== 16) e.number = "16 digits";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = "MM/YY";
      if (!/^\d{3,4}$/.test(card.cvc)) e.cvc = "3–4 digits";
      if (!card.holder.trim()) e.holder = "Required";
    }
    if (which === 3 && !terms) e.terms = "Please confirm";
    return e;
  }

  function next() {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => s + 1);
  }

  async function pay() {
    const e = validate(3);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setBusy(true);
    setFailed(null);
    try {
      const res = await getPaymentProvider().confirm({
        lines,
        totals: {
          subtotalCents: totals.subtotalCents,
          shippingCents: totals.shippingCents,
          totalCents: totals.totalCents,
        },
        customer,
        delivery,
      });
      setPlaced({ lines, totals });
      setResult(res);
      setStep(4);
      clear();
    } catch (err) {
      setFailed(err instanceof Error ? err.message : "Payment could not be completed");
    } finally {
      setBusy(false);
    }
  }

  const lead = useMemo(() => {
    if (!result) return null;
    return `${result.leadWeeks[0]}–${result.leadWeeks[1]} weeks`;
  }, [result]);

  if (empty) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-[1180px] flex-col items-center justify-center px-5 text-center">
        <Mono className="text-concrete/35">Checkout</Mono>
        <h1 className="display mt-4 text-[clamp(2rem,5vw,3rem)]">Your cart is empty</h1>
        <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-concrete/45">
          Configure a box first — it takes about a minute, and the price updates
          as you go.
        </p>
        <ButtonLink href="/#buy" size="lg" className="mt-8">
          Configure a box
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-28 sm:px-8">
      {/* step rail */}
      <ol className="no-scrollbar flex gap-1 overflow-x-auto">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={cn(
                  "mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                  done && "border-hivis bg-hivis text-steel",
                  active && !done && "border-hivis text-hivis",
                  !done && !active && "border-[var(--edge)] text-concrete/30",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "mono hidden truncate sm:inline",
                  active ? "text-concrete" : "text-concrete/30",
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 ? (
                <span className={cn("h-px flex-1", done ? "bg-hivis/60" : "bg-[var(--edge)]")} />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 ? (
                <section>
                  <Mono className="text-hivis">01 · Customer</Mono>
                  <h1 className="display mt-3 text-[clamp(1.8rem,4vw,2.6rem)]">Who is it for?</h1>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Field
                      label="First name"
                      value={customer.firstName}
                      error={errors.firstName}
                      autoComplete="given-name"
                      onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                    />
                    <Field
                      label="Last name"
                      value={customer.lastName}
                      error={errors.lastName}
                      autoComplete="family-name"
                      onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                    />
                    <Field
                      label="Email"
                      type="email"
                      inputMode="email"
                      value={customer.email}
                      error={errors.email}
                      autoComplete="email"
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    />
                    <Field
                      label="Phone"
                      type="tel"
                      inputMode="tel"
                      value={customer.phone}
                      error={errors.phone}
                      autoComplete="tel"
                      hint="The freight company calls before delivery."
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    />
                    <Field
                      label="Company (optional)"
                      className="sm:col-span-2"
                      value={customer.company}
                      autoComplete="organization"
                      onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
                    />
                  </div>
                </section>
              ) : null}

              {step === 1 ? (
                <section>
                  <Mono className="text-hivis">02 · Delivery</Mono>
                  <h1 className="display mt-3 text-[clamp(1.8rem,4vw,2.6rem)]">Where does it go?</h1>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Street and number"
                      className="sm:col-span-2"
                      value={delivery.address}
                      error={errors.address}
                      autoComplete="street-address"
                      onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                    />
                    <Field
                      label="Postal code"
                      inputMode="numeric"
                      value={delivery.postalCode}
                      error={errors.postalCode}
                      autoComplete="postal-code"
                      onChange={(e) => setDelivery({ ...delivery, postalCode: e.target.value })}
                    />
                    <Field
                      label="City"
                      value={delivery.city}
                      error={errors.city}
                      autoComplete="address-level2"
                      onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                    />
                    <SelectField
                      label="Country"
                      className="sm:col-span-2"
                      value={delivery.country}
                      onChange={(e) => setDelivery({ ...delivery, country: e.target.value })}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    <ChoiceCard
                      selected={delivery.option === "kerb"}
                      onSelect={() => setDelivery({ ...delivery, option: "kerb" })}
                      title="Kerbside"
                      meta="Included"
                      blurb="Tail-lift truck, unloaded at the kerb. You move it from there."
                    />
                    <ChoiceCard
                      selected={delivery.option === "placed"}
                      onSelect={() => setDelivery({ ...delivery, option: "placed" })}
                      title="Placed on site"
                      meta="Included"
                      blurb="Forklift or crane places it where it will stand. Needs access."
                    />
                  </div>

                  <TextAreaField
                    label="Site notes (optional)"
                    className="mt-6"
                    placeholder="Gate codes, access width, delivery window…"
                    value={delivery.notes}
                    onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })}
                  />
                </section>
              ) : null}

              {step === 2 ? (
                <section>
                  <Mono className="text-hivis">03 · Payment</Mono>
                  <h1 className="display mt-3 text-[clamp(1.8rem,4vw,2.6rem)]">Card details</h1>

                  {/* the card */}
                  <div className="mt-8 max-w-[420px] rounded-[8px] border border-[var(--edge-strong)] bg-gradient-to-br from-steel-3 to-steel p-5">
                    <div className="flex items-start justify-between">
                      <div className="h-7 w-10 rounded-[3px] bg-gradient-to-br from-hivis/80 to-hivis-deep/70" />
                      <Mono className="text-concrete/30">Demo</Mono>
                    </div>
                    <p className="tnum mt-6 font-mono text-lg tracking-[0.18em] text-concrete/85">
                      {card.number || "•••• •••• •••• ••••"}
                    </p>
                    <div className="mt-4 flex items-end justify-between">
                      <span className="mono truncate text-concrete/60">
                        {card.holder || "Name on card"}
                      </span>
                      <span className="tnum mono text-concrete/60">{card.expiry || "MM/YY"}</span>
                    </div>
                  </div>

                  <div className="mt-6 grid max-w-[420px] gap-4 sm:grid-cols-2">
                    <Field
                      label="Card number"
                      className="sm:col-span-2"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="4242 4242 4242 4242"
                      value={card.number}
                      error={errors.number}
                      onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                    />
                    <Field
                      label="Expiry"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="04/29"
                      value={card.expiry}
                      error={errors.expiry}
                      onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                    />
                    <Field
                      label="CVC"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      value={card.cvc}
                      error={errors.cvc}
                      onChange={(e) =>
                        setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })
                      }
                    />
                    <Field
                      label="Name on card"
                      className="sm:col-span-2"
                      autoComplete="cc-name"
                      value={card.holder}
                      error={errors.holder}
                      onChange={(e) => setCard({ ...card, holder: e.target.value })}
                    />
                  </div>

                  <p className="mono mt-5 flex items-center gap-2 !normal-case !tracking-[0.06em] text-concrete/30">
                    <Lock className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Demo checkout — nothing is sent anywhere and no card is charged.
                  </p>
                </section>
              ) : null}

              {step === 3 ? (
                <section>
                  <Mono className="text-hivis">04 · Review</Mono>
                  <h1 className="display mt-3 text-[clamp(1.8rem,4vw,2.6rem)]">Check it over</h1>

                  <dl className="mt-8 grid gap-6 sm:grid-cols-2">
                    <div>
                      <dt className="mono text-concrete/35">Customer</dt>
                      <dd className="mt-2 text-sm leading-relaxed text-concrete/75">
                        {customer.firstName} {customer.lastName}
                        {customer.company ? <><br />{customer.company}</> : null}
                        <br />
                        {customer.email}
                        <br />
                        {customer.phone}
                      </dd>
                    </div>
                    <div>
                      <dt className="mono text-concrete/35">Delivery</dt>
                      <dd className="mt-2 text-sm leading-relaxed text-concrete/75">
                        {delivery.address}
                        <br />
                        {delivery.postalCode} {delivery.city}
                        <br />
                        {delivery.country}
                        <br />
                        {delivery.option === "kerb" ? "Kerbside" : "Placed on site"}
                      </dd>
                    </div>
                    <div>
                      <dt className="mono text-concrete/35">Payment</dt>
                      <dd className="tnum mt-2 text-sm text-concrete/75">
                        Card ending {card.number.replace(/\D/g, "").slice(-4)} · {card.expiry}
                      </dd>
                    </div>
                    <div>
                      <dt className="mono text-concrete/35">Lead time</dt>
                      <dd className="mt-2 text-sm text-concrete/75">
                        {getInstall(lines[0]?.spec.install ?? "self").lead} from order
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={() => setTerms((v) => !v)}
                    aria-pressed={terms}
                    className="mt-8 flex w-full items-start gap-3 rounded-[4px] border border-[var(--edge)] bg-steel-2/40 p-4 text-left"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border transition-colors",
                        terms ? "border-hivis bg-hivis text-steel" : "border-[var(--edge-strong)]",
                      )}
                    >
                      {terms ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                    </span>
                    <span className="text-[13px] leading-relaxed text-concrete/55">
                      I understand this is a demonstration store: no machine will be
                      built, no card will be charged, and nothing here forms a contract.
                    </span>
                  </button>
                  {errors.terms ? (
                    <p className="mono mt-2 text-[#ff8f6b]">{errors.terms}</p>
                  ) : null}

                  {failed ? (
                    <p className="mt-4 rounded-[3px] border border-[#ff8f6b]/40 bg-[#ff8f6b]/10 p-3 text-sm text-[#ff8f6b]">
                      {failed}
                    </p>
                  ) : null}
                </section>
              ) : null}

              {step === 4 && result ? <Success result={result} lead={lead} /> : null}
            </motion.div>
          </AnimatePresence>

          {/* nav */}
          {step < 4 ? (
            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {step === 0 ? (
                <Link
                  href="/#buy"
                  className="mono inline-flex items-center gap-2 py-2.5 text-concrete/35 transition-colors hover:text-concrete"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                  Back to the configurator
                </Link>
              ) : (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                  Back
                </Button>
              )}

              {step < 3 ? (
                <Button size="lg" onClick={next} icon={<ArrowRight className="h-4 w-4" strokeWidth={2} />}>
                  Continue
                </Button>
              ) : (
                <Button size="lg" onClick={pay} disabled={busy}>
                  {busy ? "Processing…" : `Pay ${formatPrice(totals.totalCents)}`}
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {/* ── order summary ────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[5px] border border-[var(--edge)] bg-steel-2/50 p-5 sm:p-6">
            <Mono className="text-concrete/40">{step === 4 ? "Your order" : "Order summary"}</Mono>
            <ul className="mt-4 space-y-4">
              {summary.lines.map((line) => {
                const d = describeSpec(line.spec);
                return (
                  <li key={line.sku} className="flex gap-3">
                    <div className="h-12 w-14 shrink-0 overflow-hidden rounded-[3px] border border-[var(--edge)]">
                      <BoxThumb shell={line.spec.shell} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold tracking-tight">{d.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-concrete/40">
                        {d.details.join(" · ")}
                      </p>
                    </div>
                    <span className="tnum shrink-0 text-sm">
                      {line.quantity > 1 ? `${line.quantity} × ` : ""}
                      {formatPrice(line.unitPriceCents)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <Seam className="my-5" />

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-concrete/45">Subtotal</dt>
                <dd className="tnum">{formatPrice(summary.totals.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-concrete/45">Freight</dt>
                <dd className="tnum">{formatPrice(summary.totals.shippingCents)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-[var(--edge)] pt-3">
                <dt className="display text-lg">Total</dt>
                <dd className="tnum display text-lg">{formatPrice(summary.totals.totalCents)}</dd>
              </div>
            </dl>
            <p className="mono mt-2 !normal-case !tracking-[0.06em] text-concrete/30">
              Incl. {formatPrice(summary.totals.vatCents)} VAT
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Success({ result, lead }: { result: PaymentResult; lead: string | null }) {
  return (
    <section>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.4, 0.64, 1] }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-hivis text-steel"
      >
        <Check className="h-7 w-7" strokeWidth={3} />
      </motion.div>

      <motion.h1
        className="display mt-8 text-[clamp(2.1rem,6vw,4.2rem)]"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
      >
        {"Welcome to the clean side.".split(" ").map((word, i) => (
          <span key={`${word}-${i}`} className="mr-[0.28em] inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%", opacity: 0 },
                show: { y: "0%", opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p className="lede mt-5 max-w-[46ch] text-concrete/55">
          Order confirmed. You will get a mail with the order sheet, and the
          freight company calls before they set off.
        </p>

        <dl className="mt-8 grid gap-6 sm:grid-cols-3">
          <div>
            <dt className="mono text-concrete/35">Order number</dt>
            <dd className="tnum mt-2 font-mono text-lg text-hivis">{result.orderNumber}</dd>
          </div>
          <div>
            <dt className="mono text-concrete/35">Placed</dt>
            <dd className="mt-2 text-sm text-concrete/75">
              {new Date(result.paidAtIso).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </dd>
          </div>
          <div>
            <dt className="mono text-concrete/35">Build + freight</dt>
            <dd className="mt-2 text-sm text-concrete/75">{lead}</dd>
          </div>
        </dl>

        <div className="mt-10 overflow-hidden rounded-[5px] border border-[var(--edge)] bg-[#0a0c0d] p-4">
          <WashScene progress={0.9} bikeId="enduro" />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg">
            Back to the box
          </ButtonLink>
          <ButtonLink href="/rental" size="lg" variant="outline">
            Rent one for an event
          </ButtonLink>
        </div>
      </motion.div>
    </section>
  );
}
