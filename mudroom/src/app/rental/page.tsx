import { Suspense } from "react";
import type { Metadata } from "next";
import { RentalFlow, RentalFlowWithParams } from "@/components/rental/RentalFlow";

export const metadata: Metadata = {
  title: "Event rental request",
  description:
    "Tell us about the event and get an indicative price for putting one or more MUDROOM wash boxes on your site.",
};

export default function RentalPage() {
  /* The fallback renders the same flow with its defaults — it must not read
     search params itself, or the static export fails at build time. */
  return (
    <Suspense fallback={<RentalFlow />}>
      <RentalFlowWithParams />
    </Suspense>
  );
}
