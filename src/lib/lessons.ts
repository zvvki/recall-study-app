// Guided "Learn" lessons — Duolingo-style. Each topic = a few LEARN theory
// screens (plain English, with an analogy hook + highlighted key terms),
// followed by multiple-choice questions. Static content keyed by topic id.
//
// Text syntax: [[term]] → highlighted key-term chip · **word** → bold.

export type LearnBlock =
  | { t: "p"; text: string }
  | { t: "analogy"; text: string }
  | { t: "points"; items: string[] }
  | { t: "rule"; label?: string; text: string };

export type LessonScreen =
  | { kind: "learn"; title: string; blocks: LearnBlock[] }
  | { kind: "mcq"; q: string; options: string[]; answer: number; explain: string };

export const LESSONS: Record<string, LessonScreen[]> = {
  "t-service": [
    {
      kind: "learn",
      title: "Service firms sell time, not things",
      blocks: [
        { t: "p", text: "A [[service firm]] doesn't build a physical product — it delivers expertise and time. So costing is about people and customer contact, not raw materials." },
        { t: "analogy", text: "A factory counts widgets; a law firm counts billable hours." },
        {
          t: "points",
          items: [
            "[[Professional]] — heaps of contact, few clients, fully custom (lawyers, consultants)",
            "[[Service shop]] — medium contact, medium volume (a car repair place)",
            "[[Mass service]] — low contact, huge volume, standardised (banks, transport)",
          ],
        },
        { t: "p", text: "The service [[value chain]] is R&D → marketing → delivery → customer support. There's **no purchasing of raw materials** — that's the classic trap." },
      ],
    },
    { kind: "mcq", q: "A firm with high contact time and very few customers is a…?", options: ["Service shop", "Professional service firm", "Mass service firm", "Customised goods firm"], answer: 1, explain: "High contact + low volume + custom = a professional service firm (think law/consulting)." },
    { kind: "mcq", q: "Which is NOT part of a service value chain?", options: ["Customer support", "R&D / design", "Purchasing raw materials", "Delivery of the service"], answer: 2, explain: "Services don't buy raw materials — there's no physical product to build. That option is the bait." },
  ],

  "t-relevant": [
    {
      kind: "learn",
      title: "Relevant costs: future AND different",
      blocks: [
        { t: "p", text: "A cost only matters to a decision if it's in the [[future]] AND it [[differs]] between your options. Everything else is just noise." },
        { t: "analogy", text: "Choosing between two restaurants? The petrol you already burned getting hungry doesn't matter — only what each choice costs you from here." },
        { t: "rule", label: "The whole rule", text: "Relevant = FUTURE + DIFFERS" },
        {
          t: "points",
          items: [
            "[[Sunk cost]] — already spent, can't change it. Ignore it.",
            "[[Make-or-buy]] — max price to buy = variable cost + the fixed cost you'd actually avoid",
            "[[Special order]] — got spare capacity? accept if the price beats just the extra cost",
            "[[Process further]] — the joint cost before split-off is sunk; compare only extra revenue vs extra cost",
          ],
        },
      ],
    },
    { kind: "mcq", q: "Costs that can't be changed by any future action are called…?", options: ["Differential costs", "Sunk costs", "Opportunity costs", "Relevant costs"], answer: 1, explain: "Sunk = already incurred, unchangeable, always irrelevant to the decision." },
    { kind: "mcq", q: "Xebex: 100,000 units — variable $300,000, direct fixed $100,000, allocated OH $50,000. Stopping cuts fixed 80%. Buy only if price is below…?", options: ["$4.50", "$4.00", "$3.80", "$3.00"], answer: 2, explain: "Avoidable = $300,000 + (80%×$100,000 = $80,000) = $380,000 ÷ 100,000 = $3.80. Allocated $50,000 is unavoidable — ignore it." },
    { kind: "mcq", q: "5,000 units sell for $20 at split-off, or process further (+$20,000) and sell at $25. Joint cost $80,000. Effect of processing further?", options: ["$25,000 increase", "$5,000 increase", "$21,000 increase", "$27,000 decrease"], answer: 1, explain: "($25−$20)×5,000 − $20,000 = $5,000 increase. The $80,000 joint cost is sunk — ignore it." },
  ],

  "t-constraint": [
    {
      kind: "learn",
      title: "When something's scarce, rank by bang-per-bottleneck",
      blocks: [
        { t: "p", text: "If a [[limited resource]] (machine hours, labour) stops you making everything, don't rank by profit per unit — rank by [[contribution margin per unit of the scarce resource]]." },
        { t: "analogy", text: "If your oven is the bottleneck, you want the dish that earns the most per minute of oven time — not the most per plate." },
        { t: "rule", label: "Do this", text: "CM ÷ resource used per unit → rank highest first → make to demand, top down" },
        { t: "p", text: "Example: X/Y/Z have CM $4/$5/$10 but use 1/1/5 machine hours. Per hour that's $4/$5/$2 — so **Y wins, then X, then Z** even though Z has the biggest margin." },
      ],
    },
    { kind: "mcq", q: "With one limited resource, products should be ranked by…?", options: ["Contribution margin per unit", "Selling price", "Contribution margin per unit of the scarce resource", "Total demand"], answer: 2, explain: "CM per unit of the constraint maximises total contribution from the limited resource." },
    { kind: "mcq", q: "P: CM $30, needs 3 hrs. Q: CM $24, needs 2 hrs. Labour is scarce. Which wins?", options: ["P ($10/hr)", "Q ($12/hr)", "They're equal", "Can't tell"], answer: 1, explain: "CM per hour: P = 30/3 = $10; Q = 24/2 = $12. Q earns more per scarce hour." },
  ],

  "t-costing": [
    {
      kind: "learn",
      title: "Variable vs absorption: where does fixed overhead go?",
      blocks: [
        { t: "p", text: "Both methods agree on [[direct materials]], [[direct labour]] and [[variable overhead]]. The only fight is over [[fixed manufacturing overhead]]." },
        {
          t: "points",
          items: [
            "[[Variable costing]] — fixed OH is a period cost, expensed now",
            "[[Absorption costing]] — fixed OH gets baked into every unit",
          ],
        },
        { t: "analogy", text: "Under absorption, unsold stock 'hides' some fixed cost on the shelf — so making more than you sell makes profit look bigger." },
        { t: "rule", label: "Profit gap", text: "Profit difference = change in inventory (units) × fixed OH per unit" },
      ],
    },
    { kind: "mcq", q: "DM $40, DL $30, variable OH $2, fixed OH $5. Unit product cost under VARIABLE costing?", options: ["$72", "$77", "$70", "None of these"], answer: 0, explain: "Variable costing excludes fixed OH: 40 + 30 + 2 = $72. Absorption would be $77." },
    { kind: "mcq", q: "Production exceeds sales (inventory rises). Absorption profit will be…?", options: ["Lower than variable", "Higher than variable", "Equal to variable", "Always zero"], answer: 1, explain: "Rising inventory defers fixed OH on the balance sheet, so absorption profit is higher." },
  ],

  "t-abc": [
    {
      kind: "learn",
      title: "ABC: charge products for what they actually use",
      blocks: [
        { t: "p", text: "Old-school costing dumps ALL overhead onto products with one blunt rate (like direct labour hours). [[Activity-based costing]] splits overhead into [[activities]], each with its own [[cost driver]], and charges each product for what it really uses." },
        { t: "analogy", text: "Splitting a dinner bill evenly vs everyone paying for what they actually ordered. ABC is 'pay for what you ordered'." },
        { t: "rule", label: "The 4 steps", text: "1. Pool overhead by activity\n2. Rate = pool cost ÷ total driver\n3. Applied = rate × that product's usage\n4. Unit cost = DM + DL + (OH ÷ units)" },
      ],
    },
    {
      kind: "learn",
      title: "Why ABC matters",
      blocks: [
        { t: "p", text: "Traditional costing [[overcharges]] simple high-volume products and [[undercharges]] complex low-volume ones — so a company can price the complex one too low and quietly lose money." },
        { t: "p", text: "ABC is **more accurate but more work**. It is NOT the 'simple' option — that's a common exam trap." },
      ],
    },
    { kind: "mcq", q: "Which describes activity-based costing?", options: ["More cost pools than traditional", "More accurate cost drivers", "It's simpler to run", "Both 'more pools' AND 'more accurate drivers'"], answer: 3, explain: "ABC uses more pools and more accurate drivers. It is NOT simpler — it's more complex and costly." },
    { kind: "mcq", q: "An overhead pool of $225,000 is driven by 1,500 part types. The activity rate is…?", options: ["$150 per part type", "$225 per part type", "$1,500 per part type", "$0.0067 per part type"], answer: 0, explain: "Rate = pool ÷ total driver = 225,000 ÷ 1,500 = $150 per part type." },
    { kind: "mcq", q: "Total OH $912,000 over 40,000 DLH. The plant-wide overhead rate is…?", options: ["$22.80 per DLH", "$2.28 per DLH", "$45.60 per DLH", "$912 per DLH"], answer: 0, explain: "912,000 ÷ 40,000 = $22.80 per direct labour hour." },
  ],

  "t-support": [
    {
      kind: "learn",
      title: "Support departments push their costs onto production",
      blocks: [
        { t: "p", text: "[[Support departments]] (IT, maintenance, HR) don't make the product, so their costs get allocated to the [[production departments]] that do." },
        {
          t: "points",
          items: [
            "[[Direct method]] — straight onto production depts; ignore support-to-support",
            "[[Step-down]] — one-way chain, biggest helper first",
            "[[Reciprocal]] — full two-way, most accurate, rarely done by hand",
          ],
        },
        { t: "analogy", text: "The direct method splits the cleaner's wage only among the teams that make money — not among the other cleaners." },
        { t: "rule", label: "Direct method", text: "Cost to a prod dept = support cost × (its share ÷ total of the PRODUCTION depts only)" },
      ],
    },
    { kind: "mcq", q: "S2 ($30,000) is allocated by space. S1 1,000; P1 20,000; P2 30,000; P3 50,000 sq m. Direct-method cost to P2?", options: ["$8,654", "$8,571", "$9,000", "$11,250"], answer: 2, explain: "Direct method ignores S1: $30,000 × (30,000 ÷ 100,000) = $9,000." },
    { kind: "mcq", q: "Which method ignores services between support departments entirely?", options: ["Direct method", "Step-down method", "Reciprocal method", "Plant-wide method"], answer: 0, explain: "The direct method allocates straight to production depts, ignoring support-to-support services." },
  ],

  "t-budget": [
    {
      kind: "learn",
      title: "Budgets in numbers (+ two buzzwords)",
      blocks: [
        { t: "p", text: "A [[budget]] is just a plan written in numbers. For the test, nail the purchases formula and two terms." },
        { t: "rule", label: "Purchases (in units)", text: "= budgeted sales + desired ending stock − beginning stock" },
        { t: "p", text: "This month's beginning stock = last month's ending stock. Multiply units by cost per unit for the dollar figure." },
        {
          t: "points",
          items: [
            "[[Participative budgeting]] — everyone helps set it (more realistic, more buy-in)",
            "[[Budgetary slack]] — sandbagging targets so they're easy to beat and you look good",
          ],
        },
        { t: "analogy", text: "Budgetary slack is telling your boss a task takes 5 days when you know it takes 3." },
      ],
    },
    { kind: "mcq", q: "May sales 1,575; April ending inv 315; May ending inv 412. Units to purchase in May?", options: ["1,478", "1,672", "1,575", "1,562"], answer: 1, explain: "Purchases = sales + ending − beginning = 1,575 + 412 − 315 = 1,672." },
    { kind: "mcq", q: "Employees across the org help set the budget. This is…?", options: ["Budgetary slack", "Participative budgeting", "Padding", "Imposed budgeting"], answer: 1, explain: "Participative (bottom-up) budgeting involves employees — more buy-in and realism." },
    { kind: "mcq", q: "Deliberately understating sales to make targets easy is called…?", options: ["Appropriate caution", "Participation", "Budgetary slack", "Allowance for uncertainty"], answer: 2, explain: "Understating revenue / overstating costs to ease targets = budgetary slack (padding)." },
  ],
};

// ---- XP / levels ----------------------------------------------------------
export const XP_LEARN = 5;
export const XP_MCQ = 10;

export function lessonMaxXp(screens: LessonScreen[]): number {
  return screens.reduce((a, s) => a + (s.kind === "learn" ? XP_LEARN : XP_MCQ), 0);
}

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
  const into = xp - cur.min;
  return { level: i + 1, name: cur.name, into, span };
}

export function hasLesson(topicId: string): boolean {
  return (LESSONS[topicId]?.length ?? 0) > 0;
}
