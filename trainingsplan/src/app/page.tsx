import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, Chip, PhaseBadge } from "@/components/app-shell";
import { CheckIcon, ChevronRightIcon, InfoIcon } from "@/components/icons";
import { dayState, formatKg, loadContext } from "@/lib/data";
import { hasDatabase } from "@/lib/db";
import { DAY_TYPES, dayMeta, exerciseById, exercisesForDay, type DayType } from "@/lib/plan";

export const dynamic = "force-dynamic";

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const ctx = await loadContext();
  if (!ctx) redirect("/login");

  const params = await searchParams;
  const requested = DAY_TYPES.find((d) => d.id === params.tag)?.id;
  const dayType: DayType = requested ?? ctx.plannedDayType ?? "push_a";
  const isRestDay = !ctx.plannedDayType && !requested;
  const meta = dayMeta(dayType);
  const state = dayState(ctx, dayType, ctx.today);
  const planned = exercisesForDay(dayType);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {!hasDatabase && (
          <p className="rounded-card bg-warn/12 px-4 py-3 text-[13px] leading-[18px] text-warn-bright">
            Keine Datenbank verbunden — die Daten liegen nur im Arbeitsspeicher und gehen beim Neustart verloren.
          </p>
        )}

        <header className="flex flex-col gap-2">
          <p className="text-[15px] font-medium leading-[20px] tracking-[0.2px] text-ink-2">
            {meta.weekday.toUpperCase()} · TAG {meta.day}
            {isRestDay && " · RUHETAG"}
          </p>
          <div className="flex items-end justify-between gap-3">
            <h1 className="text-[34px] font-bold leading-[41px] tracking-[-0.5px]">{meta.label}</h1>
            <span className="pb-1.5 text-[15px] leading-[20px] text-ink-2">{meta.focus}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            <PhaseBadge week={ctx.week} label={ctx.spec.label} />
            <Chip>
              {ctx.spec.sets} Sätze · {ctx.spec.repMin}–{ctx.spec.repMax} Wdh
            </Chip>
          </div>
        </header>

        {ctx.cycleDone && (
          <div className="flex gap-3 rounded-card bg-go/12 px-4 py-3.5">
            <InfoIcon size={20} className="mt-0.5 shrink-0 text-go-bright" />
            <p className="text-[13px] leading-[18px] text-go-bright">
              Die acht Wochen sind durch. Setz im Profil ein neues Startdatum, dann läuft der nächste Mesozyklus —
              diesmal mit deinen Gewichten aus Woche 8 als Basis.
            </p>
          </div>
        )}

        {isRestDay && (
          <div className="flex gap-3 rounded-card bg-surface px-4 py-3.5">
            <InfoIcon size={20} className="mt-0.5 shrink-0 text-ink-2" />
            <p className="text-[13px] leading-[18px] text-ink-2">
              Heute steht nichts im Plan. Wenn du eine Einheit nachholst, wähl unten den Tag aus — sie wird auf heute
              gebucht und zählt für die Woche.
            </p>
          </div>
        )}

        <DaySwitcher current={dayType} planned={ctx.plannedDayType} />

        <section className="flex flex-col gap-2.5 rounded-card bg-surface p-4" aria-label="Fortschritt heute">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[17px] font-semibold leading-[22px]">Heutiger Fortschritt</h2>
            <span className="text-[15px] leading-[20px] text-ink-2">
              {state.doneCount} / {planned.length} Übungen
            </span>
          </div>
          <div className="flex h-1.5 gap-1" role="img" aria-label={`${state.doneCount} von ${planned.length} Übungen abgeschlossen`}>
            {planned.map((ex, i) => (
              <div
                key={ex.id}
                className={`flex-1 rounded-full ${state.exercises[i].done ? "bg-go" : "bg-line"}`}
              />
            ))}
          </div>
          {state.totalVolume > 0 && (
            <p className="text-[13px] leading-[18px] text-ink-3 tnum">
              {Math.round(state.totalVolume).toLocaleString("de-DE")} kg Volumen bisher
            </p>
          )}
        </section>

        <ul className="flex flex-col gap-2.5">
          {state.exercises.map((exState) => {
            const exercise = exerciseById(exState.exerciseId)!;
            const working = exState.loggedSets.filter((s) => !s.isDropSet);
            return (
              <li key={exercise.id}>
                <Link
                  href={`/uebung/${exercise.id}`}
                  className={`flex min-h-[76px] items-center gap-3.5 rounded-card px-4 py-3.5 transition-colors ${
                    exState.done
                      ? "bg-surface/60"
                      : working.length > 0
                        ? "border-[1.5px] border-go bg-raised"
                        : "bg-surface active:bg-raised"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                      exState.done ? "bg-go text-bg" : "border-2 border-line"
                    }`}
                  >
                    {exState.done && <CheckIcon size={16} />}
                  </span>

                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={`text-[17px] font-semibold leading-[22px] ${exState.done ? "text-ink-2" : ""}`}>
                        {exercise.name}
                      </span>
                      {exState.isDropSetTarget && (
                        <span className="inline-flex h-5 items-center rounded-full bg-warn/18 px-2 text-[12px] font-bold leading-4 tracking-[0.3px] text-warn-bright">
                          DROPSATZ
                        </span>
                      )}
                      {exercise.superset && (
                        <span className="inline-flex h-5 items-center rounded-full bg-raised px-2 text-[12px] font-semibold leading-4 text-ink-2">
                          {exercise.superset}
                        </span>
                      )}
                    </span>
                    <span className="text-[13px] leading-[18px] text-ink-2">
                      {exercise.targetMuscle} · {working.length > 0 ? `${working.length}/${ctx.spec.sets} Sätze` : `${ctx.spec.sets} Sätze`} ·{" "}
                      {ctx.spec.repMin}–{ctx.spec.repMax} Wdh
                    </span>
                    {!exState.done && exercise.equipment !== "bodyweight" && (
                      <span className="text-[13px] font-semibold leading-[18px] text-go-bright">
                        Vorschlag {formatKg(exState.suggestion.weightKg)} kg
                        {exState.suggestion.deltaKg !== 0 &&
                          ` · ${exState.suggestion.deltaKg > 0 ? "+" : ""}${formatKg(exState.suggestion.deltaKg)}`}
                      </span>
                    )}
                    {!exState.done && exercise.equipment === "bodyweight" && (
                      <span className="text-[13px] font-semibold leading-[18px] text-go-bright">
                        Ziel {exState.suggestion.targetReps} {exercise.unit === "seconds" ? "Sekunden" : "Wdh"}
                      </span>
                    )}
                  </span>

                  <ChevronRightIcon size={20} className="shrink-0 text-ink-3" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}

function DaySwitcher({ current, planned }: { current: DayType; planned: DayType | null }) {
  return (
    <nav aria-label="Trainingstag wählen" className="-mx-5 overflow-x-auto px-5 [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-28px),transparent)]">
      <ul className="flex w-max gap-2">
        {DAY_TYPES.map((d) => {
          const active = d.id === current;
          return (
            <li key={d.id}>
              <Link
                href={d.id === planned ? "/" : `/?tag=${d.id}`}
                aria-current={active ? "true" : undefined}
                className={`flex h-11 items-center whitespace-nowrap rounded-full px-3.5 text-[15px] leading-[20px] ${
                  active ? "bg-ink font-semibold text-bg" : "bg-surface font-medium text-ink-2"
                }`}
              >
                {d.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
