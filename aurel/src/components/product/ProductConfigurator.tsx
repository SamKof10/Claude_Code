"use client";

import { useSearchParams } from "next/navigation";
import { ProductDetail } from "./ProductDetail";
import { FINISHES, MODELS, type FinishId, type ModelId } from "@/lib/products";

/** Reads ?modell= and ?oberflaeche= and hands the product page its start state. */
export function ProductConfigurator() {
  const params = useSearchParams();

  const model: ModelId = MODELS.find((m) => m.id === params.get("modell"))?.id ?? "arc";
  const finish: FinishId =
    FINISHES.find((f) => f.id === params.get("oberflaeche"))?.id ?? "graphite";

  return <ProductDetail initialModel={model} initialFinish={finish} />;
}
