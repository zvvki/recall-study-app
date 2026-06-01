"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DIFFICULTIES, quizzesByDifficulty } from "@/lib/quizzes";
import { PageHeader } from "@/components/bits";
import { tokenColor } from "@/components/charts";

export default function QuizMenu() {
  return (
    <div>
      <PageHeader
        title="Quizzes"
        subtitle="Pick a difficulty and go. Every answer explains itself — wrong ones just teach you, no scores to stress about."
      />

      <div className="grid gap-3 sm:grid-cols-2 stagger">
        {DIFFICULTIES.map((d) => {
          const count = quizzesByDifficulty(d.key).length;
          return (
            <Link
              key={d.key}
              href={`/quiz/${d.key}`}
              className="group relative overflow-hidden rounded-2xl border bg-card/60 p-5 transition-all hover:-translate-y-0.5 hover:bg-card"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full blur-3xl"
                style={{ background: `color-mix(in oklch, ${tokenColor(d.token)} 18%, transparent)` }}
              />
              <div className="relative flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-xl bg-muted text-2xl">{d.icon}</span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <h3 className="relative mt-4 text-lg font-semibold" style={{ color: tokenColor(d.token) }}>
                {d.label}
              </h3>
              <p className="relative mt-1 text-sm text-muted-foreground">{d.blurb}</p>
              <p className="relative mt-3 text-xs text-muted-foreground/80">{count} questions</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed bg-card/40 p-4 text-sm text-muted-foreground">
        Tip: there&apos;s no pass or fail here. Run any tier as many times as you like — questions reshuffle each round.
      </div>
    </div>
  );
}
