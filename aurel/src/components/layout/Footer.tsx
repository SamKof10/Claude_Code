"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { Mono, StatusDot } from "@/components/ui/Primitives";
import { fmt, useT } from "@/lib/i18n";

const COLUMNS = [
  {
    title: "product",
    links: [
      { label: "specs", href: "/produkt#daten" },
      { label: "accessories", href: "/#zubehoer" },
    ],
  },
  {
    title: "buy",
    links: [
      { label: "cart", href: "/checkout" },
      { label: "shipping", href: "/produkt#daten" },
      { label: "trial", href: "/#faq" },
      { label: "warranty", href: "/#faq" },
    ],
  },
  {
    title: "company",
    links: [
      { label: "about", href: "/#technologie" },
      { label: "press", href: "/#reviews" },
      { label: "sustainability", href: "/#technologie" },
      { label: "contact", href: "/#faq" },
    ],
  },
] as const;

export function Footer() {
  const t = useT();
  const year = new Date().getFullYear();

  return (
    <footer data-nav-theme="dark" className="relative overflow-hidden bg-night text-paper">
      <div className="grain pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-[2] mx-auto max-w-[1240px] px-5 pt-16 pb-10 sm:px-8 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo night />
            <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-paper/60">
{t.footer.blurb}
            </p>

            <div
              className="mt-7 inline-flex items-center gap-2.5 rounded-full border px-3.5 py-2"
              style={{ borderColor: "var(--line-night-strong)" }}
            >
              <StatusDot />
              <Mono className="text-paper/70">{t.footer.status}</Mono>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <Mono className="text-paper/45">{t.footer.columns[col.title]}</Mono>
                <ul className="mt-2 space-y-0">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="block py-3 text-[14px] text-paper/75 transition-colors duration-200 hover:text-paper"
                      >
                        {t.footer.links[link.label]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-14 flex flex-col gap-4 border-t pt-7 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--line-night)" }}
        >
          <Mono className="text-paper/40">
{fmt(t.footer.copyright, { year })}
          </Mono>
          <div className="-my-2.5 flex flex-wrap gap-x-6">
            {(["imprint", "privacy", "terms", "cookies"] as const).map((item) => (
              <Link
                key={item}
                href="/#faq"
                className="block py-2.5 text-[12.5px] text-paper/50 transition-colors duration-200 hover:text-paper/80"
              >
                {t.footer.links[item]}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* the mark, drawn once at scale, cropped by the viewport */}
      <div
        aria-hidden
        className="pointer-events-none relative z-[1] -mb-[7vw] px-5 text-center leading-none font-medium tracking-[-0.05em] text-paper/[0.045] select-none sm:px-8"
        style={{ fontSize: "clamp(5rem, 21vw, 20rem)" }}
      >
        AUREL
      </div>
    </footer>
  );
}
