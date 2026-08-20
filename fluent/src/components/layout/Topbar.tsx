"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Sun, Moon, Settings, Flame } from "lucide-react";
import { NAV_GROUPS } from "./nav";
import { SidebarNav } from "./Sidebar";
import { useStore } from "@/lib/store";
import { useEscape, useScrollLock } from "@/hooks";
import { cn } from "@/components/ui/cn";

function pageTitle(pathname: string): string {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/")) {
        return item.label;
      }
    }
  }
  return "FLUENT";
}

export function Topbar() {
  const pathname = usePathname();
  const { state, setTheme } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  useScrollLock(menuOpen);
  useEscape(menuOpen, () => setMenuOpen(false));

  return (
    <>
      <header className="glass-solid sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--line)] px-4 md:px-8">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="grid h-9 w-9 place-items-center rounded-full text-ink-2 hover:bg-surface-2 md:hidden"
        >
          <Menu size={19} strokeWidth={1.8} />
        </button>

        <h1 className="text-[14.5px] font-medium text-ink-1">{pageTitle(pathname)}</h1>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="mono hidden items-center gap-1.5 rounded-full border border-[var(--line)] px-2.5 py-1.5 text-amber sm:flex">
            <Flame size={13} strokeWidth={2} />
            {state.streakDays}d streak
          </span>
          <button
            type="button"
            onClick={() => setTheme(state.theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full text-ink-2 hover:bg-surface-2"
          >
            {state.theme === "dark" ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
          </button>
          <Link
            href="/settings"
            aria-label="Settings"
            className="grid h-9 w-9 place-items-center rounded-full text-ink-2 hover:bg-surface-2"
          >
            <Settings size={17} strokeWidth={1.8} />
          </Link>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-[100] bg-black/50 transition-opacity duration-200 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "h-full w-72 max-w-[85vw] border-r border-[var(--line)] bg-surface-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            )}
          >
            <div className="flex justify-end px-3 pt-3">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-full text-ink-2 hover:bg-surface-2"
              >
                <X size={19} strokeWidth={1.8} />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
