"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import {
  DURATIONS,
  EVENT_TYPES,
  VOLUMES,
  quoteRental,
  type DurationId,
  type EventTypeId,
  type VolumeId,
} from "@/lib/rental";
import { formatPrice } from "@/lib/products";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { DemoNote, Mono, Section, SectionMarker } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";

const USE_CASES = [
  "Festivals",
  "MTB events",
  "Bike parks",
  "Races",
  "World Cup rounds",
  "Bike shops",
  "Camps",
  "Sport events",
  "Clubs",
];

const INCLUDED = [
  "Delivery, rigging and collection",
  "Water and power hookup on site",
  "One operator per two boxes",
  "Consumables and filter changes",
  "Branding panels, if you send artwork",
];

function Choice<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; name: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div>
      <Mono className="text-concrete/40">{label}</Mono>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={value === o.id}
            className={cn(
              "mono min-h-11 rounded-[3px] border px-4 py-3 transition-colors duration-200",
              value === o.id
                ? "border-hivis text-hivis"
                : "border-[var(--edge)] text-concrete/50 hover:border-[var(--edge-strong)] hover:text-concrete",
            )}
          >
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RentSection() {
  const [eventType, setEventType] = useState<EventTypeId>("festival");
  const [duration, setDuration] = useState<DurationId>("weekend");
  const [volume, setVolume] = useState<VolumeId>("100");

  const quote = useMemo(() => quoteRental(eventType, duration, volume), [eventType, duration, volume]);
  const type = EVENT_TYPES.find((e) => e.id === eventType) ?? EVENT_TYPES[0];

  return (
    <Section id="rent" tone="darker">
      <SectionMarker number="08" label="Rent" />
      <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end">
        <TextReveal
          text="Bring the wash to your event."
          className="h-section text-[clamp(2.1rem,5.6vw,4rem)]"
        />
        <Reveal>
          <p className="lede text-concrete/50">
            One box, or six, on your site for a weekend or a season. We deliver,
            plumb it in, run it, and take it away again.
          </p>
        </Reveal>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1.35fr]">
        {/* who it is for */}
        <Reveal className="rounded-[5px] border border-[var(--edge)] bg-steel-2/40 p-6">
          <Mono className="text-concrete/40">Where it goes</Mono>
          <ul className="mt-4 flex flex-wrap gap-2">
            {USE_CASES.map((u) => (
              <li key={u} className="mono rounded-full border border-[var(--edge)] px-3 py-1.5 text-concrete/60">
                {u}
              </li>
            ))}
          </ul>

          <Mono className="mt-8 block text-concrete/40">What the rate covers</Mono>
          <ul className="mt-4 space-y-2">
            {INCLUDED.map((i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-concrete/55">
                <span className="mt-[9px] h-px w-3 shrink-0 bg-hivis/70" />
                {i}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* calculator */}
        <Reveal index={1} className="scroll-mt-24">
          <div id="calculator" className="scroll-mt-24 rounded-[5px] border border-[var(--edge-strong)] bg-steel-2/60 p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="display text-[22px]">Rental calculator</h3>
              <Mono className="text-concrete/35">Indicative</Mono>
            </div>

            <div className="mt-6 space-y-6">
              <Choice label="Event type" options={EVENT_TYPES} value={eventType} onChange={setEventType} />
              <Choice label="Duration" options={DURATIONS} value={duration} onChange={setDuration} />
              <Choice label="Bikes expected" options={VOLUMES} value={volume} onChange={setVolume} />
            </div>

            <p className="mt-5 text-[13px] leading-relaxed text-concrete/40">{type.blurb}</p>

            {/* the number */}
            <div className="mt-6 rounded-[4px] border border-[var(--edge)] bg-[#0a0c0d] p-5 sm:p-6">
              <Mono className="text-concrete/40">Estimated rental price</Mono>
              <motion.p
                key={`${eventType}-${duration}-${volume}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="display tnum mt-2 text-[clamp(1.7rem,4.4vw,2.6rem)] text-hivis"
              >
                {formatPrice(quote.lowCents)} – {formatPrice(quote.highCents)}
              </motion.p>

              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-[var(--edge)] pt-4 text-sm sm:grid-cols-4">
                {[
                  ["Boxes", String(quote.boxes)],
                  ["Days on site", String(quote.days)],
                  ["Setup + collection", formatPrice(quote.setupCents)],
                  ["Per bike", formatPrice(quote.perBikeCents, { decimals: true })],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="mono text-concrete/35">{k}</dt>
                    <dd className="tnum mt-1 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink
                href={`/rental?event=${eventType}&duration=${duration}&volume=${volume}`}
                size="lg"
                icon={<ArrowRight className="h-4 w-4" strokeWidth={2} />}
              >
                Request a quote
              </ButtonLink>
              <p className="text-xs leading-relaxed text-concrete/35">
                A real quote comes back within a working day, once we know the
                site, the water access and the travel.
              </p>
            </div>

            <DemoNote className="mt-5">
              Demo pricing model. Concept rates, not an offer.
            </DemoNote>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-6">
        <Link
          href="/rental"
          className="mono inline-flex items-center gap-2 py-2.5 text-concrete/40 transition-colors hover:text-hivis"
        >
          Skip the calculator, just send the brief
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </Reveal>
    </Section>
  );
}
