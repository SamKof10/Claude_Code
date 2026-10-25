import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction, registerAction, type AuthErrorCode } from "../actions";
import { LogoMark } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { currentUser } from "@/lib/auth";
import { todayISO } from "@/lib/data";
import { hasDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

const MESSAGES: Record<AuthErrorCode, string> = {
  email: "Diese E-Mail-Adresse sieht nicht richtig aus.",
  kurz: "Das Passwort braucht mindestens 8 Zeichen.",
  datum: "Das Startdatum ist ungültig.",
  existiert: "Für diese E-Mail gibt es schon ein Konto. Melde dich stattdessen an.",
  leer: "E-Mail und Passwort eingeben.",
  falsch: "E-Mail oder Passwort stimmt nicht.",
  speicher: "Speichern hat nicht geklappt. Ist die Datenbank verbunden?",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ neu?: string; fehler?: string; email?: string }>;
}) {
  if (await currentUser()) redirect("/");

  const params = await searchParams;
  const isRegister = params.neu === "1";
  const message = params.fehler && params.fehler in MESSAGES ? MESSAGES[params.fehler as AuthErrorCode] : null;
  const email = typeof params.email === "string" ? params.email.slice(0, 200) : "";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-9 px-6 py-12">
      <header className="flex flex-col gap-3">
        <LogoMark size={40} className="text-go" />
        <h1 className="text-[34px] font-bold leading-[41px] tracking-[-0.5px]">Mesocycle</h1>
        <p className="max-w-[300px] text-[17px] leading-[22px] text-ink-2 text-pretty">
          Dein 8-Wochen-Plan für Oberkörper und Rumpf. Sätze loggen, Progression bekommen.
        </p>
      </header>

      <form action={isRegister ? registerAction : loginAction} className="flex flex-col gap-4">
        <Field label="E-Mail">
          <input
            type="email"
            name="email"
            required
            defaultValue={email}
            autoComplete="email"
            inputMode="email"
            placeholder="du@beispiel.at"
            className="h-[52px] w-full rounded-field border border-line bg-surface px-4 text-[17px] text-ink placeholder:text-ink-3"
          />
        </Field>

        <Field label="Passwort" hint={isRegister ? "Mindestens 8 Zeichen" : undefined}>
          <input
            type="password"
            name="password"
            required
            minLength={isRegister ? 8 : undefined}
            autoComplete={isRegister ? "new-password" : "current-password"}
            className="h-[52px] w-full rounded-field border border-line bg-surface px-4 text-[17px] text-ink"
          />
        </Field>

        {isRegister && (
          <Field label="Start des Zyklus" hint="Ab diesem Tag zählt Woche 1. Meist der kommende Montag.">
            <input
              type="date"
              name="startDate"
              defaultValue={todayISO()}
              required
              className="h-[52px] w-full rounded-field border border-line bg-surface px-4 text-[17px] text-ink"
            />
          </Field>
        )}

        {message && (
          <p role="alert" className="rounded-field bg-warn/12 px-4 py-3 text-[15px] leading-[20px] text-warn-bright">
            {message}
          </p>
        )}

        <SubmitButton
          label={isRegister ? "Konto anlegen" : "Anmelden"}
          pendingLabel="Moment…"
          className="mt-2 h-[52px]"
        />
      </form>

      <div className="flex min-h-[44px] items-center justify-center gap-1.5">
        <span className="text-[15px] text-ink-2">{isRegister ? "Schon ein Konto?" : "Noch kein Konto?"}</span>
        <Link
          href={isRegister ? "/login" : "/login?neu=1"}
          className="flex min-h-[44px] items-center px-1 text-[15px] font-semibold text-go"
        >
          {isRegister ? "Anmelden" : "Registrieren"}
        </Link>
      </div>

      {!hasDatabase && (
        <p className="rounded-card bg-warn/12 px-4 py-3 text-[13px] leading-[18px] text-warn-bright">
          Es ist keine Datenbank verbunden. Konto und Trainingsdaten liegen nur im Arbeitsspeicher des Servers und
          verschwinden beim nächsten Neustart. Setz <code className="font-mono">DATABASE_URL</code>, damit alles
          dauerhaft gespeichert wird.
        </p>
      )}
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[7px]">
      <span className="pl-0.5 text-[13px] font-semibold leading-[18px] text-ink-2">{label}</span>
      {children}
      {hint && <span className="pl-0.5 text-[13px] leading-[18px] text-ink-3">{hint}</span>}
    </label>
  );
}
