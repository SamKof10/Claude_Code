import { ButtonLink } from "@/components/ui/Button";
import { Mono, StatusDot } from "@/components/ui/Primitives";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[1180px] flex-col justify-center px-5 py-28 sm:px-8">
      <div className="flex items-center gap-2.5">
        <StatusDot tone="muted" />
        <Mono className="text-concrete/40">Error 404 · bay empty</Mono>
      </div>
      <h1 className="display mt-6 text-[clamp(2.4rem,9vw,6rem)]">
        Nothing to
        <span className="block text-hivis">wash here.</span>
      </h1>
      <p className="lede mt-6 max-w-[42ch] text-concrete/50">
        This page does not exist. The box, the calculator and the checkout all
        still do.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/" size="lg">
          Back to the box
        </ButtonLink>
        <ButtonLink href="/rental" size="lg" variant="outline">
          Rent for an event
        </ButtonLink>
      </div>
    </div>
  );
}
