"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { useStudyStore } from "@/lib/store";
import { aiStudyPlan, AIClientError } from "@/lib/ai/client";
import type { KnowledgeLevel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

function inNDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function ExamFormDialog({
  open,
  onOpenChange,
  defaultSubjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSubjectId?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Mounted only while open, so the form resets itself each time. */}
        <ExamFormBody defaultSubjectId={defaultSubjectId} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ExamFormBody({ defaultSubjectId, onClose }: { defaultSubjectId?: string; onClose: () => void }) {
  const router = useRouter();
  const subjects = useStudyStore((s) => s.subjects);
  const addExam = useStudyStore((s) => s.addExam);

  const [subjectId, setSubjectId] = React.useState(defaultSubjectId ?? subjects[0]?.id ?? "");
  const [title, setTitle] = React.useState("");
  const [date, setDate] = React.useState(() => inNDays(14));
  const [topics, setTopics] = React.useState<string[]>([]);
  const [topicInput, setTopicInput] = React.useState("");
  const [level, setLevel] = React.useState<KnowledgeLevel>("intermediate");
  const [hours, setHours] = React.useState("4");
  const [loading, setLoading] = React.useState(false);

  async function submit() {
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject || !date) return;
    const examTitle = title.trim() || `${subject.name} Exam`;
    setLoading(true);
    try {
      const createdAt = new Date().toISOString();
      const { data } = await aiStudyPlan({
        subjectName: subject.name,
        examTitle,
        examDate: new Date(date).toISOString(),
        topics,
        currentLevel: level,
        availableHoursPerWeek: Number(hours) || 3,
        createdAt,
      });
      const exam = addExam({
        subjectId,
        title: examTitle,
        date: new Date(date).toISOString(),
        topics,
        currentLevel: level,
        availableHoursPerWeek: Number(hours) || 3,
        studyPlan: data.weeks,
      });
      toast.success("Study plan ready");
      onClose();
      router.push(`/exams/${exam.id}`);
    } catch (err) {
      toast.error(err instanceof AIClientError ? err.message : "Couldn't build a study plan. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>New exam</DialogTitle>
        <DialogDescription>StudyHub will build a week-by-week prep plan automatically.</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Subject</Label>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Exam title</Label>
          <Input placeholder="e.g. Midterm exam" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Exam date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={inNDays(1)} />
          </div>
          <div className="space-y-1.5">
            <Label>Hours/week available</Label>
            <Input type="number" min={1} max={40} value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Current knowledge level</Label>
          <Select value={level} onValueChange={(v) => setLevel(v as KnowledgeLevel)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner — starting from scratch</SelectItem>
              <SelectItem value="intermediate">Intermediate — know the basics</SelectItem>
              <SelectItem value="advanced">Advanced — need to sharpen up</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Topics to cover</Label>
          <div className="flex flex-wrap gap-1.5">
            {topics.map((t) => (
              <Badge key={t} variant="outline" className="gap-1">
                {t}
                <button aria-label={`Remove ${t}`} onClick={() => setTopics((prev) => prev.filter((x) => x !== t))} className="hover:text-danger">
                  <X className="size-2.5" />
                </button>
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Type a topic and press Enter…"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && topicInput.trim()) {
                e.preventDefault();
                setTopics((prev) => [...prev, topicInput.trim()]);
                setTopicInput("");
              }
            }}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={loading || !subjectId || !date}>
          {loading && <Loader2 className="size-3.5 animate-spin" />} Create study plan
        </Button>
      </DialogFooter>
    </>
  );
}
