# Recall — an evidence-based study system

A study platform where **every feature maps to a finding about how memory, attention and motivation work** — not a notes app. Built with Next.js 16 (App Router), React 19, Tailwind v4 and shadcn/ui (base-ui). Dark, responsive, SaaS-grade.

When you open it, it tells you the **single next best action**, what's **due for review**, what you're **weak at**, and a short **ordered plan** for today.

## The principles → features map

| Principle | Where it lives | Why |
|---|---|---|
| **Active recall** | `/recall` — answer from memory *before* revealing | Retrieval, not rereading, builds durable memory |
| **Spaced repetition** | `src/lib/srs.ts` — Forgot→1d, Hard→2d, Medium→4–5d, Easy→7d+ (intervals grow with `ease`) | Review just before forgetting; stop wasting time on strong cards |
| **Interleaving** | `interleave()` in `selectors.ts` — due queue mixes topics/subjects | Desirable difficulty → sharper, more flexible recall |
| **Focus sessions** | `/focus` — goal up front, Pomodoro timer, reflection after | Single-tasking + metacognition; ends knowing what to review next |
| **Anti-cramming planner** | `buildExamPlan()` — weak topics get more touches, reviews land near the exam | Spacing beats massing; protects sleep before the test |
| **Weak-topic targeting** | confidence score per topic/subject, ranked ascending | Spend effort where the gap is largest |
| **Guilt-free streaks** | `streakInfo()` — 1-day grace, weekly consistency, recoverable framing | Consistency without shame; a miss isn't failure |
| **Reduced decision fatigue** | `nextAction()` surfaces one thing; today's plan is short & ordered | Less choosing, more doing |

## Pages

`/` landing · `/dashboard` · `/subjects` · `/topics/[id]` · `/recall` · `/focus` · `/planner` · `/progress`

## Architecture & data flow

```
src/lib/
  types.ts       domain models (Subject, Topic, Card, Exam, FocusSession, ReviewLog)
  srs.ts         spaced-repetition scheduler (pure, testable)
  selectors.ts   derived state: due queue, confidence, weak topics, streaks,
                 exam plan, next-best-action, analytics (all pure functions)
  store.ts       Zustand store + localStorage persistence; all mutations are
                 small named actions (reviewCard, addCard, logFocusSession, …)
  seed.ts        mock data (preloaded with the ACCG2000 deck)
```

### Swapping mock data for a database

The UI **never touches storage directly** — it only calls store actions and reads
pure selectors. To go from local-only to a backend:

1. Replace the `persist` storage in `store.ts` with API calls of the **same shape**
   as the existing actions (`reviewCard`, `addCard`, `addExam`, …).
2. Replace `seed.ts` / initial state with a server fetch.
3. The selectors and every component stay **unchanged** — they operate on the
   `AppState` shape, which is exactly what a DB row-set would hydrate into.

State is intentionally normalised (entities + foreign-key ids) so each model maps
cleanly to a table.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Progress saves to `localStorage` on your device (no sign-up). Clear it by resetting
the store (`resetToSeed`) or clearing site data.
