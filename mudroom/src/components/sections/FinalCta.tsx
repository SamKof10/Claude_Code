import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Mono } from "@/components/ui/Primitives";
import { LogoMark } from "@/components/layout/Logo";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-hivis px-5 py-24 text-steel sm:px-8 md:py-32">
      <div className="hazard absolute inset-x-0 top-0 h-2 opacity-90" aria-hidden />
      {/* the mark, oversized, as a watermark rather than a logo */}
      <LogoMark
        className="pointer-events-none absolute -right-16 top-1/2 h-[420px] w-[420px] -translate-y-1/2 text-steel/10 md:right-[6%]"
        sill="currentColor"
      />
      <div className="mx-auto w-full max-w-[1180px]">
        <Reveal>
          <LogoMark className="h-10 w-10 text-steel" sill="#0d0f11" />
          <h2 className="display mt-8 max-w-[16ch] text-[clamp(2.4rem,7vw,5.2rem)]">
            Bike in. Button. Clean.
          </h2>
          <p className="lede mt-6 max-w-[46ch] text-steel/70">
            Buy one for the garage, the shop or the trail centre — or have one
            turn up at your event with an operator and leave with the mud.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="#buy"
              size="lg"
              variant="light"
              icon={<ArrowRight className="h-4 w-4" strokeWidth={2} />}
            >
              Configure your box
            </ButtonLink>
            <ButtonLink
              href="#rent"
              size="lg"
              className="border border-steel/25 text-steel hover:border-steel hover:text-steel"
              variant="ghost"
            >
              Rent for an event
            </ButtonLink>
          </div>
          <Mono className="mt-10 block text-steel/45">
            Concept store · demo checkout · no payment is taken
          </Mono>
        </Reveal>
      </div>
    </section>
  );
}
