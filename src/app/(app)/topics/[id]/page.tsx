"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, Brain, ArrowLeft, Trash2, ChevronDown, BookOpen } from "lucide-react";
import { getLearnTopic } from "@/lib/learning";
import { useStore } from "@/lib/store";
import { topicCards, topicConfidence, dueCardsForTopic } from "@/lib/selectors";
import { RATING_META } from "@/lib/srs";
import { todayISO, relativeDays } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { TopicNotes } from "@/components/topic-notes";
import { RingProgress, ConfidenceBar, confToken, confLabel, tokenColor } from "@/components/charts";

export default function TopicPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const state = useStore();
  const today = todayISO();

  const topic = state.topics.find((t) => t.id === id);
  if (!topic) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Topic not found. <Link href="/subjects" className="text-primary hover:underline">Back to subjects</Link>
      </div>
    );
  }
  const subject = state.subjects.find((s) => s.id === topic.subjectId);
  const cards = topicCards(state, id);
  const conf = topicConfidence(state, id);
  const due = dueCardsForTopic(state, id, today).length;

  return (
    <div>
      <Link href="/subjects" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {subject?.name.split(" — ")[0] ?? "Subjects"}
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-5 rounded-3xl border bg-card/60 p-6">
        <div className="flex items-center gap-5">
          <RingProgress value={conf} token={confToken(conf)} size={96} stroke={10}>
            <div className="text-center">
              <div className="text-xl font-semibold tabular-nums">{conf}%</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{confLabel(conf)}</div>
            </div>
          </RingProgress>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{topic.name}</h1>
            {topic.note && <p className="mt-1 max-w-md text-sm text-muted-foreground">{topic.note}</p>}
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{cards.length} cards</span>
              {due > 0 && <Pill token="chart-1"><Brain className="size-3" /> {due} due</Pill>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AddCardDialog topicId={id} />
          {getLearnTopic(id) && (
            <Button asChild>
              <Link href={`/learning/${id}`}><BookOpen className="size-4" /> Learn</Link>
            </Button>
          )}
          <Button asChild variant={getLearnTopic(id) ? "outline" : "default"} disabled={cards.length === 0}>
            <Link href={`/recall?topic=${id}`}><Brain className="size-4" /> Drill</Link>
          </Button>
        </div>
      </div>

      <TopicNotes topicId={id} />

      <div className="space-y-2.5">
        {cards.map((c) => (
          <CardRow key={c.id} cardId={c.id} />
        ))}
        {cards.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-card/40 p-10 text-center text-muted-foreground">
            No cards yet. Add a question you want to be able to answer from memory.
          </div>
        )}
      </div>
    </div>
  );
}

function CardRow({ cardId }: { cardId: string }) {
  const state = useStore();
  const deleteCard = useStore((s) => s.deleteCard);
  const today = todayISO();
  const card = state.cards.find((c) => c.id === cardId);
  const [open, setOpen] = useState(false);
  if (!card) return null;
  const rm = card.lastRating ? RATING_META[card.lastRating] : null;

  return (
    <div className="rounded-2xl border bg-card/60 p-4">
      <div className="flex items-start gap-3">
        <button onClick={() => setOpen((o) => !o)} className="mt-0.5 text-muted-foreground hover:text-foreground">
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <div className="min-w-0 flex-1">
          <button onClick={() => setOpen((o) => !o)} className="text-left font-medium">
            {card.question}
          </button>
          {open && (
            <p className="mt-2 rounded-lg border border-primary/15 bg-primary/5 p-3 text-sm text-foreground/90">
              {card.answer}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex w-40 items-center gap-2">
              <ConfidenceBar value={card.strength} />
              <span className="text-xs tabular-nums text-muted-foreground">{card.strength}%</span>
            </div>
            <span className="text-xs text-muted-foreground">
              due {relativeDays(today, card.dueDate)}
            </span>
            {rm && <Pill token={rm.token}>{rm.label}</Pill>}
          </div>
        </div>
        <button
          onClick={() => deleteCard(card.id)}
          className="text-muted-foreground/60 transition-colors hover:text-destructive"
          title="Delete card"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}

function AddCardDialog({ topicId }: { topicId: string }) {
  const addCard = useStore((s) => s.addCard);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Plus className="size-4" /> Add card
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New recall card</DialogTitle>
          <DialogDescription>
            Phrase the front as a question you must answer from memory — that&apos;s what builds retention.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-2 block text-sm">Question</Label>
            <Textarea value={q} onChange={(e) => setQ(e.target.value)} rows={2} placeholder="e.g. State the relevant-cost rule." />
          </div>
          <div>
            <Label className="mb-2 block text-sm">Answer</Label>
            <Textarea value={a} onChange={(e) => setA(e.target.value)} rows={3} placeholder="The full answer / explanation." />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!q.trim() || !a.trim()}
            onClick={() => {
              addCard(topicId, q.trim(), a.trim());
              setQ("");
              setA("");
              setOpen(false);
            }}
          >
            Add card (due today)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
