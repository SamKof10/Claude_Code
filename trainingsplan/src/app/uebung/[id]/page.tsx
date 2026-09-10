import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons";
import { TabBar } from "@/components/tab-bar";
import { dayState, historyFor, loadContext } from "@/lib/data";
import { dayMeta, exerciseById, WEIGHT_STEP } from "@/lib/plan";
import { dropSetWeight, workingWeight } from "@/lib/progression";
import { SetLogger } from "./set-logger";

export const dynamic = "force-dynamic";

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await loadContext();
  if (!ctx) redirect("/login");

  const { id } = await params;
  const exercise = exerciseById(id);
  if (!exercise) notFound();

  const state = dayState(ctx, exercise.dayType, ctx.today);
  const exState = state.exercises.find((e) => e.exerciseId === exercise.id)!;
  const meta = dayMeta(exercise.dayType);
  const workingSets = exState.loggedSets.filter((s) => !s.isDropSet);
  const dropSets = exState.loggedSets.filter((s) => s.isDropSet);

  const doneWithWorkingSets = workingSets.length >= ctx.spec.sets;
  const showDropSet = exState.isDropSetTarget && doneWithWorkingSets && dropSets.length === 0;
  const currentWorking = workingWeight(exState.loggedSets) ?? exState.suggestion.weightKg;

  const previous = historyFor(ctx, exercise.id, state.session?.id).sort((a, b) =>
    b.session.date.localeCompare(a.session.date),
  )[0];

  return (
    <>
      <div className="mx-auto max-w-lg px-5 pb-32" style={{ paddingTop: "calc(env(safe-area-inset-top) + 14px)" }}>
        <Link
          href={ctx.plannedDayType === exercise.dayType ? "/" : `/?tag=${exercise.dayType}`}
          className="-ml-1 inline-flex min-h-[44px] items-center gap-0.5 pr-3 text-[17px] leading-[22px] text-go"
        >
          <ChevronLeftIcon size={24} />
          {meta.label}
        </Link>

        <div className="mt-1 flex flex-col gap-5">
          <header className="flex flex-col gap-1.5">
            <h1 className="text-[28px] font-bold leading-[34px] tracking-[-0.4px]">{exercise.name}</h1>
            <p className="text-[15px] leading-[20px] text-ink-2">
              {exercise.targetMuscle} · {equipmentLabel(exercise.equipment)} · {ctx.spec.sets} Sätze ·{" "}
              {ctx.spec.repMin}–{ctx.spec.repMax} {exercise.unit === "seconds" ? "Sek." : "Wdh"}
            </p>
            {exercise.note && <p className="text-[13px] leading-[18px] text-ink-3">{exercise.note}</p>}
          </header>

          <SetLogger
            key={`${exState.loggedSets.length}-${showDropSet}`}
            exerciseId={exercise.id}
            exerciseName={exercise.name}
            unit={exercise.unit ?? "reps"}
            equipment={exercise.equipment}
            step={WEIGHT_STEP[exercise.equipment]}
            date={ctx.today}
            targetSets={ctx.spec.sets}
            repMin={ctx.spec.repMin}
            repMax={ctx.spec.repMax}
            suggestion={exState.suggestion}
            loggedSets={exState.loggedSets}
            showDropSet={showDropSet}
            dropSetWeightKg={dropSetWeight(exercise, currentWorking)}
            isDropSetTarget={exState.isDropSetTarget}
            previousSummary={
              previous
                ? {
                    week: previous.session.weekNumber,
                    weightKg: workingWeight(previous.sets) ?? 0,
                    reps: previous.sets.filter((s) => !s.isDropSet).map((s) => s.reps),
                  }
                : null
            }
          />
        </div>
      </div>
      <TabBar />
    </>
  );
}

function equipmentLabel(equipment: string): string {
  if (equipment === "cable_station") return "Kabelstation";
  if (equipment === "dumbbell") return "Kurzhantel";
  return "Körpergewicht";
}
