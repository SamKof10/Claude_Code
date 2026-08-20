"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { FOCUS_MODE_PREFIXES } from "./nav";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const focusMode = FOCUS_MODE_PREFIXES.some((p) => pathname.startsWith(p));

  if (focusMode) {
    return <div className="min-h-dvh bg-surface-0">{children}</div>;
  }

  return (
    <div className="min-h-dvh bg-surface-0">
      <Sidebar />
      <div className="md:pl-64">
        <Topbar />
        <main className="mx-auto max-w-[1100px] px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
