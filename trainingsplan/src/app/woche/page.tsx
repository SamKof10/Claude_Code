import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, PageTitle } from "@/components/app-shell";
import { CheckIcon } from "@/components/icons";
import { formatVolume, loadContext, weekOverview } from "@/lib/data";
import { ALL_WEEKS, phaseSpec } from "@/lib/phase";
import { PROGRAM_WEEKS } from "@/lib/plan";

export const dynamic = "force-dynamic";

export default async function WeekPage({ searchParams }: { searchParams: Promise<{ w?: string }> }) {
  const ctx = await loadContext();
  if (!ctx) redirect("/login");

  const params = await searchParams;
  const requested = Number(params.w);
  const week = ALL_WEEKS.includes(requested) ? requested : ctx.week;
  const overview = weekOverview(ctx, week);
  const isCurrent = week === ctx.week;

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageTitle title={`Woche ${week}`} meta={`von ${PROGRAM_WEEKS} · ${overview.spec.label}`} />

        <section className="flex flex-col gap-2.5" aria-label="Mesozyklus">
          <ol className="-mx-1.5 flex gap-0.5">
            {ALL_WEEKS.map((w) => {
              const spec = phaseSpec(w);
              const current = w === week;
              const past = w < ctx.week;
              const deload = spec.phase === "deload";
              return (
                <li key={w} className="flex-1">
                  <Link
                    href={`/woche?w=${w}`}
                    aria-current={current ? "true" : undefined}
                    aria-label={`Woche ${w}, ${spec.label}`}
                    className={`flex h-11 items-center justify-center rounded-lg text-[13px] leading-[18px] ${
                      current
                        ? deload
                          ? "bg-warn font-bold text-bg"
                          : "bg-go font-bold text-bg"
                        : deload
                          ? "bg-warn/28 font-semibold text-warn-bright"
                          : past
                            ? "bg-go/35 font-semibold text-go-bright"
                            : "bg-raised font-medium text-ink-2"
                    }`}
                  >
                    {w}
                  </Link>
                </li>
              );
            })}
          </ol>
          <div className="flex items-center gap-3.5">
            <Legend color="bg-go" label="Aufbau" />
            <Legend color="bg-warn/50" label="Deload" />
            <Legend color="bg-raised" label="offen" />
          </div>
          <p className="text-[13px] leading-[18px] text-ink-2">{overview.spec.intensityNote}</p>
        </section>

        <ul className="flex flex-col gap-2">
          {overview.days.map((day) => (
            <li key={day.meta.id}>
              <Link
                href={isCurrent ? `/?tag=${day.meta.id}` : "#"}
                aria-disabled={!isCurrent}
                tabIndex={isCurrent ? undefined : -1}
                className={`flex min-h-[68px] items-center gap-3.5 rounded-card px-4 py-3 ${
                  day.isToday ? "border-[1.5px] border-go bg-raised" : "bg-surface"
                } ${isCurrent ? "active:bg-raised" : "pointer-events-none"}`}
              >
                <span
                  aria-hidden
                  className={`flex size-[26px] shrink-0 items-center justify-center rounded-full ${
                    day.complete ? "bg-go text-bg" : day.started ? "border-2 border-go" : "border-2 border-line"
                  }`}
                >
                  {day.complete && <CheckIcon size={15} />}
                </span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className={`text-[17px] font-semibold leading-[22px] ${day.complete || day.started || day.isToday ? "" : "text-ink-2"}`}>
                    {day.meta.label}
                  </span>
                  <span className="text-[13px] leading-[18px] text-ink-2">
                    {day.movedTo ? weekdayShort(day.movedTo) : day.meta.weekday.slice(0, 2)} · {day.meta.focus} ·{" "}
                    {day.doneExercises}/{day.plannedExercises} Übungen
                    {day.movedTo && " · nachgeholt"}
                  </span>
                </span>
                {day.isToday ? (
                  <span className="text-[13px] font-semibold leading-[18px] text-go-bright">Heute</span>
                ) : day.volume > 0 ? (
                  <span className="text-[13px] leading-[18px] text-ink-2 tnum">{formatVolume(day.volume)} kg</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        <section className="flex items-center gap-3.5 rounded-card bg-surface p-4">
          <div className="flex flex-1 flex-col gap-0.5">
            <h2 className="text-[15px] font-semibold leading-[20px]">
              {overview.completedDays} von {overview.days.length} absolviert
            </h2>
            <p className="text-[13px] leading-[18px] text-ink-2 tnum">
              {formatVolume(overview.totalVolume)} kg Gesamtvolumen in dieser Woche
            </p>
          </div>
          <ProgressRing done={overview.completedDays} total={overview.days.length} />
        </section>
      </div>
    </AppShell>
  );
}

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function weekdayShort(dateISO: string): string {
  return WEEKDAYS[new Date(dateISO + "T12:00:00Z").getUTCDay()];
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden className={`size-2.5 rounded-[3px] ${color}`} />
      <span className="text-[12px] leading-4 text-ink-2">{label}</span>
    </span>
  );
}

function ProgressRing({ done, total }: { done: number; total: number }) {
  const circumference = 2 * Math.PI * 19;
  const filled = total > 0 ? (done / total) * circumference : 0;
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" className="shrink-0" role="img" aria-label={`${done} von ${total} Tagen absolviert`}>
      <circle cx="23" cy="23" r="19" fill="none" stroke="var(--color-line)" strokeWidth="5" />
      <circle
        cx="23" cy="23" r="19" fill="none" stroke="var(--color-go)" strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`} transform="rotate(-90 23 23)"
      />
    </svg>
  );
}
