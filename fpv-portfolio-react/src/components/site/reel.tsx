import { useState } from "react"

import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { FlightPathCanvas } from "@/components/site/flight-path-canvas"

export function Reel() {
  const [message, setMessage] = useState("00:00 / 02:58")

  return (
    <section id="reel" className="mx-auto max-w-[1180px] px-5 py-24 sm:px-8">
      <BlurFade inView direction="up">
        <p className="mb-3 font-tech text-[11px] uppercase tracking-[0.14em] text-brand">CH01 — Featured Reel</p>
        <h2 className="max-w-[20ch] font-display text-[clamp(2rem,4.6vw,3.4rem)] font-bold uppercase leading-none tracking-tight">
          Season Reel 2026
        </h2>
        <p className="mt-3 max-w-[46ch] text-muted-foreground">
          Die dichteste Line aus einem Jahr Fliegen — sechs Locations, eine Egoperspektive.
        </p>
      </BlurFade>

      <BlurFade inView direction="up" delay={0.1} className="mt-10">
        <div className="relative aspect-video overflow-hidden rounded border border-line-soft bg-card">
          <BorderBeam size={140} duration={7} colorFrom="#f2863c" colorTo="#ffe3c2" borderWidth={1.5} />
          <FlightPathCanvas seed={91} className="h-full w-full" />

          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-between font-tech text-[11px] tracking-wide text-foreground/75">
            <span className="tabular-nums">{message}</span>
            <span>4K60 · DIGITAL HD</span>
          </div>

          <button
            type="button"
            aria-label="Reel abspielen"
            onClick={() => setMessage("Reel-Datei noch nicht hinterlegt")}
            className="absolute inset-0 m-auto flex size-17 items-center justify-center rounded-full border border-foreground/35 bg-background/55 text-foreground transition-all duration-200 hover:scale-105 hover:border-brand hover:bg-brand hover:text-brand-ink"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" className="ml-0.5" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </BlurFade>
    </section>
  )
}
