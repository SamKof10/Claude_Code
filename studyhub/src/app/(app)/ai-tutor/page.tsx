"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { History, Send, Square } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { streamAIChat, AIClientError } from "@/lib/ai/client";
import type { ChatTurn } from "@/lib/ai/types";
import type { TutorMode } from "@/lib/types";
import { TUTOR_MODES, suggestedQuestions } from "@/lib/tutor-modes";
import { ConversationSidebar } from "@/components/ai-tutor/conversation-sidebar";
import { ChatMessage } from "@/components/ai-tutor/chat-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export default function AITutorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjects = useStudyStore((s) => s.subjects);
  const documents = useStudyStore((s) => s.documents);
  const conversations = useStudyStore((s) => s.conversations);
  const allMessages = useStudyStore((s) => s.messages);
  const createConversation = useStudyStore((s) => s.createConversation);
  const updateConversation = useStudyStore((s) => s.updateConversation);
  const deleteConversation = useStudyStore((s) => s.deleteConversation);
  const addMessage = useStudyStore((s) => s.addMessage);
  const spendAICredits = useStudyStore((s) => s.spendAICredits);
  const logStudySession = useStudyStore((s) => s.logStudySession);

  const [activeId, setActiveId] = React.useState<string | null>(searchParams.get("c"));
  const [mode, setMode] = React.useState<TutorMode>("explain");
  const [subjectId, setSubjectId] = React.useState<string>("none");
  const [documentId, setDocumentId] = React.useState<string>("none");
  const [input, setInput] = React.useState("");
  const [streamingText, setStreamingText] = React.useState<string | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const streamBufferRef = React.useRef("");

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const messages = active ? allMessages.filter((m) => m.conversationId === active.id) : [];
  const effectiveMode = active?.mode ?? mode;
  const effectiveSubjectId = active?.subjectId ?? (subjectId === "none" ? null : subjectId);
  const effectiveDocumentId = active?.documentId ?? (documentId === "none" ? null : documentId);
  const subject = effectiveSubjectId ? subjects.find((s) => s.id === effectiveSubjectId) : null;
  const document = effectiveDocumentId ? documents.find((d) => d.id === effectiveDocumentId) : null;
  const subjectDocs = documents.filter((d) => d.subjectId === (effectiveSubjectId ?? ""));
  const busy = streamingText !== null;

  // Scroll on a new message or as tokens stream in — keyed on length rather
  // than the array so this doesn't re-fire on every unrelated render.
  const messageCount = messages.length;
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messageCount, streamingText]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");

    let conversationId = active?.id;
    if (!conversationId) {
      const created = createConversation({
        subjectId: subjectId === "none" ? null : subjectId,
        documentId: documentId === "none" ? null : documentId,
        mode,
        title: trimmed.slice(0, 60),
      });
      conversationId = created.id;
      setActiveId(created.id);
      router.replace(`/ai-tutor?c=${created.id}`);
    }

    addMessage(conversationId, "user", trimmed);
    const history: ChatTurn[] = [...messages.map((m) => ({ role: m.role, content: m.content })), { role: "user" as const, content: trimmed }];

    streamBufferRef.current = "";
    setStreamingText("");
    abortRef.current = new AbortController();
    try {
      await streamAIChat(
        { messages: history, mode: effectiveMode, subjectName: subject?.name, documentContext: document?.content },
        {
          onChunk: (chunk) => {
            streamBufferRef.current += chunk;
            setStreamingText(streamBufferRef.current);
          },
          signal: abortRef.current.signal,
        }
      );
      addMessage(conversationId, "assistant", streamBufferRef.current);
      setStreamingText(null);
      spendAICredits(2);
      logStudySession({ subjectId: effectiveSubjectId, type: "ai-tutor", durationMinutes: 3, relatedId: conversationId });
    } catch (err) {
      if (streamBufferRef.current) {
        addMessage(conversationId, "assistant", streamBufferRef.current);
      }
      setStreamingText(null);
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error(err instanceof AIClientError ? err.message : "The AI Tutor is temporarily unavailable.");
    }
  }

  function newConversation() {
    setActiveId(null);
    router.replace("/ai-tutor");
    setMobileHistoryOpen(false);
  }

  const historyPanel = (
    <ConversationSidebar
      conversations={conversations}
      activeId={activeId}
      onSelect={(id) => {
        setActiveId(id);
        router.replace(`/ai-tutor?c=${id}`);
        setMobileHistoryOpen(false);
      }}
      onNew={newConversation}
      onDelete={(id) => {
        deleteConversation(id);
        if (activeId === id) newConversation();
      }}
    />
  );

  return (
    <div className="flex overflow-hidden rounded-2xl border border-border" style={{ height: "calc(100dvh - 9rem)" }}>
      <div className="hidden md:flex">{historyPanel}</div>
      <Sheet open={mobileHistoryOpen} onOpenChange={setMobileHistoryOpen}>
        <SheetContent side="left" className="w-72 p-0">
          {historyPanel}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col bg-[var(--bg-elevated)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setMobileHistoryOpen(true)}>
            <History className="size-4" />
          </Button>
          <ToggleGroup
            type="single"
            value={effectiveMode}
            onValueChange={(v) => {
              if (!v) return;
              setMode(v as TutorMode);
              if (active) updateConversation(active.id, { mode: v as TutorMode });
            }}
          >
            {TUTOR_MODES.map((m) => (
              <ToggleGroupItem key={m.value} value={m.value} title={m.description}>
                <m.icon className="size-3.5" /> {m.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="ml-auto flex items-center gap-2">
            <Select value={effectiveSubjectId ?? "none"} onValueChange={(v) => setSubjectId(v)} disabled={!!active}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="No subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No subject</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={effectiveDocumentId ?? "none"} onValueChange={(v) => setDocumentId(v)} disabled={!!active || !subjectDocs.length}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="No document" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No document</SelectItem>
                {subjectDocs.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5">
          {messages.length === 0 && streamingText === null ? (
            <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl signal-gradient">
                {React.createElement(TUTOR_MODES.find((m) => m.value === effectiveMode)!.icon, { className: "size-6 text-white" })}
              </div>
              <h2 className="text-[16px] font-semibold text-ink">Ask your AI Tutor anything</h2>
              <p className="mt-1 text-[13px] text-ink-3">
                {TUTOR_MODES.find((m) => m.value === effectiveMode)!.description}
                {subject ? ` · ${subject.name}` : ""}
                {document ? ` · ${document.name}` : ""}
              </p>
              <div className="mt-5 grid w-full gap-2">
                {suggestedQuestions(effectiveMode, subject?.name).map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-left text-[12.5px] text-ink-2 transition-colors hover:border-border-strong hover:bg-surface-2"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-5">
              {messages.map((m) => (
                <ChatMessage key={m.id} role={m.role} content={m.content} />
              ))}
              {streamingText !== null && <ChatMessage role="assistant" content={streamingText} streaming />}
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask anything…"
              rows={1}
              className="min-h-10 resize-none py-2.5"
            />
            {busy ? (
              <Button size="icon" variant="secondary" onClick={() => abortRef.current?.abort()}>
                <Square className="size-3.5 fill-current" />
              </Button>
            ) : (
              <Button size="icon" onClick={() => send(input)} disabled={!input.trim()}>
                <Send className="size-4" />
              </Button>
            )}
          </div>
          {active && (
            <p className="mx-auto mt-1.5 max-w-2xl text-[10.5px] text-ink-3">
              <Badge variant="outline" className="mr-1">{TUTOR_MODES.find((m) => m.value === effectiveMode)!.label}</Badge>
              mode locked to this conversation&apos;s context — start a new conversation to change subject or document
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
