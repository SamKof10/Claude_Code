"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Controls";
import { Reveal } from "@/components/ui/Reveal";
import { NuanceLadders } from "@/components/c1c2/NuanceLadders";
import { ConnectorsList } from "@/components/c1c2/ConnectorsList";
import { IdiomsGrid } from "@/components/c1c2/IdiomsGrid";
import { RhetoricGrid } from "@/components/c1c2/RhetoricGrid";

type Tab = "nuance" | "connectors" | "idioms" | "rhetoric";

export default function C1C2Page() {
  const [tab, setTab] = useState<Tab>("nuance");

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <div>
          <h1 className="display text-[28px] text-ink-1 sm:text-[32px]">C1/C2 Lab</h1>
          <p className="lede mt-2 max-w-xl">
            Nuanced vocabulary, sophisticated connectors, idioms and rhetorical devices — the difference between correct and fluent.
          </p>
        </div>
      </Reveal>

      <Tabs
        tabs={[
          { value: "nuance", label: "Nuance ladders" },
          { value: "connectors", label: "Connectors" },
          { value: "idioms", label: "Idioms" },
          { value: "rhetoric", label: "Rhetoric" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "nuance" ? <NuanceLadders /> : null}
      {tab === "connectors" ? <ConnectorsList /> : null}
      {tab === "idioms" ? <IdiomsGrid /> : null}
      {tab === "rhetoric" ? <RhetoricGrid /> : null}
    </div>
  );
}
