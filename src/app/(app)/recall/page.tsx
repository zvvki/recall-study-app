"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motionSafeFlip } from "@/lib/utils";
import {
  Brain,
  Eye,
  Sparkles,
  ArrowRight,
  PartyPopper,
  Shuffle,
  RotateCcw,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { dueCards, interleave, cramCards } from "@/lib/selectors";
import { RATINGS, RATING_META } from "@/lib/srs";
import type { Rating } from "@/lib/types";
import { todayISO } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { tokenColor } from "@/components/charts";
import { Pill } from "@/components/bits";

export default function RecallPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted/50" />}>
      <RecallRouter />
    </Suspense>
  );
}

function RecallRouter() {
  const params = useSearchParams();
  const cram = params.get("cram");
  if (cram) return <CramSession examId={cram} key={cram} />;
  return <RecallInner key="due" />;
}

function CramSession({ examId }: { examId: string }) {
  const state = useStore();
  const reviewCard = useStore((s) => s.reviewCard);
  const exam = state.exams.find((e) => e.id === examId);

  const [queue, setQueue] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [mastered, setMastered] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const ids = cramCards(useStore.getState(), examId).map((c) => c.id);
    setQueue(ids);
    setTotal(ids.length);
    setLoaded(true);
  }, [examId]);

  const currentId = queue[0];
  const card = currentId ? state.cards.find((c) => c.id === currentId) : undefined;
  const topic = card ? state.topics.find((t) => t.id === card.topicId) : undefined;
  const subject = topic ? state.subjects.find((s) => s.id === topic.subjectId) : undefined;

  const rate = useCallback(
    (rating: Rating) => {
      if (!currentId) return;
      reviewCard(currentId, rating);
      setRevealed(false);
      if (rating === "easy" || rating === "medium") {
        setQueue((q) => q.slice(1)); // locked in — remove from the round
        setMastered((m) => m + 1);
      } else {
        setQueue((q) => (q.length > 1 ? [...q.slice(1), q[0]] : q)); // loop it back
      }
    },
    [currentId, reviewCard]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!card) return;
      if (!revealed && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && ["1", "2", "3", "4"].includes(e.key)) {
        rate(RATINGS[Number(e.key) - 1]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, revealed, rate]);

  if (!loaded) return <div className="h-64 animate-pulse rounded-2xl bg-muted/50" />;

  if (total === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="text-2xl font-semibold">No cards to cram yet</h1>
        <p className="mt-2 text-muted-foreground">Add cards to this exam&apos;s topics first.</p>
        <Button asChild className="mt-6"><Link href="/subjects">Go to subjects</Link></Button>
      </div>
    );
  }

  // deck cleared
  if (queue.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-success/15 ring-1 ring-success/25">
          <PartyPopper className="size-8 text-success" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold">Deck cleared. 🎉</h1>
        <p className="mt-2 text-muted-foreground">
          You locked in all <b>{total}</b> cards for {exam?.name ?? "this exam"}. That&apos;s the whole deck,
          from memory. Take a break — then run it again later to keep it sharp.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Button asChild><Link href="/dashboard">Back to dashboard <ArrowRight className="size-4" /></Link></Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw className="size-4" /> Run it again
          </Button>
        </div>
      </div>
    );
  }

  const progress = total ? (mastered / total) * 100 : 0;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Brain className="size-4 text-primary" />
          Cram · {exam?.name ?? "Exam"}
        </div>
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
          End cram
        </Link>
      </div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span><b className="text-foreground">{mastered}</b> of {total} locked in</span>
        <span>{queue.length} to go</span>
      </div>
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-success transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div key={card?.id} className="animate-in-up">
        <div className="rounded-3xl border bg-card/70 p-7 sm:p-9">
          {subject && (
            <Pill token={subject.color} className="mb-4">
              {subject.name.split(" — ")[0]} · {topic?.name}
            </Pill>
          )}
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recall from memory</div>
          <h2 className="mt-2 text-xl font-medium leading-snug sm:text-2xl">{card?.question}</h2>
          <div className="mt-6 overflow-hidden transition-all duration-300" style={motionSafeFlip(revealed)}>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
                <Sparkles className="size-3.5" /> Answer
              </div>
              <p className="text-[15px] leading-relaxed text-foreground/90">{card?.answer}</p>
            </div>
          </div>
        </div>

        {!revealed ? (
          <Button size="lg" className="mt-5 h-12 w-full text-base" onClick={() => setRevealed(true)}>
            <Eye className="size-4" /> Show answer
            <kbd className="ml-1 rounded bg-primary-foreground/15 px-1.5 text-[11px]">space</kbd>
          </Button>
        ) : (
          <div className="mt-5">
            <p className="mb-2 text-center text-xs text-muted-foreground">
              Got it? <span className="text-foreground">Medium/Easy</span> locks it in ·{" "}
              <span className="text-foreground">Hard/Forgot</span> brings it back this round.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {RATINGS.map((r) => {
                const m = RATING_META[r];
                const locks = r === "easy" || r === "medium";
                return (
                  <button
                    key={r}
                    onClick={() => rate(r)}
                    className="group flex flex-col items-center gap-0.5 rounded-xl border p-3 transition-all hover:-translate-y-0.5"
                    style={{ borderColor: `color-mix(in oklch, ${tokenColor(m.token)} 35%, transparent)` }}
                  >
                    <span className="font-medium" style={{ color: tokenColor(m.token) }}>{m.label}</span>
                    <span className="text-[11px] text-muted-foreground">{locks ? "locks in" : "loops back"}</span>
                    <kbd className="mt-1 rounded bg-muted px-1.5 text-[10px] text-muted-foreground">{m.key}</kbd>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RecallInner() {
  const params = useSearchParams();
  const topicId = params.get("topic");
  const state = useStore();
  const reviewCard = useStore((s) => s.reviewCard);

  // Snapshot the queue ONCE so reviewing doesn't reshuffle mid-session.
  const [queue, setQueue] = useState<string[] | null>(null);
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const s = useStore.getState();
    let ids: string[];
    if (topicId) {
      ids = interleave(
        s.cards.filter((c) => c.topicId === topicId),
        (c) => c.id
      ).map((c) => c.id);
    } else {
      ids = dueCards(s, todayISO()).map((c) => c.id);
    }
    setQueue(ids);
  }, [topicId]);

  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Rating[]>([]);

  const total = queue?.length ?? 0;
  const card = useMemo(
    () => (queue && idx < queue.length ? state.cards.find((c) => c.id === queue[idx]) : undefined),
    [queue, idx, state.cards]
  );
  const topic = card ? state.topics.find((t) => t.id === card.topicId) : undefined;
  const subject = topic ? state.subjects.find((s) => s.id === topic.subjectId) : undefined;

  const rate = useCallback(
    (rating: Rating) => {
      if (!card) return;
      reviewCard(card.id, rating);
      setResults((r) => [...r, rating]);
      setRevealed(false);
      setIdx((i) => i + 1);
    },
    [card, reviewCard]
  );

  // keyboard: space/enter reveal, 1-4 rate
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!card) return;
      if (!revealed && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && ["1", "2", "3", "4"].includes(e.key)) {
        rate(RATINGS[Number(e.key) - 1]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, revealed, rate]);

  if (!queue) return <div className="h-64 animate-pulse rounded-2xl bg-muted/50" />;

  // ---- empty / caught up ----
  if (total === 0) {
    return (
      <EmptyState />
    );
  }

  // ---- complete ----
  if (idx >= total) {
    return <Complete results={results} topicId={topicId} />;
  }

  const progress = (idx / total) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      {/* header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Brain className="size-4 text-primary" />
          {topicId ? "Topic drill" : "Due reviews"} · {idx + 1} of {total}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shuffle className="size-3.5" /> interleaved
        </div>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* card */}
      <div key={card?.id} className="animate-in-up">
        <div className="rounded-3xl border bg-card/70 p-7 sm:p-9">
          {subject && (
            <Pill token={subject.color} className="mb-4">
              {subject.name.split(" — ")[0]} · {topic?.name}
            </Pill>
          )}
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recall from memory
          </div>
          <h2 className="mt-2 text-xl font-medium leading-snug sm:text-2xl">{card?.question}</h2>

          <div
            className="mt-6 overflow-hidden transition-all duration-300"
            style={motionSafeFlip(revealed)}
          >
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-primary">
                <Sparkles className="size-3.5" /> Answer
              </div>
              <p className="text-[15px] leading-relaxed text-foreground/90">{card?.answer}</p>
            </div>
          </div>
        </div>

        {/* controls */}
        {!revealed ? (
          <Button
            size="lg"
            className="mt-5 h-12 w-full text-base"
            onClick={() => setRevealed(true)}
          >
            <Eye className="size-4" /> Show answer
            <kbd className="ml-1 rounded bg-primary-foreground/15 px-1.5 text-[11px]">space</kbd>
          </Button>
        ) : (
          <div className="mt-5">
            <p className="mb-2 text-center text-xs text-muted-foreground">
              How well did you recall it? This sets when you see it next.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {RATINGS.map((r) => {
                const m = RATING_META[r];
                return (
                  <button
                    key={r}
                    onClick={() => rate(r)}
                    className="group flex flex-col items-center gap-0.5 rounded-xl border p-3 transition-all hover:-translate-y-0.5"
                    style={{ borderColor: `color-mix(in oklch, ${tokenColor(m.token)} 35%, transparent)` }}
                  >
                    <span className="font-medium" style={{ color: tokenColor(m.token) }}>
                      {m.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{m.hint}</span>
                    <kbd className="mt-1 rounded bg-muted px-1.5 text-[10px] text-muted-foreground">{m.key}</kbd>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-success/15 ring-1 ring-success/25">
        <PartyPopper className="size-8 text-success" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold">Nothing due right now</h1>
      <p className="mt-2 text-muted-foreground">
        Your spaced schedule is clear. Reviewing items that aren&apos;t due yet has little benefit —
        that&apos;s the point. Bank a focus session or deepen a weak topic instead.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild>
          <Link href="/focus">Start a focus session <ArrowRight className="size-4" /></Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/subjects">Browse topics</Link>
        </Button>
      </div>
    </div>
  );
}

function Complete({ results, topicId }: { results: Rating[]; topicId: string | null }) {
  const counts = RATINGS.map((r) => ({ r, n: results.filter((x) => x === r).length }));
  const recalled = results.filter((r) => r === "medium" || r === "easy").length;
  const pct = results.length ? Math.round((recalled / results.length) * 100) : 0;
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/15 ring-1 ring-primary/25">
        <PartyPopper className="size-8 text-primary" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold">Session complete</h1>
      <p className="mt-2 text-muted-foreground">
        {results.length} card{results.length !== 1 ? "s" : ""} retrieved · {pct}% recalled cleanly.
        Each one is now rescheduled — the ones you found hard will come back sooner.
      </p>

      <div className="mx-auto mt-6 grid max-w-sm grid-cols-4 gap-2">
        {counts.map(({ r, n }) => {
          const m = RATING_META[r];
          return (
            <div key={r} className="rounded-xl border bg-card/60 p-3">
              <div className="text-lg font-semibold tabular-nums" style={{ color: tokenColor(m.token) }}>{n}</div>
              <div className="text-[11px] text-muted-foreground">{m.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-7 flex justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">Back to dashboard <ArrowRight className="size-4" /></Link>
        </Button>
        {topicId && (
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw className="size-4" /> Again
          </Button>
        )}
      </div>
    </div>
  );
}
