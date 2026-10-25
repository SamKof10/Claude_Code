import { redirect } from "next/navigation";
import { AppShell, PageTitle, PhaseBadge } from "@/components/app-shell";
import { InfoIcon } from "@/components/icons";
import { logoutAction, resetDataAction, updateStartDateAction } from "../actions";
import { ConfirmForm } from "@/components/confirm-form";
import { formatVolume, loadContext } from "@/lib/data";
import { hasDatabase } from "@/lib/db";
import { volume } from "@/lib/progression";
import { PROGRAM_WEEKS } from "@/lib/plan";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const ctx = await loadContext();
  if (!ctx) redirect("/login");

  const totalVolume = volume(ctx.sets);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageTitle title="Profil" />

        <section className="flex flex-col gap-3 rounded-card bg-surface p-4">
          <p className="text-[17px] font-semibold leading-[22px] break-all">{ctx.user.email}</p>
          <div className="flex flex-wrap gap-2">
            <PhaseBadge week={ctx.week} label={ctx.spec.label} />
          </div>
          <dl className="mt-1 flex gap-6">
            <div>
              <dt className="text-[12px] font-semibold leading-4 tracking-[0.3px] text-ink-2">SESSIONS</dt>
              <dd className="text-[22px] font-bold leading-7 tnum">{ctx.sessions.length}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold leading-4 tracking-[0.3px] text-ink-2">SÄTZE</dt>
              <dd className="text-[22px] font-bold leading-7 tnum">{ctx.sets.length}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-semibold leading-4 tracking-[0.3px] text-ink-2">VOLUMEN</dt>
              <dd className="text-[22px] font-bold leading-7 tnum">{formatVolume(totalVolume)} kg</dd>
            </div>
          </dl>
        </section>

        <section className="flex flex-col gap-3 rounded-card bg-surface p-4">
          <h2 className="text-[17px] font-semibold leading-[22px]">Start des Zyklus</h2>
          <p className="text-[13px] leading-[18px] text-ink-2">
            Ab diesem Tag zählt Woche 1. Verschieb ihn, wenn du pausiert hast — oder setz ihn auf heute, um nach{" "}
            {PROGRAM_WEEKS} Wochen den nächsten Mesozyklus zu starten.
          </p>
          <form action={updateStartDateAction} className="flex flex-col gap-2.5 sm:flex-row">
            <input
              type="date"
              name="startDate"
              defaultValue={ctx.user.startDate}
              required
              aria-label="Startdatum"
              className="h-12 flex-1 rounded-field border border-line bg-sunken px-4 text-[17px] text-ink"
            />
            <button type="submit" className="flex h-12 items-center justify-center rounded-field bg-raised px-5 text-[15px] font-semibold text-ink">
              Speichern
            </button>
          </form>
        </section>

        <section className="flex flex-col gap-3 rounded-card bg-surface p-4">
          <h2 className="text-[17px] font-semibold leading-[22px]">Daten</h2>
          <a
            href="/api/export"
            download={`mesocycle-${ctx.today}.json`}
            className="flex h-12 items-center justify-center rounded-field bg-raised text-[15px] font-semibold text-ink"
          >
            Trainingsdaten als JSON sichern
          </a>
          <ConfirmForm
            action={resetDataAction}
            triggerLabel="Alle Trainingsdaten löschen"
            title="Alle Trainingsdaten löschen?"
            body={`${ctx.sessions.length} Sessions und ${ctx.sets.length} Sätze werden entfernt. Das Konto bleibt bestehen. Rückgängig machen geht nicht — sichere vorher die JSON-Datei, wenn du unsicher bist.`}
            confirmLabel="Endgültig löschen"
          />
        </section>

        {!hasDatabase && (
          <div className="flex gap-3 rounded-card bg-warn/12 px-4 py-3.5">
            <InfoIcon size={20} className="mt-0.5 shrink-0 text-warn-bright" />
            <p className="text-[13px] leading-[18px] text-warn-bright">
              Keine Datenbank verbunden. Alles liegt im Arbeitsspeicher des Servers und ist beim nächsten Neustart weg.
              Trag <code className="font-mono">DATABASE_URL</code> in den Umgebungsvariablen ein, dann bleibt es.
            </p>
          </div>
        )}

        <form action={logoutAction}>
          <button type="submit" className="flex h-12 w-full items-center justify-center rounded-field text-[17px] font-semibold text-ink-2">
            Abmelden
          </button>
        </form>
      </div>
    </AppShell>
  );
}
