"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { Card, Mono } from "@/components/ui/Primitives";
import { cn } from "@/components/ui/cn";
import { TUTOR_RULES, TUTOR_FOLLOW_UPS, TUTOR_VOCAB_TIPS, TUTOR_STARTERS } from "@/lib/content/tutor";
import { useStore } from "@/lib/store";

interface Msg {
  id: number;
  role: "tutor" | "user";
  text: string;
}

let idCounter = 1;

/** Kept outside the component: a believable, varied "typing" delay, not tied to render. */
function typingDelayMs(): number {
  return 600 + Math.random() * 500;
}

function respondTo(text: string): string {
  const lower = text.toLowerCase();

  const rule = TUTOR_RULES.find((r) => r.triggers.some((t) => lower.includes(t)));
  if (rule) return rule.correction;

  const tip = TUTOR_VOCAB_TIPS.find((t) => lower.includes(t.trigger));
  const followUp = TUTOR_FOLLOW_UPS[Math.floor(Math.random() * TUTOR_FOLLOW_UPS.length)];
  if (tip && Math.random() < 0.5) return `${followUp} (${tip.suggestion})`;
  return followUp;
}

export function TutorChat() {
  const { markActivity } = useStore();
  const [messages, setMessages] = useState<Msg[]>([
    { id: idCounter++, role: "tutor", text: "Hey! I'm your English tutor. We can talk about anything — I'll jump in gently if something's worth fixing, but mostly let's just have a conversation." },
  ]);
  const [value, setValue] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentFirst = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    if (!sentFirst.current) {
      sentFirst.current = true;
      markActivity("tutor");
    }
    setMessages((m) => [...m, { id: idCounter++, role: "user", text }]);
    setValue("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: idCounter++, role: "tutor", text: respondTo(text) }]);
    }, typingDelayMs());
  };

  return (
    <Card className="mx-auto flex h-[600px] max-w-2xl flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex items-start gap-2.5", m.role === "user" && "flex-row-reverse")}>
              <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full", m.role === "tutor" ? "bg-signal/15 text-signal" : "bg-surface-2 text-ink-2")}>
                {m.role === "tutor" ? <Bot size={14} /> : <User size={14} />}
              </span>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed",
                  m.role === "tutor" ? "bg-surface-2 text-ink-1" : "bg-signal text-white",
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing ? (
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-signal/15 text-signal">
                <Bot size={14} />
              </span>
              <div className="flex items-center gap-1 rounded-2xl bg-surface-2 px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="status-dot h-1.5 w-1.5 rounded-full bg-ink-3" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      {messages.length < 2 ? (
        <div className="border-t border-[var(--line)] px-5 py-3">
          <Mono className="text-ink-3">Need a starter?</Mono>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TUTOR_STARTERS.slice(0, 3).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[12px] text-ink-2 hover:border-[var(--line-strong)] hover:text-ink-1"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2 border-t border-[var(--line)] p-4">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(value)}
          placeholder="Type a message..."
          className="h-11 flex-1 rounded-full border border-[var(--line-strong)] bg-surface-2 px-4 text-[13.5px] text-ink-1 outline-none focus:border-signal"
        />
        <button
          type="button"
          onClick={() => send(value)}
          disabled={!value.trim()}
          aria-label="Send"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-signal text-white transition-transform active:scale-95 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </Card>
  );
}
