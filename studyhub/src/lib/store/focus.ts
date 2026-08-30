"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FocusPhase = "focus" | "short-break" | "long-break";
export type FocusStatus = "idle" | "running" | "paused";

export interface FocusSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  roundsBeforeLongBreak: number;
  autoStartNext: boolean;
  chime: boolean;
}

export const DEFAULT_FOCUS_SETTINGS: FocusSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 20,
  roundsBeforeLongBreak: 4,
  autoStartNext: false,
  chime: true,
};

export const PHASE_LABEL: Record<FocusPhase, string> = {
  focus: "Focus",
  "short-break": "Short break",
  "long-break": "Long break",
};

/** What just ended, handed to the caller so the side effects stay outside the store. */
export interface FinishedPhase {
  phase: FocusPhase;
  minutes: number;
  subjectId: string | null;
}

interface FocusState {
  phase: FocusPhase;
  status: FocusStatus;
  /** Wall-clock deadline in epoch ms. The countdown reads this rather than counting down itself, so it can't drift or stall in a background tab. */
  endsAt: number | null;
  /** What is left while idle or paused. Meaningless while running — endsAt is the truth then. */
  remainingMs: number;
  subjectId: string | null;
  /** Focus blocks finished since the last long break. */
  round: number;
  settings: FocusSettings;

  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  selectPhase: (phase: FocusPhase) => void;
  setSubject: (subjectId: string | null) => void;
  updateSettings: (patch: Partial<FocusSettings>) => void;
  /** Advances to the next phase. Returns what finished, or null if the deadline had not actually passed. */
  finish: () => FinishedPhase | null;
  /** Ends the current phase without crediting it. */
  skip: () => void;
  clear: () => void;
}

export function phaseMinutes(phase: FocusPhase, settings: FocusSettings): number {
  if (phase === "focus") return settings.focusMinutes;
  if (phase === "short-break") return settings.shortBreakMinutes;
  return settings.longBreakMinutes;
}

function phaseMs(phase: FocusPhase, settings: FocusSettings): number {
  return phaseMinutes(phase, settings) * 60_000;
}

function idleAt(phase: FocusPhase, settings: FocusSettings) {
  return { phase, status: "idle" as const, endsAt: null, remainingMs: phaseMs(phase, settings) };
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      phase: "focus",
      status: "idle",
      endsAt: null,
      remainingMs: DEFAULT_FOCUS_SETTINGS.focusMinutes * 60_000,
      subjectId: null,
      round: 0,
      settings: DEFAULT_FOCUS_SETTINGS,

      start: () =>
        set((s) => ({ status: "running", endsAt: Date.now() + phaseMs(s.phase, s.settings), remainingMs: phaseMs(s.phase, s.settings) })),

      pause: () =>
        set((s) => {
          if (s.status !== "running" || s.endsAt === null) return {};
          return { status: "paused", remainingMs: Math.max(0, s.endsAt - Date.now()), endsAt: null };
        }),

      resume: () =>
        set((s) => (s.status === "paused" ? { status: "running", endsAt: Date.now() + s.remainingMs } : {})),

      reset: () => set((s) => idleAt(s.phase, s.settings)),

      selectPhase: (phase) => set((s) => idleAt(phase, s.settings)),

      setSubject: (subjectId) => set({ subjectId }),

      updateSettings: (patch) =>
        set((s) => {
          const settings = { ...s.settings, ...patch };
          // A duration change only re-arms a timer that is not mid-run; interrupting
          // a running block because a number changed would lose the block.
          return s.status === "idle" ? { settings, ...idleAt(s.phase, settings) } : { settings };
        }),

      finish: () => {
        const s = get();
        if (s.status !== "running" || s.endsAt === null || Date.now() < s.endsAt) return null;

        const finished: FinishedPhase = {
          phase: s.phase,
          minutes: phaseMinutes(s.phase, s.settings),
          subjectId: s.subjectId,
        };

        const round = s.phase === "focus" ? s.round + 1 : s.round;
        const next: FocusPhase =
          s.phase !== "focus" ? "focus" : round % s.settings.roundsBeforeLongBreak === 0 ? "long-break" : "short-break";
        // The long break closes the set, so the round counter starts over after it.
        const nextRound = s.phase === "long-break" ? 0 : round;

        set(
          s.settings.autoStartNext
            ? { phase: next, round: nextRound, status: "running", endsAt: Date.now() + phaseMs(next, s.settings), remainingMs: phaseMs(next, s.settings) }
            : { ...idleAt(next, s.settings), round: nextRound }
        );
        return finished;
      },

      skip: () =>
        set((s) => {
          const next: FocusPhase = s.phase === "focus" ? "short-break" : "focus";
          return { ...idleAt(next, s.settings), round: s.round };
        }),

      clear: () => set((s) => ({ ...idleAt("focus", s.settings), subjectId: null, round: 0 })),
    }),
    {
      name: "studyhub:focus",
      skipHydration: true,
    }
  )
);
