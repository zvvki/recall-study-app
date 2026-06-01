import Link from "next/link";
import {
  Brain,
  RefreshCw,
  Shuffle,
  Timer,
  Flame,
  CalendarRange,
  ArrowRight,
  GraduationCap,
  Target,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PRINCIPLES = [
  {
    icon: Brain,
    title: "Active recall",
    claim: "Retrieving beats rereading",
    body: "You answer from memory before seeing the solution. The effort of retrieval is what actually builds durable memory — not highlighting.",
    token: "chart-1",
  },
  {
    icon: RefreshCw,
    title: "Spaced repetition",
    claim: "Reviewed right before you forget",
    body: "Every card is scheduled by how well you knew it. Forgot → tomorrow. Easy → a week+. You spend time only where it pays off.",
    token: "chart-2",
  },
  {
    icon: Shuffle,
    title: "Interleaving",
    claim: "Mixed topics, sharper recall",
    body: "Reviews mix subjects and topics instead of blocking. It feels harder — and that desirable difficulty is exactly why it sticks.",
    token: "chart-3",
  },
  {
    icon: Timer,
    title: "Focus sessions",
    claim: "Protected, single-tasked time",
    body: "Pomodoro-style blocks with a goal up front and a reflection after, so each session ends knowing what to review next.",
    token: "chart-4",
  },
  {
    icon: CalendarRange,
    title: "Anti-cramming planner",
    claim: "Topics spread across days",
    body: "Add an exam date and your weak topics are spaced into daily blocks — front-loaded learning, reviews landing near the test.",
    token: "chart-2",
  },
  {
    icon: Flame,
    title: "Guilt-free streaks",
    claim: "Consistency without shame",
    body: "We show your rhythm, not a punishment. Miss a day and one card brings it right back — momentum, not perfectionism.",
    token: "chart-5",
  },
];

export default function Landing() {
  return (
    <div className="relative">
      {/* nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
            <GraduationCap className="size-5 text-primary" />
          </span>
          <span className="text-[17px] tracking-tight">
            Recall<span className="text-primary">.</span>
          </span>
        </Link>
        <Button asChild variant="ghost">
          <Link href="/dashboard">
            Open app <ArrowRight className="size-4" />
          </Link>
        </Button>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 sm:pt-20">
        <div className="animate-in-up mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3.5 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Built on cognitive science, not vibes
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Stop rereading.{" "}
            <span className="text-primary">Start remembering.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
            Recall turns studying into a clear daily system. Open it and it tells you exactly
            what to revise, what you&apos;re weak at, and the single next thing that moves your
            grade — using active recall, spaced repetition and focused practice.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-7 text-base">
              <Link href="/dashboard">
                Open my dashboard <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
              <Link href="/recall">Try a recall session</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Loaded with your ACCG2000 deck. No sign-up — your progress saves on this device.
          </p>
        </div>

        {/* floating preview strip */}
        <div className="animate-in-up mt-16 grid gap-4 sm:grid-cols-3" style={{ animationDelay: ".15s" }}>
          {[
            { k: "Today", v: "Retrieve 8 cards", icon: Target, token: "chart-1" },
            { k: "Weakest", v: "Relevant costs · 31%", icon: Brain, token: "chart-5" },
            { k: "Next exam", v: "ACCG2000 · in 2 days", icon: CalendarRange, token: "chart-2" },
          ].map((c) => (
            <div key={c.k} className="rounded-2xl border bg-card/70 glass p-5 text-left">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <c.icon className="size-4" style={{ color: `var(--${c.token})` }} />
                {c.k}
              </div>
              <div className="mt-2 text-lg font-medium">{c.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* principles */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">Every feature earns its place</h2>
          <p className="mt-3 text-muted-foreground">
            Nothing here is decoration. Each part maps to a specific finding about how memory,
            attention and motivation actually work.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div
              key={p.title}
              className="group rounded-2xl border bg-card/60 p-6 transition-colors hover:bg-card"
            >
              <span
                className="grid size-11 place-items-center rounded-xl ring-1"
                style={{
                  background: `color-mix(in oklch, var(--${p.token}) 16%, transparent)`,
                  color: `var(--${p.token})`,
                  borderColor: `color-mix(in oklch, var(--${p.token}) 30%, transparent)`,
                }}
              >
                <p.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-medium">{p.title}</h3>
              <p className="text-sm font-medium" style={{ color: `var(--${p.token})` }}>
                {p.claim}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border bg-card/50 p-8 sm:p-12">
          <h2 className="text-3xl font-semibold tracking-tight">A loop that compounds</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              { n: "01", t: "Recall today's due cards", d: "The dashboard surfaces only what's scheduled. Answer from memory, rate your recall, done in minutes." },
              { n: "02", t: "Focus on your weakest gap", d: "Confidence scores rank your topics. A 25-minute session targets the one that matters most before your nearest exam." },
              { n: "03", t: "Let the schedule do the rest", d: "Your ratings reschedule each card automatically and feed an exam plan that spaces everything to beat cramming." },
            ].map((s) => (
              <div key={s.n}>
                <div className="text-sm font-mono text-primary">{s.n}</div>
                <h3 className="mt-2 text-lg font-medium">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button asChild size="lg" className="h-12 px-7 text-base">
              <Link href="/dashboard">
                Start now <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
        Recall — a study system for retention, focus and consistency.
      </footer>
    </div>
  );
}
