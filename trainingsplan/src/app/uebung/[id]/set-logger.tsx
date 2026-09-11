"use client";

import { useState } from "react";
import { deleteSetAction, logSetAction } from "@/app/actions";
import { CheckIcon, InfoIcon, MinusIcon, PlusIcon, SparkIcon, TrashIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import type { Suggestion } from "@/lib/progression";
import type { SetLog } from "@/lib/types";

type Props = {
  exerciseId: string;
  exerciseName: string;
  unit: "reps" | "seconds";
  equipment: string;
  step: number;
  date: string;
  targetSets: number;
  repMin: number;
  repMax: number;
  suggestion: Suggestion;
  loggedSets: SetLog[];
  showDropSet: boolean;
  dropSetWeightKg: number;
  isDropSetTarget: boolean;
  previousSummary: { week: number; weightKg: number; reps: number[] } | null;
};

export function SetLogger(props: Props) {
  const {
    exerciseId, unit, equipment, step, date, targetSets, repMin, repMax,
    suggestion, loggedSets, showDropSet, dropSetWeightKg, isDropSetTarget, previousSummary,
  } = props;

  const bodyweight = equipment === "bodyweight";
  const workingSets = loggedSets.filter((s) => !s.isDropSet);
  const lastLogged = workingSets[workingSets.length - 1];
  const allDone = workingSets.length >= targetSets && !showDropSet;

  const [weight, setWeight] = useState(() =>
    showDropSet ? dropSetWeightKg : (lastLogged?.weightKg ?? suggestion.weightKg),
  );
  const [reps, setReps] = useState(() => (showDropSet ? repMin : suggestion.targetReps));

  const unitLabel = unit === "seconds" ? "Sekunden" : "Wiederholungen";
  const unitShort = unit === "seconds" ? "Sek." : "Wdh";

  return (
    <div className="flex flex-col gap-4">
      {!allDone && (
        <div className={`flex gap-3 rounded-card px-4 py-3.5 ${showDropSet ? "bg-warn/12" : "bg-go/12"}`}>
          {showDropSet ? (
            <InfoIcon size={20} className="mt-0.5 shrink-0 text-warn-bright" />
          ) : (
            <SparkIcon size={20} className="mt-0.5 shrink-0 text-go-bright" />
          )}
          <div className="flex flex-col gap-0.5">
            <p className={`text-[15px] font-semibold leading-[20px] ${showDropSet ? "text-warn-bright" : "text-go-bright"}`}>
              {showDropSet
                ? `Dropsatz: ${fmt(dropSetWeightKg)} kg — 25 % runter, direkt weiter bis zum Versagen`
                : bodyweight
                  ? `Ziel ${suggestion.targetReps} ${unitShort}`
                  : `Vorschlag ${fmt(suggestion.weightKg)} kg${suggestion.deltaKg !== 0 ? ` · ${suggestion.deltaKg > 0 ? "+" : ""}${fmt(suggestion.deltaKg)} kg` : ""}`}
            </p>
            <p className={`text-[13px] leading-[18px] ${showDropSet ? "text-warn-bright/85" : "text-go-bright/85"}`}>
              {showDropSet
                ? "Ein Satz, keine Pause davor. Wenn nichts mehr geht, ist er zu Ende."
                : suggestion.reason}
            </p>
          </div>
        </div>
      )}

      {suggestion.atDumbbellMax && !showDropSet && !allDone && (
        <div className="flex gap-3 rounded-card bg-warn/12 px-4 py-3.5">
          <InfoIcon size={20} className="mt-0.5 shrink-0 text-warn-bright" />
          <p className="text-[13px] leading-[18px] text-warn-bright">
            Kurzhantel-Maximum erreicht. Steigere ab jetzt über Wiederholungen (20–25) oder ein langsameres Tempo,
            etwa drei Sekunden für die absenkende Bewegung.
          </p>
        </div>
      )}

      <ol className="flex flex-col gap-2">
        {loggedSets.map((set) => {
          // Fortlaufend nach Position anzeigen — gelöschte Sätze sollen keine
          // Lücke in der Nummerierung hinterlassen.
          const position = workingSets.indexOf(set) + 1;
          const rowLabel = set.isDropSet ? "Dropsatz" : `Satz ${position}`;
          return (
          <li
            key={set.id}
            className={`flex min-h-[52px] items-center gap-2 rounded-field py-1 pl-3.5 pr-1 ${
              set.isDropSet ? "bg-warn/10" : "bg-surface"
            }`}
          >
            <span className="w-14 shrink-0 whitespace-nowrap text-[13px] font-semibold leading-[18px] text-ink-2">
              {set.isDropSet ? "Drop" : `Satz ${position}`}
            </span>
            {!bodyweight && (
              <span className="flex-1 whitespace-nowrap text-[17px] font-semibold leading-[22px] tnum">
                {fmt(set.weightKg)} kg
              </span>
            )}
            <span
              className={`whitespace-nowrap text-[17px] font-semibold leading-[22px] text-ink-2 tnum ${bodyweight ? "flex-1" : ""}`}
            >
              {set.reps} {unitShort}
            </span>
            <CheckIcon
              size={20}
              className={`hidden shrink-0 min-[360px]:block ${set.isDropSet ? "text-warn" : "text-go"}`}
            />
            <form action={deleteSetAction} className="shrink-0">
              <input type="hidden" name="setId" value={set.id} />
              <button
                type="submit"
                aria-label={`${rowLabel} löschen`}
                className="flex size-11 items-center justify-center rounded-lg text-ink-3 active:text-ink"
              >
                <TrashIcon size={18} />
              </button>
            </form>
          </li>
          );
        })}

        {!allDone && (
          <li className="flex flex-col gap-3.5 rounded-card border-[1.5px] border-go bg-raised px-3.5 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold leading-[20px]">
                {showDropSet ? "Dropsatz" : `Satz ${workingSets.length + 1}`}
              </h2>
              <span className="text-[13px] leading-[18px] text-ink-2">
                {showDropSet
                  ? "zum Abschluss"
                  : `noch ${targetSets - workingSets.length} ${targetSets - workingSets.length === 1 ? "Satz" : "Sätze"}`}
              </span>
            </div>

            <form action={logSetAction} className="flex flex-col gap-3.5">
              <input type="hidden" name="exerciseId" value={exerciseId} />
              <input type="hidden" name="date" value={date} />
              <input type="hidden" name="isDropSet" value={showDropSet ? "true" : "false"} />
              <input type="hidden" name="weightKg" value={weight} />
              <input type="hidden" name="reps" value={reps} />

              <div className="flex gap-3">
                {!bodyweight && (
                  <Stepper
                    label="Gewicht"
                    unit="kg"
                    value={weight}
                    step={step}
                    min={0}
                    max={500}
                    onChange={setWeight}
                  />
                )}
                <Stepper
                  label={unitLabel}
                  value={reps}
                  step={1}
                  min={1}
                  max={100}
                  onChange={setReps}
                />
              </div>

              <SubmitButton label={showDropSet ? "Dropsatz speichern" : "Satz speichern"} className="h-[50px]" />
            </form>

            <p className="text-[13px] leading-[18px] text-ink-3">
              Zielbereich {repMin}–{repMax} {unitShort}. Trag ein, was du wirklich geschafft hast — der Vorschlag für die
              nächste Session rechnet damit.
            </p>
          </li>
        )}

        {Array.from({ length: Math.max(0, targetSets - workingSets.length - (allDone ? 0 : 1)) }).map((_, i) => (
          <li
            key={`pending-${i}`}
            className="flex min-h-[52px] items-center gap-3 rounded-field bg-surface px-3.5 opacity-50"
          >
            <span className="w-14 text-[13px] font-semibold leading-[18px] text-ink-2">
              Satz {workingSets.length + (allDone ? 1 : 2) + i}
            </span>
            <span className="text-[17px] leading-[22px] text-ink-3">–</span>
          </li>
        ))}
      </ol>

      {allDone && (
        <div className="flex gap-3 rounded-card bg-go/12 px-4 py-3.5">
          <CheckIcon size={20} className="mt-0.5 shrink-0 text-go-bright" />
          <p className="text-[13px] leading-[18px] text-go-bright">
            {targetSets} Sätze im Kasten.{" "}
            {isDropSetTarget && loggedSets.some((s) => s.isDropSet)
              ? "Dropsatz sitzt auch. Fertig hier."
              : "Zurück zur Übersicht für die nächste Übung."}
          </p>
        </div>
      )}

      {previousSummary && previousSummary.reps.length > 0 && (
        <div className="flex flex-col gap-1 rounded-card bg-surface px-4 py-3.5">
          <h2 className="text-[13px] font-semibold leading-[18px] tracking-[0.3px] text-ink-2">ZULETZT · WOCHE {previousSummary.week}</h2>
          <p className="text-[15px] leading-[20px] tnum">
            {!bodyweight && `${fmt(previousSummary.weightKg)} kg · `}
            {previousSummary.reps.join(" / ")} {unitShort}
          </p>
        </div>
      )}
    </div>
  );
}

function Stepper({
  label, unit, value, step, min, max, onChange,
}: {
  label: string; unit?: string; value: number; step: number; min: number; max: number; onChange: (v: number) => void;
}) {
  const decimals = step < 1 ? 1 : 0;
  const set = (next: number) => onChange(Math.min(max, Math.max(min, Math.round(next * 10) / 10)));

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <span className="text-[12px] font-semibold uppercase leading-4 tracking-[0.3px] text-ink-2">
        {label}
        {unit && ` (${unit})`}
      </span>
      <div className="flex h-[52px] items-center gap-0.5 rounded-field bg-sunken px-1">
        <button
          type="button"
          aria-label={`${label} verringern`}
          onClick={() => set(value - step)}
          disabled={value <= min}
          className="flex size-11 shrink-0 items-center justify-center rounded-[10px] text-ink active:bg-raised disabled:opacity-30"
        >
          <MinusIcon size={18} />
        </button>
        <input
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) set(n);
          }}
          aria-label={label}
          className="w-full min-w-0 flex-1 bg-transparent text-center text-[20px] font-bold leading-[25px] text-ink tnum"
        />
        <button
          type="button"
          aria-label={`${label} erhöhen`}
          onClick={() => set(value + step)}
          disabled={value >= max}
          className="flex size-11 shrink-0 items-center justify-center rounded-[10px] text-ink active:bg-raised disabled:opacity-30"
        >
          <PlusIcon size={18} />
        </button>
      </div>
      <span className="sr-only">{decimals === 1 ? "Schritte von 0,5" : "Ganze Schritte"}</span>
    </div>
  );
}

function fmt(value: number): string {
  return (Math.round(value * 10) / 10).toLocaleString("de-DE", { maximumFractionDigits: 1 });
}
