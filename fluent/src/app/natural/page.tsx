import { Reveal } from "@/components/ui/Reveal";
import { NaturalList } from "@/components/natural/NaturalList";

export const metadata = { title: "Sound More Native" };

export default function NaturalPage() {
  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Sound More Native</h1>
          <p className="lede mt-2 max-w-xl">
            A basic sentence, upgraded twice. Tap any row to see the natural and advanced versions — and why the tone shifts.
          </p>
        </div>
      </Reveal>
      <NaturalList />
    </div>
  );
}
