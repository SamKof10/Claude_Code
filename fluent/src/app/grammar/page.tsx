import { Reveal } from "@/components/ui/Reveal";
import { PracticeRound } from "@/components/grammar/PracticeRound";

export const metadata = { title: "Grammar" };

export default function GrammarPage() {
  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Grammar</h1>
          <p className="lede mt-2 max-w-xl">
            Not &ldquo;choose the correct answer.&rdquo; Fix the sentence yourself — that&rsquo;s what actually sticks.
          </p>
        </div>
      </Reveal>
      <PracticeRound />
    </div>
  );
}
