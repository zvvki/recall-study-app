"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  PartyPopper,
  Lightbulb,
  HelpCircle,
  Sparkles,
  Brain,
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  LESSONS,
  lessonMaxXp,
  levelFromXp,
  XP_LEARN,
  XP_MCQ,
  type LearnBlock,
  type LessonScreen,
} from "@/lib/lessons";
import { Button } from "@/components/ui/button";
import { tokenColor } from "@/components/charts";

/** Render [[key term]] chips and **bold** inside lesson text. */
function RichText({ text }: { text: string }) {
  const tokens = text.split(/(\[\[[^\]]+\]\]|\*\*[^*]+\*\*)/g);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.startsWith("[[") && tok.endsWith("]]")) {
          return (
            <span key={i} className="rounded-md bg-primary/20 px-1.5 py-0.5 font-medium text-primary">
              {tok.slice(2, -2)}
            </span>
          );
        }
        if (tok.startsWith("**") && tok.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {tok.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{tok}</span>;
      })}
    </>
  );
}

function LearnBlockView({ block }: { block: LearnBlock }) {
  switch (block.t) {
    case "p":
      return (
        <p className="text-[15px] leading-relaxed sm:text-base">
          <RichText text={block.text} />
        </p>
      );
    case "analogy":
      return (
        <div className="rounded-lg border-l-4 border-warning bg-warning/10 p-4">
          <p className="text-[15px] leading-relaxed text-foreground/90">
            <span className="font-semibold text-warning">Think of it this way: </span>
            <RichText text={block.text} />
          </p>
        </div>
      );
    case "points":
      return (
        <ul className="space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed sm:text-base">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
              <span>
                <RichText text={it} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "rule":
      return (
        <div className="rounded-xl border border-chart-2/25 bg-chart-2/5 p-4">
          {block.label && (
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-chart-2">
              <Sparkles className="size-3.5" /> {block.label}
            </div>
          )}
          <pre className="whitespace-pre-wrap font-mono text-[13.5px] leading-relaxed text-foreground/90">
            {block.text}
          </pre>
        </div>
      );
  }
}

export default function LearnPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const state = useStore();
  const addXp = useStore((s) => s.addXp);

  const topic = state.topics.find((t) => t.id === id);
  const screens: LessonScreen[] = LESSONS[id] ?? [];

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [lessonXp, setLessonXp] = useState(0);

  const xp = state.xp ?? 0;
  const lvl = levelFromXp(xp);
  const maxXp = lessonMaxXp(screens);

  if (!topic || screens.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        No lesson for this topic yet.{" "}
        <Link href="/subjects" className="text-primary hover:underline">Back to subjects</Link>
      </div>
    );
  }

  const done = idx >= screens.length;
  const screen = screens[idx];

  function answer(i: number) {
    if (answered || screen.kind !== "mcq") return;
    setSelected(i);
    setAnswered(true);
    if (i === screen.answer) {
      addXp(XP_MCQ);
      setLessonXp((x) => x + XP_MCQ);
    }
  }

  function next() {
    if (screen.kind === "learn") {
      addXp(XP_LEARN);
      setLessonXp((x) => x + XP_LEARN);
    }
    setSelected(null);
    setAnswered(false);
    setIdx((i) => i + 1);
  }

  // progress bar shows XP earned so far this lesson (matches the reference)
  const barPct = maxXp ? (lessonXp / maxXp) * 100 : 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* gamified header */}
      <div className="rounded-2xl border bg-card/60 p-5">
        <div className="flex items-center justify-between">
          <div className="font-semibold">
            Level <span className="text-primary">{lvl.level}</span> -{" "}
            <span className="text-primary">{lvl.name}</span>
          </div>
          <div className="text-sm text-muted-foreground tabular-nums">
            {lessonXp} / {maxXp} XP
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${barPct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">— Answer questions to earn XP and build your streak.</p>
      </div>

      <Link href="/subjects" className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to topics
      </Link>
      <div className="my-5 h-px w-full bg-border" />

      {done ? (
        <Complete topicId={id} topicName={topic.name} earned={lessonXp} />
      ) : screen.kind === "learn" ? (
        <div key={idx} className="animate-in-up">
          <div className="rounded-2xl border bg-card/60 p-6 sm:p-8">
            <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <BookOpen className="size-4" /> Learn
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{screen.title}</h1>
            <div className="mt-5 space-y-4">
              {screen.blocks.map((b, i) => (
                <LearnBlockView key={i} block={b} />
              ))}
            </div>
          </div>
          <Button size="lg" className="mt-5 h-12 w-full text-base" onClick={next}>
            Got it, continue <ArrowRight className="size-4" />
          </Button>
        </div>
      ) : (
        <div key={idx} className="animate-in-up">
          <div className="rounded-2xl border bg-card/60 p-6 sm:p-8">
            <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-chart-2">
              <HelpCircle className="size-4" /> Quick check
            </div>
            <h1 className="text-xl font-semibold leading-snug sm:text-2xl">{screen.q}</h1>
            <div className="mt-5 space-y-2.5">
              {screen.options.map((opt, i) => {
                const isCorrect = i === screen.answer;
                const isPicked = i === selected;
                let cls = "border-border bg-background/40 hover:bg-card";
                if (answered && isCorrect) cls = "border-success/60 bg-success/10";
                else if (answered && isPicked) cls = "border-destructive/60 bg-destructive/10";
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
              <div
                className={`mt-4 rounded-xl border p-4 text-sm ${selected === screen.answer ? "border-success/40 bg-success/5" : "border-warning/40 bg-warning/5"}`}
              >
                <span className="font-semibold">
                  {selected === screen.answer ? "Correct! +10 XP " : "Not quite. "}
                </span>
                {screen.explain}
              </div>
            )}
          </div>
          <Button size="lg" className="mt-5 h-12 w-full text-base" onClick={next} disabled={!answered}>
            Continue <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function Complete({ topicId, topicName, earned }: { topicId: string; topicName: string; earned: number }) {
  return (
    <div className="py-10 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/15 ring-1 ring-primary/25">
        <PartyPopper className="size-8 text-primary" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold">Lesson complete!</h1>
      <p className="mt-2 text-muted-foreground">
        You earned <b className="text-foreground">+{earned} XP</b> on {topicName}. The concept&apos;s in —
        now lock it into memory by drilling the cards.
      </p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href={`/recall?topic=${topicId}`}>
            <Brain className="size-4" /> Drill the cards
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/topics/${topicId}`}>Back to topic</Link>
        </Button>
      </div>
    </div>
  );
}
