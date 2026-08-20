"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  DURATIONS,
  EVENT_TYPES,
  VOLUMES,
  quoteRental,
  submitRentalRequest,
  type DurationId,
  type EventTypeId,
  type RentalReceipt,
  type VolumeId,
} from "@/lib/rental";
import { formatPrice } from "@/lib/products";
import { WashScene } from "@/components/product/WashScene";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, SelectField, TextAreaField, ChoiceCard } from "@/components/ui/Field";
import { DemoNote, Mono, Seam } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";

const STEPS = ["Event", "Site", "Contact", "Done"] as const;

const COUNTRIES = [
  "Germany", "Austria", "Switzerland", "France", "Italy", "Spain", "Slovenia",
  "Netherlands", "Belgium", "Denmark", "Sweden", "Norway", "Finland", "Poland",
  "Czechia", "United Kingdom", "Ireland", "Portugal", "Canada", "United States",
];

function isEventType(v: string | null): v is EventTypeId {
  return !!v && EVENT_TYPES.some((e) => e.id === v);
}
function isDuration(v: string | null): v is DurationId {
  return !!v && DURATIONS.some((d) => d.id === v);
}
function isVolume(v: string | null): v is VolumeId {
  return !!v && VOLUMES.some((x) => x.id === v);
}

/** Reads the calculator's selection out of the URL so the quote carries over. */
export function RentalFlowWithParams() {
  const params = useSearchParams();
  const event = params.get("event");
  const duration = params.get("duration");
  const volume = params.get("volume");
  return (
    <RentalFlow
      initialEvent={isEventType(event) ? event : "festival"}
      initialDuration={isDuration(duration) ? duration : "weekend"}
      initialVolume={isVolume(volume) ? volume : "100"}
    />
  );
}

export function RentalFlow({
  initialEvent = "festival",
  initialDuration = "weekend",
  initialVolume = "100",
}: {
  initialEvent?: EventTypeId;
  initialDuration?: DurationId;
  initialVolume?: VolumeId;
}) {
  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState<EventTypeId>(initialEvent);
  const [duration, setDuration] = useState<DurationId>(initialDuration);
  const [volume, setVolume] = useState<VolumeId>(initialVolume);
  const [form, setForm] = useState({
    eventName: "",
    startDate: "",
    location: "",
    country: "Germany",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<RentalReceipt | null>(null);

  const quote = quoteRental(eventType, duration, volume);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  function validate(which: number) {
    const e: Record<string, string> = {};
    if (which === 1) {
      if (!form.eventName.trim()) e.eventName = "Required";
      if (!form.startDate) e.startDate = "Required";
      if (!form.location.trim()) e.location = "Required";
    }
    if (which === 2) {
      if (!form.name.trim()) e.name = "Required";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Check this";
    }
    return e;
  }

  function next() {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => s + 1);
  }

  async function submit() {
    const e = validate(2);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setBusy(true);
    setFailed(null);
    try {
      const res = await submitRentalRequest({ eventType, duration, volume, ...form });
      setReceipt(res);
      setStep(3);
    } catch (err) {
      setFailed(err instanceof Error ? err.message : "Could not send the request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-28 sm:px-8">
      <Mono className="text-concrete/35">Event rental</Mono>

      <ol className="no-scrollbar mt-6 flex gap-1 overflow-x-auto">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={cn(
                  "mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                  done && "border-hivis bg-hivis text-steel",
                  active && !done && "border-hivis text-hivis",
                  !done && !active && "border-[var(--edge)] text-concrete/30",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : String(i + 1).padStart(2, "0")}
              </span>
              <span className={cn("mono hidden truncate sm:inline", active ? "text-concrete" : "text-concrete/30")}>
                {label}
              </span>
              {i < STEPS.length - 1 ? (
                <span className={cn("h-px flex-1", done ? "bg-hivis/60" : "bg-[var(--edge)]")} />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 ? (
                <section>
                  <Mono className="text-hivis">01 · Event</Mono>
                  <h1 className="display mt-3 text-[clamp(1.8rem,4vw,2.6rem)]">What are we washing for?</h1>

                  <fieldset className="mt-8">
                    <legend className="mono text-concrete/40">Event type</legend>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {EVENT_TYPES.map((e) => (
                        <ChoiceCard
                          key={e.id}
                          selected={eventType === e.id}
                          onSelect={() => setEventType(e.id)}
                          title={e.name}
                          blurb={e.blurb}
                        />
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="mt-8">
                    <legend className="mono text-concrete/40">Duration</legend>
                    <div className="mt-3 grid gap-2 sm:grid-cols-4">
                      {DURATIONS.map((d) => (
                        <ChoiceCard
                          key={d.id}
                          selected={duration === d.id}
                          onSelect={() => setDuration(d.id)}
                          title={d.name}
                          meta={`${d.days}d`}
                        />
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="mt-8">
                    <legend className="mono text-concrete/40">Bikes expected</legend>
                    <div className="mt-3 grid gap-2 sm:grid-cols-5">
                      {VOLUMES.map((v) => (
                        <ChoiceCard
                          key={v.id}
                          selected={volume === v.id}
                          onSelect={() => setVolume(v.id)}
                          title={v.name}
                          meta={`${v.boxes}×`}
                        />
                      ))}
                    </div>
                  </fieldset>
                </section>
              ) : null}

              {step === 1 ? (
                <section>
                  <Mono className="text-hivis">02 · Site</Mono>
                  <h1 className="display mt-3 text-[clamp(1.8rem,4vw,2.6rem)]">Where and when?</h1>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Event name"
                      className="sm:col-span-2"
                      value={form.eventName}
                      error={errors.eventName}
                      placeholder="Alpine Enduro Series, round 3"
                      onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                    />
                    <Field
                      label="Start date"
                      type="date"
                      value={form.startDate}
                      error={errors.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                    <SelectField
                      label="Country"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </SelectField>
                    <Field
                      label="Location"
                      className="sm:col-span-2"
                      value={form.location}
                      error={errors.location}
                      placeholder="Venue, town, or a pin"
                      hint="Water and power access on site is the thing that moves the price most."
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                </section>
              ) : null}

              {step === 2 ? (
                <section>
                  <Mono className="text-hivis">03 · Contact</Mono>
                  <h1 className="display mt-3 text-[clamp(1.8rem,4vw,2.6rem)]">Who do we call back?</h1>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Name"
                      value={form.name}
                      error={errors.name}
                      autoComplete="name"
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <Field
                      label="Email"
                      type="email"
                      inputMode="email"
                      value={form.email}
                      error={errors.email}
                      autoComplete="email"
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <Field
                      label="Phone (optional)"
                      type="tel"
                      className="sm:col-span-2"
                      value={form.phone}
                      autoComplete="tel"
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                    <TextAreaField
                      label="Anything we should know?"
                      className="sm:col-span-2"
                      rows={4}
                      placeholder="Access, power, water, branding, running times…"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                  {failed ? (
                    <p className="mt-4 rounded-[3px] border border-[#ff8f6b]/40 bg-[#ff8f6b]/10 p-3 text-sm text-[#ff8f6b]">
                      {failed}
                    </p>
                  ) : null}
                </section>
              ) : null}

              {step === 3 && receipt ? (
                <section>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.4, 0.64, 1] }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-hivis text-steel"
                  >
                    <Check className="h-7 w-7" strokeWidth={3} />
                  </motion.div>

                  <motion.h1
                    className="display mt-8 text-[clamp(2.1rem,6vw,4.2rem)]"
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
                  >
                    {"Request received.".split(" ").map((word, i) => (
                      <span key={`${word}-${i}`} className="mr-[0.28em] inline-block overflow-hidden align-bottom">
                        <motion.span
                          className="inline-block"
                          variants={{
                            hidden: { y: "110%", opacity: 0 },
                            show: { y: "0%", opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                          }}
                        >
                          {word}
                        </motion.span>
                      </span>
                    ))}
                  </motion.h1>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                  >
                    <p className="lede mt-5 max-w-[46ch] text-concrete/55">
                      We have the brief. Someone reads it, works out the travel and
                      the water access, and comes back with a real number.
                    </p>

                    <dl className="mt-8 grid gap-6 sm:grid-cols-3">
                      <div>
                        <dt className="mono text-concrete/35">Reference</dt>
                        <dd className="tnum mt-2 font-mono text-lg text-hivis">{receipt.reference}</dd>
                      </div>
                      <div>
                        <dt className="mono text-concrete/35">Received</dt>
                        <dd className="mt-2 text-sm text-concrete/75">
                          {new Date(receipt.receivedAtIso).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </dd>
                      </div>
                      <div>
                        <dt className="mono text-concrete/35">Reply within</dt>
                        <dd className="mt-2 text-sm text-concrete/75">{receipt.replyWithinHours} hours</dd>
                      </div>
                    </dl>

                    <div className="mt-10 overflow-hidden rounded-[5px] border border-[var(--edge)] bg-[#0a0c0d] p-4">
                      <WashScene progress={0.12} bikeId="downhill" />
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <ButtonLink href="/" size="lg">
                        Back to the box
                      </ButtonLink>
                      <ButtonLink href="/#buy" size="lg" variant="outline">
                        Buy one instead
                      </ButtonLink>
                    </div>

                    <DemoNote className="mt-8">
                      Demo form — the request is not actually sent anywhere.
                    </DemoNote>
                  </motion.div>
                </section>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {step < 3 ? (
            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {step === 0 ? (
                <Link
                  href="/#rent"
                  className="mono inline-flex items-center gap-2 py-2.5 text-concrete/35 transition-colors hover:text-concrete"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                  Back to the calculator
                </Link>
              ) : (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                  Back
                </Button>
              )}

              {step < 2 ? (
                <Button size="lg" onClick={next} icon={<ArrowRight className="h-4 w-4" strokeWidth={2} />}>
                  Continue
                </Button>
              ) : (
                <Button size="lg" onClick={submit} disabled={busy}>
                  {busy ? "Sending…" : "Send request"}
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {/* running quote */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[5px] border border-[var(--edge)] bg-steel-2/50 p-5 sm:p-6">
            <Mono className="text-concrete/40">Indicative price</Mono>
            <p className="display tnum mt-2 text-[clamp(1.5rem,3.6vw,2.1rem)] text-hivis">
              {formatPrice(quote.lowCents)} – {formatPrice(quote.highCents)}
            </p>

            <Seam className="my-5" />

            <dl className="space-y-2.5 text-sm">
              {[
                ["Event", EVENT_TYPES.find((e) => e.id === eventType)?.name ?? ""],
                ["Duration", `${DURATIONS.find((d) => d.id === duration)?.name} · ${quote.days} days`],
                ["Bikes", VOLUMES.find((v) => v.id === volume)?.name ?? ""],
                ["Boxes on site", String(quote.boxes)],
                ["Setup + collection", formatPrice(quote.setupCents)],
                ["Crew", formatPrice(quote.crewCents)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-concrete/45">{k}</dt>
                  <dd className="tnum text-right">{v}</dd>
                </div>
              ))}
            </dl>

            <DemoNote className="mt-5">
              Concept rates. The real quote depends on travel, water and power.
            </DemoNote>
          </div>
        </aside>
      </div>
    </div>
  );
}
