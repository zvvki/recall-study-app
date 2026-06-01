"use client";

import Link from "next/link";
import { Clock, Shuffle, FileText, ArrowRight, ListChecks } from "lucide-react";
import { PageHeader } from "@/components/bits";

export default function TestMenu() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Mock test"
        subtitle="A full exam simulation in the real format — 16 multiple-choice + 1 practical. Generated fresh every single time."
      />

      <div className="rounded-2xl border bg-card/60 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Feature icon={ListChecks} title="16 MC + 1 practical" body="Same shape as the real ACCG2000 in-class test." />
          <Feature icon={Shuffle} title="Different every time" body="Numbers are randomised and answers computed live." />
          <Feature icon={FileText} title="Full review" body="See every answer worked out, plus a model solution." />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/test/run?timed=1"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <Clock className="size-4" /> Timed test (70 min)
          </Link>
          <Link
            href="/test/run?timed=0"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-5 py-3.5 font-medium transition-colors hover:bg-accent/50"
          >
            Untimed practice <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed bg-card/40 p-4 text-sm text-muted-foreground">
        Unlike the Quizzes section, a test holds your feedback until you submit — just like the real thing. Then it
        shows you exactly where the marks were. No pass/fail, just a clear picture and a fresh one whenever you want.
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div>
      <Icon className="size-5 text-primary" />
      <div className="mt-2 text-sm font-medium">{title}</div>
      <p className="text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
