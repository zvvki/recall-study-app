"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ChevronRight, Brain, Layers } from "lucide-react";
import { useStore } from "@/lib/store";
import { topicConfidence, dueCardsForTopic, subjectConfidence, nextExam } from "@/lib/selectors";
import { todayISO, relativeDays } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader, Pill } from "@/components/bits";
import { RingProgress, ConfidenceBar, confToken, tokenColor } from "@/components/charts";

export default function SubjectsPage() {
  const state = useStore();
  const today = todayISO();

  return (
    <div>
      <PageHeader title="Subjects" subtitle="Your decks, grouped by unit. Confidence is computed from how you've rated each card.">
        <AddSubjectDialog />
      </PageHeader>

      <div className="space-y-5">
        {state.subjects.map((subject) => {
          const topics = state.topics.filter((t) => t.subjectId === subject.id);
          const conf = subjectConfidence(state, subject.id);
          const exam = state.exams.find((e) => e.subjectId === subject.id);
          return (
            <div key={subject.id} className="rounded-3xl border bg-card/60 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <RingProgress value={conf} token={confToken(conf)} size={72} stroke={8}>
                    <span className="text-sm font-semibold tabular-nums">{conf}%</span>
                  </RingProgress>
                  <div>
                    <h2 className="text-lg font-medium">{subject.name}</h2>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Layers className="size-4" /> {topics.length} topics
                      {exam && (
                        <Pill token="chart-4">{exam.name.split(" ").slice(-2).join(" ")} · {relativeDays(today, exam.date)}</Pill>
                      )}
                    </div>
                  </div>
                </div>
                <AddTopicDialog subjectId={subject.id} />
              </div>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {topics.map((t) => {
                  const c = topicConfidence(state, t.id);
                  const due = dueCardsForTopic(state, t.id, today).length;
                  const cards = state.cards.filter((cc) => cc.topicId === t.id).length;
                  return (
                    <Link
                      key={t.id}
                      href={`/topics/${t.id}`}
                      className="group rounded-2xl border bg-background/40 p-4 transition-colors hover:bg-card"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{t.name}</span>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1"><ConfidenceBar value={c} /></div>
                        <span className="text-sm font-medium tabular-nums" style={{ color: tokenColor(confToken(c)) }}>{c}%</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{cards} cards</span>
                        {due > 0 && <Pill token="chart-1"><Brain className="size-3" /> {due} due</Pill>}
                      </div>
                    </Link>
                  );
                })}
                {topics.length === 0 && (
                  <p className="text-sm text-muted-foreground">No topics yet — add one to start building cards.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddSubjectDialog() {
  const addSubject = useStore((s) => s.addSubject);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("chart-1");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" /> New subject
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New subject</DialogTitle>
          <DialogDescription>A subject groups related topics and can hold an exam date.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-2 block text-sm">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FINS1234 — Corporate Finance" />
          </div>
          <div>
            <Label className="mb-2 block text-sm">Colour</Label>
            <div className="flex gap-2">
              {["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"].map((t) => (
                <button
                  key={t}
                  onClick={() => setColor(t)}
                  className={`size-8 rounded-full ring-2 ${color === t ? "ring-foreground" : "ring-transparent"}`}
                  style={{ background: tokenColor(t) }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!name.trim()}
            onClick={() => {
              addSubject(name.trim(), color);
              setName("");
              setOpen(false);
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddTopicDialog({ subjectId }: { subjectId: string }) {
  const addTopic = useStore((s) => s.addTopic);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Plus className="size-4" /> Topic
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New topic</DialogTitle>
          <DialogDescription>Topics carry your recall cards and a confidence score.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-2 block text-sm">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Capital budgeting" />
          </div>
          <div>
            <Label className="mb-2 block text-sm">Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="A one-line summary" />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!name.trim()}
            onClick={() => {
              addTopic(subjectId, name.trim(), note.trim() || undefined);
              setName("");
              setNote("");
              setOpen(false);
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
