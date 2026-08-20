import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductConfigurator } from "@/components/product/ProductConfigurator";

export const metadata: Metadata = {
  title: "ARC — zirkadiane Schreibtischleuchte",
  description:
    "AUREL ARC konfigurieren: zwei Längen, drei Oberflächen. 1800–6500 K, CRI 97, flimmerfrei. 60 Nächte testen, weltweiter Versand inklusive.",
};

/**
 * The query string is read on the client, which keeps this route static — the
 * whole site can then be exported as plain files and hosted anywhere. The
 * fallback is the default configuration, so that is what lands in the
 * prerendered HTML rather than an empty shell.
 */
export default function ProductPage() {
  return (
    <Suspense fallback={<ProductDetail initialModel="arc" initialFinish="graphite" />}>
      <ProductConfigurator />
    </Suspense>
  );
}
