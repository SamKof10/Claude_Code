"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

interface ToastEntry {
  id: number;
  title: string;
  detail?: string;
}

interface ToastContextValue {
  push: (title: string, detail?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const push = useCallback((title: string, detail?: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-2), { id, title, detail }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, 3600);
    timers.current.set(id, timer);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[130] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto flex w-full max-w-[340px] items-center gap-3 rounded-full border border-[var(--line-night-strong)] bg-night px-4 py-3 text-paper shadow-[0_16px_40px_-16px_rgba(0,0,0,0.8)]"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ember text-night">
                <Check size={13} strokeWidth={3} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] leading-tight font-medium">
                  {toast.title}
                </span>
                {toast.detail ? (
                  <span className="mono-label mt-0.5 block truncate text-[9.5px] text-paper/55">
                    {toast.detail}
                  </span>
                ) : null}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
