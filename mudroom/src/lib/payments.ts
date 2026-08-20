/**
 * Payment provider seam.
 *
 * The checkout UI talks only to `PaymentProvider`. Today the demo provider
 * is wired in; swapping in Stripe means implementing this interface against
 * `/api/checkout/session` and changing one line in `getPaymentProvider()` —
 * no component needs to know.
 */

import type { CartLine } from "./cart";

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
}

export interface OrderDelivery {
  address: string;
  postalCode: string;
  city: string;
  country: string;
  /** "kerb" = tail-lift drop, "placed" = crane/forklift placement on site. */
  option: "kerb" | "placed";
  notes: string;
}

export interface PaymentIntentRequest {
  lines: CartLine[];
  totals: { subtotalCents: number; shippingCents: number; totalCents: number };
  customer: OrderCustomer;
  delivery: OrderDelivery;
}

export interface PaymentResult {
  orderNumber: string;
  paidAtIso: string;
  /** Freight window, in weeks from today. */
  leadWeeks: [number, number];
}

export interface PaymentProvider {
  readonly id: string;
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
  return `MR-${y}${m}-${rand}${check}`;
}

class DemoPaymentProvider implements PaymentProvider {
  readonly id = "demo";
  readonly label = "Demo payment";

  async confirm(request: PaymentIntentRequest): Promise<PaymentResult> {
    if (request.lines.length === 0) throw new Error("Cart is empty");
    if (request.totals.totalCents <= 0) throw new Error("Nothing to charge");

    // Stand-in for the round trip a real PSP would make.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const onsite = request.lines.some((l) => l.spec.install === "onsite");
    return {
      orderNumber: orderNumber(),
      paidAtIso: new Date().toISOString(),
      leadWeeks: onsite ? [8, 10] : [6, 8],
    };
  }
}

/*
 * Stripe, when it lands, looks like this:
 *
 * class StripePaymentProvider implements PaymentProvider {
 *   readonly id = "stripe";
 *   readonly label = "Card, SEPA, invoice";
 *   async confirm(request: PaymentIntentRequest) {
 *     const res = await fetch("/api/checkout/session", {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       // Send SKUs + quantities only — the server re-prices from the
 *       // catalogue so the client can never dictate an amount.
 *       body: JSON.stringify({
 *         items: request.lines.map((l) => ({ sku: l.sku, quantity: l.quantity })),
 *         customer: request.customer,
 *         delivery: request.delivery,
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
