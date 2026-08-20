"use client";

import { useT } from "@/lib/i18n";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono, SectionKicker } from "@/components/ui/Primitives";
import { SpotlightCard } from "@/components/ui/Spotlight";
import { DialVisual, OpticsVisual, SolarVisual, SpectrumVisual } from "./FeatureVisuals";
import { cn } from "@/components/ui/cn";

const VISUALS = [SolarVisual, SpectrumVisual, OpticsVisual, DialVisual];

export function Features() {
  const t = useT();

  return (
    <section
      id="features"
      className="relative scroll-mt-20 border-t py-24 sm:py-32"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <SectionKicker index="04" label={t.featuresSection.kicker} />
        </Reveal>

        <div className="mt-8 grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <TextReveal
            as="h2"
            text={t.featuresSection.title}
            className="h-section max-w-[16ch] text-[clamp(2.2rem,1.4rem+3.4vw,4rem)]"
          />
          <Reveal index={1}>
            <p className="text-[16px] leading-relaxed text-ink-2">
{t.featuresSection.lede}
            </p>
          </Reveal>
        </div>

        <div className="mt-14 flex flex-col gap-4 sm:gap-5">
          {t.features.map((feature, i) => {
            const Visual = VISUALS[i];
            const flip = i % 2 === 1;
            return (
              <Reveal key={feature.kicker}>
                <SpotlightCard
                  className={cn(
                    "grid overflow-hidden rounded-2xl border lg:grid-cols-2",
                    "transition-[border-color,box-shadow] duration-500",
                    "hover:shadow-[0_24px_60px_-40px_rgba(19,18,17,0.55)]",
                  )}
                  glow="color-mix(in srgb, var(--color-ember) 15%, transparent)"
                >
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl border"
                    style={{ borderColor: "var(--line)" }}
                    aria-hidden
                  />

                  {/* copy */}
                  <div
                    className={cn(
                      "relative z-[2] flex flex-col justify-center p-7 sm:p-10 lg:p-12",
                      flip && "lg:order-2",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Mono className="text-ember-deep">{String(i + 1).padStart(2, "0")}</Mono>
                      <span className="h-px w-7" style={{ background: "var(--line-strong)" }} />
                      <Mono className="text-ink-3">{feature.kicker}</Mono>
                    </div>

                    <h3 className="mt-5 max-w-[20ch] text-[clamp(1.4rem,1.1rem+1.1vw,2rem)] leading-[1.1] font-medium tracking-[-0.03em]">
                      {feature.title}
                    </h3>

                    <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
                      {feature.body}
                    </p>

                    <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-3">
                      {feature.spec.map((s) => (
                        <div key={s.label}>
                          <dt className="mono-label text-ink-3">{s.label}</dt>
                          <dd className="mt-1 font-mono text-[15px] tabular-nums">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* visual */}
                  <div
                    className={cn(
                      "relative z-[2] min-h-[260px] border-t lg:border-t-0",
                      flip ? "lg:order-1 lg:border-r" : "lg:border-l",
                    )}
                    style={{
                      borderColor: "var(--line)",
                      background: "var(--color-paper-2)",
                    }}
                  >
                    <Visual />
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
