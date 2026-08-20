import { Reveal } from "@/components/ui/Reveal";
import { AbroadRun } from "@/components/abroad/AbroadRun";

export const metadata = { title: "Abroad Mode" };

export default function AbroadPage() {
  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Abroad Mode</h1>
          <p className="lede mt-2 max-w-xl">
            You should be able to function comfortably in an English-speaking country without mentally translating every sentence.
          </p>
        </div>
      </Reveal>
      <AbroadRun />
    </div>
  );
}
