import { TabBar } from "./tab-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main
        className="mx-auto max-w-lg px-5 pb-32"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 28px)" }}
      >
        {children}
      </main>
      <TabBar />
    </>
  );
}

export function PageTitle({ title, meta }: { title: string; meta?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h1 className="text-[34px] font-bold leading-[41px] tracking-[-0.5px]">{title}</h1>
      {meta && <div className="pb-1.5 text-[15px] leading-[20px] text-ink-2">{meta}</div>}
    </div>
  );
}

export function PhaseBadge({ week, label }: { week: number; label: string }) {
  const deload = label === "Deload";
  return (
    <span
      className={`inline-flex h-7 items-center rounded-full px-3 text-[13px] font-semibold leading-[18px] ${
        deload ? "bg-warn/18 text-warn-bright" : "bg-go/16 text-go-bright"
      }`}
    >
      Woche {week} · {label}
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center rounded-full bg-raised px-3 text-[13px] font-medium leading-[18px] text-ink-2">
      {children}
    </span>
  );
}
