"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import {
  useActiveSection,
  useEscape,
  useFocusTrap,
  useNavOverDark,
  useScrolledPast,
  useScrollLock,
} from "@/hooks";
import { cn } from "@/components/ui/cn";
import { Logo } from "./Logo";
import { Mono } from "@/components/ui/Primitives";
import { LanguagePicker } from "./LanguagePicker";
import { fmt, useT } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { MODELS } from "@/lib/products";

const LINKS = [
  { href: "/#produkt", id: "produkt" },
  { href: "/#features", id: "features" },
  { href: "/#technologie", id: "technologie" },
  { href: "/#zubehoer", id: "zubehoer" },
  { href: "/#reviews", id: "reviews" },
  { href: "/#faq", id: "faq" },
] as const;

// "steuerung" and "varianten" have no nav entry but are observed, so the
// indicator clears
// rather than staying stuck on Technologie while it is on screen.
const SECTION_IDS = [...LINKS.map((l) => l.id), "steuerung", "varianten", "zubehoer"];

export function Navbar() {
  const scrolled = useScrolledPast(20);
  const { totals, open, addPulse } = useCart();
  const pathname = usePathname();
  const [menu, setMenu] = useState<{ open: boolean; path: string }>({ open: false, path: pathname });
  const menuOpen = menu.open && menu.path === pathname;
  const setMenuOpen = (next: boolean) => setMenu({ open: next, path: pathname });
  const active = useActiveSection(SECTION_IDS);
  const overDark = useNavOverDark();
  const t = useT();
  const cheapest = Math.min(...MODELS.map((m) => m.priceCents));

  useScrollLock(menuOpen);
  useEscape(menuOpen, () => setMenuOpen(false));
  const trapRef = useFocusTrap<HTMLDivElement>(menuOpen);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] border-b transition-[background-color,border-color,backdrop-filter,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled && (overDark ? "glass-night" : "glass"),
          overDark ? "text-paper" : "text-ink",
        )}
        style={{
          borderColor: scrolled
            ? overDark
              ? "var(--line-night)"
              : "var(--line)"
            : "transparent",
        }}
      >
        <nav className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-5 sm:h-[72px] sm:px-8">
          <Link href="/" aria-label={t.nav.home} className="-my-2 shrink-0 py-2">
            <Logo night={overDark} />
          </Link>

          <ul className="ml-4 hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => {
              const isActive = pathname === "/" && active === link.id;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-[13.5px] transition-colors duration-200",
                      overDark
                        ? isActive
                          ? "text-paper"
                          : "text-paper/60 hover:text-paper"
                        : isActive
                          ? "text-ink"
                          : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {t.nav.links[link.id]}
                    {isActive ? (
                      <motion.span
                        layoutId="nav-active"
                        className={cn(
                          "absolute inset-x-3.5 -bottom-0.5 h-px",
                          overDark ? "bg-ember" : "bg-ember-deep",
                        )}
                        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/produkt"
              className={cn(
                "hidden h-10 items-center rounded-full px-5 text-[13.5px] font-medium transition-[transform,background-color,color] duration-300 active:scale-[0.97] sm:inline-flex",
                overDark ? "bg-paper text-ink hover:bg-white" : "bg-ink text-paper hover:bg-black",
              )}
            >
              {t.nav.buy}
            </Link>

            <LanguagePicker night={overDark} />

            <button
              type="button"
              id="cart-target"
              onClick={open}
              aria-label={fmt(t.nav.openCart, { count: totals.itemCount })}
              className={cn(
                "relative grid h-11 w-11 place-items-center rounded-full transition-colors duration-200",
                overDark
                  ? "hover:bg-[color-mix(in_srgb,white_10%,transparent)]"
                  : "hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)]",
              )}
            >
              <ShoppingBag size={19} strokeWidth={1.6} />
              <AnimatePresence>
                {totals.itemCount > 0 ? (
                  <motion.span
                    key={`badge-${addPulse}`}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: [null, 1.28, 1], opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-1.5 right-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-ember px-1 text-[10px] leading-none font-semibold text-ink tabular-nums"
                  >
                    {totals.itemCount}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t.nav.openMenu}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-full transition-colors duration-200 lg:hidden",
                overDark
                  ? "hover:bg-[color-mix(in_srgb,white_10%,transparent)]"
                  : "hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)]",
              )}
            >
              <Menu size={20} strokeWidth={1.6} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="mobile-menu"
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.nav.navigation}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[120] bg-paper lg:hidden"
          >
            <div className="flex h-16 items-center justify-between px-5 sm:h-[72px] sm:px-8">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t.nav.closeMenu}
                className="grid h-11 w-11 place-items-center rounded-full transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)]"
              >
                <X size={20} strokeWidth={1.6} />
              </button>
            </div>

            <nav className="px-5 pt-6 sm:px-8">
              <ul>
                {LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.44, delay: 0.06 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="border-b"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-baseline justify-between py-5 text-[26px] font-medium tracking-[-0.03em]"
                    >
                      {t.nav.links[link.id]}
                      <Mono className="text-ink-3">{String(i + 1).padStart(2, "0")}</Mono>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.44, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8"
              >
                <Link
                  href="/produkt"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-14 w-full items-center justify-center rounded-full bg-ink text-[15px] font-medium text-paper active:scale-[0.98]"
                >
                  {fmt(t.nav.buyFrom, { price: formatPrice(cheapest) })}
                </Link>
                <p className="mono-label mt-5 text-ink-3">
{t.common.trust.join(" · ")}
                </p>
              </motion.div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
