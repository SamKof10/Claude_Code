"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

export type SrsState = "new" | "learning" | "familiar" | "mastered";
export type Skill = "vocabulary" | "listening" | "speaking" | "grammar" | "writing" | "naturalness";
export type ExplanationLanguage = "de" | "en" | "adaptive";
export type Accent = "british" | "american" | "australian" | "irish" | "canadian";
export type Theme = "dark" | "light";
export type ActivityId =
  | "vocabulary"
  | "grammar"
  | "listening"
  | "speaking"
  | "writing"
  | "think"
  | "translate"
  | "natural"
  | "c1c2"
  | "debate"
  | "reallife"
  | "abroad"
  | "tutor"
  | "session";

export interface VocabProgress {
  state: SrsState;
  seen: number;
  correct: number;
  lastResult?: "correct" | "incorrect";
}

export interface SessionRecord {
  date: string;
  minutes: number;
  newWords: number;
  grammarPatterns: number;
  speakingExercises: number;
  progressGain: number;
}

/** One completed monthly check-in — see `buildMonthlyTest` in
 * `lib/content/monthlyTest.ts` for how the test itself is assembled. */
export interface MonthlyTestRecord {
  date: string;
  monthIndex: number;
  overallScore: number;
  skillScores: Partial<Record<Skill, number>>;
  level: string;
  leveledUp: boolean;
}

export interface FluentState {
  hydrated: boolean;
  level: string;
  targetLevel: string;
  c1Progress: number;
  streakDays: number;
  lastActiveDate: string | null;
  totalWordsMastered: number;
  totalMinutes: number;
  minutesToday: number;
  weeklyProgress: number[];
  skillScores: Record<Skill, number>;
  vocab: Record<string, VocabProgress>;
  completedActivities: ActivityId[];
  sessions: SessionRecord[];
  theme: Theme;
  explanationLanguage: ExplanationLanguage;
  accent: Accent;
  dailyGoalMinutes: number;
  /** The day you started — the monthly test cadence counts from here. */
  programStartDate: string | null;
  monthlyTests: MonthlyTestRecord[];
}

const STORAGE_KEY = "fluent.state.v1";
const todayISO = () => new Date().toISOString().slice(0, 10);

function initialState(): FluentState {
  return {
    hydrated: false,
    level: "B2",
    targetLevel: "C1",
    c1Progress: 0,
    streakDays: 0,
    lastActiveDate: null,
    totalWordsMastered: 0,
    totalMinutes: 0,
    minutesToday: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0, 0],
    skillScores: {
      vocabulary: 0,
      listening: 0,
      speaking: 0,
      grammar: 0,
      writing: 0,
      naturalness: 0,
    },
    vocab: {},
    completedActivities: [],
    sessions: [],
    theme: "dark",
    explanationLanguage: "adaptive",
    accent: "british",
    dailyGoalMinutes: 50,
    programStartDate: null,
    monthlyTests: [],
  };
}

type Action =
  | { type: "hydrate"; state: Partial<FluentState> }
  | { type: "setTheme"; theme: Theme }
  | { type: "setExplanationLanguage"; value: ExplanationLanguage }
  | { type: "setAccent"; value: Accent }
  | { type: "setDailyGoal"; minutes: number }
  | { type: "reviewWord"; id: string; correct: boolean }
  | { type: "bumpSkill"; skill: Skill; delta: number }
  | { type: "markActivity"; id: ActivityId }
  | { type: "logMinutes"; minutes: number }
  | { type: "touchStreak" }
  | { type: "completeSession"; record: SessionRecord }
  | { type: "completeMonthlyTest"; record: MonthlyTestRecord }
  | { type: "resetProgress" };

function nextSrs(state: SrsState, correct: boolean): SrsState {
  const order: SrsState[] = ["new", "learning", "familiar", "mastered"];
  const idx = order.indexOf(state);
  if (correct) return order[Math.min(idx + 1, order.length - 1)];
  return order[Math.max(idx - 1, 0)];
}

function withStreak(state: FluentState): Pick<FluentState, "streakDays" | "lastActiveDate"> {
  const today = todayISO();
  if (state.lastActiveDate === today) return { streakDays: state.streakDays, lastActiveDate: today };
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streakDays = state.lastActiveDate === yesterday ? state.streakDays + 1 : 1;
  return { streakDays, lastActiveDate: today };
}

function reducer(state: FluentState, action: Action): FluentState {
  switch (action.type) {
    case "hydrate": {
      const merged = { ...state, ...action.state, hydrated: true };
      return merged.programStartDate ? merged : { ...merged, programStartDate: todayISO() };
    }
    case "setTheme":
      return { ...state, theme: action.theme };
    case "setExplanationLanguage":
      return { ...state, explanationLanguage: action.value };
    case "setAccent":
      return { ...state, accent: action.value };
    case "setDailyGoal":
      return { ...state, dailyGoalMinutes: action.minutes };
    case "reviewWord": {
      const current = state.vocab[action.id] ?? { state: "new" as SrsState, seen: 0, correct: 0 };
      const nextState = nextSrs(current.state, action.correct);
      const wasMastered = current.state === "mastered";
      const isMastered = nextState === "mastered";
      const delta = isMastered && !wasMastered ? 1 : !isMastered && wasMastered ? -1 : 0;
      return {
        ...state,
        totalWordsMastered: state.totalWordsMastered + delta,
        vocab: {
          ...state.vocab,
          [action.id]: {
            state: nextState,
            seen: current.seen + 1,
            correct: current.correct + (action.correct ? 1 : 0),
            lastResult: action.correct ? "correct" : "incorrect",
          },
        },
      };
    }
    case "bumpSkill": {
      const current = state.skillScores[action.skill];
      const value = Math.max(0, Math.min(100, current + action.delta));
      return { ...state, skillScores: { ...state.skillScores, [action.skill]: value } };
    }
    case "markActivity": {
      if (state.completedActivities.includes(action.id)) return state;
      return { ...state, completedActivities: [...state.completedActivities, action.id] };
    }
    case "logMinutes":
      return {
        ...state,
        minutesToday: state.minutesToday + action.minutes,
        totalMinutes: state.totalMinutes + action.minutes,
        ...withStreak(state),
      };
    case "touchStreak":
      return { ...state, ...withStreak(state) };
    case "completeSession": {
      const gain = action.record.progressGain;
      const weeklyProgress = [...state.weeklyProgress.slice(1), Math.min(100, state.c1Progress + gain)];
      return {
        ...state,
        c1Progress: Math.min(100, state.c1Progress + gain),
        weeklyProgress,
        sessions: [action.record, ...state.sessions].slice(0, 30),
        minutesToday: state.minutesToday + action.record.minutes,
        totalMinutes: state.totalMinutes + action.record.minutes,
        ...withStreak(state),
      };
    }
    case "completeMonthlyTest":
      return {
        ...state,
        monthlyTests: [action.record, ...state.monthlyTests].slice(0, 24),
        skillScores: { ...state.skillScores, ...action.record.skillScores },
        level: action.record.level,
        c1Progress: action.record.overallScore,
      };
    case "resetProgress":
      return { ...initialState(), hydrated: true, theme: state.theme, programStartDate: todayISO() };
    default:
      return state;
  }
}

interface StoreContextValue {
  state: FluentState;
  setTheme: (t: Theme) => void;
  setExplanationLanguage: (v: ExplanationLanguage) => void;
  setAccent: (v: Accent) => void;
  setDailyGoal: (m: number) => void;
  reviewWord: (id: string, correct: boolean) => void;
  bumpSkill: (skill: Skill, delta: number) => void;
  markActivity: (id: ActivityId) => void;
  logMinutes: (minutes: number) => void;
  completeSession: (record: SessionRecord) => void;
  completeMonthlyTest: (record: MonthlyTestRecord) => void;
  resetProgress: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function readStored(): Partial<FluentState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<FluentState>;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) dispatch({ type: "hydrate", state: stored });
    else dispatch({ type: "hydrate", state: {} });
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      const persisted: Partial<FluentState> = { ...state };
      delete persisted.hydrated;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      /* storage full or blocked — app still works for this session */
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", state.theme);
    try {
      window.localStorage.setItem("fluent.theme", state.theme);
    } catch {
      /* ignore */
    }
  }, [state.theme]);

  const setTheme = useCallback((theme: Theme) => dispatch({ type: "setTheme", theme }), []);
  const setExplanationLanguage = useCallback(
    (value: ExplanationLanguage) => dispatch({ type: "setExplanationLanguage", value }),
    [],
  );
  const setAccent = useCallback((value: Accent) => dispatch({ type: "setAccent", value }), []);
  const setDailyGoal = useCallback((minutes: number) => dispatch({ type: "setDailyGoal", minutes }), []);
  const reviewWord = useCallback(
    (id: string, correct: boolean) => dispatch({ type: "reviewWord", id, correct }),
    [],
  );
  const bumpSkill = useCallback(
    (skill: Skill, delta: number) => dispatch({ type: "bumpSkill", skill, delta }),
    [],
  );
  const markActivity = useCallback((id: ActivityId) => dispatch({ type: "markActivity", id }), []);
  const logMinutes = useCallback((minutes: number) => dispatch({ type: "logMinutes", minutes }), []);
  const completeSession = useCallback(
    (record: SessionRecord) => dispatch({ type: "completeSession", record }),
    [],
  );
  const completeMonthlyTest = useCallback(
    (record: MonthlyTestRecord) => dispatch({ type: "completeMonthlyTest", record }),
    [],
  );
  const resetProgress = useCallback(() => dispatch({ type: "resetProgress" }), []);

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      setTheme,
      setExplanationLanguage,
      setAccent,
      setDailyGoal,
      reviewWord,
      bumpSkill,
      markActivity,
      logMinutes,
      completeSession,
      completeMonthlyTest,
      resetProgress,
    }),
    [
      state,
      setTheme,
      setExplanationLanguage,
      setAccent,
      setDailyGoal,
      reviewWord,
      bumpSkill,
      markActivity,
      logMinutes,
      completeSession,
      completeMonthlyTest,
      resetProgress,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

export const LEVEL_ORDER = ["B2", "B2+", "C1", "C1+", "C2"] as const;

export const SKILL_LABELS: Record<Skill, string> = {
  vocabulary: "Vocabulary",
  listening: "Listening",
  speaking: "Speaking",
  grammar: "Grammar",
  writing: "Writing",
  naturalness: "Naturalness",
};

/** Days between monthly check-ins. */
export const TEST_INTERVAL_DAYS = 30;

function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b + "T00:00:00Z").getTime() - new Date(a + "T00:00:00Z").getTime()) / 86400000);
}

export interface MonthlyTestStatus {
  /** The month this check-in belongs to (1 = first month), whether it's due yet or not. */
  monthIndex: number;
  /** True once enough days have passed since the last check-in (or program start). */
  available: boolean;
  daysUntilNext: number;
}

/** Pure gating logic for the monthly test: due every `TEST_INTERVAL_DAYS`
 * days, counted from `programStartDate` and then from each completed test. */
export function monthlyTestStatus(state: FluentState): MonthlyTestStatus {
  const monthIndex = state.monthlyTests.length + 1;
  if (!state.programStartDate) return { monthIndex, available: false, daysUntilNext: TEST_INTERVAL_DAYS };
  const since = state.monthlyTests[0]?.date ?? state.programStartDate;
  const elapsed = daysBetween(since, todayISO());
  return {
    monthIndex,
    available: elapsed >= TEST_INTERVAL_DAYS,
    daysUntilNext: Math.max(0, TEST_INTERVAL_DAYS - elapsed),
  };
}

/** A level-up is earned, not automatic — only a strong check-in (≥85) moves
 * you to the next rung of `LEVEL_ORDER`. */
export function levelAfterTest(currentLevel: string, overallScore: number): { level: string; leveledUp: boolean } {
  const idx = LEVEL_ORDER.indexOf(currentLevel as (typeof LEVEL_ORDER)[number]);
  if (idx === -1 || idx === LEVEL_ORDER.length - 1 || overallScore < 85) return { level: currentLevel, leveledUp: false };
  return { level: LEVEL_ORDER[idx + 1], leveledUp: true };
}
