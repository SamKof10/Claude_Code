export interface NuanceWord {
  word: string;
  nuance: string;
  example: string;
}

export interface NuanceLadder {
  id: string;
  concept: string;
  basic: string;
  words: NuanceWord[];
}

export const NUANCE_LADDERS: NuanceLadder[] = [
  {
    id: "important",
    concept: "important",
    basic: "important",
    words: [
      { word: "significant", nuance: "noteworthy, has a measurable effect", example: "There's been a significant increase in remote work." },
      { word: "crucial", nuance: "necessary for something to succeed", example: "Getting the timing right is crucial." },
      { word: "essential", nuance: "absolutely required, non-negotiable", example: "Trust is essential in any partnership." },
      { word: "fundamental", nuance: "basic, foundational — everything else depends on it", example: "This is a fundamental principle of good design." },
      { word: "pivotal", nuance: "marks a decisive turning point", example: "This was a pivotal moment in her career." },
      { word: "paramount", nuance: "more important than anything else — formal, high register", example: "Safety is paramount in this industry." },
    ],
  },
  {
    id: "said",
    concept: "said",
    basic: "said",
    words: [
      { word: "stated", nuance: "formal, factual, on the record", example: "She stated that the results would be published in June." },
      { word: "argued", nuance: "gave reasons to support a position", example: "He argued that the policy would backfire." },
      { word: "claimed", nuance: "asserted something that may be disputed", example: "The company claimed the delay was unavoidable." },
      { word: "remarked", nuance: "made a casual, often incidental observation", example: "She remarked that the office felt emptier lately." },
      { word: "noted", nuance: "pointed something out, often factually", example: "The report noted a sharp rise in costs." },
      { word: "pointed out", nuance: "drew attention to something others may have missed", example: "He pointed out a flaw in the plan." },
    ],
  },
  {
    id: "big",
    concept: "big",
    basic: "big",
    words: [
      { word: "substantial", nuance: "formal, describes a large amount or degree", example: "They made a substantial investment in R&D." },
      { word: "considerable", nuance: "noteworthy in size or amount", example: "This requires considerable effort." },
      { word: "sizeable", nuance: "fairly large — slightly more casual than 'substantial'", example: "We have a sizeable audience in Germany." },
      { word: "vast", nuance: "enormous in scale, often spatial or abstract", example: "There's a vast difference between the two approaches." },
      { word: "massive", nuance: "informal, emphatic — very large", example: "That was a massive mistake." },
      { word: "significant", nuance: "large enough to matter or have an effect", example: "A significant portion of users never finish onboarding." },
    ],
  },
  {
    id: "good",
    concept: "good",
    basic: "good",
    words: [
      { word: "solid", nuance: "dependable, reliably good — not flashy", example: "It was a solid performance overall." },
      { word: "decent", nuance: "adequate, acceptable — mildly informal", example: "The food was decent, nothing special." },
      { word: "excellent", nuance: "clearly above average, strong praise", example: "Excellent work on the proposal." },
      { word: "outstanding", nuance: "exceptionally good, stands out from the rest", example: "Her results were outstanding this quarter." },
      { word: "exceptional", nuance: "rare, well above the norm", example: "He showed exceptional judgement under pressure." },
      { word: "superb", nuance: "very high praise, slightly more elegant register", example: "The venue was superb." },
    ],
  },
  {
    id: "bad",
    concept: "bad",
    basic: "bad",
    words: [
      { word: "poor", nuance: "below an expected standard, neutral-formal", example: "The turnout was poor this year." },
      { word: "mediocre", nuance: "average, unimpressive, not outright bad", example: "The sequel was mediocre at best." },
      { word: "subpar", nuance: "below an accepted standard — common in professional feedback", example: "The service was subpar for the price." },
      { word: "disappointing", nuance: "worse than expected or hoped for", example: "Sales figures were disappointing this quarter." },
      { word: "dreadful", nuance: "informal, emphatic — really bad", example: "The traffic this morning was dreadful." },
      { word: "appalling", nuance: "shockingly bad, often with a moral or ethical edge", example: "The working conditions were appalling." },
    ],
  },
  {
    id: "think",
    concept: "think",
    basic: "think",
    words: [
      { word: "believe", nuance: "a settled opinion, often values-based", example: "I believe transparency builds trust." },
      { word: "reckon", nuance: "informal, mainly British — a casual opinion", example: "I reckon it'll rain later." },
      { word: "assume", nuance: "take something as true without proof", example: "I assumed you'd already seen the email." },
      { word: "suspect", nuance: "think something is likely, with a hint of doubt", example: "I suspect the numbers were adjusted." },
      { word: "consider", nuance: "think about carefully, weigh up", example: "We should consider all the options first." },
      { word: "be convinced that", nuance: "strong, confident belief", example: "I'm convinced that this is the right call." },
    ],
  },
  {
    id: "show",
    concept: "show",
    basic: "show",
    words: [
      { word: "demonstrate", nuance: "formal — prove something with evidence", example: "The study demonstrates a clear correlation." },
      { word: "reveal", nuance: "uncover something previously hidden", example: "The interview revealed a side of him few people knew." },
      { word: "indicate", nuance: "suggest, point towards — softer than 'prove'", example: "Early results indicate a positive trend." },
      { word: "highlight", nuance: "draw specific attention to something", example: "The report highlights three key risks." },
      { word: "illustrate", nuance: "make something clear through example", example: "Let me illustrate that with a real case." },
      { word: "underscore", nuance: "emphasise the importance of something already known", example: "This only underscores how urgent the issue is." },
    ],
  },
  {
    id: "problem",
    concept: "problem",
    basic: "problem",
    words: [
      { word: "issue", nuance: "neutral, formal — a matter to deal with", example: "There's an issue with the billing system." },
      { word: "challenge", nuance: "frames a problem more positively, as something to overcome", example: "Scaling the team is our biggest challenge right now." },
      { word: "obstacle", nuance: "something actively blocking progress", example: "Funding remains the main obstacle." },
      { word: "setback", nuance: "a problem that causes delay or a step backwards", example: "Losing the client was a real setback." },
      { word: "dilemma", nuance: "a difficult choice between two options", example: "We're facing a dilemma: speed or quality." },
      { word: "predicament", nuance: "a difficult, often confusing situation", example: "He found himself in a genuine predicament." },
    ],
  },
];

export interface Connector {
  id: string;
  phrase: string;
  function: "addition" | "contrast" | "cause-effect" | "concession" | "emphasis" | "example" | "conclusion";
  example: string;
}

export const CONNECTOR_GROUPS: Record<Connector["function"], string> = {
  addition: "Adding a point",
  contrast: "Contrasting ideas",
  "cause-effect": "Cause & effect",
  concession: "Conceding a point",
  emphasis: "Emphasising",
  example: "Giving an example",
  conclusion: "Concluding",
};

export const CONNECTORS: Connector[] = [
  { id: "c-furthermore", phrase: "Furthermore, …", function: "addition", example: "Furthermore, the data suggests the trend is accelerating." },
  { id: "c-moreover", phrase: "Moreover, …", function: "addition", example: "Moreover, the cost of inaction is rising every year." },
  { id: "c-whats-more", phrase: "What's more, …", function: "addition", example: "What's more, the new system is actually cheaper to run." },
  { id: "c-however", phrase: "However, …", function: "contrast", example: "However, not everyone agrees with this reading of the data." },
  { id: "c-that-said", phrase: "That said, …", function: "contrast", example: "That said, the risks shouldn't be underestimated." },
  { id: "c-whereas", phrase: "…, whereas …", function: "contrast", example: "The old system was rigid, whereas this one adapts in real time." },
  { id: "c-as-a-result", phrase: "As a result, …", function: "cause-effect", example: "As a result, productivity dropped noticeably." },
  { id: "c-consequently", phrase: "Consequently, …", function: "cause-effect", example: "Consequently, several team members left within a year." },
  { id: "c-given-that", phrase: "Given that …", function: "cause-effect", example: "Given that costs are rising, we need a new plan." },
  { id: "c-admittedly", phrase: "Admittedly, …", function: "concession", example: "Admittedly, the first version had serious flaws." },
  { id: "c-even-so", phrase: "Even so, …", function: "concession", example: "Even so, the project was ultimately worth it." },
  { id: "c-that-being-said", phrase: "That being said, …", function: "concession", example: "That being said, I still think we made the right call." },
  { id: "c-crucially", phrase: "Crucially, …", function: "emphasis", example: "Crucially, the team was never consulted beforehand." },
  { id: "c-notably", phrase: "Notably, …", function: "emphasis", example: "Notably, none of the competitors offer this feature." },
  { id: "c-indeed", phrase: "Indeed, …", function: "emphasis", example: "Indeed, the results exceeded every expectation." },
  { id: "c-for-instance", phrase: "For instance, …", function: "example", example: "For instance, sales rose by 40% in just one quarter." },
  { id: "c-case-in-point", phrase: "A case in point is …", function: "example", example: "A case in point is the recent rollout in Berlin." },
  { id: "c-ultimately", phrase: "Ultimately, …", function: "conclusion", example: "Ultimately, the decision comes down to trust." },
  { id: "c-all-things-considered", phrase: "All things considered, …", function: "conclusion", example: "All things considered, it was the right decision." },
  { id: "c-in-short", phrase: "In short, …", function: "conclusion", example: "In short, the plan needs more time, not more money." },
];

export interface AdvancedIdiom {
  id: string;
  phrase: string;
  meaning: string;
  meaningDe: string;
  example: string;
}

export const ADVANCED_IDIOMS: AdvancedIdiom[] = [
  {
    id: "elephant-in-the-room",
    phrase: "the elephant in the room",
    meaning: "an obvious problem that everyone notices but avoids discussing",
    meaningDe: "das Thema, das alle sehen, aber niemand anspricht",
    example: "Nobody wanted to mention the elephant in the room: the budget was already gone.",
  },
  {
    id: "double-edged-sword",
    phrase: "a double-edged sword",
    meaning: "something that has both a significant advantage and a significant disadvantage",
    meaningDe: "ein zweischneidiges Schwert",
    example: "Remote work is a double-edged sword — more freedom, but less spontaneous collaboration.",
  },
  {
    id: "read-between-the-lines",
    phrase: "read between the lines",
    meaning: "understand a hidden or implied meaning, not just what's literally said",
    meaningDe: "zwischen den Zeilen lesen",
    example: "If you read between the lines, they're clearly not happy with the results.",
  },
  {
    id: "tip-of-the-iceberg",
    phrase: "the tip of the iceberg",
    meaning: "a small, visible part of a much bigger problem",
    meaningDe: "die Spitze des Eisbergs",
    example: "The layoffs are just the tip of the iceberg — the whole department is being restructured.",
  },
  {
    id: "par-for-the-course",
    phrase: "par for the course",
    meaning: "typical, expected — not surprising given the circumstances",
    meaningDe: "normal, wie zu erwarten",
    example: "Delays like this are par for the course with construction projects.",
  },
  {
    id: "blessing-in-disguise",
    phrase: "a blessing in disguise",
    meaning: "something that seems bad at first but turns out to be good",
    meaningDe: "ein Glück im Unglück",
    example: "Losing that job was a blessing in disguise — it pushed me to start my own business.",
  },
  {
    id: "back-to-square-one",
    phrase: "back to square one",
    meaning: "back to the starting point, with no progress made",
    meaningDe: "wieder ganz am Anfang stehen",
    example: "The client rejected the whole concept, so it's back to square one.",
  },
  {
    id: "get-the-ball-rolling",
    phrase: "get the ball rolling",
    meaning: "start a process or activity",
    meaningDe: "den Stein ins Rollen bringen",
    example: "Let's get the ball rolling by assigning first tasks today.",
  },
];

export interface RhetoricalDevice {
  id: string;
  name: string;
  description: string;
  example: string;
}

export const RHETORICAL_DEVICES: RhetoricalDevice[] = [
  {
    id: "rhetorical-question",
    name: "Rhetorical question",
    description: "A question asked to make a point, not to get an answer.",
    example: "How much longer can we keep ignoring the data?",
  },
  {
    id: "tricolon",
    name: "Tricolon (rule of three)",
    description: "Listing three parallel words or phrases for rhythm and emphasis.",
    example: "It was faster, cheaper, and simpler than anything we'd tried before.",
  },
  {
    id: "anaphora",
    name: "Anaphora",
    description: "Repeating the same word or phrase at the start of successive clauses for emphasis.",
    example: "We need change. We need it now. We need it to last.",
  },
  {
    id: "understatement",
    name: "Understatement",
    description: "Deliberately downplaying something for ironic or persuasive effect.",
    example: "Losing the entire client base was, let's say, not ideal.",
  },
  {
    id: "antithesis",
    name: "Antithesis",
    description: "Placing two contrasting ideas side by side to sharpen the point.",
    example: "It's not that we lack ideas — we lack the courage to act on them.",
  },
  {
    id: "hedging",
    name: "Hedging",
    description: "Softening a claim to sound careful and credible rather than absolute.",
    example: "It could be argued that the policy, while well-intentioned, missed the mark.",
  },
];
