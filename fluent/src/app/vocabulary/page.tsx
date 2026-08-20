"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Controls";
import { Reveal } from "@/components/ui/Reveal";
import { VocabGrid } from "@/components/vocabulary/VocabGrid";
import { PracticeMode } from "@/components/vocabulary/PracticeMode";
import { FalseFriendCard } from "@/components/vocabulary/FalseFriendCard";
import { FALSE_FRIENDS } from "@/lib/content/vocabulary";

type Tab = "browse" | "practice" | "false-friends";

export default function VocabularyPage() {
  const [tab, setTab] = useState<Tab>("browse");

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Vocabulary</h1>
          <p className="lede mt-2 max-w-xl">
            Words in context, not flashcards. Every entry shows how it&rsquo;s actually used — and where German speakers usually trip.
          </p>
        </div>
      </Reveal>

      <Tabs
        tabs={[
          { value: "browse", label: "Browse" },
          { value: "practice", label: "Active recall" },
          { value: "false-friends", label: "False friends" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "browse" ? <VocabGrid /> : null}
      {tab === "practice" ? <PracticeMode /> : null}
      {tab === "false-friends" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FALSE_FRIENDS.map((f) => (
            <FalseFriendCard key={f.id} item={f} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
