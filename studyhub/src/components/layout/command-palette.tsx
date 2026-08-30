"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  FileText,
  GraduationCap,
  LayoutGrid,
  Layers,
  Layers3,
  ListChecks,
  NotebookPen,
  Settings,
  Sparkles,
  Timer,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useUIStore } from "@/lib/store/ui";
import { useStudyStore } from "@/lib/store";
import { useFocusStore } from "@/lib/store/focus";
import { buildSearchIndex } from "@/lib/search";
import type { SearchIndexEntry } from "@/lib/types";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

const KIND_ICON: Record<SearchIndexEntry["kind"], React.ElementType> = {
  subject: Layers,
  document: FileText,
  note: NotebookPen,
  "flashcard-deck": Layers3,
  task: CheckSquare,
  exam: GraduationCap,
  quiz: ListChecks,
  conversation: Sparkles,
};

const KIND_LABEL: Record<SearchIndexEntry["kind"], string> = {
  subject: "Subjects",
  document: "Documents",
  note: "Notes",
  "flashcard-deck": "Flashcard decks",
  task: "Tasks",
  exam: "Exams",
  quiz: "Quizzes",
  conversation: "AI conversations",
};

export function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const router = useRouter();
  const state = useStudyStore();

  const index = React.useMemo(() => buildSearchIndex(state), [state]);
  const grouped = React.useMemo(() => {
    const map = new Map<SearchIndexEntry["kind"], SearchIndexEntry[]>();
    index.forEach((e) => {
      const arr = map.get(e.kind) ?? [];
      arr.push(e);
      map.set(e.kind, arr);
    });
    return map;
  }, [index]);

  const focusStatus = useFocusStore((s) => s.status);

  const startFocus = useFocusStore((s) => s.start);

  const go = React.useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router, setOpen]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search StudyHub, or type a command…" />
      <CommandList>
        <CommandEmpty>No results. Try a different search.</CommandEmpty>

        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go("/notes?new=1")}>
            <NotebookPen /> New note
          </CommandItem>
          <CommandItem onSelect={() => go("/documents?upload=1")}>
            <Upload /> Upload document
          </CommandItem>
          <CommandItem onSelect={() => go("/tasks?new=1")}>
            <CheckSquare /> Create task
          </CommandItem>
          <CommandItem onSelect={() => go("/quizzes/new")}>
            <ListChecks /> Start a quiz
          </CommandItem>
          <CommandItem onSelect={() => go("/flashcards?study=1")}>
            <Layers3 /> Study flashcards
          </CommandItem>
          <CommandItem
            onSelect={() => {
              // Opening the page mid-block should not restart the block.
              if (focusStatus === "idle") startFocus();
              go("/focus");
            }}
          >
            <Timer /> {focusStatus === "idle" ? "Start a focus block" : "Open the focus timer"}
          </CommandItem>
          <CommandItem onSelect={() => go("/exams?new=1")}>
            <GraduationCap /> New exam
          </CommandItem>
          <CommandItem onSelect={() => go("/ai-tutor")}>
            <Sparkles /> Ask AI Tutor
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Go to">
          <CommandItem onSelect={() => go("/dashboard")}>
            <LayoutGrid /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go("/calendar")}>
            <CalendarDays /> Calendar
          </CommandItem>
          <CommandItem onSelect={() => go("/progress")}>
            <TrendingUp /> Progress
          </CommandItem>
          <CommandItem onSelect={() => go("/settings")}>
            <Settings /> Settings
          </CommandItem>
        </CommandGroup>

        {[...grouped.entries()].map(([kind, entries]) => (
          <React.Fragment key={kind}>
            <CommandSeparator />
            <CommandGroup heading={KIND_LABEL[kind]}>
              {entries.slice(0, 8).map((entry) => {
                const Icon = KIND_ICON[entry.kind];
                return (
                  <CommandItem key={entry.id} value={`${entry.title} ${entry.subtitle ?? ""}`} onSelect={() => go(entry.href)}>
                    <Icon />
                    <span className="truncate">{entry.title}</span>
                    {entry.subtitle && <CommandShortcut>{entry.subtitle}</CommandShortcut>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

export function GlobalKeyboardShortcuts() {
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (!isMeta) return;
      const key = e.key.toLowerCase();
      if (key === "k" || key === "p" || key === "f") {
        e.preventDefault();
        setOpen(true);
      } else if (key === "n") {
        e.preventDefault();
        router.push("/notes?new=1");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen, router]);

  return null;
}
