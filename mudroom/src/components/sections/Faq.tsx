import { FAQ } from "@/lib/content";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { Mono, Section, SectionMarker } from "@/components/ui/Primitives";

export function Faq() {
  return (
    <Section id="faq" tone="dark">
      <SectionMarker number="10" label="Questions" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <TextReveal text="FAQ" className="h-section text-[clamp(2.1rem,5.6vw,4rem)]" />
          <Reveal>
            <p className="lede mt-5 max-w-[34ch] text-concrete/50">
              The eight things people actually ask before they buy one.
            </p>
            <p className="mt-6">
              <a
                href="#rent"
                className="mono inline-block py-2.5 text-hivis underline decoration-hivis/30 underline-offset-4 hover:decoration-hivis"
              >
                Something else? Send it with a quote request
              </a>
            </p>
            <Mono className="mt-8 block text-concrete/25">Answered by the build team</Mono>
          </Reveal>
        </div>

        <Reveal index={1}>
          <Accordion items={FAQ} />
        </Reveal>
      </div>
    </Section>
  );
}
