"use client";

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Flame,
  Timer,
  CalendarRange,
  Target,
  CheckCircle2,
  Circle,
  TrendingUp,
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  nextAction,
  todayPlan,
  weakTopics,
  dueCards,
  streakInfo,
  analytics,
  nextExam,
  relativeExam,
  buildExamPlan,
} from "@/lib/selectors";
import { todayISO, formatLong, relativeDays, daysBetween } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionHeading, StatTile, Pill } from "@/components/bits";
import { RingProgress, ConfidenceBar, confToken, confLabel, tokenColor } from "@/components/charts";

export default function DashboardPage() {
  const state = useStore();
  const today = todayISO();

  const na = nextAction(state, today);
  const plan = todayPlan(state, today);
  const weak = weakTopics(state, today).slice(0, 4);
  const due = dueCards(state, today);
  const streak = streakInfo(state, today);
  const stats = analytics(state, today);
  const exam = nextExam(state, today);
  const daysUntilExam = exam ? daysBetween(today, exam.date) : 999;
  const overall = Math.round(
    state.subjects.reduce((a, s) => {
      const ts = state.topics.filter((t) => t.subjectId === s.id);
      const c = ts.length
        ? ts.reduce((x, t) => {
            const cards = state.cards.filter((cc) => cc.topicId === t.id);
            return x + (cards.length ? cards.reduce((y, cc) => y + cc.strength, 0) / cards.length : 0);
          }, 0) / ts.length
        : 0;
      return a + c;
    }, 0) / Math.max(1, state.subjects.length)
  );

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <PageHeader title={`${greet}.`} subtitle={formatLong(today)} />

      {/* Cram banner — appears when an exam is close; one unmissable action */}
      {exam && daysUntilExam <= 7 && (
        <Link
          href={`/recall?cram=${exam.id}`}
          className="animate-in-up mb-5 flex items-center justify-between gap-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 transition-colors hover:bg-warning/15"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-warning/20 ring-1 ring-warning/30">
              <Flame className="size-5 text-warning" />
            </span>
            <div>
              <div className="font-medium">
                Cram mode for {exam.name} — {relativeExam(exam, today)}
              </div>
              <div className="text-sm text-muted-foreground">
                Drill every card for this exam. Hard ones loop back until you&apos;ve locked them all in.
              </div>
            </div>
          </div>
          <span className="hidden shrink-0 items-center gap-1 rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-background sm:inline-flex">
            Start cramming <ArrowRight className="size-4" />
          </span>
        </Link>
      )}

      {/* Next best action — the one thing, to kill decision fatigue */}
      <div className="animate-in-up relative overflow-hidden rounded-3xl border bg-card/70 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full blur-3xl"
          style={{ background: `color-mix(in oklch, ${tokenColor(na.accent)} 22%, transparent)` }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Target className="size-3.5" /> Your next best action
            </span>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{na.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{na.description}</p>
          </div>
          <Button asChild size="lg" className="h-12 shrink-0 px-6 text-base">
            <Link href={na.href}>
              {na.cta} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat row */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Due today" value={due.length} sub="cards to retrieve" token="chart-1" icon={Brain} />
        <StatTile label="Streak" value={`${streak.current}d`} sub={`${streak.weekly}/7 days this week`} token="chart-4" icon={Flame} />
        <StatTile label="Retention" value={stats.reviewsTotal ? `${stats.retention}%` : "—"} sub={stats.reviewsTotal ? "recall, last 14 days" : "no reviews yet"} token="chart-3" icon={TrendingUp} />
        <StatTile label="Focus" value={`${stats.focusMinutes}m`} sub={`${stats.focusSessions} sessions`} token="chart-2" icon={Timer} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Today's plan */}
        <div className="lg:col-span-2">
          <SectionHeading
            title="Today's plan"
            hint="A short, ordered list — do them top to bottom"
          />
          <div className="space-y-2.5 stagger">
            {plan.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group flex items-center gap-4 rounded-2xl border bg-card/60 p-4 transition-colors hover:bg-card"
              >
                {item.done ? (
                  <CheckCircle2 className="size-6 shrink-0 text-success" />
                ) : (
                  <Circle className="size-6 shrink-0" style={{ color: tokenColor(item.accent) }} />
                )}
                <div className="min-w-0 flex-1">
                  <div className={item.done ? "font-medium text-muted-foreground line-through" : "font-medium"}>
                    {item.title}
                  </div>
                  <div className="text-sm text-muted-foreground">{item.subtitle}</div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>

          {/* Upcoming exam mini-plan */}
          {exam && (
            <div className="mt-8">
              <SectionHeading title="Next up" action={<Link href="/planner" className="text-xs text-primary hover:underline">Full planner →</Link>} />
              <div className="rounded-2xl border bg-card/60 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/25">
                      <CalendarRange className="size-5 text-primary" />
                    </span>
                    <div>
                      <div className="font-medium">{exam.name}</div>
                      <div className="text-sm text-muted-foreground">{formatLong(exam.date)}</div>
                    </div>
                  </div>
                  <Pill token="chart-4">
                    <Flame className="size-3.5" /> {relativeExam(exam, today)}
                  </Pill>
                </div>
                <ExamTodayBlocks examId={exam.id} />
              </div>
            </div>
          )}
        </div>

        {/* Right column: weak topics + progress */}
        <div className="space-y-6">
          <div>
            <SectionHeading title="Weak topics" hint="Lowest confidence first" />
            <div className="space-y-2.5">
              {weak.map((w) => (
                <Link
                  key={w.topic.id}
                  href={`/topics/${w.topic.id}`}
                  className="block rounded-2xl border bg-card/60 p-4 transition-colors hover:bg-card"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{w.topic.name}</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums" style={{ color: tokenColor(confToken(w.confidence)) }}>
                      {w.confidence}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <ConfidenceBar value={w.confidence} />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{w.started ? confLabel(w.confidence) : "Not started"}</span>
                    {w.dueCount > 0 && <Pill token="chart-1">{w.dueCount} due</Pill>}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading title="Overall mastery" />
            <div className="flex items-center gap-5 rounded-2xl border bg-card/60 p-5">
              <RingProgress value={overall} token={confToken(overall)} size={108}>
                <div className="text-center">
                  <div className="text-2xl font-semibold tabular-nums">{overall}%</div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">mastery</div>
                </div>
              </RingProgress>
              <div className="space-y-2 text-sm">
                {stats.subjectConfidence.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: tokenColor(s.color) }} />
                    <span className="truncate text-muted-foreground">{s.name.split(" — ")[0]}</span>
                    <span className="ml-auto font-medium tabular-nums">{s.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamTodayBlocks({ examId }: { examId: string }) {
  const state = useStore();
  const today = todayISO();
  const exam = state.exams.find((e) => e.id === examId);
  if (!exam) return null;
  const plan = buildExamPlan(state, exam, today);
  const todayDay = plan.find((p) => p.date === today);
  const nextDays = plan.slice(0, 4);
  if (!nextDays.length) return null;
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {nextDays.map((d) => (
        <div key={d.date} className="rounded-xl border bg-background/40 p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium">{relativeDays(today, d.date)}</span>
            <span className="text-muted-foreground">{d.blocks.length} block{d.blocks.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {d.blocks.length ? (
              d.blocks.map((b, i) => (
                <span
                  key={i}
                  className="rounded-md px-1.5 py-0.5 text-[11px]"
                  style={{
                    background: `color-mix(in oklch, ${tokenColor(b.subjectColor)} 14%, transparent)`,
                    color: tokenColor(b.subjectColor),
                  }}
                  title={`${b.type}: ${b.topicName}`}
                >
                  {b.type === "learn" ? "▸ " : "↻ "}
                  {b.topicName.length > 18 ? b.topicName.slice(0, 17) + "…" : b.topicName}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-muted-foreground">Rest / buffer day</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
