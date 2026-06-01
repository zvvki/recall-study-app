"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Play, Pause, X, Coffee, Check, ArrowRight, Brain, Target } from "lucide-react";
import { useStore } from "@/lib/store";
import { weakTopics } from "@/lib/selectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RingProgress, tokenColor } from "@/components/charts";
import { PageHeader } from "@/components/bits";
import { toast } from "sonner";

type Phase = "setup" | "work" | "reflect" | "break" | "done";
const PRESETS = [
  { label: "25 / 5", work: 25, brk: 5, note: "Classic Pomodoro" },
  { label: "50 / 10", work: 50, brk: 10, note: "Deep work" },
  { label: "Custom", work: 0, brk: 5, note: "Your call" },
];

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function FocusPage() {
  const state = useStore();
  const logFocusSession = useStore((s) => s.logFocusSession);

  const [phase, setPhase] = useState<Phase>("setup");
  const [presetIdx, setPresetIdx] = useState(0);
  const [customMin, setCustomMin] = useState(30);
  const [topicId, setTopicId] = useState<string>("");
  const [goal, setGoal] = useState("");

  const workMin = presetIdx === 2 ? customMin : PRESETS[presetIdx].work;
  const breakMin = PRESETS[presetIdx].brk;

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const totalRef = useRef(0);

  const [reflection, setReflection] = useState({ learned: "", confused: "", reviewNext: "" });

  const suggested = weakTopics(state)[0];

  // ticking
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // phase transitions on hitting zero
  useEffect(() => {
    if (secondsLeft !== 0 || !running) return;
    setRunning(false);
    if (phase === "work") {
      try {
        new Audio(
          "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
        ).play().catch(() => {});
      } catch {}
      setPhase("reflect");
      toast.success("Block complete — capture it while it's fresh.");
    } else if (phase === "break") {
      setPhase("done");
    }
  }, [secondsLeft, running, phase]);

  // live document title during a block
  useEffect(() => {
    if (phase === "work" || phase === "break") {
      document.title = `${fmt(secondsLeft)} · ${phase === "work" ? "Focus" : "Break"} — Recall`;
    } else {
      document.title = "Focus — Recall";
    }
    return () => {
      document.title = "Recall — study by retrieval, not rereading";
    };
  }, [secondsLeft, phase]);

  function startWork() {
    const secs = Math.max(1, workMin) * 60;
    totalRef.current = secs;
    setSecondsLeft(secs);
    setRunning(true);
    setPhase("work");
  }
  function startBreak() {
    const secs = Math.max(1, breakMin) * 60;
    totalRef.current = secs;
    setSecondsLeft(secs);
    setRunning(true);
    setPhase("break");
  }
  function endWorkEarly() {
    setRunning(false);
    setPhase("reflect");
  }
  function saveReflection() {
    const elapsedMin = phase === "reflect" ? Math.max(1, Math.round((totalRef.current - secondsLeft) / 60)) || workMin : workMin;
    logFocusSession({
      topicId: topicId || undefined,
      goal: goal || "Focused study",
      durationMin: elapsedMin,
      reflection,
    });
    toast.success("Session logged.");
    setPhase("done");
  }

  const topic = state.topics.find((t) => t.id === topicId);
  const accent = topic
    ? state.subjects.find((s) => s.id === topic.subjectId)?.color ?? "chart-3"
    : "chart-3";
  const progress = totalRef.current ? ((totalRef.current - secondsLeft) / totalRef.current) * 100 : 0;

  // ---------- SETUP ----------
  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader title="Focus session" subtitle="One goal, one block, no tabs. Set it up, then disappear into it." />

        <div className="space-y-6">
          <div>
            <Label className="mb-2 block text-sm">Session length</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => setPresetIdx(i)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    presetIdx === i ? "border-primary/50 bg-primary/10" : "hover:bg-accent/50"
                  }`}
                >
                  <div className="font-medium">{p.label}</div>
                  <div className="text-xs text-muted-foreground">{p.note}</div>
                </button>
              ))}
            </div>
            {presetIdx === 2 && (
              <div className="mt-4 rounded-xl border bg-card/60 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Work minutes</span>
                  <span className="font-medium tabular-nums">{customMin} min</span>
                </div>
                <Slider
                  value={[customMin]}
                  min={10}
                  max={90}
                  step={5}
                  onValueChange={(v) => setCustomMin(Array.isArray(v) ? v[0] : v)}
                />
              </div>
            )}
          </div>

          <div>
            <Label className="mb-2 block text-sm">What are you working on?</Label>
            <Select value={topicId} onValueChange={(v) => setTopicId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pick a topic (optional)" />
              </SelectTrigger>
              <SelectContent>
                {state.subjects.map((s) => (
                  <SelectGroupTopics key={s.id} subjectId={s.id} />
                ))}
              </SelectContent>
            </Select>
            {suggested && !topicId && (
              <button
                onClick={() => setTopicId(suggested.topic.id)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Target className="size-3.5" /> Suggested: {suggested.topic.name} (weakest at {suggested.confidence}%)
              </button>
            )}
          </div>

          <div>
            <Label htmlFor="goal" className="mb-2 block text-sm">
              Goal for this block
            </Label>
            <Input
              id="goal"
              placeholder="e.g. Work the ABC practical without looking at notes"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              A concrete goal up front beats &quot;study accounting&quot; — it gives your attention a target.
            </p>
          </div>

          <Button size="lg" className="h-12 w-full text-base" onClick={startWork}>
            <Play className="size-4" /> Start {workMin}-minute block
          </Button>
        </div>
      </div>
    );
  }

  // ---------- WORK / BREAK ----------
  if (phase === "work" || phase === "break") {
    const isBreak = phase === "break";
    return (
      <div className="mx-auto flex min-h-[70svh] max-w-md flex-col items-center justify-center text-center">
        <div className="mb-2 flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
          {isBreak ? <Coffee className="size-4" /> : <Brain className="size-4 text-primary" />}
          {isBreak ? "Break" : "Deep focus"}
        </div>
        <RingProgress value={progress} token={isBreak ? "chart-3" : accent} size={260} stroke={14}>
          <div>
            <div className="text-5xl font-semibold tabular-nums tracking-tight">{fmt(secondsLeft)}</div>
            {!isBreak && topic && (
              <div className="mt-1 max-w-[180px] text-xs text-muted-foreground">{topic.name}</div>
            )}
          </div>
        </RingProgress>

        {!isBreak && goal && (
          <p className="mt-6 max-w-sm text-pretty text-muted-foreground">
            <span className="text-foreground">Goal:</span> {goal}
          </p>
        )}

        <div className="mt-8 flex items-center gap-3">
          <Button variant="outline" size="lg" onClick={() => setRunning((r) => !r)}>
            {running ? <Pause className="size-4" /> : <Play className="size-4" />}
            {running ? "Pause" : "Resume"}
          </Button>
          {isBreak ? (
            <Button variant="ghost" size="lg" onClick={() => setPhase("done")}>
              <X className="size-4" /> Skip break
            </Button>
          ) : (
            <Button variant="ghost" size="lg" onClick={endWorkEarly}>
              <Check className="size-4" /> End & reflect
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ---------- REFLECT ----------
  if (phase === "reflect") {
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader
          title="Quick reflection"
          subtitle="30 seconds now turns this block into tomorrow's review. This is retrieval too."
        />
        <div className="space-y-5">
          <Field
            label="What did I learn or get done?"
            value={reflection.learned}
            onChange={(v) => setReflection((r) => ({ ...r, learned: v }))}
            placeholder="The one or two things that clicked…"
          />
          <Field
            label="What confused me?"
            value={reflection.confused}
            onChange={(v) => setReflection((r) => ({ ...r, confused: v }))}
            placeholder="Where you got stuck or unsure…"
          />
          <Field
            label="What should I review next?"
            value={reflection.reviewNext}
            onChange={(v) => setReflection((r) => ({ ...r, reviewNext: v }))}
            placeholder="The obvious next target…"
          />
          <div className="flex gap-3">
            <Button size="lg" className="flex-1" onClick={saveReflection}>
              <Check className="size-4" /> Save & log session
            </Button>
            <Button size="lg" variant="outline" onClick={startBreak}>
              <Coffee className="size-4" /> {breakMin}m break
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- DONE ----------
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-success/15 ring-1 ring-success/25">
        <Check className="size-8 text-success" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold">Block banked.</h1>
      <p className="mt-2 text-muted-foreground">
        Logged to your progress and your streak. Small wins compound — that&apos;s the whole game.
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">Back to dashboard <ArrowRight className="size-4" /></Link>
        </Button>
        <Button variant="outline" onClick={() => { setPhase("setup"); setGoal(""); setReflection({ learned: "", confused: "", reviewNext: "" }); }}>
          Another session
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="mb-2 block text-sm">{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} />
    </div>
  );
}

function SelectGroupTopics({ subjectId }: { subjectId: string }) {
  const state = useStore();
  const subject = state.subjects.find((s) => s.id === subjectId);
  const topics = state.topics.filter((t) => t.subjectId === subjectId);
  if (!subject) return null;
  return (
    <>
      <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {subject.name.split(" — ")[0]}
      </div>
      {topics.map((t) => (
        <SelectItem key={t.id} value={t.id}>
          {t.name}
        </SelectItem>
      ))}
    </>
  );
}
