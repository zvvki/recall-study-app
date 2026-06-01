// Mock-exam generator. Produces a fresh test every run by RANDOMISING the
// numbers in each question and computing the correct answer + plausible
// distractors live. Mirrors the real ACCG2000 format: 16 MCQs + 1 practical.
//
// Because answers are computed (not stored), every attempt is genuinely
// different and rewards understanding over memorising option letters.

export interface TestMCQ {
  topic: string;
  question: string;
  options: string[];
  answer: number; // index
  explain: string;
}

export interface Practical {
  title: string;
  scenario: string;
  givens: { label: string; a: string; b: string; aLabel?: string; bLabel?: string }[];
  productA: string;
  productB: string;
  required: string[];
  solution: { heading: string; lines: string[] }[];
}

export interface MockTest {
  mcqs: TestMCQ[];
  practical: Practical;
}

// ---- rng helpers ----------------------------------------------------------
const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
const money0 = (n: number) => "$" + Math.round(n).toLocaleString();
const money2 = (n: number) => "$" + n.toFixed(2);
const num = (n: number) => Math.round(n).toLocaleString();

/** Build a 4-option numeric MCQ from a correct value + distractor values. */
function numericMCQ(correct: number, distractors: number[], fmt: (n: number) => string) {
  const set: number[] = [correct];
  for (const d of distractors) {
    if (set.length >= 4) break;
    if (!set.some((x) => Math.abs(x - d) < 0.005)) set.push(d);
  }
  let k = 1;
  while (set.length < 4) {
    const v = correct + correct * 0.05 * k * (k % 2 ? 1 : -1);
    if (v > 0 && !set.some((x) => Math.abs(x - v) < 0.005)) set.push(v);
    k++;
    if (k > 20) break;
  }
  const opts = shuffle(set);
  return { options: opts.map(fmt), answer: opts.indexOf(correct) };
}

// ---- numeric generators ---------------------------------------------------
function genMakeOrBuy(): TestMCQ {
  const vper = pick([2.5, 3.0, 3.5, 4.0, 2.0]);
  const fper = pick([1.0, 1.5, 2.0, 0.5]);
  const avoid = pick([60, 70, 75, 80]);
  const units = pick([50000, 100000, 200000]);
  const allocPer = pick([0.4, 0.5, 0.6]);
  const vc = vper * units, fc = fper * units, alloc = allocPer * units;
  const correct = +(vper + (fper * avoid) / 100).toFixed(2);
  const { options, answer } = numericMCQ(
    correct,
    [+(vper + fper).toFixed(2), vper, +(correct + allocPer).toFixed(2)],
    money2
  );
  return {
    topic: "Relevant costs",
    question: `A firm makes ${num(units)} components a year. Annual costs: variable manufacturing ${money0(vc)}, direct fixed manufacturing ${money0(fc)}, allocated head-office overhead ${money0(alloc)}. If it stops producing, direct fixed cost falls by ${avoid}%. It should BUY only if the price per unit is below…?`,
    options,
    answer,
    explain: `Avoidable cost = variable ${money0(vc)} + ${avoid}% of fixed ${money0(fc)} = ${money0(vc + (fc * avoid) / 100)}. ÷ ${num(units)} = ${money2(correct)}/unit. Allocated overhead is unavoidable, so ignore it.`,
  };
}

function genPurchasesUnits(): TestMCQ {
  const S = pick([1400, 1575, 1650, 1800, 1500, 2100]);
  const B = ri(250, 420);
  const E = ri(300, 460);
  const correct = S + E - B;
  const { options, answer } = numericMCQ(correct, [S - E + B, S + E + B, S], (n) => num(n) + " units");
  return {
    topic: "Budgeting",
    question: `Budgeted sales are ${num(S)} units. Beginning inventory is ${num(B)} units and desired ending inventory is ${num(E)} units. How many units should be purchased?`,
    options,
    answer,
    explain: `Purchases = sales + desired ending − beginning = ${num(S)} + ${num(E)} − ${num(B)} = ${num(correct)} units.`,
  };
}

function genPurchasesDollars(): TestMCQ {
  const S = pick([1400, 1575, 1650, 1800, 2000]);
  const B = ri(300, 430);
  const E = ri(350, 470);
  const C = pick([100, 120, 125, 150]);
  const units = S + E - B;
  const correct = units * C;
  const { options, answer } = numericMCQ(correct, [(S - E + B) * C, (S + E + B) * C, S * C], money0);
  return {
    topic: "Budgeting",
    question: `Budgeted sales ${num(S)} units; beginning inventory ${num(B)}; desired ending inventory ${num(E)}; purchase cost ${money0(C)} per unit. What is the purchases budget in dollars?`,
    options,
    answer,
    explain: `Units = ${num(S)} + ${num(E)} − ${num(B)} = ${num(units)}. × ${money0(C)} = ${money0(correct)}.`,
  };
}

function genVariableCosting(): TestMCQ {
  const DM = ri(20, 50), DL = ri(20, 40), vOH = ri(1, 6), fOH = ri(3, 9);
  const correct = DM + DL + vOH;
  const { options, answer } = numericMCQ(correct, [correct + fOH, DM + DL, DM + DL + fOH], money0);
  return {
    topic: "Variable vs absorption",
    question: `Per-unit costs are: direct materials ${money0(DM)}, direct labour ${money0(DL)}, variable overhead ${money0(vOH)}, fixed manufacturing overhead ${money0(fOH)}. What is the unit product cost under VARIABLE costing?`,
    options,
    answer,
    explain: `Variable costing = DM + DL + variable OH = ${DM} + ${DL} + ${vOH} = ${money0(correct)}. Fixed OH (${money0(fOH)}) is a period cost, excluded.`,
  };
}

function genSupportDirect(): TestMCQ {
  const SC = pick([30000, 45000, 24000, 36000, 48000]);
  const p1 = pick([20000, 15000, 25000]);
  const p2 = pick([30000, 10000, 20000, 24000]);
  const p3 = pick([50000, 40000, 55000]);
  const otherSupport = pick([1000, 4000, 2000]);
  const total = p1 + p2 + p3;
  const correct = Math.round((SC * p2) / total);
  const { options, answer } = numericMCQ(
    correct,
    [Math.round((SC * p2) / (total + otherSupport)), Math.round(SC / 3), Math.round((SC * p1) / total)],
    money0
  );
  return {
    topic: "Support dept allocation",
    question: `Support department S has cost ${money0(SC)}, allocated on floor space. The other support dept uses ${num(otherSupport)} m², and production depts P1, P2, P3 use ${num(p1)}, ${num(p2)}, ${num(p3)} m². Using the DIRECT method, how much of S is allocated to P2?`,
    options,
    answer,
    explain: `Direct method ignores the other support dept. P2 share = ${money0(SC)} × (${num(p2)} ÷ ${num(total)}) = ${money0(correct)}.`,
  };
}

function genABCRate(): TestMCQ {
  const rate = pick([15, 20, 46, 50, 65, 150]);
  const driver = pick([1500, 2000, 2250, 2800, 10000]);
  const pool = rate * driver;
  const correct = rate;
  const { options, answer } = numericMCQ(correct, [rate * 2, rate / 2, Math.round(pool / (driver + 500))], money2);
  return {
    topic: "Activity-based costing",
    question: `An activity cost pool of ${money0(pool)} is driven by ${num(driver)} units of its cost driver. What is the activity rate?`,
    options,
    answer,
    explain: `Activity rate = pool cost ÷ total driver volume = ${money0(pool)} ÷ ${num(driver)} = ${money2(rate)} per driver unit.`,
  };
}

function genSellProcess(): TestMCQ {
  const N = pick([4000, 5000, 8000, 6000]);
  const sp = ri(15, 25);
  const add = ri(3, 8);
  const fp = sp + add;
  const FC = pick([10000, 15000, 20000, 30000]);
  const inc = add * N - FC;
  const fmt = (n: number) => (n >= 0 ? `${money0(n)} increase` : `${money0(-n)} decrease`);
  const distractors = [add * N, -FC, add * N - FC + 50000];
  // build with signed formatting (values are distinct integers)
  const set = [inc, ...distractors].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4);
  while (set.length < 4) set.push(inc + 1000 * set.length);
  const opts = shuffle(set);
  return {
    topic: "Relevant costs",
    question: `${num(N)} units can be sold for ${money0(sp)} each at split-off, OR processed further for an extra ${money0(FC)} in total and sold for ${money0(fp)} each. What is the effect on profit of processing further?`,
    options: opts.map(fmt),
    answer: opts.indexOf(inc),
    explain: `Extra revenue = (${money0(fp)} − ${money0(sp)}) × ${num(N)} = ${money0(add * N)}. Less extra cost ${money0(FC)} = ${fmt(inc)}. (Any joint cost before split-off is sunk — ignore.)`,
  };
}

function genConstrained(): TestMCQ {
  const mk = (n: string) => {
    const cm = pick([4, 5, 8, 10, 12, 6]);
    const hr = pick([1, 2, 4, 5, 3]);
    return { n, cm, hr, per: cm / hr };
  };
  let prods = [mk("P"), mk("Q"), mk("R")];
  // ensure a unique winner
  let guard = 0;
  while (prods.filter((p) => p.per === Math.max(...prods.map((x) => x.per))).length > 1 && guard < 20) {
    prods = [mk("P"), mk("Q"), mk("R")];
    guard++;
  }
  const win = prods.reduce((a, b) => (b.per > a.per ? b : a));
  const opts = [...prods.map((p) => `Product ${p.n}`), "All equally good"];
  return {
    topic: "Constrained resources",
    question: `Machine hours are the bottleneck. ${prods.map((p) => `Product ${p.n}: CM ${money0(p.cm)}/unit, ${p.hr}h each`).join("; ")}. Which should be produced FIRST?`,
    options: opts,
    answer: opts.indexOf(`Product ${win.n}`),
    explain: `Rank by CM per machine hour: ${prods.map((p) => `${p.n} = ${money2(p.per)}`).join(", ")}. ${win.n} is highest, so make it first.`,
  };
}

// ---- conceptual pool ------------------------------------------------------
const CONCEPTUAL: TestMCQ[] = [
  { topic: "Service costing", question: "A firm with high contact time and very few customers is a…", options: ["Professional service firm", "Service shop", "Mass service firm", "Manufacturer"], answer: 0, explain: "High contact + low volume + custom = professional service firm." },
  { topic: "Service costing", question: "Which is NOT part of a service value chain?", options: ["R&D / design", "Customer support", "Purchasing of raw materials", "Delivery"], answer: 2, explain: "Services don't buy raw materials — there's no physical product." },
  { topic: "Relevant costs", question: "Costs that cannot be affected by any future action are…", options: ["Differential costs", "Sunk costs", "Opportunity costs", "Relevant costs"], answer: 1, explain: "Sunk costs are already incurred and unchangeable." },
  { topic: "Activity-based costing", question: "Activity-based costing, compared to traditional costing…", options: ["Uses one plant-wide rate", "Uses more pools and more accurate drivers", "Is simpler and cheaper", "Ignores overhead"], answer: 1, explain: "ABC = more pools + more accurate drivers; more accurate but more complex." },
  { topic: "Budgeting", question: "Employees throughout the org help set the budget. This is…", options: ["Budgetary slack", "Participative budgeting", "Imposed budgeting", "Padding"], answer: 1, explain: "Participative (bottom-up) budgeting improves realism and buy-in." },
  { topic: "Budgeting", question: "Deliberately understating sales so targets are easy to beat is…", options: ["Caution", "Participation", "Budgetary slack", "Forecasting"], answer: 2, explain: "Understating revenue / overstating cost to ease targets = budgetary slack." },
  { topic: "Support dept allocation", question: "Which method recognises some, but not all, services between support depts?", options: ["Direct", "Step-down", "Reciprocal", "Plant-wide"], answer: 1, explain: "Step-down is one-way/sequenced; reciprocal is full two-way; direct recognises none." },
  { topic: "Variable vs absorption", question: "When production exceeds sales, absorption-costing profit is…", options: ["Lower than variable", "Higher than variable", "Equal to variable", "Always zero"], answer: 1, explain: "Rising inventory defers fixed OH on the balance sheet, so absorption profit is higher." },
  { topic: "Relevant costs", question: "A special order should be accepted when…", options: ["It covers full absorption cost", "There's spare capacity and price beats incremental cost", "It uses all fixed overhead", "The customer is regular"], answer: 1, explain: "With spare capacity, accept if price > incremental (variable) cost." },
  { topic: "Service costing", question: "Job costing suits a service when work is…", options: ["Standardised, high-volume", "Distinct/customised, low-volume", "Identical for all", "Free of labour"], answer: 1, explain: "Job costing fits distinct, customised, low-volume services tracked per job." },
  { topic: "Constrained resources", question: "With one scarce resource, rank products by…", options: ["CM per unit", "Selling price", "CM per unit of the scarce resource", "Demand"], answer: 2, explain: "Maximise contribution per unit of the bottleneck." },
  { topic: "Activity-based costing", question: "Traditional single-rate costing tends to…", options: ["Over-cost complex low-volume products", "Over-cost simple high-volume products and under-cost complex ones", "Be more accurate than ABC", "Use many cost drivers"], answer: 1, explain: "It over-costs simple high-volume products and under-costs complex low-volume ones; ABC corrects this." },
];

/** Shuffle a conceptual question's options so repeats still look fresh. */
function shuffleConceptual(q: TestMCQ): TestMCQ {
  const correctText = q.options[q.answer];
  const opts = shuffle(q.options);
  return { ...q, options: opts, answer: opts.indexOf(correctText) };
}

// ---- practical (parameterised ABC problem) --------------------------------
function genPractical(): Practical {
  const A = "Standard", B = "Deluxe";
  const unitsA = pick([40000, 60000]);
  const unitsB = pick([10000, 20000]);
  const dlhA = pick([0.4, 0.5]);
  const dlhB = pick([0.8, 1.0]);
  const dmA = ri(20, 35), dlA = ri(4, 8), dmB = ri(40, 60), dlB = ri(10, 16);
  const setupRate = pick([400, 500, 600]);
  const machineRate = pick([8, 10, 12]);
  const setupsA = pick([100, 150]);
  const setupsB = pick([250, 300]);
  const mhA = pick([20000, 28000]);
  const mhB = pick([12000, 14000]);

  const totalDLH = unitsA * dlhA + unitsB * dlhB;
  const setupPool = setupRate * (setupsA + setupsB);
  const machinePool = machineRate * (mhA + mhB);
  const totalOH = setupPool + machinePool;
  const pwRate = totalOH / totalDLH;

  const tradA = dmA + dlA + pwRate * dlhA;
  const tradB = dmB + dlB + pwRate * dlhB;

  const abcOHA = setupRate * setupsA + machineRate * mhA;
  const abcOHB = setupRate * setupsB + machineRate * mhB;
  const abcUnitA = dmA + dlA + abcOHA / unitsA;
  const abcUnitB = dmB + dlB + abcOHB / unitsB;

  return {
    title: "Part B — Activity-Based Costing (practical)",
    productA: A,
    productB: B,
    scenario: `A company makes two products. ${A} is high-volume and simple; ${B} is low-volume and complex. Overhead is currently applied on direct labour hours, but management suspects the costing system is distorting product costs. Total manufacturing overhead is ${money0(totalOH)}.`,
    givens: [
      { label: "Units produced", a: num(unitsA), b: num(unitsB) },
      { label: "Direct labour hours / unit", a: String(dlhA), b: String(dlhB) },
      { label: "Direct materials / unit", a: money0(dmA), b: money0(dmB) },
      { label: "Direct labour / unit", a: money0(dlA), b: money0(dlB) },
      { label: "Setups (driver)", a: num(setupsA), b: num(setupsB) },
      { label: "Machine hours (driver)", a: num(mhA), b: num(mhB) },
    ],
    required: [
      "(a) Compute the plant-wide overhead rate (on direct labour hours).",
      "(b) Find each product's unit cost under the traditional system.",
      `(c) Using ABC with two pools — Setups ${money0(setupPool)} and Machine ${money0(machinePool)} — find each product's unit cost. Comment on the difference.`,
    ],
    solution: [
      {
        heading: "(a) Plant-wide rate",
        lines: [
          `Total DLH = ${num(unitsA)}×${dlhA} + ${num(unitsB)}×${dlhB} = ${num(totalDLH)} hrs`,
          `Rate = ${money0(totalOH)} ÷ ${num(totalDLH)} = ${money2(pwRate)} per DLH`,
        ],
      },
      {
        heading: "(b) Traditional unit cost",
        lines: [
          `${A}: ${money0(dmA)} + ${money0(dlA)} + ${dlhA}×${money2(pwRate)} = ${money2(tradA)}`,
          `${B}: ${money0(dmB)} + ${money0(dlB)} + ${dlhB}×${money2(pwRate)} = ${money2(tradB)}`,
        ],
      },
      {
        heading: "(c) ABC activity rates",
        lines: [
          `Setups: ${money0(setupPool)} ÷ ${num(setupsA + setupsB)} = ${money2(setupRate)} per setup`,
          `Machine: ${money0(machinePool)} ÷ ${num(mhA + mhB)} = ${money2(machineRate)} per machine hour`,
        ],
      },
      {
        heading: "(c) ABC unit cost",
        lines: [
          `${A} OH = ${num(setupsA)}×${money2(setupRate)} + ${num(mhA)}×${money2(machineRate)} = ${money0(abcOHA)}; ÷ ${num(unitsA)} = ${money2(abcOHA / unitsA)}/unit`,
          `${A} unit cost = ${money0(dmA)} + ${money0(dlA)} + ${money2(abcOHA / unitsA)} = ${money2(abcUnitA)}`,
          `${B} OH = ${num(setupsB)}×${money2(setupRate)} + ${num(mhB)}×${money2(machineRate)} = ${money0(abcOHB)}; ÷ ${num(unitsB)} = ${money2(abcOHB / unitsB)}/unit`,
          `${B} unit cost = ${money0(dmB)} + ${money0(dlB)} + ${money2(abcOHB / unitsB)} = ${money2(abcUnitB)}`,
          `Check: ${money0(abcOHA)} + ${money0(abcOHB)} = ${money0(totalOH)} ✓`,
          `Insight: traditional ${tradB > abcUnitB ? "over" : "under"}-costs ${B} (${money2(tradB)} → ${money2(abcUnitB)}) and ${tradA < abcUnitA ? "under" : "over"}-costs ${A} (${money2(tradA)} → ${money2(abcUnitA)}).`,
        ],
      },
    ],
  };
}

// ---- assemble a full mock test --------------------------------------------
export function buildMockTest(): MockTest {
  // 10 generated numeric questions (some generators twice with fresh numbers)
  const generated: TestMCQ[] = [
    genMakeOrBuy(),
    genPurchasesUnits(),
    genPurchasesDollars(),
    genVariableCosting(),
    genSupportDirect(),
    genABCRate(),
    genSellProcess(),
    genConstrained(),
    genMakeOrBuy(),
    genVariableCosting(),
  ];
  // 6 conceptual, sampled & option-shuffled
  const concept = shuffle(CONCEPTUAL).slice(0, 6).map(shuffleConceptual);
  const mcqs = shuffle([...generated, ...concept]).slice(0, 16);
  return { mcqs, practical: genPractical() };
}
