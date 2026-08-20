"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/lib/cart";
import { BoxThumb } from "@/components/product/BoxThumb";

/**
 * The configured box flies from the button that added it into the cart
 * icon. Positions are measured at flight start, so the drawer opening or
 * the page scrolling mid-flight cannot leave the ghost behind.
 */
export function FlyToCart() {
  const { flight, endFlight } = useCart();

  return (
    <AnimatePresence>
      {flight ? (
        <motion.div
          key={flight.id}
          aria-hidden
          className="pointer-events-none fixed z-[85] overflow-hidden rounded-[3px] border border-[var(--edge-strong)] bg-steel-2"
          initial={{
            left: flight.from.x,
            top: flight.from.y,
            width: flight.from.width,
            height: flight.from.height,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            left: flight.to.x - 16,
            top: flight.to.y - 14,
            width: 32,
            height: 28,
            opacity: 0.15,
            scale: 0.9,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.62, ease: [0.5, 0, 0.3, 1] }}
          onAnimationComplete={() => endFlight(flight.id)}
        >
          <BoxThumb shell={flight.spec.shell} className="h-full w-full object-cover" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
