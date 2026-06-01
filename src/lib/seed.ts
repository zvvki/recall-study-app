// Seed / mock data. Loaded once into the store on first run, then persisted &
// mutated locally. Swapping this for an API later means replacing `loadInitial`
// in the repository — nothing else changes.
import type { AppState, Card, Rating } from "./types";
import { todayISO, addDays } from "./date";
import { newCardDefaults } from "./srs";

type CardSpec = {
  q: string;
  a: string;
  /** due offset in days from today (negative = overdue) */
  due: number;
  strength: number;
  reps: number;
  ease: number;
  interval: number;
  last?: Rating;
};

const T = todayISO();

// Cards ship as brand-new & unstudied — every card is due today, strength 0.
// All progress (strength, streak, retention) is earned by the learner, never seeded.
function mkCards(topicId: string, specs: CardSpec[], idPrefix = "c"): Card[] {
  return specs.map((s, i) => ({
    id: `${idPrefix}-${topicId}-${i + 1}`,
    topicId,
    question: s.q,
    answer: s.a,
    createdAt: T,
    ...newCardDefaults(T),
  }));
}

// --- ACCG2000 topics + cards (drawn from the learner's own material) ---
const accgTopics: { id: string; name: string; note: string; cards: CardSpec[] }[] = [
  {
    id: "t-service",
    name: "Service entity costing",
    note: "Service firm types, value chain, job costing for services.",
    cards: [
      { q: "A firm with high contact time and few customers is what type of service firm?", a: "A professional service firm (high contact, low volume, highly customised — e.g. law, consulting).", due: -1, strength: 38, reps: 1, ease: 2.15, interval: 2, last: "hard" },
      { q: "Does the service value chain include purchasing of raw materials?", a: "No. It includes R&D/design, marketing, delivery and customer support — but not raw-material purchasing.", due: 0, strength: 55, reps: 2, ease: 2.3, interval: 4, last: "medium" },
      { q: "When does job costing apply to a service entity?", a: "When services are distinct, customised and produced in low volume, so each job is tracked separately.", due: 2, strength: 70, reps: 3, ease: 2.4, interval: 5, last: "medium" },
    ],
  },
  {
    id: "t-relevant",
    name: "Relevant costs for decisions",
    note: "Sunk vs differential; make-or-buy; special orders; sell-or-process-further.",
    cards: [
      { q: "State the relevant-cost rule.", a: "A cost is relevant only if it is a FUTURE cost AND it DIFFERS between the alternatives. Sunk costs are never relevant.", due: -2, strength: 22, reps: 0, ease: 1.9, interval: 1, last: "forgot" },
      { q: "In make-or-buy, what is the maximum acceptable purchase price per unit?", a: "Variable cost to make per unit + avoidable fixed cost per unit. Ignore unavoidable/allocated overhead.", due: 0, strength: 44, reps: 1, ease: 2.1, interval: 2, last: "hard" },
      { q: "In a sell-or-process-further decision, how are joint costs treated?", a: "Joint costs incurred before split-off are SUNK and irrelevant. Compare only incremental revenue vs incremental further-processing cost.", due: 0, strength: 40, reps: 1, ease: 2.05, interval: 2, last: "hard" },
      { q: "When should a special order be accepted?", a: "If there is spare capacity and the price exceeds the incremental (usually variable) cost per unit, and it doesn't harm regular sales.", due: 3, strength: 68, reps: 2, ease: 2.35, interval: 5, last: "medium" },
    ],
  },
  {
    id: "t-constraint",
    name: "Constrained resources",
    note: "Rank products by contribution margin per unit of the scarce resource.",
    cards: [
      { q: "With one limited resource, how do you rank products?", a: "By contribution margin PER UNIT OF THE SCARCE RESOURCE (not CM per unit). Then produce to demand from the highest rank down.", due: -1, strength: 35, reps: 1, ease: 2.0, interval: 2, last: "hard" },
      { q: "Product P: CM $30 needs 3 hrs. Product Q: CM $24 needs 2 hrs. Labour is scarce. Which wins?", a: "Q. CM/hr: P = $10, Q = $12. Q earns more contribution per scarce hour.", due: 1, strength: 60, reps: 2, ease: 2.3, interval: 4, last: "medium" },
    ],
  },
  {
    id: "t-costing",
    name: "Variable vs absorption costing",
    note: "What goes into unit product cost under each method.",
    cards: [
      { q: "Which cost is excluded from unit product cost under variable costing?", a: "Fixed manufacturing overhead (treated as a period cost). Variable cost = DM + DL + variable OH.", due: 0, strength: 50, reps: 2, ease: 2.25, interval: 4, last: "medium" },
      { q: "If production exceeds sales, which method shows higher profit?", a: "Absorption costing — rising inventory defers fixed OH on the balance sheet. Δprofit = Δinventory units × fixed OH/unit.", due: 4, strength: 72, reps: 3, ease: 2.45, interval: 6, last: "easy" },
    ],
  },
  {
    id: "t-abc",
    name: "Activity-based costing (ABC)",
    note: "Multiple cost pools & drivers vs a single plant-wide rate. The Part B practical.",
    cards: [
      { q: "List the 4 steps of ABC.", a: "1) Pool overhead by activity. 2) Activity rate = pool cost ÷ total driver volume. 3) Applied OH = rate × the product's driver usage. 4) Unit cost = DM + DL + (total applied OH ÷ units).", due: -1, strength: 30, reps: 1, ease: 1.95, interval: 2, last: "hard" },
      { q: "Compared to a single plant-wide rate, what does traditional costing get wrong?", a: "It over-costs high-volume simple products and under-costs low-volume complex ones. ABC corrects this with more accurate drivers.", due: 0, strength: 42, reps: 1, ease: 2.1, interval: 2, last: "hard" },
      { q: "An activity pool of $225,000 is driven by 1,500 part types. The activity rate is?", a: "$225,000 ÷ 1,500 = $150 per part type.", due: 0, strength: 48, reps: 2, ease: 2.2, interval: 4, last: "medium" },
      { q: "Is ABC simpler than traditional costing?", a: "No — ABC is more complex and costly to run, but more accurate. (Common MCQ trap.)", due: 5, strength: 80, reps: 3, ease: 2.5, interval: 7, last: "easy" },
    ],
  },
  {
    id: "t-support",
    name: "Support department allocation",
    note: "Direct method and step-down method.",
    cards: [
      { q: "How does the DIRECT method allocate support-department cost?", a: "Only to production departments, ignoring services between support depts. Denominator uses production-dept driver totals only.", due: -1, strength: 33, reps: 1, ease: 2.0, interval: 2, last: "hard" },
      { q: "What does the step-down method recognise that direct does not?", a: "Some (one-way, sequenced) services between support departments. Reciprocal method recognises all (two-way).", due: 2, strength: 64, reps: 2, ease: 2.35, interval: 5, last: "medium" },
    ],
  },
  {
    id: "t-budget",
    name: "Budgeting",
    note: "Purchases budget, participative budgeting, budgetary slack.",
    cards: [
      { q: "Write the purchases (in units) formula.", a: "Purchases = budgeted sales + desired ending inventory − beginning inventory. Beginning inv = prior period's ending inv.", due: 0, strength: 52, reps: 2, ease: 2.3, interval: 4, last: "medium" },
      { q: "A manager deliberately understates sales to make targets easy. Name it.", a: "Budgetary slack (padding).", due: 6, strength: 85, reps: 4, ease: 2.6, interval: 8, last: "easy" },
      { q: "What is participative budgeting?", a: "Employees throughout the organisation help set the budget (bottom-up), improving accuracy and buy-in.", due: 7, strength: 88, reps: 4, ease: 2.65, interval: 9, last: "easy" },
    ],
  },
];

// --- a second subject so interleaving + multi-exam scheduling is visible ---
const statsTopics: { id: string; name: string; note: string; cards: CardSpec[] }[] = [
  {
    id: "t-prob",
    name: "Probability basics",
    note: "Rules of probability, conditional probability.",
    cards: [
      { q: "State Bayes' theorem.", a: "P(A|B) = P(B|A)·P(A) / P(B).", due: 0, strength: 40, reps: 1, ease: 2.1, interval: 2, last: "hard" },
      { q: "When are two events independent?", a: "When P(A∩B) = P(A)·P(B), equivalently P(A|B) = P(A).", due: 1, strength: 58, reps: 2, ease: 2.3, interval: 4, last: "medium" },
    ],
  },
  {
    id: "t-dist",
    name: "Distributions",
    note: "Normal, binomial, expected value.",
    cards: [
      { q: "Mean and variance of a Binomial(n, p)?", a: "Mean = np; Variance = np(1−p).", due: -1, strength: 28, reps: 0, ease: 1.9, interval: 1, last: "forgot" },
      { q: "What does a z-score measure?", a: "How many standard deviations a value is from the mean: z = (x − μ) / σ.", due: 3, strength: 66, reps: 2, ease: 2.35, interval: 5, last: "medium" },
    ],
  },
];

// --- actual ACCG2000 sample-test questions, as exam-style cards ---
const EXAM_EXTRAS: Record<string, CardSpec[]> = {
  "t-service": [
    { q: "Which does the service value chain include? (i) R&D (ii) Customer support (iii) Purchasing (iv) Production/Delivery", a: "i, ii and iv. Services don't purchase raw materials, so purchasing (iii) is excluded.", due: 0, strength: 30, reps: 0, ease: 2.0, interval: 1, last: "hard" },
  ],
  "t-relevant": [
    { q: "Xebex makes 100,000 units: variable $300,000, direct fixed $100,000, allocated OH $50,000. Stopping cuts fixed 80%. Buy only if price is below?", a: "$3.80. Avoidable = $300,000 + (80%×$100,000=$80,000) = $380,000 ÷ 100,000 = $3.80. Allocated $50,000 is unavoidable — ignore.", due: 0, strength: 22, reps: 0, ease: 1.9, interval: 1, last: "forgot" },
    { q: "5,000 units sell for $20 at split-off, or process further for +$20,000 and sell at $25. Joint cost $80,000. Effect of processing further?", a: "+$5,000. ($25−$20)×5,000 − $20,000 = $5,000 increase. The $80,000 joint cost is sunk — ignore it.", due: 0, strength: 28, reps: 0, ease: 1.95, interval: 1, last: "hard" },
  ],
  "t-constraint": [
    { q: "X,Y,Z have CM $4/$5/$10 and need 1/1/5 machine hrs. Only 5,000 hrs; demand 1,000/3,000/2,000. Production plan?", a: "3,000 Y, 1,000 X, 200 Z. CM/hr = $4/$5/$2 → make Y (3,000h), X (1,000h), then 1,000h left ÷5 = 200 Z.", due: 0, strength: 25, reps: 0, ease: 1.9, interval: 1, last: "hard" },
  ],
  "t-costing": [
    { q: "Unit costs: DM $40, DL $30, var OH $2, fixed OH $5. Unit product cost under VARIABLE costing?", a: "$72 (40+30+2). Fixed OH $5 is a period cost, excluded. Absorption would be $77.", due: 0, strength: 35, reps: 0, ease: 2.0, interval: 1, last: "hard" },
  ],
  "t-abc": [
    { q: "ABC characteristics: more bases than traditional? more accurate drivers? simpler?", a: "More bases AND more accurate drivers — both true. NOT simpler (ABC is more complex/costly).", due: 0, strength: 30, reps: 0, ease: 2.0, interval: 1, last: "hard" },
    { q: "ABC practical: total OH $912,000 on 40,000 DLH. Plant-wide rate, then LEC40 (0.4h) & LEC90 (0.8h) OH/unit?", a: "Rate = 912,000÷40,000 = $22.80/DLH. LEC40 OH = 0.4×22.80 = $9.12; LEC90 = 0.8×22.80 = $18.24.", due: 0, strength: 20, reps: 0, ease: 1.85, interval: 1, last: "forgot" },
  ],
  "t-support": [
    { q: "S2 ($30,000) allocated by space. S1 1,000; P1 20,000; P2 30,000; P3 50,000 sq m. Direct-method cost to P2?", a: "$9,000. Direct method ignores S1: $30,000 × (30,000 ÷ 100,000) = $9,000.", due: 0, strength: 24, reps: 0, ease: 1.9, interval: 1, last: "hard" },
  ],
  "t-budget": [
    { q: "May sales 1,575; April ending inv 315; May ending inv 412. Units to purchase in May?", a: "1,672 = 1,575 + 412 − 315 (purchases = sales + ending − beginning).", due: 0, strength: 33, reps: 0, ease: 2.0, interval: 1, last: "hard" },
    { q: "June sales 1,650; ending 425; beginning 412; cost $125/unit. June purchases budget ($)?", a: "$207,875. Units = 1,650 + 425 − 412 = 1,663 × $125 = $207,875.", due: 0, strength: 33, reps: 0, ease: 2.0, interval: 1, last: "hard" },
  ],
};

function buildState(): AppState {
  const cards: Card[] = [];
  const topics: AppState["topics"] = [];

  const allTopicGroups: { subjectId: string; list: typeof accgTopics }[] = [
    { subjectId: "s-accg", list: accgTopics },
    { subjectId: "s-stat", list: statsTopics },
  ];

  for (const grp of allTopicGroups) {
    for (const t of grp.list) {
      topics.push({
        id: t.id,
        subjectId: grp.subjectId,
        name: t.name,
        note: t.note,
        createdAt: addDays(T, -20),
      });
      cards.push(...mkCards(t.id, t.cards));
      cards.push(...mkCards(t.id, EXAM_EXTRAS[t.id] ?? [], "cx"));
    }
  }

  return {
    subjects: [
      { id: "s-accg", name: "ACCG2000 — Managerial Accounting", color: "chart-1", createdAt: addDays(T, -20) },
      { id: "s-stat", name: "STAT1000 — Statistics", color: "chart-2", createdAt: addDays(T, -20) },
    ],
    topics,
    cards,
    reviews: [], // no fabricated history — every review is earned by the learner
    exams: [
      {
        id: "e-accg",
        subjectId: "s-accg",
        name: "ACCG2000 In-class Test",
        date: addDays(T, 2),
        topicIds: accgTopics.map((t) => t.id),
      },
      {
        id: "e-stat",
        subjectId: "s-stat",
        name: "STAT1000 Quiz 2",
        date: addDays(T, 9),
        topicIds: statsTopics.map((t) => t.id),
      },
    ],
    sessions: [], // no fake focus sessions
    activityDates: [], // streak starts at 0 until the learner actually studies
    xp: 0,
  };
}

export const SEED: AppState = buildState();
