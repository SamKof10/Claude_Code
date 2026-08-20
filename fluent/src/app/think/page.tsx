import { Reveal } from "@/components/ui/Reveal";
import { ThinkPractice } from "@/components/think/ThinkPractice";

export const metadata = { title: "Think in English" };

export default function ThinkPage() {
  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Think in English</h1>
          <p className="lede mt-2 max-w-xl">
            No German translation shown first. Formulate your answer in English before anything else.
          </p>
        </div>
      </Reveal>
      <ThinkPractice />
    </div>
  );
}
