// Standalone Quizzes section — practice questions at four difficulty tiers.
// Separate from Learning (teach→quiz) and Recall (flashcards). Every answer
// gives instant, kind, explanatory feedback; there are no shame screens.

export type Difficulty = "easy" | "medium" | "hard" | "exam";

export interface QuizQ {
  id: string;
  topicId: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  answer: number;
  explain: string;
}

export const DIFFICULTIES: {
  key: Difficulty;
  label: string;
  blurb: string;
  icon: string;
  token: string;
}[] = [
  { key: "easy", label: "Easy", blurb: "Warm-up — definitions & spotting the right idea", icon: "🌱", token: "chart-3" },
  { key: "medium", label: "Medium", blurb: "Apply it — one-step calcs & classic traps", icon: "⚡", token: "chart-2" },
  { key: "hard", label: "Hard", blurb: "Multi-step decisions with full workings", icon: "🔥", token: "chart-4" },
  { key: "exam", label: "Exam level", blurb: "Real past-test style, full difficulty", icon: "🎓", token: "chart-5" },
];

export const QUIZ_BANK: QuizQ[] = [
  // ---------------- EASY ----------------
  { id: "e1", topicId: "t-service", difficulty: "easy", question: "A firm with high contact time and very few customers is a…?", options: ["Service shop", "Professional service firm", "Mass service firm", "Manufacturer"], answer: 1, explain: "High contact + low volume + custom = professional service firm (law, consulting)." },
  { id: "e2", topicId: "t-relevant", difficulty: "easy", question: "A sunk cost is…", options: ["A future cost that differs between options", "Already incurred and can't be changed — always irrelevant", "The next-best alternative forgone", "A cost you can avoid"], answer: 1, explain: "Sunk = already spent, unchangeable, so it never affects a decision." },
  { id: "e3", topicId: "t-costing", difficulty: "easy", question: "Which cost is EXCLUDED from unit cost under variable costing?", options: ["Direct materials", "Direct labour", "Variable overhead", "Fixed manufacturing overhead"], answer: 3, explain: "Variable costing treats fixed manufacturing OH as a period cost, not a product cost." },
  { id: "e4", topicId: "t-abc", difficulty: "easy", question: "Compared to traditional costing, ABC uses…", options: ["One plant-wide overhead rate", "Multiple cost pools, each with its own driver", "No overhead at all", "Only direct labour hours"], answer: 1, explain: "ABC splits overhead into several activity pools with their own cost drivers." },
  { id: "e5", topicId: "t-budget", difficulty: "easy", question: "Employees across the organisation help set the budget. This is…", options: ["Budgetary slack", "Participative budgeting", "Imposed budgeting", "Padding"], answer: 1, explain: "Participative (bottom-up) budgeting boosts realism and buy-in." },
  { id: "e6", topicId: "t-support", difficulty: "easy", question: "The direct method allocates support-department cost to…", options: ["Other support departments first", "Only production departments", "Customers", "Nobody — it's expensed"], answer: 1, explain: "Direct method sends support costs straight to production depts, ignoring support-to-support." },
  { id: "e7", topicId: "t-constraint", difficulty: "easy", question: "With one scarce resource, products should be ranked by…", options: ["Selling price", "Contribution margin per unit", "Contribution margin per unit of the scarce resource", "Total demand"], answer: 2, explain: "Maximise contribution per unit of the bottleneck, not per unit of product." },
  { id: "e8", topicId: "t-service", difficulty: "easy", question: "Which is NOT part of a service value chain?", options: ["R&D / design", "Marketing", "Purchasing of raw materials", "Customer support"], answer: 2, explain: "Services don't buy raw materials — there's no physical product to build." },

  // ---------------- MEDIUM ----------------
  { id: "m1", topicId: "t-costing", difficulty: "medium", question: "DM $40, DL $30, variable OH $2, fixed OH $5. Unit cost under VARIABLE costing?", options: ["$72", "$77", "$70", "$75"], answer: 0, explain: "40 + 30 + 2 = $72. Fixed OH ($5) is excluded under variable costing." },
  { id: "m2", topicId: "t-budget", difficulty: "medium", question: "A manager deliberately understates expected sales so targets are easy to beat. This is…", options: ["Appropriate caution", "Participative budgeting", "Budgetary slack", "An allowance for risk"], answer: 2, explain: "Understating revenue / overstating cost to ease targets = budgetary slack (padding)." },
  { id: "m3", topicId: "t-abc", difficulty: "medium", question: "Which best describes ABC?", options: ["Fewer pools than traditional", "More pools AND more accurate cost drivers", "Simpler and cheaper to run", "Ignores overhead"], answer: 1, explain: "ABC = more pools + more accurate drivers. It's more accurate but more complex — not simpler." },
  { id: "m4", topicId: "t-relevant", difficulty: "medium", question: "A special order should generally be accepted when…", options: ["It covers full absorption cost", "There's spare capacity and price beats the incremental cost", "It uses all fixed overhead", "The customer is a regular"], answer: 1, explain: "With spare capacity, accept if price > incremental (variable) cost; existing fixed costs are irrelevant." },
  { id: "m5", topicId: "t-costing", difficulty: "medium", question: "If production exceeds sales (inventory rises), absorption-costing profit will be…", options: ["Lower than variable costing", "Higher than variable costing", "Equal to variable costing", "Always zero"], answer: 1, explain: "Rising inventory defers fixed OH on the balance sheet, so absorption profit is higher." },
  { id: "m6", topicId: "t-support", difficulty: "medium", question: "Which method recognises SOME but not all services between support departments?", options: ["Direct", "Step-down", "Reciprocal", "Plant-wide"], answer: 1, explain: "Step-down is one-way/sequenced (partial); reciprocal is full two-way; direct recognises none." },
  { id: "m7", topicId: "t-constraint", difficulty: "medium", question: "P: CM $30, 3 hrs. Q: CM $24, 2 hrs. Labour is scarce. Which is preferred?", options: ["P ($10/hr)", "Q ($12/hr)", "Equal", "Can't tell"], answer: 1, explain: "CM per hour: P = 30/3 = $10; Q = 24/2 = $12. Q wins per scarce hour." },
  { id: "m8", topicId: "t-service", difficulty: "medium", question: "Job costing suits a service when the work is…", options: ["Standardised and high-volume", "Distinct/customised and low-volume, tracked per job", "Identical for everyone", "Free of labour"], answer: 1, explain: "Job costing fits distinct, customised, low-volume services tracked individually." },

  // ---------------- HARD ----------------
  { id: "h1", topicId: "t-relevant", difficulty: "hard", question: "100,000 units: variable $300,000, direct fixed $100,000, allocated OH $50,000. Stopping cuts fixed 80%. Buy only if price <…?", options: ["$4.50", "$4.00", "$3.80", "$3.00"], answer: 2, explain: "Avoidable = 300,000 + 0.8×100,000 = 380,000 ÷ 100,000 = $3.80. Allocated $50,000 is unavoidable." },
  { id: "h2", topicId: "t-relevant", difficulty: "hard", question: "5,000 units sell $20 at split-off OR process further (+$20,000) and sell $25. Joint cost $80,000. Process further effect?", options: ["$25,000 increase", "$5,000 increase", "$21,000 increase", "$27,000 decrease"], answer: 1, explain: "(25−20)×5,000 − 20,000 = $5,000 increase. Joint $80,000 is sunk — ignore it." },
  { id: "h3", topicId: "t-constraint", difficulty: "hard", question: "X/Y/Z: CM $4/$5/$10, machine hrs 1/1/5, demand 1000/3000/2000, only 5,000 hrs. Production plan?", options: ["2,000 Z", "1,000 X, 3,000 Y, 2,000 Z", "3,000 Y, 1,000 X, 200 Z", "2,000 Z, 3,000 Y"], answer: 2, explain: "CM/hr = $4/$5/$2 → make 3,000 Y (3,000h), 1,000 X (1,000h), then 1,000h÷5 = 200 Z." },
  { id: "h4", topicId: "t-support", difficulty: "hard", question: "S2 cost $30,000 by space. P1 20,000, P2 30,000, P3 50,000 sq m (ignore S1). Direct-method cost to P2?", options: ["$8,654", "$8,571", "$9,000", "$11,250"], answer: 2, explain: "$30,000 × (30,000 ÷ 100,000) = $9,000." },
  { id: "h5", topicId: "t-abc", difficulty: "hard", question: "Activity pool $225,000 driven by 1,500 part types. Activity rate?", options: ["$150 per part type", "$225 per part type", "$1,500 per part type", "$337 per part type"], answer: 0, explain: "225,000 ÷ 1,500 = $150 per part type." },
  { id: "h6", topicId: "t-abc", difficulty: "hard", question: "Total overhead $912,000 over 40,000 direct labour hours. Plant-wide rate?", options: ["$22.80/DLH", "$2.28/DLH", "$45.60/DLH", "$912/DLH"], answer: 0, explain: "912,000 ÷ 40,000 = $22.80 per direct labour hour." },
  { id: "h7", topicId: "t-budget", difficulty: "hard", question: "May sales 1,575; April ending inv 315; May ending inv 412. Units to purchase in May?", options: ["1,478", "1,672", "1,575", "1,562"], answer: 1, explain: "Purchases = sales + ending − beginning = 1,575 + 412 − 315 = 1,672." },

  // ---------------- EXAM LEVEL ----------------
  { id: "x1", topicId: "t-budget", difficulty: "exam", question: "June sales 1,650; desired ending 425; beginning 412; cost $125/unit. June purchases budget ($)?", options: ["$153,125", "$154,750", "$204,625", "$207,875"], answer: 3, explain: "Units = 1,650 + 425 − 412 = 1,663 × $125 = $207,875." },
  { id: "x2", topicId: "t-service", difficulty: "exam", question: "Which does the service value chain include? (i) R&D (ii) Customer support (iii) Purchasing (iv) Delivery", options: ["i, ii and iii", "ii, iii and iv", "i, ii and iv", "iii and iv"], answer: 2, explain: "R&D, customer support and delivery — but NOT purchasing of raw materials." },
  { id: "x3", topicId: "t-abc", difficulty: "exam", question: "Costs that cannot be affected by any future action are: (i) differential (ii) sunk (iii) joint (iv) relevant", options: ["i and iv", "ii and iii", "ii only", "i, ii and iii"], answer: 2, explain: "Only sunk costs (ii) cannot be affected by future action." },
  { id: "x4", topicId: "t-relevant", difficulty: "exam", question: "In a make-or-buy decision, the company would…", options: ["Choose to expand or drop a product line", "Choose to accept or reject a special order", "Treat the external purchase price as relevant", "Treat all fixed overhead as irrelevant"], answer: 2, explain: "The external purchase price is the key relevant cost of buying. Not ALL fixed OH is irrelevant — avoidable fixed costs matter." },
  { id: "x5", topicId: "t-costing", difficulty: "exam", question: "Yates: DM $40, DL $30, var OH $2, fixed OH $5. Unit product cost using variable costing?", options: ["$72", "$77", "$70", "None of the above"], answer: 0, explain: "40 + 30 + 2 = $72 (fixed OH excluded)." },
  { id: "x6", topicId: "t-constraint", difficulty: "exam", question: "When employees throughout an organisation are meaningfully involved in budget setting, this is…", options: ["Budgeting slack", "Participative budgeting", "Padding the budget", "Employee-based budgeting"], answer: 1, explain: "That's participative budgeting — bottom-up involvement." },
  { id: "x7", topicId: "t-support", difficulty: "exam", question: "Using the DIRECT method, the cost of a support dept is allocated based on…", options: ["All departments' driver totals", "Only the production departments' driver totals", "Equal shares to every department", "The support departments only"], answer: 1, explain: "Direct method uses only production-department driver totals in the denominator." },

  // ---- extra ABC focus (tutor flagged ABC as a big part of the test) ----
  { id: "abc-e1", topicId: "t-abc", difficulty: "easy", question: "In ABC, overhead is assigned to products using…", options: ["A single plant-wide rate", "A cost driver for each activity", "Direct materials only", "Sales revenue"], answer: 1, explain: "ABC assigns overhead through a cost driver for each activity pool — that's what makes it more accurate." },
  { id: "abc-m1", topicId: "t-abc", difficulty: "medium", question: "An activity rate is $12 per machine hour and a product uses 1,600 machine hours. Overhead applied to that product from this activity is…", options: ["$19,200", "$133", "$1,612", "$192"], answer: 0, explain: "Applied overhead = rate × usage = $12 × 1,600 = $19,200." },
  { id: "abc-m2", topicId: "t-abc", difficulty: "medium", question: "A cost pool of $182,000 is driven by 2,800 purchase orders. The activity rate is…", options: ["$65 per order", "$50 per order", "$182 per order", "$0.015 per order"], answer: 0, explain: "$182,000 ÷ 2,800 = $65 per purchase order." },
  { id: "abc-h1", topicId: "t-abc", difficulty: "hard", question: "Total overhead $460,000 over 10,000 machine hours. A product uses 8,400 machine hours. How much machine-related overhead does it receive?", options: ["$386,400", "$46,000", "$54,762", "$460,000"], answer: 0, explain: "Rate = 460,000 ÷ 10,000 = $46/MH. Applied = $46 × 8,400 = $386,400." },
  { id: "abc-h2", topicId: "t-abc", difficulty: "hard", question: "A product gets $303,600 of overhead under ABC across 60,000 units. With DM $30 and DL $6 per unit, its ABC unit cost is…", options: ["$41.06", "$36.00", "$5.06", "$45.12"], answer: 0, explain: "Overhead per unit = 303,600 ÷ 60,000 = $5.06. Unit cost = 30 + 6 + 5.06 = $41.06." },
  { id: "abc-x1", topicId: "t-abc", difficulty: "exam", question: "Why do profits often fall when a company keeps using a single plant-wide rate as its product mix gets more complex?", options: ["It over-costs everything equally", "It under-costs complex low-volume products, so they're priced too low", "It ignores direct materials", "Fixed overhead disappears"], answer: 1, explain: "A single rate under-costs complex low-volume products, so they're unknowingly priced below true cost — ABC reveals the real cost." },
];

export function quizzesByDifficulty(d: Difficulty): QuizQ[] {
  return QUIZ_BANK.filter((q) => q.difficulty === d);
}

export function difficultyMeta(d: Difficulty) {
  return DIFFICULTIES.find((x) => x.key === d)!;
}
