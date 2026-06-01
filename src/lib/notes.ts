// Plain-English, colloquial theory notes — written like you'd explain it to a
// mate, not like a textbook. Keyed by topic id. Static reference content (not
// user data), so it lives here rather than in the store.
//
// Inline **bold** is supported by the renderer.

export type NoteBlock =
  | { t: "gist"; text: string } // the one-line TL;DR
  | { t: "p"; text: string } // a normal paragraph
  | { t: "points"; items: string[] } // bullet list
  | { t: "rule"; label?: string; text: string } // formula / decision rule box
  | { t: "trap"; text: string }; // common exam trap / "watch out"

export const NOTES: Record<string, NoteBlock[]> = {
  "t-service": [
    { t: "gist", text: "Service firms don't make *stuff*, they do *stuff* — so costing is about people's time and customer contact, not raw materials." },
    {
      t: "points",
      items: [
        "**Professional service firm** = tons of contact, very few clients, everything's custom. Think lawyers, consultants. (High touch, low volume.)",
        "**Service shop** = the middle ground — medium contact, medium volume. Like a car repair place.",
        "**Mass service firm** = barely any one-on-one contact, huge volume, everyone gets the same thing. Think a bank branch or public transport.",
      ],
    },
    { t: "p", text: "The **value chain** for a service is R&D/design → marketing → actually delivering the service → customer support. Notice what's *missing*: there's no buying raw materials, because you're not building a physical product." },
    { t: "p", text: "**Job costing** kicks in when each job is its own custom thing and you don't do many of them — so you track each one separately (like one audit engagement)." },
    { t: "trap", text: "If a question lists 'purchasing' or 'raw materials' as part of a service value chain — that's the bait. Services don't do that." },
  ],
  "t-relevant": [
    { t: "gist", text: "Only count money that (1) happens in the future AND (2) actually changes depending on which option you pick. Everything else is noise — ignore it." },
    { t: "rule", label: "The whole rule", text: "Relevant cost = FUTURE  +  DIFFERS between options" },
    {
      t: "points",
      items: [
        "**Sunk cost** = already spent, can't get it back. Totally irrelevant. Don't cry over spilt milk — it doesn't change your decision.",
        "**Make-or-buy** = compare what you'd actually save by stopping vs the price to buy it in.",
        "**Special order** = got spare capacity? Say yes if the price beats just the *extra* cost of making it. Your normal fixed costs don't count — they're there either way.",
        "**Sell now or process further** = the cost to get to the split-off point is already spent (sunk). Only compare the *extra* revenue vs the *extra* cost of processing more.",
      ],
    },
    { t: "rule", label: "Make-or-buy max price", text: "Highest price you'd pay to buy = variable cost to make + the fixed cost you'd actually avoid" },
    { t: "trap", text: "Allocated overhead that keeps running no matter what = irrelevant. They love to throw it in to tempt you into counting it." },
  ],
  "t-constraint": [
    { t: "gist", text: "When you can't make everything, don't chase the biggest profit *per unit* — chase the biggest profit *per hour* (or whatever the scarce thing is)." },
    { t: "rule", label: "Do this", text: "CM per unit ÷ scarce resource used per unit  →  rank highest first  →  make to demand, top down, until you run out" },
    { t: "p", text: "So a product with a smaller margin can win if it barely uses any of the scarce resource. It's about bang-for-buck on the bottleneck, not the headline margin." },
    { t: "p", text: "Worked example: X/Y/Z have CM $4/$5/$10 but use 1/1/5 machine hours. Per hour that's $4/$5/$2 — so Y wins, then X, and poor Z is last even though it has the biggest margin." },
  ],
  "t-costing": [
    { t: "gist", text: "Same costs, two ways to slice them. The ONLY difference is where fixed factory overhead goes." },
    {
      t: "points",
      items: [
        "**Variable costing**: a unit costs DM + DL + variable overhead. Fixed factory overhead is treated as a 'period cost' — expensed now, not stuck onto units.",
        "**Absorption costing**: same as above but you ALSO bake a slice of fixed overhead into every unit.",
      ],
    },
    { t: "rule", label: "Profit gap", text: "Profit difference = change in inventory (units) × fixed overhead per unit" },
    { t: "p", text: "Make more than you sell (inventory goes up)? Absorption looks *more* profitable — because some fixed cost is hiding in the unsold inventory on the balance sheet instead of hitting the income statement." },
  ],
  "t-abc": [
    { t: "gist", text: "Instead of dumping ALL overhead onto products with one blunt rate, ABC splits overhead into activities and charges each product for what it actually uses." },
    { t: "rule", label: "The 4 steps", text: "1. Pool overhead by activity\n2. Rate = pool cost ÷ total driver\n3. Applied = rate × that product's usage\n4. Unit cost = DM + DL + (total applied OH ÷ units)" },
    { t: "p", text: "Why anyone cares: the old single-rate method **overcharges** simple high-volume products and **undercharges** the fiddly, complex low-volume ones. So a company can think its complex product is profitable when it's actually bleeding money. ABC fixes that distortion." },
    { t: "trap", text: "ABC is NOT 'simpler'. It's more accurate but more work and more cost to run. If an option says ABC is easy/simple, that's wrong." },
  ],
  "t-support": [
    { t: "gist", text: "Support departments (IT, maintenance, HR) don't make the product, so their costs get pushed onto the departments that do." },
    {
      t: "points",
      items: [
        "**Direct method** = shove each support cost straight onto the production departments. Ignore the fact that support depts help each other. Simplest.",
        "**Step-down method** = go in order, biggest helper first, passing cost down the line. One-way only — nothing flows back up. More accurate.",
        "**Reciprocal method** = full two-way, everyone helps everyone. Most accurate, but you basically never hand-calculate it.",
      ],
    },
    { t: "rule", label: "Direct method to a production dept", text: "= support cost × (that dept's share ÷ total of the PRODUCTION depts only)" },
    { t: "trap", text: "In the direct method, leave the other support dept out of the denominator entirely. Only the production departments count." },
  ],
  "t-budget": [
    { t: "gist", text: "Budgets are just plans written in numbers. For the test: nail the purchases formula and two buzzwords." },
    { t: "rule", label: "Purchases (in units)", text: "= budgeted sales + desired ending stock − what you already have (beginning stock)" },
    { t: "p", text: "Heads up: this month's beginning stock = last month's ending stock. Then multiply units by cost per unit to get the dollar figure." },
    {
      t: "points",
      items: [
        "**Participative budgeting** = everyone across the org helps set the budget. More realistic, more buy-in.",
        "**Budgetary slack (padding)** = sandbagging — lowballing your sales or overstating costs so your targets are easy to beat and you look good.",
      ],
    },
  ],
  "t-prob": [
    { t: "gist", text: "Probability is just 'how likely is this', on a scale from 0 (never) to 1 (always)." },
    { t: "rule", label: "Bayes", text: "P(A|B) = P(B|A) × P(A) ÷ P(B)" },
    { t: "p", text: "Two events are **independent** if one happening tells you nothing about the other — formally P(A and B) = P(A) × P(B)." },
  ],
  "t-dist": [
    { t: "gist", text: "A distribution just describes how likely each possible outcome is." },
    { t: "rule", label: "Binomial(n, p)", text: "Mean = n·p     Variance = n·p·(1 − p)" },
    { t: "p", text: "A **z-score** tells you how many standard deviations a value sits from the mean: z = (x − mean) ÷ standard deviation. Positive = above average, negative = below." },
  ],
};
