import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Kasse",
  description: "Bestellung abschließen — Versand inklusive, 60 Nächte testen.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
