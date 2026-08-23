import { useState } from "react"

import { BlurFade } from "@/components/ui/blur-fade"
import { Card } from "@/components/ui/card"
import NumberFlow from "@/components/smoothui/number-flow"

interface Spec {
  label: string
  value: string
}

function SpecList({ specs }: { specs: Spec[] }) {
  return (
    <dl className="space-y-0">
      {specs.map((s, i) => (
        <div
          key={s.label}
          className={`flex items-center justify-between gap-3 py-2 text-sm ${i > 0 ? "border-t border-line-soft" : ""}`}
        >
          <dt className="text-muted-foreground">{s.label}</dt>
          <dd className="font-tech tabular-nums text-foreground">{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Rig() {
  const [channel, setChannel] = useState(1)

  return (
    <section id="rig" className="mx-auto max-w-[1180px] px-5 py-24 sm:px-8">
      <BlurFade inView direction="up">
        <p className="mb-3 font-tech text-[11px] uppercase tracking-[0.14em] text-brand">CH03 — The Rig</p>
        <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] font-bold uppercase leading-none tracking-tight">
          Setup-Specs
        </h2>
        <p className="mt-3 max-w-[46ch] text-muted-foreground">Das aktuelle Freestyle-Setup, Stand dieser Saison.</p>
      </BlurFade>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <BlurFade inView direction="up" delay={0.05}>
          <Card className="h-full p-5">
            <h3 className="mb-3 font-tech text-sm uppercase tracking-[0.1em] text-brand">Aircraft</h3>
            <SpecList
              specs={[
                { label: "Frame", value: '5" Freestyle' },
                { label: "Motoren", value: "2306 · 1750KV" },
                { label: "FC / ESC", value: "F7-Stack · 60A" },
                { label: "Firmware", value: "Betaflight 4.5" },
                { label: "Akku", value: "4S / 6S" },
              ]}
            />
          </Card>
        </BlurFade>

        <BlurFade inView direction="up" delay={0.1}>
          <Card className="h-full p-5">
            <h3 className="mb-3 font-tech text-sm uppercase tracking-[0.1em] text-brand">Goggles</h3>
            <SpecList
              specs={[
                { label: "System", value: "Digital HD, 4:3" },
                { label: "Latenz", value: "~28ms" },
                { label: "Empfang", value: "Diversity" },
              ]}
            />
          </Card>
        </BlurFade>

        <BlurFade inView direction="up" delay={0.15}>
          <Card className="h-full p-5">
            <h3 className="mb-3 font-tech text-sm uppercase tracking-[0.1em] text-brand">Kamera</h3>
            <SpecList
              specs={[
                { label: "Body", value: "Action-Cam 4K60" },
                { label: "Halterung", value: "Naked-Build, 38g" },
              ]}
            />
          </Card>
        </BlurFade>

        <BlurFade inView direction="up" delay={0.2}>
          <Card className="flex h-full flex-col p-5">
            <h3 className="mb-3 font-tech text-sm uppercase tracking-[0.1em] text-brand">Funke</h3>
            <SpecList specs={[{ label: "Sender", value: "ELRS 2.4GHz" }, { label: "Reichweite", value: ">5km LOS" }]} />
            <div className="mt-3 border-t border-line-soft pt-3">
              <p className="mb-2 text-xs text-muted-foreground">VTX-Kanal wählen</p>
              <NumberFlow
                min={1}
                max={8}
                value={channel}
                onChange={setChannel}
                className="!gap-3"
                digitClassName="[&>div]:h-10 [&>div]:w-8"
                buttonClassName="!p-1.5"
              />
            </div>
          </Card>
        </BlurFade>
      </div>
    </section>
  )
}
