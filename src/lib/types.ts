// ---------------------------------------------------------------------------
// Domain models. Kept deliberately plain & serialisable so the same shapes can
// later back a database (each entity has a stable string `id` + foreign keys).
// ---------------------------------------------------------------------------

/** How well the learner recalled a card. Drives the spaced-repetition schedule. */
export type Rating = "forgot" | "hard" | "medium" | "easy";

export interface Subject {
  id: string;
  name: string;
  /** chart token: "chart-1".."chart-5" — keeps colour logic data-driven */
  color: string;
  createdAt: string; // ISO
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  /** optional learner note / summary */
  note?: string;
  createdAt: string;
}

export interface Card {
  id: string;
  topicId: string;
  question: string;
  answer: string;
  // --- spaced repetition state ---
  ease: number; // ~1.3 (hard) .. 2.8 (easy), SM-2 style
  intervalDays: number; // current gap between reviews
  dueDate: string; // ISO date (yyyy-mm-dd) the card is next due
  reps: number; // successful reps in a row
  lapses: number; // times forgotten
  /** 0–100 memory-strength estimate, smoothed across reviews */
  strength: number;
  lastReviewed?: string;
  lastRating?: Rating;
  createdAt: string;
}

export interface ReviewLog {
  id: string;
  cardId: string;
  topicId: string;
  date: string; // ISO date
  rating: Rating;
}

export interface Exam {
  id: string;
  subjectId: string;
  name: string;
  date: string; // ISO date
  topicIds: string[];
}

export interface FocusSession {
  id: string;
  date: string; // ISO datetime
  topicId?: string;
  goal: string;
  durationMin: number;
  reflection?: {
    learned: string;
    confused: string;
    reviewNext: string;
  };
}

export interface AppState {
  subjects: Subject[];
  topics: Topic[];
  cards: Card[];
  reviews: ReviewLog[];
  exams: Exam[];
  sessions: FocusSession[];
  /** ISO dates (yyyy-mm-dd) on which the learner studied — powers streaks */
  activityDates: string[];
}
