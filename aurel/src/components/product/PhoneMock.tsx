"use client";

import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

/**
 * The AUREL app on a phone, drawn flat and face-on. The screen is ordinary
 * DOM, so everything on it stays clickable and readable by a screen reader.
 */
export function PhoneMock({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("relative mx-auto w-full max-w-[290px]", className)}
      style={{ aspectRatio: "290 / 588" }}
    >
      {/* body */}
      <div
        className="absolute inset-0 rounded-[42px]"
        style={{
          background: "linear-gradient(155deg, #3d3d43, #202024 55%, #17171a)",
          boxShadow: "0 40px 90px -44px rgba(0,0,0,0.9), 0 2px 0 rgba(255,255,255,0.06) inset",
        }}
      />
      {/* screen */}
      <div
        className="absolute inset-[9px] overflow-hidden rounded-[34px]"
        style={{ background: "#0b0b0c", boxShadow: "0 0 0 1px rgba(0,0,0,0.6) inset" }}
      >
        {children}
      </div>
      {/* side buttons */}
      <span
        className="absolute -left-[2px] h-[54px] w-[3px] rounded-full"
        style={{ top: "26%", background: "#4a4a50" }}
      />
      <span
        className="absolute -right-[2px] h-[76px] w-[3px] rounded-full"
        style={{ top: "31%", background: "#4a4a50" }}
      />
    </div>
  );
}
