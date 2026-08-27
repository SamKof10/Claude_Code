"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import type { AIConversation } from "@/lib/types";
import { TUTOR_MODES } from "@/lib/tutor-modes";
import { cn } from "@/lib/utils";

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  conversations: AIConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const sorted = [...conversations].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-border">
      <div className="p-3">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px] font-medium text-ink transition-colors hover:border-border-strong hover:bg-surface-hover"
        >
          <MessageSquarePlus className="size-4" /> New conversation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        {sorted.map((c) => {
          const mode = TUTOR_MODES.find((m) => m.value === c.mode)!;
          return (
            <div
              key={c.id}
              className={cn(
                "group flex items-center gap-1 rounded-lg px-2.5 py-2 transition-colors",
                activeId === c.id ? "bg-surface-2" : "hover:bg-surface-2"
              )}
            >
              <button onClick={() => onSelect(c.id)} className="min-w-0 flex-1 text-left">
                <p className={cn("truncate text-[12.5px]", activeId === c.id ? "font-medium text-ink" : "text-ink-2")}>{c.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10.5px] text-ink-3">
                  <mode.icon className="size-2.5" /> {mode.label} · {formatDistanceToNow(new Date(c.updatedAt), { addSuffix: true })}
                </p>
              </button>
              <button
                onClick={() => onDelete(c.id)}
                className="flex size-6 shrink-0 items-center justify-center rounded text-ink-3 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          );
        })}
        {sorted.length === 0 && <p className="px-2.5 py-4 text-[12px] text-ink-3">No conversations yet</p>}
      </div>
    </div>
  );
}
