// The Learning section: teach→quiz micro-lessons. Content lives in
// learning-content.ts (authored + fact-checked); this file holds the shape,
// XP rules and level helpers used by the engine and menu.

export type LearnStep =
  | { type: "teach"; title: string; body: string; analogy?: string }
  | {
      type: "quiz";
      question: string;
      options: string[];
      answer: number;
      correctMsg: string;
      wrongMsg: string;
    };

export interface LearnTopic {
  id: string;
  icon: string;
  title: string;
  desc: string;
  steps: LearnStep[];
}

export { LEARNING_TOPICS } from "./learning-content";
import { LEARNING_TOPICS } from "./learning-content";

export function getLearnTopic(id: string): LearnTopic | undefined {
  return LEARNING_TOPICS.find((t) => t.id === id);
}

// XP: small reward per correct quiz, bigger reward for finishing a topic.
export const XP_QUIZ = 5;
export const XP_FINISH = 15;

const LEVELS = [
  { min: 0, name: "Beginner" },
  { min: 60, name: "Getting it" },
  { min: 150, name: "Solid" },
  { min: 280, name: "Sharp" },
  { min: 450, name: "Exam-ready" },
];

export function levelFromXp(xp: number): { level: number; name: string; into: number; span: number } {
  let i = 0;
  for (let k = 0; k < LEVELS.length; k++) if (xp >= LEVELS[k].min) i = k;
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  const span = next ? next.min - cur.min : 100;
  return { level: i + 1, name: cur.name, into: xp - cur.min, span };
}
