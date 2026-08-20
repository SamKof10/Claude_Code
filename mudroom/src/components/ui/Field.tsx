"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

const control =
  "w-full rounded-[3px] border bg-steel-2/60 px-3.5 text-[15px] text-concrete " +
  "placeholder:text-concrete/25 transition-colors duration-200 " +
  "focus:border-hivis focus:outline-none";

function Label({ htmlFor, children, error }: { htmlFor: string; children: ReactNode; error?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="mono text-concrete/45">
        {children}
      </label>
      {error ? <span className="mono !tracking-[0.08em] text-[#ff8f6b]">{error}</span> : null}
    </div>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Field({ label, error, hint, className, id, ...rest }: FieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className={className}>
      <Label htmlFor={fieldId} error={error}>
        {label}
      </Label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(
          control,
          "h-12",
          error ? "border-[#ff8f6b]/60" : "border-[var(--edge)]",
        )}
        {...rest}
      />
      {hint ? <p className="mt-1.5 text-xs text-concrete/35">{hint}</p> : null}
    </div>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: ReactNode;
}

export function SelectField({ label, error, className, id, children, ...rest }: SelectFieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className={className}>
      <Label htmlFor={fieldId} error={error}>
        {label}
      </Label>
      <div className="relative">
        <select
          id={fieldId}
          className={cn(
            control,
            "h-12 appearance-none pr-10",
            error ? "border-[#ff8f6b]/60" : "border-[var(--edge)]",
          )}
          {...rest}
        >
          {children}
        </select>
        <svg
          viewBox="0 0 12 8"
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 h-2 w-3 -translate-y-1/2 fill-none stroke-concrete/40"
          strokeWidth="1.6"
        >
          <path d="M1 1.5 6 6.5 11 1.5" />
        </svg>
      </div>
    </div>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextAreaField({ label, error, className, id, ...rest }: TextAreaFieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className={className}>
      <Label htmlFor={fieldId} error={error}>
        {label}
      </Label>
      <textarea
        id={fieldId}
        rows={3}
        className={cn(control, "resize-y py-3 leading-relaxed", error ? "border-[#ff8f6b]/60" : "border-[var(--edge)]")}
        {...rest}
      />
    </div>
  );
}

/** Radio-style selectable card, used for every either/or choice on the site. */
export function ChoiceCard({
  selected,
  onSelect,
  title,
  meta,
  blurb,
  disabled,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  title: ReactNode;
  meta?: ReactNode;
  blurb?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group relative w-full rounded-[4px] border p-4 text-left transition-all duration-200 ease-[var(--ease-out-soft)]",
        selected
          ? "border-hivis bg-hivis/[0.06]"
          : "border-[var(--edge)] bg-steel-2/40 hover:border-[var(--edge-strong)] hover:bg-steel-2/70",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold tracking-tight">{title}</span>
        {meta ? <span className="tnum mono shrink-0 text-concrete/55">{meta}</span> : null}
      </div>
      {blurb ? <p className="mt-1.5 text-[13px] leading-relaxed text-concrete/45">{blurb}</p> : null}
      <span
        className={cn(
          "absolute left-0 top-4 h-6 w-px transition-all duration-200",
          selected ? "bg-hivis" : "bg-transparent",
        )}
      />
    </button>
  );
}
