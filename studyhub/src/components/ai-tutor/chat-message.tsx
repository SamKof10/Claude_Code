import { Sparkles, User } from "lucide-react";
import { Markdown } from "@/components/shared/markdown";
import { AIFeedback } from "@/components/shared/ai-disclosure";
import { cn } from "@/lib/utils";

export function ChatMessage({ role, content, streaming }: { role: "user" | "assistant"; content: string; streaming?: boolean }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg", isUser ? "bg-surface-2 text-ink-2" : "signal-gradient text-white")}>
        {isUser ? <User className="size-3.5" /> : <Sparkles className="size-3.5" />}
      </div>
      <div className={cn("max-w-[75%] min-w-0", isUser && "flex flex-col items-end")}>
        <div className={cn("rounded-2xl px-4 py-2.5", isUser ? "bg-surface-2 text-ink" : "border border-border bg-surface")}>
          {isUser ? (
            <p className="whitespace-pre-wrap t-body">{content}</p>
          ) : (
            <>
              <Markdown>{content || " "}</Markdown>
              {streaming && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-ink-3 align-middle" />}
            </>
          )}
        </div>
        {/* Voluntary, per-answer feedback — only once the answer has landed. */}
        {!isUser && !streaming && content.trim().length > 0 && <AIFeedback className="mt-1 -ml-1" />}
      </div>
    </div>
  );
}
