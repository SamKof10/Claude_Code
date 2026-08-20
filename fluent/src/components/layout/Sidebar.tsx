"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "./nav";
import { cn } from "@/components/ui/cn";
import { Mono, StatusDot } from "@/components/ui/Primitives";
import { useStore } from "@/lib/store";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { state } = useStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-gradient-to-br from-signal to-signal-deep text-[13px] font-semibold text-white">
          F
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-medium tracking-[-0.01em] text-ink-1">FLUENT</span>
          <span className="mono flex items-center gap-1.5 text-ink-3">
            <StatusDot tone="mint" />
            engine online
          </span>
        </div>
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className={cn("mb-1", gi > 0 && "mt-5")}>
            {group.label ? <Mono className="px-3 pb-2 text-ink-3">{group.label}</Mono> : null}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-medium transition-colors duration-150",
                        active ? "bg-surface-2 text-ink-1" : "text-ink-2 hover:bg-surface-2/60 hover:text-ink-1",
                      )}
                    >
                      <Icon size={16.5} strokeWidth={1.8} className={active ? "text-signal" : "text-ink-3"} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mx-3 mb-4 rounded-2xl border border-[var(--line)] bg-surface-2/50 p-3.5">
        <div className="flex items-center justify-between">
          <Mono className="text-ink-3">Level</Mono>
          <Mono className="text-signal">{state.level} → {state.targetLevel}</Mono>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div className="h-full rounded-full bg-signal transition-[width] duration-700" style={{ width: `${state.c1Progress}%` }} />
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[11px] text-ink-3">{state.c1Progress}% to {state.targetLevel}</span>
          <span className="text-[11px] text-ink-3">🔥 {state.streakDays}d</span>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[var(--line)] bg-surface-0 md:block">
      <SidebarNav />
    </aside>
  );
}
