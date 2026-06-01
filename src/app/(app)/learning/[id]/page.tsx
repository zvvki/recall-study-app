"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, HelpCircle, Check, X, Flame, PartyPopper, RotateCcw, Brain } from "lucide-react";
import { useStore } from "@/lib/store";
import { getLearnTopic, levelFromXp, XP_QUIZ, XP_FINISH, type LearnStep } from "@/lib/learning";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/confetti";
import { tokenColor } from "@/components/charts";

/** minimal **bold** renderer for lesson prose */
function Prose({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export default function LearningTopicPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const topic = getLearnTopic(id);

  const xp = useStore((s) => s.xp ?? 0);
  const addXp = useStore((s) => s.addXp);
  const completeTopic = useStore((s) => s.completeTopic);

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [earned, setEarned] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const awarded = useRef(false);

  const total = topic?.steps.length ?? 0;
  const finished = step >= total;

  // scroll to top each render so focus resets cleanly (spec rule 7)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  // award completion exactly once (spec step 6)
  useEffect(() => {
    if (finished && topic && !awarded.current) {
      awarded.current = true;
      completeTopic(topic.id);
      addXp(XP_FINISH);
      setEarned((e) => e + XP_FINISH);
      setConfetti(true);
    }
  }, [finished, topic, completeTopic, addXp]);

  if (!topic) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        No lesson here yet. <Link href="/learning" className="text-primary hover:underline">Back to topics</Link>
      </div>
    );
  }

  const lvl = levelFromXp(xp);
  const current: LearnStep | undefined = topic.steps[step];
  const progress = (step / total) * 100;

  function answer(i: number) {
    if (answered || !current || current.type !== "quiz") return;
    setSelected(i);
    setAnswered(true);
    if (i === current.answer) {
      addXp(XP_QUIZ);
      setEarned((e) => e + XP_QUIZ);
      setStreak((s) => s + 1);
    } else {
      setStreak(0); // silent, gentle reset — no penalty
    }
  }

  function next() {
    setSelected(null);
    setAnswered(false);
    setStep((s) => s + 1);
  }

  function redo() {
    awarded.current = false;
    setConfetti(false);
    setStreak(0);
    setEarned(0);
    setSelected(null);
    setAnswered(false);
    setStep(0);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Confetti fire={confetti} />

      {/* header: level + per-topic progress bar */}
      <div className="rounded-2xl border bg-card/60 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            Level <span className="text-primary">{lvl.level}</span> · {lvl.name}
          </span>
          <span className="flex items-center gap-3 text-muted-foreground">
            {streak >= 2 && (
              <span className="inline-flex items-center gap-1 font-medium text-warning">
                <Flame className="size-4" /> {streak} in a row
              </span>
            )}
            <span className="tabular-nums">+{earned} XP</span>
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${finished ? 100 : progress}%` }} />
        </div>
      </div>

      <Link href="/learning" className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to topics
      </Link>
      <div className="my-4 h-px w-full bg-border" />

      {finished ? (
        <div className="py-8 text-center animate-in-up">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/15 ring-1 ring-primary/25">
            <PartyPopper className="size-8 text-primary" />
          </span>
          <h1 className="mt-6 text-2xl font-semibold">Topic complete! 🎉</h1>
          <p className="mt-2 text-muted-foreground">
            You worked all the way through <b className="text-foreground">{topic.title}</b> and earned{" "}
            <b className="text-foreground">+{earned} XP</b>. That&apos;s a real win — be proud of it.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/learning"><ArrowLeft className="size-4" /> Back to topics</Link>
            </Button>
            <Button variant="outline" onClick={redo}>
              <RotateCcw className="size-4" /> Redo this topic
            </Button>
            <Button asChild variant="outline">
              <Link href={`/recall?topic=${topic.id}`}><Brain className="size-4" /> Drill the cards</Link>
            </Button>
          </div>
        </div>
      ) : current?.type === "teach" ? (
        <div key={step} className="animate-in-up">
          <div className="rounded-2xl border bg-card/60 p-6 sm:p-8">
            <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <BookOpen className="size-4" /> Learn
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{current.title}</h1>
            <p className="mt-4 text-[15px] leading-relaxed sm:text-base">
              <Prose text={current.body} />
            </p>
            {current.analogy && (
              <div className="mt-5 rounded-lg border-l-4 border-warning bg-warning/10 p-4">
                <p className="text-[15px] leading-relaxed text-foreground/90">
                  <span className="font-semibold text-warning">Think of it this way: </span>
                  <Prose text={current.analogy} />
                </p>
              </div>
            )}
          </div>
          <Button size="lg" className="mt-5 h-12 w-full text-base" onClick={next}>
            Got it, continue <ArrowRight className="size-4" />
          </Button>
        </div>
      ) : current?.type === "quiz" ? (
        <div key={step} className="animate-in-up">
          <div className="rounded-2xl border bg-card/60 p-6 sm:p-8">
            <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-chart-2">
              <HelpCircle className="size-4" /> Quick check
            </div>
            <h1 className="text-xl font-semibold leading-snug sm:text-2xl">{current.question}</h1>
            <div className="mt-5 space-y-2.5">
              {current.options.map((opt, i) => {
                const isCorrect = i === current.answer;
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
              <div className={`mt-4 rounded-xl border p-4 text-sm leading-relaxed ${selected === current.answer ? "border-success/40 bg-success/5" : "border-warning/40 bg-warning/5"}`}>
                <span className="font-semibold">
                  {selected === current.answer ? "Nice — +5 XP. " : "All good — here's the idea: "}
                </span>
                {selected === current.answer ? current.correctMsg : current.wrongMsg}
              </div>
            )}
          </div>
          {answered && (
            <Button size="lg" className="mt-5 h-12 w-full text-base animate-in-up" onClick={next}>
              Continue <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
