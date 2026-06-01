// ---------------------------------------------------------------------------
// Derived state. Pure functions over AppState — this is where the learning
// psychology is encoded (retrieval scheduling, interleaving, weak-topic
// targeting, guilt-free streaks, anti-cramming exam plans).
// ---------------------------------------------------------------------------
import type { AppState, Card, Exam, Topic } from "./types";
import { addDays, daysBetween, isOnOrBefore, todayISO } from "./date";

export type Pick<T> = T; // alias guard (unused), keeps tree-shake happy

// ---- topic / subject confidence ------------------------------------------
export function topicCards(s: AppState, topicId: string): Card[] {
  return s.cards.filter((c) => c.topicId === topicId);
}

export function topicConfidence(s: AppState, topicId: string): number {
  const cards = topicCards(s, topicId);
  if (cards.length === 0) return 0;
  return Math.round(cards.reduce((a, c) => a + c.strength, 0) / cards.length);
}

export function topicStarted(s: AppState, topicId: string): boolean {
  return topicCards(s, topicId).some((c) => c.reps > 0 || c.lastRating);
}

export function subjectConfidence(s: AppState, subjectId: string): number {
  const topics = s.topics.filter((t) => t.subjectId === subjectId);
  if (!topics.length) return 0;
  return Math.round(
    topics.reduce((a, t) => a + topicConfidence(s, t.id), 0) / topics.length
  );
}

export interface WeakTopic {
  topic: Topic;
  subjectName: string;
  subjectColor: string;
  confidence: number;
  started: boolean;
  dueCount: number;
}

export function weakTopics(s: AppState, today = todayISO()): WeakTopic[] {
  return s.topics
    .map((topic) => {
      const subject = s.subjects.find((x) => x.id === topic.subjectId);
      return {
        topic,
        subjectName: subject?.name ?? "—",
        subjectColor: subject?.color ?? "chart-1",
        confidence: topicConfidence(s, topic.id),
        started: topicStarted(s, topic.id),
        dueCount: dueCardsForTopic(s, topic.id, today).length,
      };
    })
    .filter((w) => topicCards(s, w.topic.id).length > 0)
    .sort((a, b) => a.confidence - b.confidence);
}

// ---- due / interleaved review queue ---------------------------------------
export function dueCards(s: AppState, today = todayISO()): Card[] {
  const due = s.cards.filter((c) => isOnOrBefore(c.dueDate, today));
  // most overdue first
  due.sort((a, b) => daysBetween(b.dueDate, today) - daysBetween(a.dueDate, today));
  return interleave(due, (c) => c.topicId);
}

export function dueCardsForTopic(s: AppState, topicId: string, today = todayISO()): Card[] {
  return s.cards.filter((c) => c.topicId === topicId && isOnOrBefore(c.dueDate, today));
}

/** Every card across an exam's topics, interleaved — the cram deck (ignores due dates). */
export function cramCards(s: AppState, examId: string): Card[] {
  const exam = s.exams.find((e) => e.id === examId);
  if (!exam) return [];
  const topicSet = new Set(exam.topicIds);
  const cards = s.cards.filter((c) => topicSet.has(c.topicId));
  return interleave(cards, (c) => c.topicId);
}

/** Re-order so consecutive items differ by `key` where possible (interleaving). */
export function interleave<T>(items: T[], key: (t: T) => string): T[] {
  const buckets = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k)!.push(it);
  }
  const out: T[] = [];
  let remaining = items.length;
  const keys = Array.from(buckets.keys());
  let i = 0;
  while (remaining > 0) {
    const b = buckets.get(keys[i % keys.length])!;
    if (b.length) {
      out.push(b.shift()!);
      remaining--;
    }
    i++;
    if (i > items.length * keys.length + 5) break; // safety
  }
  return out;
}

// ---- streaks (guilt-free) --------------------------------------------------
export interface StreakInfo {
  current: number;
  best: number;
  studiedToday: boolean;
  /** days studied in the last 7 (incl today) */
  weekly: number;
  /** last 7 days as booleans, oldest → newest */
  week: { date: string; active: boolean }[];
  atRisk: boolean; // not yet studied today, but streak alive from yesterday
}

export function streakInfo(s: AppState, today = todayISO()): StreakInfo {
  const set = new Set(s.activityDates);
  const studiedToday = set.has(today);

  // Anchor the streak at today (if done) or yesterday (grace) — a single missed
  // day doesn't read as failure; the streak is "recoverable" until tonight.
  let anchor: string | null = null;
  if (studiedToday) anchor = today;
  else if (set.has(addDays(today, -1))) anchor = addDays(today, -1);

  let current = 0;
  if (anchor) {
    let cur = anchor;
    while (set.has(cur)) {
      current++;
      cur = addDays(cur, -1);
    }
  }

  // best streak over all history
  const sorted = Array.from(set).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    if (prev && daysBetween(prev, d) === 1) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = d;
  }

  const week: { date: string; active: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i);
    week.push({ date: d, active: set.has(d) });
  }
  const weekly = week.filter((w) => w.active).length;

  return { current, best, studiedToday, weekly, week, atRisk: !studiedToday && current > 0 };
}

// ---- exam plan (anti-cramming, weak-first, spaced) -------------------------
export type BlockType = "learn" | "review";
export interface PlanBlock {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectColor: string;
  type: BlockType;
}
export interface PlanDay {
  date: string;
  blocks: PlanBlock[];
}

const SPACING = [0, 1, 3, 6, 10, 15]; // expanding gaps → spaced practice
const MAX_PER_DAY = 4;

export function buildExamPlan(s: AppState, exam: Exam, today = todayISO()): PlanDay[] {
  const studyDays: string[] = [];
  let cur = today;
  while (isOnOrBefore(cur, addDays(exam.date, -1))) {
    studyDays.push(cur);
    cur = addDays(cur, 1);
  }
  if (studyDays.length === 0) return [];

  const dayBlocks: PlanBlock[][] = studyDays.map(() => []);
  const subject = s.subjects.find((x) => x.id === exam.subjectId);

  // weaker topics get more touches
  const topics = exam.topicIds
    .map((id) => s.topics.find((t) => t.id === id))
    .filter(Boolean) as Topic[];

  const ranked = topics
    .map((t) => ({ t, c: topicConfidence(s, t.id), started: topicStarted(s, t.id) }))
    .sort((a, b) => a.c - b.c);

  for (const { t, c, started } of ranked) {
    const touches = c < 40 ? 4 : c < 60 ? 3 : c < 80 ? 2 : 1;
    const n = Math.min(touches, studyDays.length);
    for (let k = 0; k < n; k++) {
      const offset = SPACING[Math.min(k, SPACING.length - 1)];
      let idx = Math.min(offset, studyDays.length - 1);
      // push later touches toward the exam so review lands near the test
      if (k === n - 1) idx = studyDays.length - 1;
      idx = findSlot(dayBlocks, idx);
      dayBlocks[idx].push({
        topicId: t.id,
        topicName: t.name,
        subjectId: exam.subjectId,
        subjectColor: subject?.color ?? "chart-1",
        type: k === 0 && !started ? "learn" : "review",
      });
    }
  }

  return studyDays.map((date, i) => ({ date, blocks: dayBlocks[i] }));
}

/** find nearest day (search outward) under the per-day cap, starting at idx. */
function findSlot(dayBlocks: PlanBlock[][], idx: number): number {
  if (dayBlocks[idx].length < MAX_PER_DAY) return idx;
  for (let d = 1; d < dayBlocks.length; d++) {
    if (idx - d >= 0 && dayBlocks[idx - d].length < MAX_PER_DAY) return idx - d;
    if (idx + d < dayBlocks.length && dayBlocks[idx + d].length < MAX_PER_DAY) return idx + d;
  }
  return idx; // all full — allow overflow
}

// ---- today's plan (combines reviews + plan blocks + focus nudge) -----------
export type TaskKind = "review" | "learn" | "focus";
export interface TodayItem {
  id: string;
  kind: TaskKind;
  title: string;
  subtitle: string;
  href: string;
  done: boolean;
  accent: string; // chart token
}

export function todayPlan(s: AppState, today = todayISO()): TodayItem[] {
  const items: TodayItem[] = [];
  const due = dueCards(s, today);
  const studiedFocusToday = s.sessions.some((f) => f.date.slice(0, 10) === today);

  if (due.length > 0) {
    items.push({
      id: "review",
      kind: "review",
      title: `Retrieve ${due.length} due card${due.length > 1 ? "s" : ""}`,
      subtitle: "Active recall — the highest-yield 15 minutes of your day",
      href: "/recall",
      done: false,
      accent: "chart-1",
    });
  }

  // today's exam-plan learn/review blocks (deduped by topic)
  const seen = new Set<string>();
  for (const exam of s.exams) {
    const plan = buildExamPlan(s, exam, today);
    const todayDay = plan.find((p) => p.date === today);
    if (!todayDay) continue;
    for (const b of todayDay.blocks) {
      if (b.type === "learn" && !seen.has(b.topicId)) {
        seen.add(b.topicId);
        items.push({
          id: `learn-${b.topicId}`,
          kind: "learn",
          title: `Learn: ${b.topicName}`,
          subtitle: `First pass before ${exam.name}`,
          href: `/learning/${b.topicId}`,
          done: topicStarted(s, b.topicId),
          accent: b.subjectColor,
        });
      }
    }
  }

  // a single, low-friction focus nudge on the weakest started topic
  const weak = weakTopics(s, today)[0];
  items.push({
    id: "focus",
    kind: "focus",
    title: "One 25-minute focus session",
    subtitle: weak ? `Suggested: ${weak.topic.name}` : "Pick a topic and protect 25 minutes",
    href: "/focus",
    done: studiedFocusToday,
    accent: "chart-3",
  });

  return items;
}

export interface NextAction {
  title: string;
  description: string;
  href: string;
  cta: string;
  accent: string;
}

/** The single most valuable thing to do right now (reduces decision fatigue). */
export function nextAction(s: AppState, today = todayISO()): NextAction {
  const due = dueCards(s, today);
  if (due.length > 0) {
    return {
      title: `${due.length} card${due.length > 1 ? "s" : ""} ready for retrieval`,
      description:
        "These are scheduled at the moment you're most likely to be forgetting them. Recall now to lock them in.",
      href: "/recall",
      cta: "Start recall",
      accent: "chart-1",
    };
  }
  const exam = nextExam(s, today);
  const weak = weakTopics(s, today).find((w) => exam?.topicIds.includes(w.topic.id)) ?? weakTopics(s, today)[0];
  if (weak) {
    return {
      title: `Strengthen your weakest topic: ${weak.topic.name}`,
      description: exam
        ? `Confidence ${weak.confidence}%. ${exam.name} is ${relativeExam(exam, today)} — close this gap first.`
        : `Confidence ${weak.confidence}%. A focused pass here moves the needle most.`,
      href: `/topics/${weak.topic.id}`,
      cta: "Open topic",
      accent: weak.subjectColor,
    };
  }
  return {
    title: "You're all caught up",
    description: "Nothing due. Bank a focus session or add cards to a topic you want to deepen.",
    href: "/focus",
    cta: "Start a focus session",
    accent: "chart-3",
  };
}

export function relativeExam(exam: Exam, today = todayISO()): string {
  const d = daysBetween(today, exam.date);
  if (d <= 0) return "today";
  if (d === 1) return "tomorrow";
  return `in ${d} days`;
}

export function nextExam(s: AppState, today = todayISO()): Exam | undefined {
  return s.exams
    .filter((e) => daysBetween(today, e.date) >= 0)
    .sort((a, b) => daysBetween(today, a.date) - daysBetween(today, b.date))[0];
}

// ---- analytics -------------------------------------------------------------
export interface Analytics {
  byDay: { date: string; count: number; recall: number }[];
  retention: number; // % medium+easy over last 14d
  reviewsTotal: number;
  cardsStarted: number;
  cardsTotal: number;
  focusMinutes: number;
  focusSessions: number;
  ratingDist: { rating: string; count: number; token: string }[];
  subjectConfidence: { name: string; color: string; confidence: number }[];
}

export function analytics(s: AppState, today = todayISO()): Analytics {
  const byDay: Analytics["byDay"] = [];
  let recallNum = 0;
  let recallDen = 0;
  for (let i = 13; i >= 0; i--) {
    const date = addDays(today, -i);
    const rs = s.reviews.filter((r) => r.date === date);
    const good = rs.filter((r) => r.rating === "medium" || r.rating === "easy").length;
    recallNum += good;
    recallDen += rs.length;
    byDay.push({
      date,
      count: rs.length,
      recall: rs.length ? Math.round((good / rs.length) * 100) : 0,
    });
  }

  const ratingTokens: Record<string, string> = {
    forgot: "chart-5",
    hard: "chart-4",
    medium: "chart-2",
    easy: "chart-3",
  };
  const ratingDist = ["forgot", "hard", "medium", "easy"].map((rating) => ({
    rating,
    count: s.reviews.filter((r) => r.rating === rating).length,
    token: ratingTokens[rating],
  }));

  return {
    byDay,
    retention: recallDen ? Math.round((recallNum / recallDen) * 100) : 0,
    reviewsTotal: s.reviews.length,
    cardsStarted: s.cards.filter((c) => c.reps > 0).length,
    cardsTotal: s.cards.length,
    focusMinutes: s.sessions.reduce((a, f) => a + f.durationMin, 0),
    focusSessions: s.sessions.length,
    ratingDist,
    subjectConfidence: s.subjects.map((sub) => ({
      name: sub.name,
      color: sub.color,
      confidence: subjectConfidence(s, sub.id),
    })),
  };
}
