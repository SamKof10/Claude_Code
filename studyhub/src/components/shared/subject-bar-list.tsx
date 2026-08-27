import Link from "next/link";
import type { SubjectPerformance } from "@/lib/analytics";
import { subjectColorVar } from "@/lib/icon-map";
import { SubjectIcon } from "@/components/shared/subject-pill";

export function SubjectBarList({ items }: { items: SubjectPerformance[] }) {
  return (
    <div className="space-y-4">
      {items.map(({ subject, progress }) => (
        <Link key={subject.id} href={`/subjects/${subject.id}`} className="group flex items-center gap-3">
          <SubjectIcon subject={subject} size={14} />
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="truncate text-[13px] font-medium text-ink group-hover:text-[var(--color-signal-2)] transition-colors">{subject.name}</span>
              <span className="shrink-0 tabular-nums text-[12px] text-ink-3">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%`, background: subjectColorVar(subject.color) }}
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
