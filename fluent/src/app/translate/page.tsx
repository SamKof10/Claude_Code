import { Reveal } from "@/components/ui/Reveal";
import { TranslationPractice } from "@/components/translate/TranslationPractice";

export const metadata = { title: "Translation" };

export default function TranslatePage() {
  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Translation Challenge</h1>
          <p className="lede mt-2 max-w-xl">
            German sentences that punish word-for-word translation — this is where C1 fluency actually gets built.
          </p>
        </div>
      </Reveal>
      <TranslationPractice />
    </div>
  );
}
