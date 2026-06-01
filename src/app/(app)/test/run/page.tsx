"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, ArrowLeft, ArrowRight, Check, X, RotateCcw, ChevronDown, FileText } from "lucide-react";
import { useStore } from "@/lib/store";
import { buildMockTest, type MockTest } from "@/lib/testgen";
import { Button } from "@/components/ui/button";
import { Confetti } from "@/components/confetti";
import { tokenColor } from "@/components/charts";
import { cn } from "@/lib/utils";

export default function TestRunPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted/50" />}>
      <TestRunner />
    </Suspense>
  );
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function TestRunner() {
  const params = useSearchParams();
  const timed = params.get("timed") !== "0";
  const addXp = useStore((s) => s.addXp);

  const [test, setTest] = useState<MockTest | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [idx, setIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(70 * 60);
  const [revealed, setRevealed] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const scoredRef = useRef(false);

  // (re)generate the test
  useEffect(() => {
    const t = buildMockTest();
    setTest(t);
    setAnswers(new Array(t.mcqs.length).fill(null));
    setIdx(0);
    setSubmitted(false);
    setTimeLeft(70 * 60);
    setRevealed(false);
    setConfetti(false);
    scoredRef.current = false;
  }, [attempt]);

  // timer
  useEffect(() => {
    if (!timed || submitted || !test) return;
    if (timeLeft <= 0) {
      doSubmit();
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timed, submitted, timeLeft, test]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [idx, submitted]);

  if (!test) return <div className="h-64 animate-pulse rounded-2xl bg-muted/50" />;

  const mcqs = test.mcqs;
  const score = answers.reduce<number>((a, ans, i) => a + (ans === mcqs[i].answer ? 1 : 0), 0);

  function choose(optIdx: number) {
    if (submitted) return;
    setAnswers((a) => a.map((v, i) => (i === idx ? optIdx : v)));
  }
  function doSubmit() {
    if (scoredRef.current) return;
    scoredRef.current = true;
    const s = answers.reduce<number>((a, ans, i) => a + (ans === mcqs[i].answer ? 1 : 0), 0);
    addXp(s * 2); // small reward for the reps
    setSubmitted(true);
    if (s >= Math.ceil(mcqs.length * 0.75)) setConfetti(true);
  }

  const answeredCount = answers.filter((a) => a !== null).length;

  // ---------- RESULTS ----------
  if (submitted) {
    const pct = Math.round((score / mcqs.length) * 100);
    const msg =
      pct >= 85 ? "Exam-ready. Seriously — that's a strong result."
      : pct >= 60 ? "Solid. Read the worked answers below and you'll push this higher."
      : "Every worked answer below is a mark you can grab. This is exactly how you improve — keep going.";
    return (
      <div className="mx-auto max-w-2xl">
        <Confetti fire={confetti} />
        <div className="rounded-2xl border bg-card/60 p-6 text-center">
          <div className="text-sm uppercase tracking-wide text-muted-foreground">Mock test · Part A</div>
          <div className="mt-2 text-5xl font-bold tabular-nums" style={{ color: tokenColor(pct >= 60 ? "chart-3" : "chart-4") }}>
            {score}<span className="text-2xl text-muted-foreground">/{mcqs.length}</span>
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{msg}</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => setAttempt((a) => a + 1)}><RotateCcw className="size-4" /> New test (fresh questions)</Button>
            <Button asChild variant="outline"><Link href="/test">Back to test menu</Link></Button>
          </div>
        </div>

        <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Worked review</h2>
        <div className="space-y-3">
          {mcqs.map((q, i) => {
            const yours = answers[i];
            const right = yours === q.answer;
            return (
              <div key={i} className="rounded-2xl border bg-card/60 p-4">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full"
                    style={{ background: `color-mix(in oklch, ${tokenColor(right ? "chart-3" : "chart-5")} 20%, transparent)`, color: tokenColor(right ? "chart-3" : "chart-5") }}
                  >
                    {right ? <Check className="size-4" /> : <X className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Q{i + 1} · {q.topic}</div>
                    <div className="mt-0.5 font-medium">{q.question}</div>
                    <div className="mt-2 text-sm">
                      <span className="text-success">✓ {q.options[q.answer]}</span>
                      {!right && (
                        <span className="ml-3 text-muted-foreground">
                          You: {yours === null ? "—" : q.options[yours]}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{q.explain}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <PracticalCard test={test} revealed={revealed} setRevealed={setRevealed} />
      </div>
    );
  }

  // ---------- TAKING THE TEST ----------
  const q = mcqs[idx];
  return (
    <div className="mx-auto max-w-2xl">
      {/* header */}
      <div className="flex items-center justify-between rounded-2xl border bg-card/60 px-4 py-3">
        <span className="text-sm font-medium">Mock test · Part A</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{answeredCount}/{mcqs.length} answered</span>
          {timed && (
            <span className={cn("inline-flex items-center gap-1.5 font-medium tabular-nums", timeLeft < 300 ? "text-destructive" : "")}>
              <Clock className="size-4" /> {fmtTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      {/* question palette */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {mcqs.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={cn(
              "size-7 rounded-md text-xs font-medium transition-colors",
              i === idx ? "ring-2 ring-primary" : "",
              answers[i] !== null ? "bg-primary/25 text-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div key={idx} className="animate-in-up mt-4">
        <div className="rounded-2xl border bg-card/60 p-6 sm:p-8">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Question {idx + 1} of {mcqs.length} · {q.topic}
          </div>
          <h1 className="text-lg font-semibold leading-snug sm:text-xl">{q.question}</h1>
          <div className="mt-5 space-y-2.5">
            {q.options.map((opt, i) => {
              const picked = answers[idx] === i;
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-4 text-left text-[15px] transition-all hover:-translate-y-0.5",
                    picked ? "border-primary/60 bg-primary/10" : "border-border bg-background/40 hover:bg-card"
                  )}
                >
                  <span className={cn("grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold", picked && "border-primary text-primary")}>
                    {"ABCD"[i]}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button variant="outline" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          {idx < mcqs.length - 1 ? (
            <Button className="flex-1" onClick={() => setIdx((i) => i + 1)}>
              Next <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button className="flex-1" onClick={doSubmit}>
              Submit test <Check className="size-4" />
            </Button>
          )}
        </div>
        <button onClick={doSubmit} className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground">
          Finish &amp; submit now ({answeredCount}/{mcqs.length} answered)
        </button>
      </div>
    </div>
  );
}

function PracticalCard({ test, revealed, setRevealed }: { test: MockTest; revealed: boolean; setRevealed: (b: boolean) => void }) {
  const p = test.practical;
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Part B · Practical</h2>
      <div className="rounded-2xl border bg-card/60 p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <FileText className="size-4" /> {p.title}
        </div>
        <p className="mt-3 text-sm leading-relaxed">{p.scenario}</p>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1.5 pr-2 font-medium"></th>
              <th className="py-1.5 px-2 font-medium">{p.productA}</th>
              <th className="py-1.5 px-2 font-medium">{p.productB}</th>
            </tr>
          </thead>
          <tbody>
            {p.givens.map((g, i) => (
              <tr key={i} className="border-t border-border/60">
                <td className="py-1.5 pr-2 text-muted-foreground">{g.label}</td>
                <td className="py-1.5 px-2 tabular-nums">{g.a}</td>
                <td className="py-1.5 px-2 tabular-nums">{g.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <div className="mb-1 font-medium">Required (work it on paper first):</div>
          <ul className="list-disc space-y-1 pl-5 text-foreground/90">
            {p.required.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>

        <button
          onClick={() => setRevealed(!revealed)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors hover:bg-accent/50"
        >
          <ChevronDown className={cn("size-4 transition-transform", revealed && "rotate-180")} />
          {revealed ? "Hide model solution" : "Reveal model solution"}
        </button>
        {revealed && (
          <div className="mt-4 space-y-4">
            {p.solution.map((sec, i) => (
              <div key={i}>
                <div className="mb-1 text-sm font-semibold text-primary">{sec.heading}</div>
                <div className="space-y-1 rounded-lg bg-background/40 p-3 font-mono text-[12.5px] leading-relaxed text-foreground/90">
                  {sec.lines.map((l, j) => <div key={j}>{l}</div>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
