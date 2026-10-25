import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, PageTitle } from "@/components/app-shell";
import { InfoIcon, TrendIcon } from "@/components/icons";
import { exerciseTrend, formatKg, formatVolume, loadContext } from "@/lib/data";
import { DUMBBELL_MAX_KG, EXERCISES, exerciseById } from "@/lib/plan";
import { TrendChart } from "./trend-chart";

export const dynamic = "force-dynamic";

export default async function TrendPage({ searchParams }: { searchParams: Promise<{ ex?: string }> }) {
  const ctx = await loadContext();
  if (!ctx) redirect("/login");

  const loggedIds = new Set(ctx.sets.map((s) => s.exerciseId));
  const available = EXERCISES.filter((e) => loggedIds.has(e.id));

  if (available.length === 0) {
    return (
      <AppShell>
        <div className="flex flex-col gap-6">
          <PageTitle title="Verlauf" />
          <div className="flex flex-col items-center gap-3 rounded-card bg-surface px-6 py-12 text-center">
            <TrendIcon size={32} className="text-ink-3" />
            <h2 className="text-[17px] font-semibold leading-[22px]">Noch nichts zu zeigen</h2>
            <p className="max-w-[280px] text-[15px] leading-[20px] text-ink-2 text-pretty">
              Sobald du den ersten Satz loggst, siehst du hier, wie sich dein Arbeitsgewicht über die acht Wochen
              entwickelt.
            </p>
            <Link href="/" className="mt-2 flex h-11 items-center rounded-field bg-go px-5 text-[15px] font-semibold text-bg">
              Zum heutigen Workout
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const params = await searchParams;
  const selected = available.find((e) => e.id === params.ex) ?? available[0];
  const trend = exerciseTrend(ctx, selected.id);
  const exercise = exerciseById(selected.id)!;
  const bodyweight = exercise.equipment === "bodyweight";

  const first = trend[0];
  const last = trend[trend.length - 1];
  const metric = bodyweight ? "topReps" : "weightKg";
  const change = first && last && first[metric] > 0 ? ((last[metric] - first[metric]) / first[metric]) * 100 : 0;
  const bestVolume = Math.max(...trend.map((t) => t.volume), 0);
  const atDumbbellLimit = exercise.equipment === "dumbbell" && last?.weightKg >= DUMBBELL_MAX_KG;

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageTitle title="Verlauf" />

        <nav aria-label="Übung wählen" className="-mx-5 overflow-x-auto px-5 [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-28px),transparent)]">
          <ul className="flex w-max gap-2">
            {available.map((e) => {
              const active = e.id === selected.id;
              return (
                <li key={e.id}>
                  <Link
                    href={`/verlauf?ex=${e.id}`}
                    aria-current={active ? "true" : undefined}
                    className={`flex h-11 items-center whitespace-nowrap rounded-full px-3.5 text-[15px] leading-[20px] ${
                      active ? "bg-ink font-semibold text-bg" : "bg-surface font-medium text-ink-2"
                    }`}
                  >
                    {e.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <section className="flex flex-col gap-4 rounded-2xl bg-surface px-4 pb-3.5 pt-4.5">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold leading-[34px] tracking-[-0.4px] tnum">
              {bodyweight ? last.topReps : formatKg(last.weightKg)}
            </span>
            <span className="text-[15px] leading-[20px] text-ink-2">
              {bodyweight ? (exercise.unit === "seconds" ? "Sek. aktuell" : "Wdh aktuell") : "kg aktuell"}
            </span>
            {trend.length > 1 && (
              <span className={`ml-auto text-[15px] font-semibold leading-[20px] ${change >= 0 ? "text-go-bright" : "text-warn-bright"}`}>
                {change >= 0 ? "+" : ""}
                {change.toFixed(0)} %
              </span>
            )}
          </div>

          {trend.length > 1 ? (
            <TrendChart
              points={trend.map((t) => ({ week: t.week, value: bodyweight ? t.topReps : t.weightKg, phase: t.phase }))}
              unit={bodyweight ? (exercise.unit === "seconds" ? "Sek." : "Wdh") : "kg"}
              label={exercise.name}
            />
          ) : (
            <p className="rounded-field bg-sunken px-4 py-6 text-center text-[13px] leading-[18px] text-ink-2 text-pretty">
              Eine Session reicht noch nicht für eine Kurve. Ab der zweiten siehst du hier, wie sich dein
              Arbeitsgewicht über die acht Wochen entwickelt.
            </p>
          )}
        </section>

        <div className="flex gap-2.5">
          <Stat label="START" value={bodyweight ? String(first.topReps) : formatKg(first.weightKg)} />
          <Stat label="TOP-VOL." value={bodyweight ? "–" : formatVolume(bestVolume)} />
          <Stat label="SESSIONS" value={String(trend.length)} />
        </div>

        {atDumbbellLimit && (
          <div className="flex gap-3 rounded-card bg-warn/12 px-4 py-3.5">
            <InfoIcon size={20} className="mt-0.5 shrink-0 text-warn-bright" />
            <div className="flex flex-col gap-0.5">
              <p className="text-[15px] font-semibold leading-[20px] text-warn-bright">
                {exercise.name}: {DUMBBELL_MAX_KG} kg erreicht
              </p>
              <p className="text-[13px] leading-[18px] text-warn-bright/85">
                Kurzhantel-Maximum. Jetzt auf 20–25 Wiederholungen gehen oder das Tempo verlangsamen — drei Sekunden
                für die absenkende Bewegung.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 rounded-card bg-surface p-3.5">
      <span className="truncate text-[12px] font-semibold leading-4 tracking-[0.3px] text-ink-2">{label}</span>
      <span className="text-[22px] font-bold leading-7 tnum">{value}</span>
    </div>
  );
}
