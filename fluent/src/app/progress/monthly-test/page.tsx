import type { Metadata } from "next";
import { MonthlyTestGate } from "@/components/progress/MonthlyTestGate";

export const metadata: Metadata = { title: "Monthly check-in" };

export default function MonthlyTestPage() {
  return <MonthlyTestGate />;
}
