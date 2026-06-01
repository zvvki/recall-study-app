"use client";

import { useState } from "react";
import { Plus, Trash2, CalendarRange, Flame, Info, GraduationCap } from "lucide-react";
import { useStore } from "@/lib/store";
import { buildExamPlan, relativeExam, topicConfidence } from "@/lib/selectors";
import { todayISO, formatShort, formatLong, addDays } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader, Pill } from "@/components/bits";
import { confToken, tokenColor } from "@/components/charts";

export default function PlannerPage() {
  const state = useStore();
  const today = todayISO();
  const exams = [...state.exams].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <PageHeader title="Exam planner" subtitle="Add a date and your topics get spread across the days — weak ones first, reviews landing near the test.">
        <AddExamDialog />
      </PageHeader>

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          <span className="text-foreground">How the plan is built:</span> weaker topics (lower confidence) get more touches.
          The first touch is a <span className="text-foreground">learn</span> pass, later ones are spaced <span className="text-foreground">reviews</span> at widening
          gaps — so material is revisited just as you&apos;d start to forget it, never crammed the night before.
        </p>
      </div>

      <div className="space-y-6">
        {exams.map((exam) => {
          const subject = state.subjects.find((s) => s.id === exam.subjectId);
          const plan = buildExamPlan(state, exam, today);
          return (
            <div key={exam.id} className="rounded-3xl border bg-card/60 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/25">
                    <CalendarRange className="size-5 text-primary" />
                  </span>
                  <div>
                    <h2 className="text-lg font-medium">{exam.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {subject?.name.split(" — ")[0]} · {formatLong(exam.date)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill token="chart-4"><Flame className="size-3.5" /> {relativeExam(exam, today)}</Pill>
                  <button
                    onClick={() => useStore.getState().deleteExam(exam.id)}
                    className="text-muted-foreground/60 hover:text-destructive"
                    title="Delete exam"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* topic confidence legend */}
              <div className="mt-4 flex flex-wrap gap-2">
                {exam.topicIds.map((tid) => {
                  const t = state.topics.find((x) => x.id === tid);
                  if (!t) return null;
                  const c = topicConfidence(state, tid);
                  return (
                    <span key={tid} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
                      <span className="size-2 rounded-full" style={{ background: tokenColor(confToken(c)) }} />
                      {t.name} <span className="tabular-nums text-muted-foreground">{c}%</span>
                    </span>
                  );
                })}
              </div>

              {/* day-by-day plan */}
              {plan.length === 0 ? (
                <p className="mt-5 text-sm text-muted-foreground">The exam is today or past — no study days left to schedule.</p>
              ) : (
                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {plan.map((d) => {
                    const isToday = d.date === today;
                    return (
                      <div
                        key={d.date}
                        className={`rounded-2xl border p-3.5 ${isToday ? "border-primary/40 bg-primary/5" : "bg-background/40"}`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>
                            {isToday ? "Today" : formatShort(d.date)}
                          </span>
                          <span className="text-xs text-muted-foreground">{d.blocks.length || "—"}</span>
                        </div>
                        <div className="space-y-1.5">
                          {d.blocks.length ? (
                            d.blocks.map((b, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs"
                                style={{ background: `color-mix(in oklch, ${tokenColor(b.subjectColor)} 12%, transparent)` }}
                              >
                                <span
                                  className="font-medium uppercase tracking-wide"
                                  style={{ color: tokenColor(b.type === "learn" ? "chart-4" : b.subjectColor) }}
                                >
                                  {b.type === "learn" ? "Learn" : "Review"}
                                </span>
                                <span className="truncate text-foreground/85">{b.topicName}</span>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-lg bg-muted/40 px-2 py-1 text-xs text-muted-foreground">Buffer / rest</div>
                          )}
                        </div>
                        {/* exam-eve marker */}
                        {d.date === addDays(exam.date, -1) && (
                          <div className="mt-2 text-[11px] text-warning">Light review only — sleep &gt; cramming.</div>
                        )}
                      </div>
                    );
                  })}
                  <div className="rounded-2xl border border-dashed bg-background/20 p-3.5 grid place-items-center text-center">
                    <div>
                      <GraduationCap className="mx-auto size-5 text-primary" />
                      <div className="mt-1 text-sm font-medium">{exam.name.split(" ").slice(-1)}</div>
                      <div className="text-xs text-muted-foreground">{formatShort(exam.date)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {exams.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-card/40 p-12 text-center text-muted-foreground">
            No exams yet. Add one to generate a spaced study plan.
          </div>
        )}
      </div>
    </div>
  );
}

function AddExamDialog() {
  const state = useStore();
  const addExam = useStore((s) => s.addExam);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState(state.subjects[0]?.id ?? "");
  const [date, setDate] = useState(addDays(todayISO(), 14));
  const [picked, setPicked] = useState<string[]>([]);

  const topics = state.topics.filter((t) => t.subjectId === subjectId);

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" /> New exam
      </DialogTrigger>
      <DialogContent className="max-h-[85svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New exam / assessment</DialogTitle>
          <DialogDescription>Pick the topics it covers — the planner spaces them across the days until then.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-2 block text-sm">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Midsem exam" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-2 block text-sm">Subject</Label>
              <Select value={subjectId} onValueChange={(v) => { setSubjectId(v ?? ""); setPicked([]); }}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {state.subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name.split(" — ")[0]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block text-sm">Date</Label>
              <Input type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-2 block text-sm">Topics covered</Label>
            <div className="grid max-h-44 grid-cols-1 gap-1.5 overflow-y-auto rounded-xl border p-2">
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    picked.includes(t.id) ? "bg-primary/15 text-foreground" : "hover:bg-accent/50 text-muted-foreground"
                  }`}
                >
                  <span className={`grid size-4 place-items-center rounded border ${picked.includes(t.id) ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}>
                    {picked.includes(t.id) && "✓"}
                  </span>
                  {t.name}
                </button>
              ))}
              {topics.length === 0 && <p className="px-2 py-2 text-sm text-muted-foreground">This subject has no topics yet.</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!name.trim() || !subjectId || picked.length === 0}
            onClick={() => {
              addExam({ name: name.trim(), subjectId, date, topicIds: picked });
              setName("");
              setPicked([]);
              setOpen(false);
            }}
          >
            Create plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
