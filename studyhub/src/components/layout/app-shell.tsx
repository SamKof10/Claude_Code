"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useStudyStore } from "@/lib/store";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette, GlobalKeyboardShortcuts } from "@/components/layout/command-palette";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { Skeleton } from "@/components/ui/skeleton";

function ShellSkeleton() {
  return (
    <div className="flex h-dvh w-full">
      <div className="hidden md:block w-[236px] shrink-0 border-r border-border p-4 space-y-3">
        <Skeleton className="h-7 w-28" />
        <div className="space-y-2 pt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-6 space-y-4">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useStudyStore((s) => s.hydrated);
  const profile = useStudyStore((s) => s.profile);
  const touchStreak = useStudyStore((s) => s.touchStreak);
  const pathname = usePathname();
  // HIG Accessibility: with Reduce Motion on, replace y-axis transitions with
  // a plain fade rather than dropping the transition entirely.
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (hydrated && profile?.onboarded) touchStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, profile?.onboarded]);

  if (!hydrated) return <ShellSkeleton />;
  if (!profile || !profile.onboarded) return <OnboardingFlow />;

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:signal-gradient focus:px-4 focus:py-2 focus:t-callout focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main" className="flex-1 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-[1400px] px-4 py-5 md:px-7 md:py-7"
          >
            {children}
          </motion.div>
        </main>
      </div>
      <CommandPalette />
      <GlobalKeyboardShortcuts />
    </div>
  );
}
