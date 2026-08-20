"use client";

import { motion } from "motion/react";
import { Award, PackageCheck, RotateCcw, ShieldCheck } from "lucide-react";
import { REVIEW_META, REVIEW_STATS } from "@/lib/reviews";
import { fmt, useI18n } from "@/lib/i18n";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono, SectionKicker, Stars } from "@/components/ui/Primitives";
import { SpotlightCard } from "@/components/ui/Spotlight";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

const TRUST = [RotateCcw, ShieldCheck, PackageCheck, Award].map((icon) => ({ icon }));

export function SocialProof() {
  const { t, locale } = useI18n();

  return (
    <section
      id="reviews"
      className="relative scroll-mt-20 border-t py-24 sm:py-32"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <Reveal>
          <SectionKicker index="09" label={t.social.kicker} />
        </Reveal>

        <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
          <TextReveal
            as="h2"
            text={t.social.title}
            className="h-section max-w-[14ch] text-[clamp(2.2rem,1.4rem+3.4vw,4rem)]"
          />

          <Reveal index={1}>
            <div
              className="flex flex-wrap items-center gap-x-8 gap-y-4 border-l pl-6"
              style={{ borderColor: "var(--line-strong)" }}
            >
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[34px] leading-none font-medium tracking-[-0.04em] tabular-nums">
                    <AnimatedNumber value={REVIEW_STATS.average} decimals={1} />
                  </span>
                  <Stars rating={REVIEW_STATS.average} size={14} />
                </div>
                <Mono className="mt-2 block text-ink-3">
                  {fmt(t.social.outOf, { count: REVIEW_STATS.count.toLocaleString(locale === "de" ? "de-DE" : "en-GB") })}
                </Mono>
              </div>
              <div>
                <div className="text-[34px] leading-none font-medium tracking-[-0.04em] tabular-nums">
                  <AnimatedNumber value={REVIEW_STATS.recommendPct} suffix=" %" />
                </div>
                <Mono className="mt-2 block text-ink-3">{t.social.recommend}</Mono>
              </div>
            </div>
          </Reveal>
        </div>

        {/* reviews */}
        <div className="mt-14 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {REVIEW_META.map((review, i) => {
            const copy = t.reviews[i];
            return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <SpotlightCard
                className="flex h-full flex-col rounded-2xl border p-6 transition-shadow duration-500 hover:shadow-[0_20px_50px_-36px_rgba(19,18,17,0.6)] sm:p-7"
                glow="color-mix(in srgb, var(--color-ember) 12%, transparent)"
              >
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl border"
                  style={{ borderColor: "var(--line)" }}
                  aria-hidden
                />
                <div className="relative z-[2] flex flex-1 flex-col">
                  <Stars rating={review.rating} />
                  <h3 className="mt-4 text-[16px] leading-snug font-medium tracking-[-0.015em]">
                    {copy.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-ink-2">
{copy.body}
                  </p>

                  <div
                    className="mt-6 flex items-center justify-between gap-4 border-t pt-4"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium">{review.name}</p>
                      <p className="truncate text-[12.5px] text-ink-3">
{copy.role} · {copy.location}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Mono className="block text-ink-3">{review.variant}</Mono>
<Mono className="mt-1 block text-ink-3/70">{fmt(t.social.ownedFor, { duration: copy.ownedFor })}</Mono>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
            );
          })}
        </div>

        {/* trust */}
        <div
          className="mt-14 grid gap-px border-t sm:grid-cols-2 lg:grid-cols-4"
          style={{ background: "var(--line)", borderColor: "var(--line)" }}
        >
          {TRUST.map((item, i) => {
            const copy = t.social.trust[i];
            const Icon = item.icon;
            return (
              <motion.div
                key={copy.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-3.5 bg-paper py-7 sm:px-6"
              >
                <Icon size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ember-deep" />
                <div>
                  <p className="text-[14.5px] font-medium">{copy.title}</p>
                  <Mono className="mt-1.5 block text-ink-3">{copy.note}</Mono>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
