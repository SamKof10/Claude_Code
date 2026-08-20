"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCart } from "@/lib/cart";
import { findCatalogEntry } from "@/lib/products";
import { ArcLamp } from "@/components/product/ArcLamp";
import { AccessoryArt } from "@/components/product/AccessoryArt";

/**
 * Sends a small copy of the product from the button that was pressed to the
 * cart icon. Purely decorative — it never blocks the pointer, and it is
 * skipped entirely when the viewer prefers reduced motion.
 */
export function FlyToCart() {
  const { flight, endFlight } = useCart();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!flight || reduce) return;
    const id = flight.id;
    const t = setTimeout(() => endFlight(id), 780);
    return () => clearTimeout(t);
  }, [flight, reduce, endFlight]);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {flight ? (
        <motion.div
          key={flight.id}
          aria-hidden
          className="pointer-events-none fixed z-[160] grid place-items-center overflow-hidden rounded-xl"
          style={{ background: "var(--color-paper-2)" }}
          initial={{
            left: flight.from.x + flight.from.width / 2 - 44,
            top: flight.from.y + flight.from.height / 2 - 44,
            width: 88,
            height: 88,
            opacity: 0,
            scale: 0.85,
          }}
          animate={{
            left: [null, flight.to.x - 22],
            top: [null, flight.to.y - 22],
            width: [null, 44],
            height: [null, 44],
            opacity: [0, 1, 1, 0],
            scale: [0.85, 1, 0.9, 0.55],
          }}
          transition={{
            duration: 0.72,
            ease: [0.5, 0, 0.35, 1],
            opacity: { times: [0, 0.12, 0.7, 1], duration: 0.72 },
            scale: { times: [0, 0.15, 0.7, 1], duration: 0.72 },
          }}
        >
          <FlightArt sku={flight.sku} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function FlightArt({ sku }: { sku: string }) {
  const entry = findCatalogEntry(sku);
  if (!entry) return null;
  if (entry.kind === "accessory") {
    return (
      <AccessoryArt
        accessoryId={entry.accessoryId}
        finishId={entry.finishId}
        showLight={false}
        intensity={0.5}
        className="w-full"
      />
    );
  }
  return (
    <ArcLamp
      finishId={entry.finishId}
      modelId={entry.modelId}
      showLight={false}
      intensity={0.5}
      className="w-full"
    />
  );
}
