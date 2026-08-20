"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Controls";
import { Reveal } from "@/components/ui/Reveal";
import { ExerciseList } from "@/components/listening/ExerciseList";
import { ListeningPlayer } from "@/components/listening/ListeningPlayer";
import { ConnectedSpeechList } from "@/components/listening/ConnectedSpeechList";
import { LISTENING_EXERCISES } from "@/lib/content/listening";

type Tab = "listen" | "connected";

export default function ListeningPage() {
  const [tab, setTab] = useState<Tab>("listen");
  const [selected, setSelected] = useState<string | null>(null);
  const exercise = LISTENING_EXERCISES.find((e) => e.id === selected) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">Listening</h1>
          <p className="lede mt-2 max-w-xl">
            Authentic-sounding English across accents, topics and levels — understand native speakers effortlessly.
          </p>
        </div>
      </Reveal>

      <Tabs
        tabs={[
          { value: "listen", label: "Listen" },
          { value: "connected", label: "Connected speech" },
        ]}
        value={tab}
        onChange={(t) => {
          setTab(t);
          setSelected(null);
        }}
      />

      {tab === "listen" ? (
        exercise ? (
          <ListeningPlayer key={exercise.id} exercise={exercise} onBack={() => setSelected(null)} />
        ) : (
          <ExerciseList onSelect={setSelected} />
        )
      ) : null}

      {tab === "connected" ? <ConnectedSpeechList /> : null}
    </div>
  );
}
