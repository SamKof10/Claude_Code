"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { AccessoryArt } from "./AccessoryArt";
import { ACCESSORIES, accessorySku, type AccessoryId, type FinishId } from "@/lib/products";
import { FinishSwatches } from "./FinishSwatches";
import { formatPrice } from "@/lib/format";
import { fmt, useT } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useToast } from "@/components/ui/Toast";

/** Compact cross-sell on the product page, in whichever finish is selected. */
export function AccessoryUpsell({ finishId }: { finishId: FinishId }) {
  const { add, pendingSku } = useCart();
  const { push } = useToast();
  const t = useT();

  // Only deliberate deviations are stored. Rows the visitor has not touched
  // follow the lamp's finish on their own, so there is nothing to sync.
  const [overrides, setOverrides] = useState<Partial<Record<AccessoryId, FinishId>>>({});

  return (
    <div className="mt-9">
      <h2 className="text-[15px] font-medium tracking-[-0.015em]">
        {t.accessoriesSection.upsellTitle}
      </h2>

      <ul className="mt-3 grid gap-px" style={{ background: "var(--line)" }}>
        {ACCESSORIES.map((accessory) => {
          const rowFinish = overrides[accessory.id] ?? finishId;
          const sku = accessorySku(accessory.id, rowFinish);
          const isPending = pendingSku === sku;
          return (
            <li key={accessory.id} className="flex min-w-0 items-center gap-3 bg-paper py-4 sm:gap-4">
              <span
                className="grid h-[58px] w-[58px] shrink-0 place-items-center overflow-hidden rounded-lg"
                style={{ background: "var(--color-paper-2)" }}
              >
                <AccessoryArt
                  accessoryId={accessory.id}
                  finishId={rowFinish}
                  showLight={false}
                  intensity={0.4}
                  className="w-full"
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14.5px] font-medium">AUREL {accessory.name}</span>
                <span className="mt-0.5 block truncate text-[13px] text-ink-3">
                  {t.accessories[accessory.id].title}
                </span>
                <FinishSwatches
                  value={rowFinish}
                  onChange={(f) => setOverrides((prev) => ({ ...prev, [accessory.id]: f }))}
                  label={`AUREL ${accessory.name} — ${t.common.finishLabel}`}
                  size="sm"
                  className="-ml-1.5 mt-1"
                />
              </span>

              <span className="shrink-0 text-[14.5px] tabular-nums">
                {formatPrice(accessory.priceCents)}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  add(sku, 1, e.currentTarget);
                  push(fmt(t.toast.added, { name: `AUREL ${accessory.name}` }), `${t.accessories[accessory.id].title} · ${t.finishes[rowFinish].name}`);
                }}
                aria-label={fmt(t.accessoriesSection.addAria, { name: accessory.name })}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)]"
                style={{ borderColor: "var(--line-strong)" }}
              >
                {isPending ? (
                  <Check size={15} strokeWidth={2.5} className="text-ember-deep" />
                ) : (
                  <Plus size={15} strokeWidth={2} />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
