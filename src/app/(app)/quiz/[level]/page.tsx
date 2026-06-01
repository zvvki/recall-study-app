"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X, HelpCircle, PartyPopper, RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import { quizzesByDifficulty, difficultyMeta, type Difficulty, type QuizQ } from "@/lib/quizzes";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/confetti";
import { tokenColor } from "@/components/charts";

const VALID: Difficulty[] = ["easy", "medium", "hard", "exam"];
const XP_PER_CORRECT = 5;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizRunner() {
  const params = useParams<{ level: string }>();
  const level = params.level as Difficulty;
  const valid = VALID.includes(level);
  const meta = valid ? difficultyMeta(level) : null;

  const addXp = useStore((s) => s.addXp);
  const topics = useStore((s) => s.topics);
  const topicName = (id: string) => topics.find((t) => t.id === id)?.name ?? id;

  // snapshot a shuffled set once per run
  const [queue, setQueue] = useState<QuizQ[]>([]);
  const [round, setRound] = useState(0);
  useEffect(() => {
    if (valid) setQueue(shuffle(quizzesByDifficulty(level)));
  }, [level, valid, round]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [idx]);

  const total = queue.length;
  const finished = total > 0 && idx >= total;

  useEffect(() => {
    if (finished && correct === total && total > 0) setConfetti(true);
  }, [finished, correct, total]);

  if (!valid) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Unknown quiz. <Link href="/quiz" className="text-primary hover:underline">Back to quizzes</Link>
      </div>
    );
  }
  if (!total) return <div className="h-64 animate-pulse rounded-2xl bg-muted/50" />;

  const q = queue[idx];

  function answer(i: number) {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.answer) {
      addXp(XP_PER_CORRECT);
      setCorrect((c) => c + 1);
    } else {
      setMissed((m) => (m.includes(q.topicId) ? m : [...m, q.topicId]));
    }
  }
  function next() {
    setSelected(null);
    setAnswered(false);
    setIdx((i) => i + 1);
  }
  function again() {
    setConfetti(false);
    setIdx(0);
    setSelected(null);
    setAnswered(false);
    setCorrect(0);
    setMissed([]);
    setRound((r) => r + 1);
  }

  if (finished) {
    const pct = Math.round((correct / total) * 100);
    const msg =
      pct === 100 ? "Perfect run — you've got this cold. 🎯"
      : pct >= 70 ? "Strong. A couple to tidy up and you're golden."
      : pct >= 40 ? "Good reps — the misses below are where the easy marks are."
      : "Every one of these is a mark you can grab before Wednesday. Keep going.";
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <Confetti fire={confetti} />
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/15 ring-1 ring-primary/25">
          <PartyPopper className="size-8 text-primary" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold">Round done!</h1>
        <p className="mt-2 text-muted-foreground">
          You got <b className="text-foreground">{correct} of {total}</b> on the {meta?.label} tier. {msg}
        </p>
        {missed.length > 0 && (
          <div className="mt-5 rounded-2xl border bg-card/60 p-4 text-left">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Worth a look</div>
            <div className="flex flex-wrap gap-2">
              {missed.map((tid) => (
                <Link key={tid} href={`/learning/${tid}`} className="rounded-full bg-muted px-3 py-1 text-sm hover:bg-accent">
                  {topicName(tid)} →
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={again}><RotateCcw className="size-4" /> Try again</Button>
          <Button asChild variant="outline"><Link href="/quiz">Other difficulties</Link></Button>
        </div>
      </div>
    );
  }

  const progress = (idx / total) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-lg">{meta?.icon}</span>
          {meta?.label} quiz
        </div>
        <Link href="/quiz" className="text-xs text-muted-foreground hover:text-foreground">Exit</Link>
      </div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {idx + 1} of {total}</span>
        <span className="tabular-nums">{correct} right so far</span>
      </div>
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: tokenColor(meta!.token) }} />
      </div>

      <div key={q.id} className="animate-in-up">
        <div className="rounded-2xl border bg-card/60 p-6 sm:p-8">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: tokenColor(meta!.token) }}>
            <HelpCircle className="size-4" /> {topicName(q.topicId)}
          </div>
          <h1 className="text-xl font-semibold leading-snug sm:text-[1.4rem]">{q.question}</h1>
          <div className="mt-5 space-y-2.5">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.answer;
              const isPicked = i === selected;
              let cls = "border-border bg-background/40 hover:bg-card";
              if (answered && isCorrect) cls = "border-success/60 bg-success/10";
              else if (answered && isPicked) cls = "border-destructive/60 bg-destructive/10";
              else if (answered) cls = "border-border bg-background/40 opacity-70";
              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  disabled={answered}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-[15px] transition-all ${cls} ${!answered ? "hover:-translate-y-0.5" : ""}`}
                >
                  <span
                    className="grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold"
                    style={
                      answered && isCorrect
                        ? { borderColor: tokenColor("chart-3"), color: tokenColor("chart-3") }
                        : answered && isPicked
                          ? { borderColor: tokenColor("chart-5"), color: tokenColor("chart-5") }
                          : undefined
                    }
                  >
                    {answered && isCorrect ? <Check className="size-4" /> : answered && isPicked ? <X className="size-4" /> : "ABCD"[i]}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          {answered && (
            <div className={`mt-4 rounded-xl border p-4 text-sm leading-relaxed ${selected === q.answer ? "border-success/40 bg-success/5" : "border-warning/40 bg-warning/5"}`}>
              <span className="font-semibold">{selected === q.answer ? "Nice — +5 XP. " : "All good — here's why: "}</span>
              {q.explain}
            </div>
          )}
        </div>
        {answered && (
          <Button size="lg" className="mt-5 h-12 w-full text-base animate-in-up" onClick={next}>
            {idx === total - 1 ? "See results" : "Next question"} <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
