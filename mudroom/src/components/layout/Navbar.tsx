"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, ShoppingCart, X } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/components/ui/cn";
import { useCart } from "@/lib/cart";
import { useActiveSection, useScrollLock, useScrolledPast } from "@/hooks";

const LINKS = [
  { id: "product", label: "Product" },
  { id: "how", label: "How it works" },
  { id: "tech", label: "Technology" },
  { id: "rent", label: "Rent" },
  { id: "buy", label: "Buy" },
  { id: "faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolledPast(40);
  const active = useActiveSection(LINKS.map((l) => l.id));
  const { totals, open: openCart, addPulse } = useCart();
  useScrollLock(open);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled || open
            ? "glass border-b border-[var(--edge)]"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
          <a href="#top" className="shrink-0 py-2" aria-label="MUDROOM — back to top">
            <Logo compact />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={cn(
                    "mono relative block px-3 py-2 transition-colors duration-200",
                    active === link.id ? "text-hivis" : "text-concrete/55 hover:text-concrete",
                  )}
                >
                  {link.label}
                  {active === link.id ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-px h-px bg-hivis"
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  ) : null}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-11 w-11 items-center justify-center rounded-[3px] text-concrete/75 transition-colors hover:text-hivis"
              aria-label={`Cart, ${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"}`}
            >
              <span id="cart-target" className="relative block">
                <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.7} />
                {totals.itemCount > 0 ? (
                  <motion.span
                    key={`badge-${addPulse}`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
                    className="tnum absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-hivis px-1 font-mono text-[10px] font-semibold leading-none text-steel"
                  >
                    {totals.itemCount}
                  </motion.span>
                ) : null}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-[3px] text-concrete/75 transition-colors hover:text-hivis lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" strokeWidth={1.7} /> : <Menu className="h-5 w-5" strokeWidth={1.7} />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 top-16 z-40 bg-steel/97 lg:hidden"
          >
            <ul className="flex flex-col px-5 pt-4 sm:px-8">
              {LINKS.map((link, i) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 + i * 0.04, duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-[var(--edge)]"
                >
                  <a
                    href={`#${link.id}`}
                    onClick={() => setOpen(false)}
                    className="display flex items-center justify-between py-5 text-[26px] text-concrete"
                  >
                    {link.label}
                    <span className="mono tnum text-hivis/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
