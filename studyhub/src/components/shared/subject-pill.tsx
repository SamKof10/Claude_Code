import * as React from "react";
import Link from "next/link";
import type { Subject } from "@/lib/types";
import { getSubjectIcon, subjectColorVar } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

export function SubjectIcon({ subject, size = 16 }: { subject: Pick<Subject, "icon" | "color">; size?: number }) {
  // `getSubjectIcon` returns a stable module-level component from the icon map;
  // rendering it via createElement keeps that explicit (a `const Icon = ...`
  // local reads as a component defined during render).
  const color = subjectColorVar(subject.color);
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-lg"
      style={{
        width: size + 14,
        height: size + 14,
        color,
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
      }}
    >
      {React.createElement(getSubjectIcon(subject.icon), { size, strokeWidth: 2 })}
    </span>
  );
}

export function SubjectDot({ subject, className }: { subject: Pick<Subject, "color">; className?: string }) {
  return <span className={cn("inline-block size-2 rounded-full", className)} style={{ background: subjectColorVar(subject.color) }} />;
}

export function SubjectPill({ subject, href, className }: { subject: Subject | null | undefined; href?: string; className?: string }) {
  if (!subject) return <span className={cn("text-[12px] text-ink-3", className)}>No subject</span>;
  const content = (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-2", className)}>
      <SubjectDot subject={subject} />
      {subject.name}
    </span>
  );
  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }
  return content;
}
