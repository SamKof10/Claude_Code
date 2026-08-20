/**
 * Payment provider seam.
 *
 * The checkout UI talks only to `PaymentProvider`. Today the demo provider
 * is wired in; swapping in Stripe means implementing this interface against
 * `/api/checkout/session` and changing one line in `getPaymentProvider()` —
 * no component needs to know.
 */

import type { CartLine } from "./cart";

export interface OrderAddress {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface PaymentIntentRequest {
  lines: CartLine[];
  totals: {
    subtotalCents: number;
    shippingCents: number;
    totalCents: number;
  };
  address: OrderAddress;
}

export interface PaymentResult {
  orderNumber: string;
  paidAtIso: string;
  estimatedDeliveryIso: string;
}

export interface PaymentProvider {
  readonly id: string;
  /** Human label shown next to the pay button. */
  readonly label: string;
  confirm(request: PaymentIntentRequest): Promise<PaymentResult>;
}

function orderNumber(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  const check = Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `AU-${y}${m}-${rand}${check}`;
}

/** Two working days to dispatch, then 2–4 in transit. */
function estimatedDelivery(from = new Date()): Date {
  const d = new Date(from);
  let added = 0;
  while (added < 5) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}

class DemoPaymentProvider implements PaymentProvider {
  readonly id = "demo";
  readonly label = "Demo payment";

  async confirm(request: PaymentIntentRequest): Promise<PaymentResult> {
    if (request.lines.length === 0) throw new Error("Cart is empty");
    if (request.totals.totalCents <= 0) throw new Error("Nothing to charge");

    // Stand-in for the round trip a real PSP would make.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const now = new Date();
    return {
      orderNumber: orderNumber(),
      paidAtIso: now.toISOString(),
      estimatedDeliveryIso: estimatedDelivery(now).toISOString(),
    };
  }
}

/*
 * Stripe, when it lands, looks like this:
 *
 * class StripePaymentProvider implements PaymentProvider {
 *   readonly id = "stripe";
 *   readonly label = "Card, Apple Pay, Klarna";
 *   async confirm(request: PaymentIntentRequest) {
 *     const res = await fetch("/api/checkout/session", {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       // Send SKUs + quantities only — the server re-prices from the
 *       // catalogue so the client can never dictate an amount.
 *       body: JSON.stringify({
 *         items: request.lines.map((l) => ({ sku: l.sku, quantity: l.quantity })),
 *         address: request.address,
 *       }),
 *     });
 *     if (!res.ok) throw new Error("Payment failed");
 *     return res.json();
 *   }
 * }
 */

const demoProvider = new DemoPaymentProvider();

export function getPaymentProvider(): PaymentProvider {
  return demoProvider;
}
