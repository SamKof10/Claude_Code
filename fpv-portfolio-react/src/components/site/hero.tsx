import { useEffect, useState } from "react"

import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { Meteors } from "@/components/ui/meteors"
import { Switch } from "@/components/ui/switch"
import { MagneticButton } from "@/components/unlumen-ui/magnetic-button"
import { FlightPathCanvas } from "@/components/site/flight-path-canvas"
import { ClipCornersButton } from "@/components/smoothui/clip-corners-button"

interface Osd {
  bat: string
  rssi: string
  alt: string
  spd: string
}

function useOsdDrift(enabled: boolean): Osd {
  const [osd, setOsd] = useState<Osd>({ bat: "16.8V", rssi: "99%", alt: "4.2M", spd: "148KM/H" })

  useEffect(() => {
    if (!enabled) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let t = 0
    const id = setInterval(() => {
      t += 1
      setOsd({
        bat: (16.8 - (t % 40) * 0.005).toFixed(1) + "V",
        rssi: 97 + Math.round(Math.sin(t / 3) * 2) + "%",
        alt: (4.2 + Math.sin(t / 5) * 0.6).toFixed(1) + "M",
        spd: 148 + Math.round(Math.sin(t / 2.2) * 9) + "KM/H",
      })
    }, 1200)
    return () => clearInterval(id)
  }, [enabled])

  return osd
}

export function Hero() {
  const [osdVisible, setOsdVisible] = useState(true)
  const osd = useOsdDrift(osdVisible)

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden border-b border-line-soft">
      <FlightPathCanvas seed={7} variant="animated" className="absolute inset-0 h-full w-full" />
      <Meteors number={16} className="[--angle:210deg] bg-brand/70 shadow-[0_0_0_1px_rgba(242,134,60,0.15)]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(11,16,19,0) 30%, rgba(11,16,19,0.85) 100%), linear-gradient(to bottom, rgba(11,16,19,0.35) 0%, rgba(11,16,19,0.1) 35%, rgba(11,16,19,0.75) 100%)",
        }}
      />

      {osdVisible && (
        <>
          <div className="absolute left-5 top-26 z-10 flex items-baseline gap-1.5 font-tech text-sm tracking-wide text-ok [text-shadow:0_0_8px_rgba(111,207,124,0.45)] sm:left-8">
            <span className="text-[11px] text-ok/65">BAT</span>
            <span className="tabular-nums">{osd.bat}</span>
          </div>
          <div className="absolute right-5 top-26 z-10 hidden items-baseline gap-1.5 font-tech text-sm tracking-wide text-ok [text-shadow:0_0_8px_rgba(111,207,124,0.45)] sm:right-8 sm:flex">
            <span className="text-[11px] text-ok/65">RSSI</span>
            <span className="tabular-nums">{osd.rssi}</span>
          </div>
          <div className="absolute bottom-24 left-5 z-10 flex items-baseline gap-1.5 font-tech text-sm tracking-wide text-ok [text-shadow:0_0_8px_rgba(111,207,124,0.45)] sm:left-8">
            <span className="text-[11px] text-ok/65">ALT</span>
            <span className="tabular-nums">{osd.alt}</span>
          </div>
          <div className="absolute bottom-24 right-5 z-10 hidden items-baseline gap-1.5 font-tech text-sm tracking-wide text-ok [text-shadow:0_0_8px_rgba(111,207,124,0.45)] sm:right-8 sm:flex">
            <span className="text-[11px] text-ok/65">SPD</span>
            <span className="tabular-nums">{osd.spd}</span>
          </div>
        </>
      )}

      <div className="relative z-10 mx-auto w-full max-w-[1180px] px-5 pb-24 pt-28 sm:px-8">
        <p className="mb-4">
          <AnimatedShinyText className="!mx-0 max-w-none font-tech text-sm tracking-[0.14em] text-brand">
            CH·5.8GHZ — FPV FREESTYLE &amp; RACE EDITS
          </AnimatedShinyText>
        </p>
        <h1 className="max-w-[14ch] font-display text-[clamp(3.4rem,9.5vw,8.2rem)] font-black uppercase leading-[0.86] tracking-tight text-foreground">
          Flown,
          <br />
          nicht&nbsp;gefilmt.
        </h1>
        <p className="mt-6 max-w-[46ch] text-[1.05rem] text-muted-foreground">
          Freestyle-Lines und Race-Runs aus der Egoperspektive — bei 150&nbsp;km/h, einen Meter über dem Boden. Kein
          Gimbal. Keine zweite Chance.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <ClipCornersButton
            onClick={() => document.getElementById("reel")?.scrollIntoView({ behavior: "smooth" })}
          >
            Reel ansehen
          </ClipCornersButton>
          <MagneticButton
            variant="outline"
            className="h-auto border-line-soft bg-transparent px-6 py-4 font-tech text-sm uppercase tracking-wide text-foreground hover:bg-secondary hover:text-foreground"
            onClick={() => document.getElementById("log")?.scrollIntoView({ behavior: "smooth" })}
          >
            Flight Log
          </MagneticButton>
        </div>
      </div>

      <label className="absolute bottom-5 right-5 z-10 flex items-center gap-2 font-tech text-[11px] uppercase tracking-wide text-faint sm:right-8">
        OSD
        <Switch size="sm" checked={osdVisible} onCheckedChange={setOsdVisible} aria-label="OSD-Overlay ein-/ausblenden" />
      </label>
    </section>
  )
}
