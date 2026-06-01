// ---------------------------------------------------------------------------
// Spaced-repetition engine (SM-2 inspired, simplified to 4 ratings).
//
// WHY: forgetting is exponential. Reviewing an item just before you'd forget
// it is the single most efficient way to move it to long-term memory. We honour
// the brief's base intervals but let "easy" items grow so strong cards stop
// stealing time from weak ones (that's the whole point of spacing).
// ---------------------------------------------------------------------------
import type { Card, Rating } from "./types";
import { addDays, todayISO } from "./date";

export const RATINGS: Rating[] = ["forgot", "hard", "medium", "easy"];

export const RATING_META: Record<
  Rating,
  { label: string; hint: string; token: string; key: string }
> = {
  forgot: { label: "Forgot", hint: "see again tomorrow", token: "chart-5", key: "1" },
  hard: { label: "Hard", hint: "in ~2 days", token: "chart-4", key: "2" },
  medium: { label: "Medium", hint: "in ~4–5 days", token: "chart-2", key: "3" },
  easy: { label: "Easy", hint: "in 7+ days", token: "chart-3", key: "4" },
};

/** Memory-strength target each rating implies (0–100). Smoothed in `schedule`. */
const STRENGTH_TARGET: Record<Rating, number> = {
  forgot: 18,
  hard: 45,
  medium: 72,
  easy: 92,
};

const EASE_DELTA: Record<Rating, number> = {
  forgot: -0.3,
  hard: -0.15,
  medium: 0,
  easy: 0.15,
};

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;

export interface ScheduleResult {
  ease: number;
  intervalDays: number;
  dueDate: string;
  reps: number;
  lapses: number;
  strength: number;
}

/**
 * Compute the next schedule for a card given how the learner rated their recall.
 * Pure function — pass `today` so it is deterministic and testable.
 */
export function schedule(card: Card, rating: Rating, today = todayISO()): ScheduleResult {
  const prevInterval = card.intervalDays || 0;
  let ease = clamp(card.ease + EASE_DELTA[rating], MIN_EASE, MAX_EASE);
  let reps = card.reps;
  let lapses = card.lapses;
  let interval: number;

  switch (rating) {
    case "forgot":
      reps = 0;
      lapses += 1;
      interval = 1; // tomorrow
      break;
    case "hard":
      reps += 1;
      interval = prevInterval < 2 ? 2 : Math.round(prevInterval * 1.2);
      break;
    case "medium":
      reps += 1;
      interval = prevInterval < 1 ? 4 : Math.max(4, Math.round(prevInterval * ease));
      break;
    case "easy":
      reps += 1;
      interval = prevInterval < 1 ? 7 : Math.max(7, Math.round(prevInterval * ease * 1.4));
      break;
  }

  // smooth strength toward the rating's target so confidence reacts gradually
  const strength = Math.round(card.strength * 0.45 + STRENGTH_TARGET[rating] * 0.55);

  return {
    ease,
    intervalDays: interval,
    dueDate: addDays(today, interval),
    reps,
    lapses,
    strength: clamp(strength, 0, 100),
  };
}

/** A brand-new card is due immediately and has neutral strength. */
export function newCardDefaults(today = todayISO()): Pick<
  Card,
  "ease" | "intervalDays" | "dueDate" | "reps" | "lapses" | "strength"
> {
  return { ease: 2.3, intervalDays: 0, dueDate: today, reps: 0, lapses: 0, strength: 0 };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
