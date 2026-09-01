"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, Sparkles } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { useUIStore } from "@/lib/store/ui";
import { useStudyStore } from "@/lib/store";
import { cn, initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

function NavLink({ href, label, icon: Icon, collapsed }: { href: string; label: string; icon: React.ElementType; collapsed: boolean }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  const link = (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 t-callout font-medium transition-colors",
        active ? "text-ink" : "text-ink-3 hover:text-ink hover:bg-surface-2",
        collapsed && "justify-center px-0 h-9 w-9"
      )}
    >
      {active && (
        <span
          className={cn(
            "absolute inset-0 -z-10 rounded-lg signal-gradient opacity-[0.14]",
            "border border-[color-mix(in_srgb,var(--color-signal)_35%,transparent)]"
          )}
        />
      )}
      <Icon className={cn("size-[17px] shrink-0", active ? "text-[var(--color-signal-2)]" : "")} strokeWidth={2} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }
  return link;
}

export function Sidebar({ className }: { className?: string }) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);
  const profile = useStudyStore((s) => s.profile);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem("studyhub:sidebar-collapsed");
      if (stored === "true") setSidebarCollapsed(true);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const usagePct = profile ? Math.round((profile.aiUsage.used / Math.max(1, profile.aiUsage.limit)) * 100) : 0;

  return (
    <aside
      className={cn(
        "hidden md:flex h-dvh shrink-0 flex-col border-r border-border bg-[var(--chrome)] transition-[width] duration-200 ease-out",
        collapsed ? "w-[68px]" : "w-[236px]",
        className
      )}
    >
      <div className={cn("flex items-center gap-2 px-4 h-14 shrink-0", collapsed && "justify-center px-0")}>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg signal-gradient">
          <Sparkles className="size-4 text-white" strokeWidth={2.25} />
        </div>
        {!collapsed && <span className="t-headline font-semibold tracking-tight text-ink">StudyHub</span>}
      </div>

      <nav aria-label="Hauptnavigation" className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="shrink-0 border-t border-border p-3 space-y-3">
        {!collapsed ? (
          <div className="rounded-xl border border-border bg-surface p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="mono-label">KI-Nutzung</span>
              <span className="t-caption text-ink-3">
                {profile?.aiUsage.used ?? 0}/{profile?.aiUsage.limit ?? 0}
              </span>
            </div>
            <Progress value={usagePct} className="h-1" />
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">
                <Progress value={usagePct} className="h-1 w-8" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              KI-Nutzung: {profile?.aiUsage.used ?? 0}/{profile?.aiUsage.limit ?? 0}
            </TooltipContent>
          </Tooltip>
        )}

        <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <Avatar className="size-8">
            <AvatarFallback>{profile ? initials(profile.name) : "?"}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate t-callout font-medium text-ink">{profile?.name ?? "Schüler:in"}</p>
              <p className="truncate t-caption text-ink-3">
                {[profile?.grade, profile?.schoolYear].filter(Boolean).join(" · ")}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Seitenleiste ausklappen" : "Seitenleiste einklappen"}
          aria-expanded={!collapsed}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 t-caption text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          {!collapsed && "Einklappen"}
        </button>
      </div>
    </aside>
  );
}
