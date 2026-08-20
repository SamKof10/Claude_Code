import { Reveal } from "@/components/ui/Reveal";
import { TutorChat } from "@/components/tutor/TutorChat";

export const metadata = { title: "AI Tutor" };

export default function TutorPage() {
  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">AI Tutor</h1>
          <p className="lede mt-2 max-w-xl">
            A conversation, not a correction machine. Mistakes get gentle notes; the conversation keeps flowing.
          </p>
        </div>
      </Reveal>
      <TutorChat />
    </div>
  );
}
