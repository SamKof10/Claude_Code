"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Loader2, MonitorSmartphone, Sparkles } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { MIN_PASSWORD_LENGTH, isValidEmail } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "signup";

const COPY: Record<Mode, { title: string; sub: string; submit: string; switchTo: Mode; switchLabel: string }> = {
  signin: {
    title: "Willkommen zurück",
    sub: "Melde dich an und mach dort weiter, wo du aufgehört hast.",
    submit: "Anmelden",
    switchTo: "signup",
    switchLabel: "Konto erstellen",
  },
  signup: {
    title: "Konto erstellen",
    sub: "Ein Konto hält deine Fächer, Notizen und deinen Fortschritt zusammen.",
    submit: "Konto erstellen",
    switchTo: "signin",
    switchLabel: "Anmelden",
  },
};

export function AuthScreen() {
  const hasAccounts = useAuthStore((s) => s.hasAccounts);
  const pending = useAuthStore((s) => s.pending);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const reduceMotion = useReducedMotion();

  // Null means "not chosen yet", so the default can follow hasAccounts without
  // an effect writing state on mount.
  const [chosenMode, setChosenMode] = React.useState<Mode | null>(null);
  const mode: Mode = chosenMode ?? (hasAccounts ? "signin" : "signup");
  const copy = COPY[mode];

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);

  function switchMode(next: Mode) {
    setChosenMode(next);
    setLocalError(null);
    clearError();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;

    if (!isValidEmail(email)) {
      setLocalError("Gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setLocalError(`Dein Passwort braucht mindestens ${MIN_PASSWORD_LENGTH} Zeichen.`);
      return;
    }
    setLocalError(null);

    if (mode === "signup") await signUp({ name, email, password });
    else await signIn({ email, password });
  }

  const shownError = localError ?? error;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-bg px-4 py-10 dot-grid">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl signal-gradient shadow-lg">
            <Sparkles className="size-[18px] text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-ink">StudyHub</span>
        </div>

        <motion.div
          key={mode}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="card-surface rounded-2xl p-7 shadow-2xl"
        >
          <h1 className="t-title-2 font-semibold tracking-tight text-ink">{copy.title}</h1>
          <p className="mt-1 t-callout text-ink-3">{copy.sub}</p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-name">Name</Label>
                <Input
                  id="auth-name"
                  autoFocus
                  autoComplete="name"
                  placeholder="Dein Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="auth-email">E-Mail</Label>
              <Input
                id="auth-email"
                type="email"
                inputMode="email"
                autoFocus={mode === "signin"}
                autoComplete="email"
                placeholder="du@schule.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="auth-password">Passwort</Label>
              <Input
                id="auth-password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder={mode === "signup" ? `Mindestens ${MIN_PASSWORD_LENGTH} Zeichen` : "Dein Passwort"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {shownError && (
              <p role="alert" className="t-callout text-danger-text">
                {shownError}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Prüfe…
                </>
              ) : (
                copy.submit
              )}
            </Button>
          </form>

          <p className="mt-5 text-center t-callout text-ink-3">
            {mode === "signin" ? "Noch kein Konto?" : "Schon ein Konto?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(copy.switchTo)}
              className="font-medium text-ink underline underline-offset-4 hover:text-[var(--color-signal-2)]"
            >
              {copy.switchLabel}
            </button>
          </p>
        </motion.div>

        <div className={cn("mt-5 flex gap-2.5 rounded-xl border border-border bg-surface p-3.5")}>
          <MonitorSmartphone className="mt-0.5 size-4 shrink-0 text-ink-3" />
          <p className="t-caption text-ink-3">
            Dein Konto liegt in diesem Browser, auf diesem Gerät. Nichts geht an einen Server — StudyHub
            kann ein vergessenes Passwort deshalb nicht wiederherstellen, und deine Arbeit wandert nicht
            auf einen anderen Computer mit. Exportiere in den Einstellungen, wenn du eine Kopie brauchst.
          </p>
        </div>
      </div>
    </div>
  );
}
