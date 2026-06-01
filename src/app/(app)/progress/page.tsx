"use client";

import { Brain, Timer, Flame, TrendingUp, Target, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { analytics, streakInfo } from "@/lib/selectors";
import { todayISO, parseISO } from "@/lib/date";
import { PageHeader, SectionHeading, StatTile } from "@/components/bits";
import { Sparkline, MiniBars, ConfidenceBar, confToken, tokenColor } from "@/components/charts";
import { RATING_META } from "@/lib/srs";

export default function ProgressPage() {
  const state = useStore();
  const today = todayISO();
  const a = analytics(state, today);
  const streak = streakInfo(state, today);

  const dayLabel = (iso: string) => parseISO(iso).toLocaleDateString(undefined, { weekday: "narrow" });
  const reviewBars = a.byDay.map((d) => ({ label: dayLabel(d.date), value: d.count, token: "chart-1" }));
  const recallPoints = a.byDay.map((d) => d.recall);
  const maxRating = Math.max(...a.ratingDist.map((r) => r.count), 1);

  return (
    <div>
      <PageHeader title="Progress" subtitle="The honest view: are things actually moving to long-term memory?" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Retention" value={a.reviewsTotal ? `${a.retention}%` : "—"} sub={a.reviewsTotal ? "clean recall, 14d" : "no reviews yet"} token="chart-3" icon={TrendingUp} />
        <StatTile label="Reviews" value={a.reviewsTotal} sub="cards retrieved" token="chart-1" icon={Brain} />
        <StatTile label="Cards started" value={`${a.cardsStarted}/${a.cardsTotal}`} sub="in rotation" token="chart-2" icon={Target} />
        <StatTile label="Focus time" value={`${a.focusMinutes}m`} sub={`${a.focusSessions} sessions`} token="chart-4" icon={Timer} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Reviews per day */}
        <div className="rounded-2xl border bg-card/60 p-5 lg:col-span-2">
          <SectionHeading title="Retrieval activity" hint="Reviews per day, last 14 days" />
          <MiniBars data={reviewBars} />
        </div>

        {/* Recall rate trend */}
        <div className="rounded-2xl border bg-card/60 p-5">
          <SectionHeading title="Recall rate" hint="% answered cleanly" />
          <div className="mb-2 text-3xl font-semibold tabular-nums" style={{ color: tokenColor(confToken(a.retention)) }}>
            {a.reviewsTotal ? `${a.retention}%` : "—"}
          </div>
          <Sparkline points={recallPoints.length ? recallPoints : [0]} token="chart-3" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Rating distribution */}
        <div className="rounded-2xl border bg-card/60 p-5">
          <SectionHeading title="How recall felt" hint="Distribution of your self-ratings" />
          <div className="space-y-3">
            {a.ratingDist.map((r) => {
              const m = RATING_META[r.rating as keyof typeof RATING_META];
              return (
                <div key={r.rating} className="flex items-center gap-3">
                  <span className="w-16 text-sm" style={{ color: tokenColor(m.token) }}>{m.label}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(r.count / maxRating) * 100}%`, background: tokenColor(m.token) }} />
                  </div>
                  <span className="w-8 text-right text-sm tabular-nums text-muted-foreground">{r.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject confidence */}
        <div className="rounded-2xl border bg-card/60 p-5">
          <SectionHeading title="Confidence by subject" />
          <div className="space-y-4">
            {a.subjectConfidence.map((s) => (
              <div key={s.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="truncate">{s.name}</span>
                  <span className="tabular-nums" style={{ color: tokenColor(confToken(s.confidence)) }}>{s.confidence}%</span>
                </div>
                <ConfidenceBar value={s.confidence} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Consistency — guilt-free framing */}
      <div className="mt-6 rounded-2xl border bg-card/60 p-5">
        <SectionHeading title="Consistency" hint="Showing up beats intensity — and one miss isn't failure" />
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <Flame className={streak.current > 0 ? "size-7 text-warning" : "size-7 text-muted-foreground"} />
            <div>
              <div className="text-2xl font-semibold tabular-nums">{streak.current} days</div>
              <div className="text-xs text-muted-foreground">current streak · best {streak.best}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {streak.week.map((w, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`grid size-9 place-items-center rounded-lg ${w.active ? "bg-warning/20 ring-1 ring-warning/40" : "bg-muted"}`}
                  title={w.date}
                >
                  {w.active && <CheckCircle2 className="size-4 text-warning" />}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {parseISO(w.date).toLocaleDateString(undefined, { weekday: "narrow" })}
                </span>
              </div>
            ))}
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            You studied <span className="text-foreground">{streak.weekly} of the last 7 days</span>.
            {streak.studiedToday ? " Today's already in — bank it." : " A single card today keeps the momentum."}
          </p>
        </div>
      </div>
    </div>
  );
}
