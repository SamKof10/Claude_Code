"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { LOCALES, LOCALE_META, fmt, useI18n } from "@/lib/i18n";
import { useEscape } from "@/hooks";
import { Mono } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";

/** Flag button beside the cart; opens the language list. */
export function LanguagePicker({ night = false }: { night?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  useEscape(open, () => setOpen(false));
  const current = LOCALE_META[locale];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={fmt(t.nav.languageOpen, { name: current.label })}
        className={cn(
          "grid h-11 w-11 place-items-center rounded-full transition-colors duration-200",
          night
            ? "hover:bg-[color-mix(in_srgb,white_10%,transparent)]"
            : "hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)]",
        )}
      >
        <span className="text-[19px] leading-none" aria-hidden>
          {current.flag}
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <>
            {/* click-away catcher, invisible and behind the panel */}
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[10] cursor-default"
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              role="listbox"
              aria-label={t.nav.language}
              className="glass absolute top-[calc(100%+8px)] right-0 z-[20] w-[212px] overflow-hidden rounded-xl border shadow-[0_20px_44px_-24px_rgba(19,18,17,0.55)]"
              style={{ borderColor: "var(--line-strong)" }}
            >
              <div className="border-b px-3.5 py-2.5" style={{ borderColor: "var(--line)" }}>
                <Mono className="text-ink-3">{t.nav.shipsTo}</Mono>
              </div>
              {LOCALES.map((code) => {
                const meta = LOCALE_META[code];
                const active = code === locale;
                return (
                  <button
                    key={code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setLocale(code);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors duration-150",
                      "hover:bg-[color-mix(in_srgb,var(--color-ink)_6%,transparent)]",
                    )}
                  >
                    <span className="text-[17px] leading-none" aria-hidden>
                      {meta.flag}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] text-ink">{meta.label}</span>
                      <Mono className="mt-0.5 block text-ink-3">{meta.english}</Mono>
                    </span>
                    {active ? <Check size={14} strokeWidth={2.25} className="text-ember-deep" /> : null}
                  </button>
                );
              })}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
