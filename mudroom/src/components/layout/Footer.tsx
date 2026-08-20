import { Logo } from "./Logo";
import { Mono, StatusDot } from "@/components/ui/Primitives";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "The box", href: "#product" },
      { label: "How it works", href: "#how" },
      { label: "Technology", href: "#tech" },
      { label: "Specifications", href: "#specs" },
    ],
  },
  {
    title: "Buy & rent",
    links: [
      { label: "Configure", href: "#buy" },
      { label: "Event rental", href: "#rent" },
      { label: "Rental calculator", href: "#calculator" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Riders", href: "#reviews" },
      { label: "Press kit", href: "#faq" },
      { label: "Dealers", href: "#rent" },
      { label: "Contact", href: "#rent" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-[#0a0c0d] px-5 pt-20 sm:px-8">
      <div className="hazard absolute inset-x-0 top-0 h-1.5 opacity-70" aria-hidden />
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="grid gap-12 pb-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo compact />
            <p className="mt-5 max-w-[34ch] text-sm leading-relaxed text-concrete/45">
              An automatic bike wash box for people whose bikes come home the
              colour of the trail. Dirt stops here.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <StatusDot />
              <Mono className="text-concrete/40">Assembled in Aalen, Germany</Mono>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <Mono className="text-concrete/35">{col.title}</Mono>
              <ul className="mt-3 space-y-0.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="block py-2.5 text-sm text-concrete/65 transition-colors hover:text-hivis"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--edge)] py-7 sm:flex-row sm:items-center sm:justify-between">
          <Mono className="text-concrete/30">© 2026 Mudroom Systems GmbH</Mono>
          <p className="max-w-[62ch] text-xs leading-relaxed text-concrete/30">
            Concept site. MUDROOM ONE is a design study — prices, dimensions,
            performance figures and reviews on this page are demonstration
            data, and the checkout does not take real payments.
          </p>
        </div>
      </div>
    </footer>
  );
}
