"use client";
// ---------------------------------------------------------------------------
// Single source of truth. Zustand + localStorage persistence.
//
// DB-READINESS: every mutation below is a small, named, serialisable operation
// (reviewCard, addCard, logFocusSession, …). To move to a backend you replace
// the `persist` storage with API calls of the same shape — components never
// touch storage directly, they only call these actions / read selectors.
// ---------------------------------------------------------------------------
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import type { AppState, Card, Exam, FocusSession, Rating, Subject, Topic } from "./types";
import { SEED } from "./seed";
import { schedule, newCardDefaults } from "./srs";
import { todayISO } from "./date";

function uid(prefix: string) {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rnd}`;
}

interface Actions {
  reviewCard: (cardId: string, rating: Rating) => void;
  addSubject: (name: string, color?: string) => string;
  addTopic: (subjectId: string, name: string, note?: string) => string;
  updateTopic: (topicId: string, patch: Partial<Topic>) => void;
  addCard: (topicId: string, question: string, answer: string) => void;
  deleteCard: (cardId: string) => void;
  addExam: (e: Omit<Exam, "id">) => string;
  deleteExam: (examId: string) => void;
  logFocusSession: (s: Omit<FocusSession, "id" | "date">) => void;
  markStudiedToday: () => void;
  addXp: (n: number) => void;
  completeTopic: (topicId: string) => void;
  resetToSeed: () => void;
}

export type Store = AppState & Actions;

// --- per-profile storage --------------------------------------------------
// Each local profile keeps its own data under `recall-data::<profileId>`.
// Switching profile = point the storage at a different key + rehydrate.
export const PROFILE_ACTIVE_KEY = "recall-active-profile";
export function profileDataKey(): string {
  if (typeof window === "undefined") return "recall-data::default";
  return `recall-data::${localStorage.getItem(PROFILE_ACTIVE_KEY) || "default"}`;
}
const profileStorage = {
  getItem: (_n: string) => (typeof window !== "undefined" ? localStorage.getItem(profileDataKey()) : null),
  setItem: (_n: string, v: string) => {
    if (typeof window !== "undefined") localStorage.setItem(profileDataKey(), v);
  },
  removeItem: (_n: string) => {
    if (typeof window !== "undefined") localStorage.removeItem(profileDataKey());
  },
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...SEED,

      reviewCard: (cardId, rating) =>
        set((state) => {
          const today = todayISO();
          const card = state.cards.find((c) => c.id === cardId);
          if (!card) return state;
          const next = schedule(card, rating, today);
          return {
            cards: state.cards.map((c) =>
              c.id === cardId
                ? { ...c, ...next, lastReviewed: today, lastRating: rating }
                : c
            ),
            reviews: [
              ...state.reviews,
              { id: uid("r"), cardId, topicId: card.topicId, date: today, rating },
            ],
            activityDates: state.activityDates.includes(today)
              ? state.activityDates
              : [...state.activityDates, today],
          };
        }),

      addSubject: (name, color = "chart-1") => {
        const id = uid("s");
        set((state) => ({
          subjects: [...state.subjects, { id, name, color, createdAt: todayISO() }],
        }));
        return id;
      },

      addTopic: (subjectId, name, note) => {
        const id = uid("t");
        set((state) => ({
          topics: [...state.topics, { id, subjectId, name, note, createdAt: todayISO() }],
        }));
        return id;
      },

      updateTopic: (topicId, patch) =>
        set((state) => ({
          topics: state.topics.map((t) => (t.id === topicId ? { ...t, ...patch } : t)),
        })),

      addCard: (topicId, question, answer) =>
        set((state) => {
          const card: Card = {
            id: uid("c"),
            topicId,
            question,
            answer,
            createdAt: todayISO(),
            ...newCardDefaults(),
          };
          return { cards: [...state.cards, card] };
        }),

      deleteCard: (cardId) =>
        set((state) => ({ cards: state.cards.filter((c) => c.id !== cardId) })),

      addExam: (e) => {
        const id = uid("e");
        set((state) => ({ exams: [...state.exams, { id, ...e }] }));
        return id;
      },

      deleteExam: (examId) =>
        set((state) => ({ exams: state.exams.filter((e) => e.id !== examId) })),

      logFocusSession: (s) =>
        set((state) => {
          const today = todayISO();
          return {
            sessions: [
              ...state.sessions,
              { id: uid("f"), date: new Date().toISOString(), ...s },
            ],
            activityDates: state.activityDates.includes(today)
              ? state.activityDates
              : [...state.activityDates, today],
          };
        }),

      markStudiedToday: () =>
        set((state) => {
          const today = todayISO();
          return state.activityDates.includes(today)
            ? state
            : { activityDates: [...state.activityDates, today] };
        }),

      addXp: (n) =>
        set((state) => {
          const today = todayISO();
          return {
            xp: (state.xp ?? 0) + n,
            activityDates: state.activityDates.includes(today)
              ? state.activityDates
              : [...state.activityDates, today],
          };
        }),

      completeTopic: (topicId) =>
        set((state) => {
          const done = state.completedTopics ?? [];
          return done.includes(topicId)
            ? state
            : { completedTopics: [...done, topicId] };
        }),

      resetToSeed: () => set({ ...SEED }),
    }),
    {
      name: "recall-store",
      storage: createJSONStorage(() => profileStorage),
      version: 3,
    }
  )
);

/** Gate UI on hydration to avoid SSR/localStorage mismatch. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(useStore.persist.hasHydrated());
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);
  return hydrated;
}
