import type { Metadata } from "next";
import { Hero } from "@/components/dashboard/Hero";
import { DailyPathCard } from "@/components/dashboard/DailyPathCard";
import { SystemStatusPanel } from "@/components/dashboard/SystemStatusPanel";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { SmartReviewPreview } from "@/components/dashboard/SmartReviewPreview";
import { WeeklyChartCard } from "@/components/dashboard/WeeklyChartCard";
import { LevelStrip } from "@/components/dashboard/LevelStrip";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <div className="flex flex-col gap-5">
      <Hero />
      <StatTiles />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_1fr]">
        <DailyPathCard />
        <div className="flex flex-col gap-5">
          <SystemStatusPanel />
          <SmartReviewPreview />
        </div>
      </div>
      <WeeklyChartCard />
      <LevelStrip />
    </div>
  );
}
