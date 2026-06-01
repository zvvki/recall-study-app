"use client";

import Link from "next/link";
import { Check, ArrowRight, Sparkles, GraduationCap } from "lucide-react";
import { useStore } from "@/lib/store";
import { LEARNING_TOPICS, levelFromXp } from "@/lib/learning";
import { PageHeader, SectionHeading } from "@/components/bits";

export default function LearningMenu() {
  const xp = useStore((s) => s.xp ?? 0);
  const completed = useStore((s) => s.completedTopics ?? []);
  const lvl = levelFromXp(xp);
  const doneCount = LEARNING_TOPICS.filter((t) => completed.includes(t.id)).length;
  const pct = LEARNING_TOPICS.length ? Math.round((doneCount / LEARNING_TOPICS.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Learning"
        subtitle="Bite-sized lessons: learn one idea, check it, move on. No walls of text, no scary tests — just small wins."
      />

      {/* level + overall progress */}
      <div className="mb-6 rounded-2xl border bg-card/60 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/25">
              <Sparkles className="size-5 text-primary" />
            </span>
            <div>
              <div className="font-semibold">
                Level <span className="text-primary">{lvl.level}</span> · {lvl.name}
              </div>
              <div className="text-xs text-muted-foreground">{xp} XP earned</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium tabular-nums">{doneCount} / {LEARNING_TOPICS.length} topics</div>
            <div className="text-xs text-muted-foreground">{pct}% complete</div>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.max(2, pct)}%` }} />
        </div>
      </div>

      <SectionHeading title="Pick a topic" hint="Each one takes a few minutes — finish it in one sitting" />
      <div className="grid gap-3 sm:grid-cols-2 stagger">
        {LEARNING_TOPICS.map((t) => {
          const isDone = completed.includes(t.id);
          const quizzes = t.steps.filter((s) => s.type === "quiz").length;
          return (
            <Link
              key={t.id}
              href={`/learning/${t.id}`}
              className="group flex items-center gap-4 rounded-2xl border bg-card/60 p-4 transition-all hover:-translate-y-0.5 hover:bg-card"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-muted text-2xl">
                {t.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{t.title}</span>
                  {isDone && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
                      <Check className="size-3" /> Done
                    </span>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{t.desc}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/80">{quizzes} quick checks</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-dashed bg-card/40 p-4 text-sm text-muted-foreground">
        <GraduationCap className="size-5 shrink-0 text-primary" />
        <p>Learn the idea here, then head to <Link href="/recall" className="text-primary hover:underline">Recall</Link> to drill it into memory with flashcards. Learning builds understanding; Recall makes it stick.</p>
      </div>
    </div>
  );
}
