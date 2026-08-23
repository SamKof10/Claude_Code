import { useMemo, useState } from "react"

import { BlurFade } from "@/components/ui/blur-fade"
import { Badge } from "@/components/ui/badge"
import { Marquee } from "@/components/ui/marquee"
import AnimatedTabs from "@/components/smoothui/animated-tabs"
import ScrambleHover from "@/components/smoothui/scramble-hover"
import { Tilt } from "@/components/unlumen-ui/tilt"
import { FlightPathCanvas } from "@/components/site/flight-path-canvas"
import { CATEGORY_LABEL, flightLog, type FlightCategory } from "@/lib/flight-log-data"

const TABS: { id: FlightCategory | "all"; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "freestyle", label: "Freestyle" },
  { id: "race", label: "Race" },
  { id: "long-range", label: "Long-Range" },
]

export function FlightLog() {
  const [active, setActive] = useState<string>("all")

  const filtered = useMemo(
    () => (active === "all" ? flightLog : flightLog.filter((f) => f.category === active)),
    [active]
  )

  return (
    <section id="log" className="border-t border-line-soft py-24">
      <Marquee pauseOnHover className="border-y border-line-soft py-3 text-faint [--duration:32s]">
        {flightLog.map((f) => (
          <span key={f.seed} className="mx-6 flex items-center gap-2 font-tech text-xs uppercase tracking-[0.1em]">
            {f.location}
            <span className="text-brand">·</span>
          </span>
        ))}
      </Marquee>

      <div className="mx-auto max-w-[1180px] px-5 pt-16 sm:px-8">
        <BlurFade inView direction="up">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 font-tech text-[11px] uppercase tracking-[0.14em] text-brand">CH02 — Flight Log</p>
              <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] font-bold uppercase leading-none tracking-tight">
                Ausgewählte Flüge
              </h2>
            </div>
            <AnimatedTabs
              tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
              activeTab={active}
              onChange={setActive}
              variant="segment"
              className="border-line-soft bg-secondary"
            />
          </div>
        </BlurFade>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f, i) => (
            <BlurFade key={f.seed} inView direction="up" delay={0.05 * i}>
              <Tilt
                rotationFactor={7}
                springOptions={{ stiffness: 200, damping: 20 }}
                className="group flex h-full flex-col overflow-hidden rounded border border-line-soft bg-card transition-colors duration-200 hover:border-brand-dim"
              >
                <div className="relative aspect-[16/10]">
                  <FlightPathCanvas seed={f.seed} className="h-full w-full" />
                  <span className="absolute right-3 bottom-3 flex size-8 items-center justify-center rounded-full border border-foreground/25 bg-background/60 text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <svg viewBox="0 0 24 24" width="14" height="14" className="ml-0.5" aria-hidden="true">
                      <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" />
                    </svg>
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <h3 className="font-display text-2xl font-bold uppercase tracking-tight">
                      <ScrambleHover className="text-left">{f.title}</ScrambleHover>
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                  </div>

                  <Badge variant="outline" className="w-fit border-brand-dim font-tech text-[10px] tracking-wide text-brand">
                    {CATEGORY_LABEL[f.category]}
                  </Badge>

                  <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line-soft pt-3 font-tech text-xs">
                    <div>
                      <dt className="text-[10px] tracking-wide text-faint">ORT</dt>
                      <dd className="mt-0.5 text-muted-foreground">{f.location}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] tracking-wide text-faint">DATUM</dt>
                      <dd className="mt-0.5 text-muted-foreground">{f.date}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] tracking-wide text-faint">DAUER</dt>
                      <dd className="mt-0.5 text-muted-foreground tabular-nums">{f.duration}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] tracking-wide text-faint">SETUP</dt>
                      <dd className="mt-0.5 text-muted-foreground">{f.setup}</dd>
                    </div>
                  </dl>
                </div>
              </Tilt>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
