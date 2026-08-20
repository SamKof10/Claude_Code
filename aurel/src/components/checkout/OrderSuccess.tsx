"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { PaymentResult } from "@/lib/payments";
import type { CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { LineThumb } from "@/components/cart/LineThumb";
import { Mono } from "@/components/ui/Primitives";
import { fmt, useI18n } from "@/lib/i18n";
import { describeLine } from "@/lib/labels";

interface OrderSuccessProps {
  result: PaymentResult;
  lines: CartLine[];
  totalCents: number;
  email: string;
}

export function OrderSuccess({ result, lines, totalCents, email }: OrderSuccessProps) {
  const { t, locale } = useI18n();
  const delivery = new Date(result.estimatedDeliveryIso);
  const deliveryLabel = delivery.toLocaleDateString(locale === "de" ? "de-DE" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-[720px] px-5 pt-28 pb-24 sm:px-8 sm:pt-32">
      <div className="text-center">
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.1 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ember"
        >
          <motion.span
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <Check size={28} strokeWidth={2.5} className="text-ink" />
          </motion.span>
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="display mt-7 text-[clamp(2rem,1.5rem+2vw,3rem)]">{t.success.title}</h1>
          <p className="lede mx-auto mt-4 max-w-[44ch]">
{fmt(t.success.lede, { email })}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="mt-12 overflow-hidden rounded-2xl border"
        style={{ borderColor: "var(--line)" }}
      >
        <div
          className="grid gap-px sm:grid-cols-2"
          style={{ background: "var(--line)" }}
        >
          <div className="bg-paper p-6">
            <Mono className="text-ink-3">{t.success.orderNumber}</Mono>
            <p className="mt-2 font-mono text-[19px] tracking-tight">{result.orderNumber}</p>
          </div>
          <div className="bg-paper p-6">
            <Mono className="text-ink-3">{t.success.delivery}</Mono>
            <p className="mt-2 text-[19px] font-medium tracking-[-0.02em]">{deliveryLabel}</p>
          </div>
        </div>

        <div className="border-t p-6" style={{ borderColor: "var(--line)" }}>
          <Mono className="text-ink-3">{t.success.overview}</Mono>
          <ul className="mt-4 space-y-4">
            {lines.map((line) => {
              const label = describeLine(line, t);
              return (
                <li key={line.sku} className="flex items-center gap-4">
                  <span
                    className="grid h-[60px] w-[60px] shrink-0 place-items-center overflow-hidden rounded-lg"
                    style={{ background: "var(--color-paper-2)" }}
                  >
                    <LineThumb line={line} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-medium">
{label.name} — {label.subtitle}
                    </span>
                    <Mono className="mt-1 block text-ink-3">
                      {line.quantity} × {formatPrice(line.unitPriceCents)} · {line.sku}
                    </Mono>
                  </span>
                  <span className="shrink-0 text-[14.5px] tabular-nums">
                    {formatPrice(line.unitPriceCents * line.quantity)}
                  </span>
                </li>
              );
            })}
          </ul>

          <div
            className="mt-6 flex items-baseline justify-between border-t pt-4"
            style={{ borderColor: "var(--line)" }}
          >
            <span className="text-[16px] font-medium">{t.success.totalPaid}</span>
            <span className="text-[18px] font-medium tabular-nums">{formatPrice(totalCents)}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-10 flex flex-col items-center gap-4"
      >
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-full bg-ink px-7 text-[15px] font-medium text-paper transition-transform duration-200 active:scale-[0.98]"
        >
          {t.success.home}
        </Link>
        <Mono className="text-ink-3">
{t.success.demoNote}
        </Mono>
      </motion.div>
    </div>
  );
}
