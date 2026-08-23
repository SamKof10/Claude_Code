import { BlurFade } from "@/components/ui/blur-fade"
import { CountUp } from "@/components/unlumen-ui/count-up"
import { FlightPathCanvas } from "@/components/site/flight-path-canvas"

const STATS = [
  { to: 620, suffix: "+", label: "Flugstunden" },
  { to: 48, suffix: "", label: "Veröffentlichte Edits" },
  { to: 2019, suffix: "", label: "Seit" },
]

export function Pilot() {
  return (
    <section id="pilot" className="mx-auto max-w-[1180px] px-5 py-24 sm:px-8">
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[0.85fr_1.15fr]">
        <BlurFade inView direction="right" className="mx-auto aspect-square w-full max-w-[260px] overflow-hidden rounded border border-line-soft bg-card md:mx-0 md:max-w-none">
          <FlightPathCanvas seed={33} className="h-full w-full" />
        </BlurFade>

        <BlurFade inView direction="left" delay={0.1}>
          <p className="mb-3 font-tech text-[11px] uppercase tracking-[0.14em] text-brand">CH04 — Pilot</p>
          <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] font-bold uppercase leading-none tracking-tight">
            Seit 2019 in der Luft.
          </h2>
          <p className="mt-4 max-w-[54ch] text-muted-foreground">
            Was mit einem Tiny Whoop im Wohnzimmer begann, ist heute die Egoperspektive auf jede neue Line — vom
            Rohbau bis zum Alpenkamm. Kein Gimbal, keine zweite Chance: Was die Linse sieht, ist geflogen, nicht
            animiert.
          </p>

          <div className="mt-10 flex flex-wrap gap-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="font-display text-4xl font-bold tabular-nums text-brand">
                  <CountUp to={s.to} duration={1.6} digitEffect="slide" />
                  {s.suffix}
                </div>
                <div className="mt-1.5 font-tech text-[11px] uppercase tracking-[0.08em] text-faint">{s.label}</div>
              </div>
            ))}
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
