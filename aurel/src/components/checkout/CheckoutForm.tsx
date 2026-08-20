"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, CreditCard, Loader2, Lock } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { getPaymentProvider, type OrderAddress, type PaymentResult } from "@/lib/payments";
import { LineThumb } from "@/components/cart/LineThumb";
import { Button } from "@/components/ui/Button";
import { Mono } from "@/components/ui/Primitives";
import { fmt, useT } from "@/lib/i18n";
import type { Dict } from "@/lib/i18n/types";
import { describeLine } from "@/lib/labels";
import { SHIPPING_REGIONS } from "@/lib/reviews";
import { OrderSuccess } from "./OrderSuccess";
import { cn } from "@/components/ui/cn";

type Errors = Partial<Record<keyof OrderAddress, string>>;

const EMPTY: OrderAddress = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  postalCode: "",
  city: "",
  country: "Deutschland",
};

function validate(values: OrderAddress, msg: Dict["checkout"]["errors"]): Errors {
  const errors: Errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) errors.email = msg.email;
  if (values.firstName.trim().length < 2) errors.firstName = msg.required;
  if (values.lastName.trim().length < 2) errors.lastName = msg.required;
  if (values.address.trim().length < 5) errors.address = msg.street;
  // Postcodes differ worldwide — check that something plausible is there,
  // not that it matches one country's format.
  if (!/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(values.postalCode.trim())) errors.postalCode = msg.postalCode;
  if (values.city.trim().length < 2) errors.city = msg.required;
  return errors;
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  inputMode,
  className,
}: {
  id: keyof OrderAddress;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "numeric";
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mono-label mb-2 block text-ink-3">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-12 w-full rounded-xl border bg-transparent px-4 text-[15px] transition-colors duration-200",
          "focus-visible:border-ink focus-visible:outline-none",
          error ? "border-[#b8442f]" : "border-[var(--line-strong)] hover:border-ink-3",
        )}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[12.5px] text-[#b8442f]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CheckoutForm() {
  const { lines, totals, clear } = useCart();
  const t = useT();
  const [values, setValues] = useState<OrderAddress>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [paidLines, setPaidLines] = useState(lines);
  const [paidTotal, setPaidTotal] = useState(totals.totalCents);

  const set = (key: keyof OrderAddress) => (v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(values, t.checkout.errors);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    setStatus("processing");
    // Snapshot before clearing, so the confirmation can still render the order.
    setPaidLines(lines);
    setPaidTotal(totals.totalCents);

    try {
      const payment = await getPaymentProvider().confirm({
        lines,
        totals: {
          subtotalCents: totals.subtotalCents,
          shippingCents: totals.shippingCents,
          totalCents: totals.totalCents,
        },
        address: values,
      });
      setResult(payment);
      clear();
      // The confirmation replaces a long form — without this the user lands
      // mid-page and never sees it.
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch {
      setStatus("error");
    }
  }

  if (result) {
    return (
      <OrderSuccess result={result} lines={paidLines} totalCents={paidTotal} email={values.email} />
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[520px] px-5 pt-32 pb-24 text-center sm:px-8">
        <h1 className="display text-[clamp(1.8rem,1.4rem+1.6vw,2.4rem)]">
{t.checkout.emptyTitle}
        </h1>
        <p className="lede mt-4">
{t.checkout.emptyBody}
        </p>
        <Link
          href="/produkt"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-7 text-[15px] font-medium text-paper"
        >
{t.checkout.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-5 pt-28 pb-24 sm:px-8 sm:pt-32">
      <Link
        href="/produkt"
        className="inline-flex items-center gap-2 text-[13.5px] text-ink-2 transition-colors duration-200 hover:text-ink"
      >
        <ArrowLeft size={15} strokeWidth={1.75} />
        {t.checkout.back}
      </Link>

      <h1 className="display mt-6 text-[clamp(2rem,1.5rem+2vw,2.8rem)]">{t.checkout.title}</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* ── form ───────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate>
          <section>
            <h2 className="text-[17px] font-medium tracking-[-0.02em]">{t.checkout.contact}</h2>
            <div className="mt-4">
              <Field
                id="email"
                label={t.checkout.email}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.email}
                onChange={set("email")}
                error={errors.email}
              />
            </div>
          </section>

          <section className="mt-9">
            <h2 className="text-[17px] font-medium tracking-[-0.02em]">{t.checkout.address}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                id="firstName"
                label={t.checkout.firstName}
                autoComplete="given-name"
                value={values.firstName}
                onChange={set("firstName")}
                error={errors.firstName}
              />
              <Field
                id="lastName"
                label={t.checkout.lastName}
                autoComplete="family-name"
                value={values.lastName}
                onChange={set("lastName")}
                error={errors.lastName}
              />
              <Field
                id="address"
                label={t.checkout.street}
                autoComplete="street-address"
                value={values.address}
                onChange={set("address")}
                error={errors.address}
                className="sm:col-span-2"
              />
              <Field
                id="postalCode"
                label={t.checkout.postalCode}
                inputMode="numeric"
                autoComplete="postal-code"
                value={values.postalCode}
                onChange={set("postalCode")}
                error={errors.postalCode}
              />
              <Field
                id="city"
                label={t.checkout.city}
                autoComplete="address-level2"
                value={values.city}
                onChange={set("city")}
                error={errors.city}
              />
              <div className="sm:col-span-2">
                <label htmlFor="country" className="mono-label mb-2 block text-ink-3">
                  {t.checkout.country}
                </label>
                <select
                  id="country"
                  name="country"
                  value={values.country}
                  onChange={(e) => set("country")(e.target.value)}
                  className="h-12 w-full rounded-xl border bg-transparent px-4 text-[15px] transition-colors duration-200 hover:border-ink-3 focus-visible:border-ink focus-visible:outline-none"
                  style={{ borderColor: "var(--line-strong)" }}
                >
                  {SHIPPING_REGIONS.map((group) => (
                    <optgroup key={group.region} label={t.checkout.regions[group.region]}>
                      {group.countries.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="mt-9">
            <h2 className="text-[17px] font-medium tracking-[-0.02em]">{t.checkout.payment}</h2>
            <div
              className="mt-4 rounded-xl border p-5"
              style={{ borderColor: "var(--line-strong)", background: "var(--color-paper-2)" }}
            >
              <div className="flex items-start gap-3">
                <CreditCard size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-2" />
                <div>
                  <p className="text-[14.5px] font-medium">{t.checkout.demoTitle}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">
{t.checkout.demoBody}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {status === "error" ? (
            <p className="mt-5 text-[14px] text-[#b8442f]">
{t.checkout.failed}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="mt-7 w-full"
            disabled={status === "processing"}
            shimmer
          >
            {status === "processing" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t.checkout.processing}
              </>
            ) : (
              <>
                <Lock size={15} strokeWidth={1.75} />
                {fmt(t.checkout.placeOrder, { amount: formatPrice(totals.totalCents) })}
              </>
            )}
          </Button>

          <Mono className="mt-4 block text-center text-ink-3">
{t.common.trust.join(" · ")}
          </Mono>
        </form>

        {/* ── summary ────────────────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div
            className="rounded-2xl border p-6"
            style={{ borderColor: "var(--line)", background: "var(--color-paper-2)" }}
          >
            <h2 className="text-[17px] font-medium tracking-[-0.02em]">{t.checkout.summary}</h2>

            <ul className="mt-5 space-y-4">
              {lines.map((line) => {
                const label = describeLine(line, t);
                return (
                  <motion.li key={line.sku} layout className="flex items-center gap-4">
                    <span
                      className="relative grid h-[62px] w-[62px] shrink-0 place-items-center overflow-hidden rounded-lg"
                      style={{ background: "var(--color-paper)" }}
                    >
                      <LineThumb line={line} />
                      <span className="absolute -top-1 -right-1 grid h-[19px] min-w-[19px] place-items-center rounded-full bg-ink px-1 text-[10.5px] font-medium text-paper tabular-nums">
                        {line.quantity}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-medium">{label.name}</span>
                      <Mono className="mt-1 block text-ink-3">{label.subtitle}</Mono>
                    </span>
                    <span className="shrink-0 text-[14.5px] tabular-nums">
                      {formatPrice(line.unitPriceCents * line.quantity)}
                    </span>
                  </motion.li>
                );
              })}
            </ul>

            <dl
              className="mt-6 space-y-2.5 border-t pt-5 text-[14.5px]"
              style={{ borderColor: "var(--line)" }}
            >
              <div className="flex justify-between">
                <dt className="text-ink-2">{t.cart.subtotal}</dt>
                <dd className="tabular-nums">{formatPrice(totals.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-2">{t.cart.shipping}</dt>
                <dd className="text-ember-deep">{t.cart.shippingIncluded}</dd>
              </div>
              <div
                className="flex justify-between border-t pt-3 text-[17px] font-medium"
                style={{ borderColor: "var(--line)" }}
              >
                <dt>{t.cart.total}</dt>
                <dd className="tabular-nums">{formatPrice(totals.totalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="mono-label text-ink-3">{fmt(t.checkout.vatLine, { rate: 19 })}</dt>
                <dd className="mono-label text-ink-3">{formatPrice(totals.vatCents)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
