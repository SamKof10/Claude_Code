"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Moon, Plus, Search, Sparkles, Sun } from "lucide-react";
import { useUIStore } from "@/lib/store/ui";
import { useTheme } from "@/components/providers/theme-provider";
import { useStudyStore } from "@/lib/store";
import { useAuthStore } from "@/lib/store/auth";
import { FocusIndicator } from "@/components/focus/focus-indicator";
import { NAV_ITEMS } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function pageTitle(pathname: string) {
  const match = NAV_ITEMS.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  return match?.label ?? "StudyHub";
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const mobileNavOpen = useUIStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);
  const { theme, toggleTheme } = useTheme();
  const profile = useStudyStore((s) => s.profile);
  const resetDemoData = useStudyStore((s) => s.resetDemoData);
  const account = useAuthStore((s) => s.account);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-[var(--bg)]/85 backdrop-blur px-3 md:px-5">
        <button
          className="md:hidden flex size-8 items-center justify-center rounded-md text-ink-2 hover:bg-surface-2"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Navigation öffnen"
        >
          <Menu className="size-[18px]" />
        </button>

        <h1 className="t-body font-medium text-ink md:hidden">{pageTitle(pathname)}</h1>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 h-8 t-callout text-ink-3 transition-colors hover:border-border-strong hover:text-ink w-64 lg:w-80"
        >
          <Search className="size-[15px]" />
          <span className="flex-1 text-left">StudyHub durchsuchen…</span>
          <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 t-caption font-mono text-ink-3">⌘K</kbd>
        </button>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="md:hidden ml-auto flex size-8 items-center justify-center rounded-md text-ink-2 hover:bg-surface-2"
          aria-label="Suchen"
        >
          <Search className="size-[17px]" />
        </button>

        <div className="ml-auto hidden md:flex items-center gap-1.5">
          <FocusIndicator />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-3.5" />
                Neu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => router.push("/notes?new=1")}>Neue Notiz</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/documents?upload=1")}>Dokument hochladen</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/tasks?new=1")}>Neue Aufgabe</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/flashcards?new=1")}>Neuer Kartenstapel</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/quizzes/new")}>Quiz erstellen</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/exams?new=1")}>Neue Prüfung</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push("/ai-tutor")}>
                <Sparkles className="size-3.5" /> KI-Tutor fragen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Zu hellem Erscheinungsbild wechseln" : "Zu dunklem Erscheinungsbild wechseln"}
            title="Erscheinungsbild — in den Einstellungen wieder auf System stellen"
          >
            {theme === "dark" ? <Sun className="size-[17px]" /> : <Moon className="size-[17px]" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal)]">
                <Avatar className="size-8">
                  <AvatarFallback>{profile ? initials(profile.name) : "?"}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="pb-1">
                <span className="block truncate text-ink">{profile?.name ?? "Schüler:in"}</span>
                {account && <span className="block truncate t-caption font-normal text-ink-3">{account.email}</span>}
              </DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => router.push("/settings")}>Einstellungen</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/progress")}>Mein Fortschritt</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => resetDemoData()}>Demodaten laden</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void signOut()}>
                <LogOut className="size-3.5" /> Abmelden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md signal-gradient">
                <Sparkles className="size-3.5 text-white" />
              </div>
              StudyHub
            </SheetTitle>
          </SheetHeader>
          <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 t-body font-medium",
                    active ? "bg-surface-2 text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                  )}
                >
                  <item.icon className="size-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
