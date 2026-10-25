"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarIcon, DumbbellIcon, PersonIcon, TrendIcon } from "./icons";

const TABS = [
  { href: "/", label: "Heute", Icon: DumbbellIcon },
  { href: "/woche", label: "Woche", Icon: CalendarIcon },
  { href: "/verlauf", label: "Verlauf", Icon: TrendIcon },
  { href: "/profil", label: "Profil", Icon: PersonIcon },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-sunken/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch px-2 pt-2">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" || pathname.startsWith("/uebung") : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[50px] flex-col items-center gap-1 rounded-lg pt-1.5 pb-1 transition-colors ${
                  active ? "text-go" : "text-ink-3"
                }`}
              >
                <Icon size={24} />
                <span className={`text-[10px] leading-[13px] ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
