import { addDays, subDays, subHours, subMinutes } from "date-fns";
import { uid } from "@/lib/utils";
import type {
  AIConversation,
  AIMessage,
  Exam,
  Flashcard,
  FlashcardDeck,
  Note,
  Profile,
  Quiz,
  StudyDocument,
  StudySession,
  StudyTask,
  Subject,
} from "@/lib/types";

const iso = (d: Date) => d.toISOString();

export interface DemoBundle {
  profile: Profile;
  subjects: Subject[];
  documents: StudyDocument[];
  notes: Note[];
  decks: FlashcardDeck[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  tasks: StudyTask[];
  exams: Exam[];
  sessions: StudySession[];
  conversations: AIConversation[];
  messages: AIMessage[];
}

export function buildDemoData(now: Date = new Date()): DemoBundle {
  const math: Subject = { id: uid("subj"), name: "Mathematics", icon: "Sigma", color: "subj-1", createdAt: iso(subDays(now, 210)) };
  const english: Subject = { id: uid("subj"), name: "English", icon: "BookOpen", color: "subj-2", createdAt: iso(subDays(now, 210)) };
  const physics: Subject = { id: uid("subj"), name: "Physics", icon: "Atom", color: "subj-3", createdAt: iso(subDays(now, 200)) };
  const history: Subject = { id: uid("subj"), name: "History", icon: "Landmark", color: "subj-4", createdAt: iso(subDays(now, 200)) };
  const subjects = [math, english, physics, history];

  // ── Documents ──────────────────────────────────────────────────────
  const physicsThermoContent = `Chapter 3 — Thermodynamics

3.1 Systems and Surroundings
A thermodynamic system is the specific portion of matter we choose to study; everything else is the surroundings. Systems are open (exchange matter and energy), closed (exchange energy only), or isolated (exchange neither).

3.2 The First Law of Thermodynamics
Energy cannot be created or destroyed, only converted from one form to another. For a closed system, the change in internal energy ΔU equals the heat added to the system Q minus the work done by the system W: ΔU = Q − W. This is simply conservation of energy applied to heat and work.

3.3 Heat, Work and Internal Energy
Internal energy U is the sum of the kinetic and potential energies of all particles in a system. Heat Q is energy transferred due to a temperature difference. Work W, in the gas-piston case, is the energy transferred when a gas expands or is compressed: W = PΔV at constant pressure.

3.4 The Second Law and Entropy
Heat flows spontaneously from hot to cold, never the reverse, without external work. Entropy S is a measure of disorder; the total entropy of an isolated system never decreases. This explains why some processes (like an ice cube melting) happen spontaneously while their reverse does not.

3.5 Thermodynamic Processes
Isothermal (constant temperature), adiabatic (no heat exchange), isobaric (constant pressure) and isochoric (constant volume) processes each simplify the first law differently. In an adiabatic process Q = 0, so ΔU = −W: all the work done changes the internal energy directly.

3.6 Heat Engines and Efficiency
A heat engine converts heat into work by operating in a cycle between a hot and a cold reservoir. Efficiency η = W / Q_hot is always less than 100% — the second law guarantees some heat is always rejected to the cold reservoir. The Carnot engine sets the theoretical maximum efficiency: η_carnot = 1 − T_cold / T_hot (temperatures in Kelvin).`;

  const mathFunctionsContent = `Algebra II — Functions & Graphs

Unit 4: Quadratic Functions
A quadratic function has the form f(x) = ax² + bx + c, with a ≠ 0. Its graph is a parabola. If a > 0 it opens upward with a minimum; if a < 0 it opens downward with a maximum. The vertex sits at x = −b/2a.

Solving quadratic equations: factoring, completing the square, and the quadratic formula x = (−b ± √(b² − 4ac)) / 2a. The discriminant b² − 4ac tells you the number of real roots: positive gives two, zero gives one repeated root, negative gives none (two complex roots).

Unit 5: Functions and Transformations
A function assigns exactly one output to each input. Transformations of f(x): f(x) + k shifts vertically, f(x + h) shifts horizontally, −f(x) reflects vertically, f(x)·a stretches or compresses. Composite functions (f∘g)(x) = f(g(x)) apply one function to the result of another.

Unit 6: Exponential and Logarithmic Functions
Exponential growth/decay: f(x) = a·bˣ. The logarithm is the inverse: if bˣ = y then log_b(y) = x. Key rules: log(xy) = log x + log y, log(x/y) = log x − log y, log(xⁿ) = n·log x.`;

  const englishMacbethContent = `Macbeth — Act-by-Act Summary & Themes

Act I: Three witches prophesy that Macbeth will become Thane of Cawdor and later King. The prophecy partly comes true immediately, planting the seed of ambition. Lady Macbeth pushes her hesitant husband toward murdering King Duncan.

Act II: Macbeth murders Duncan while he sleeps as a guest in Macbeth's own castle — a double betrayal of kinship and hospitality. Guilt appears immediately: Macbeth hallucinates a bloody dagger before the act and cannot say "Amen" afterward.

Act III: Macbeth, now king, has his former ally Banquo murdered to silence the part of the prophecy that promised Banquo's descendants the throne. Banquo's ghost appears at a banquet, visible only to Macbeth — the guilt motif intensifies.

Act IV: Macbeth visits the witches again and receives further prophecies that make him overconfident ("none of woman born shall harm Macbeth"). He orders the massacre of Macduff's family, escalating from ambition to pure tyranny.

Act V: Lady Macbeth, consumed by guilt, sleepwalks and obsessively tries to wash imaginary blood from her hands before dying offstage. Macduff, revealed to have been "from his mother's womb untimely ripped" (a caesarean birth), kills Macbeth, fulfilling the witches' riddle.

Central themes: unchecked ambition, the corrupting nature of power, guilt as a psychological force, and the tension between fate and free will — the witches predict, but Macbeth chooses to act.`;

  const historyWW2Content = `World War II — Overview

Causes: The Treaty of Versailles left Germany economically devastated and resentful; the global depression of the 1930s enabled the rise of fascist and militarist governments in Germany, Italy and Japan. Appeasement policy by Britain and France failed to stop German expansion.

Course of the war (Europe): Germany invaded Poland in September 1939, triggering British and French declarations of war. Blitzkrieg tactics led to the rapid fall of France in 1940. Germany invaded the Soviet Union in 1941 (Operation Barbarossa), opening a massive eastern front. The tide turned after Stalingrad (1942–43) and the D-Day landings (June 1944).

Pacific theater: Japan's attack on Pearl Harbor (December 1941) brought the United States into the war. Island-hopping campaigns and naval battles like Midway gradually pushed Japan back; the war ended after atomic bombs were dropped on Hiroshima and Nagasaki in August 1945.

Consequences: Roughly 70–85 million deaths made it the deadliest conflict in human history. The Holocaust, the systematic genocide of six million Jews and millions of others, remains its defining atrocity. The war reshaped the global order: the UN was founded, colonial empires began to dissolve, and the US and USSR emerged as rival superpowers, setting up the Cold War.`;

  const documents: StudyDocument[] = [
    {
      id: uid("doc"),
      subjectId: physics.id,
      name: "Thermodynamics — Chapter 3.pdf",
      fileType: "pdf",
      uploadDate: iso(subDays(now, 6)),
      sizeBytes: 3_400_000,
      pages: 40,
      status: "ready",
      tags: ["thermodynamics", "energy", "entropy"],
      content: physicsThermoContent,
      summary:
        "Covers the first and second laws of thermodynamics, heat/work/internal energy, the four classical processes, and heat-engine efficiency including the Carnot limit.",
      starred: true,
    },
    {
      id: uid("doc"),
      subjectId: math.id,
      name: "Algebra II — Functions & Graphs.pdf",
      fileType: "pdf",
      uploadDate: iso(subDays(now, 14)),
      sizeBytes: 2_100_000,
      pages: 24,
      status: "ready",
      tags: ["algebra", "quadratics", "functions"],
      content: mathFunctionsContent,
      summary: "Quadratic functions and the discriminant, function transformations, and exponential/logarithm rules.",
    },
    {
      id: uid("doc"),
      subjectId: math.id,
      name: "Trigonometry — Formula Sheet.pdf",
      fileType: "pdf",
      uploadDate: iso(subDays(now, 3)),
      sizeBytes: 540_000,
      pages: 4,
      status: "ready",
      tags: ["trigonometry", "formulas"],
      content:
        "Core identities: sin²θ + cos²θ = 1. tan θ = sin θ / cos θ. Sum formulas: sin(A±B) = sinA cosB ± cosA sinB, cos(A±B) = cosA cosB ∓ sinA sinB. Law of sines: a/sinA = b/sinB = c/sinC. Law of cosines: c² = a² + b² − 2ab·cosC.",
    },
    {
      id: uid("doc"),
      subjectId: english.id,
      name: "Macbeth — Act Summaries.docx",
      fileType: "docx",
      uploadDate: iso(subDays(now, 21)),
      sizeBytes: 180_000,
      pages: 9,
      status: "ready",
      tags: ["shakespeare", "tragedy", "themes"],
      content: englishMacbethContent,
      summary: "Act-by-act plot summary of Macbeth with a focus on ambition, guilt, and fate vs. free will.",
    },
    {
      id: uid("doc"),
      subjectId: history.id,
      name: "World War II — Overview.pdf",
      fileType: "pdf",
      uploadDate: iso(subDays(now, 9)),
      sizeBytes: 4_800_000,
      pages: 32,
      status: "ready",
      tags: ["ww2", "20th-century", "causes-and-effects"],
      content: historyWW2Content,
      summary: "Causes, European and Pacific theaters, and the lasting consequences of World War II.",
    },
    {
      id: uid("doc"),
      subjectId: physics.id,
      name: "Lab Report — Specific Heat Capacity.docx",
      fileType: "docx",
      uploadDate: iso(subHours(now, 20)),
      sizeBytes: 260_000,
      pages: 3,
      status: "processing",
      tags: ["lab", "calorimetry"],
      content: "Lab writeup measuring the specific heat capacity of aluminium and copper using a calorimeter.",
    },
  ];

  // ── Notes ──────────────────────────────────────────────────────────
  const notes: Note[] = [
    {
      id: uid("note"),
      subjectId: physics.id,
      title: "Thermo — first law, in my own words",
      contentHTML:
        "<h2>The first law</h2><p>Energy in a closed system is conserved: <strong>ΔU = Q − W</strong>.</p><ul><li>Q positive = heat added to the system</li><li>W positive = work done <em>by</em> the system (e.g. gas expanding)</li></ul><p>Mnemonic: heat <strong>in</strong> is positive, work <strong>out</strong> is positive.</p><h2>Second law</h2><p>Entropy of an isolated system never decreases. Explains the arrow of time — why the ice cube melts but never un-melts.</p>",
      tags: ["thermodynamics", "exam-prep"],
      pinned: true,
      createdAt: iso(subDays(now, 5)),
      updatedAt: iso(subHours(now, 30)),
    },
    {
      id: uid("note"),
      subjectId: math.id,
      title: "Quadratic formula — when to use what method",
      contentHTML:
        "<h2>Choosing a method</h2><ol><li>Factors obvious? → factor directly.</li><li>Leading coefficient is 1 and b is even? → complete the square.</li><li>Otherwise → quadratic formula, always works.</li></ol><p>Discriminant <code>b² − 4ac</code>: positive → 2 roots, zero → 1 root, negative → no real roots.</p>",
      tags: ["algebra"],
      pinned: false,
      createdAt: iso(subDays(now, 12)),
      updatedAt: iso(subDays(now, 2)),
    },
    {
      id: uid("note"),
      subjectId: english.id,
      title: "Macbeth: ambition quotes to memorize",
      contentHTML:
        '<p>"Stars, hide your fires; Let not light see my black and deep desires" — Macbeth, Act I. Shows he already knows his ambition is wrong.</p><p>"Look like the innocent flower, but be the serpent under\'t" — Lady Macbeth teaching deception.</p><p>"I am in blood stepped in so far..." — Act III, the point of no return.</p>',
      tags: ["quotes", "themes"],
      pinned: true,
      createdAt: iso(subDays(now, 18)),
      updatedAt: iso(subDays(now, 4)),
    },
    {
      id: uid("note"),
      subjectId: history.id,
      title: "WW2 causes — quick outline",
      contentHTML:
        "<h2>Long-term</h2><ul><li>Treaty of Versailles resentment</li><li>Global depression → extremism</li></ul><h2>Short-term</h2><ul><li>Failed appeasement</li><li>Invasion of Poland, Sept 1939</li></ul>",
      tags: ["causes"],
      pinned: false,
      createdAt: iso(subDays(now, 8)),
      updatedAt: iso(subDays(now, 8)),
    },
  ];

  // ── Flashcard decks & cards ───────────────────────────────────────
  const physicsDeck: FlashcardDeck = {
    id: uid("deck"),
    subjectId: physics.id,
    name: "Thermodynamics essentials",
    description: "Core laws, quantities and definitions from Chapter 3.",
    sourceDocumentId: documents[0].id,
    createdAt: iso(subDays(now, 5)),
  };
  const mathDeck: FlashcardDeck = {
    id: uid("deck"),
    subjectId: math.id,
    name: "Quadratics & functions",
    description: "Formulas and transformation rules for Algebra II.",
    sourceDocumentId: documents[1].id,
    createdAt: iso(subDays(now, 13)),
  };
  const englishDeck: FlashcardDeck = {
    id: uid("deck"),
    subjectId: english.id,
    name: "Macbeth — plot & themes",
    description: "Key events and quotes, act by act.",
    createdAt: iso(subDays(now, 17)),
  };
  const historyDeck: FlashcardDeck = {
    id: uid("deck"),
    subjectId: history.id,
    name: "WW2 key dates & terms",
    description: "Dates, battles and vocabulary.",
    createdAt: iso(subDays(now, 8)),
  };
  const decks = [physicsDeck, mathDeck, englishDeck, historyDeck];

  function makeCard(
    deckId: string,
    front: string,
    back: string,
    opts: { correct?: number; incorrect?: number; ease?: number; dueInHours?: number; reviewedHoursAgo?: number } = {}
  ): Flashcard {
    const { correct = 0, incorrect = 0, ease = 2.5, dueInHours = 0, reviewedHoursAgo } = opts;
    return {
      id: uid("card"),
      deckId,
      front,
      back,
      correctCount: correct,
      incorrectCount: incorrect,
      easeFactor: ease,
      intervalDays: Math.max(0.1, dueInHours / 24),
      nextReview: iso(addDays(now, dueInHours / 24)),
      lastReviewed: reviewedHoursAgo != null ? iso(subHours(now, reviewedHoursAgo)) : null,
    };
  }

  const flashcards: Flashcard[] = [
    makeCard(physicsDeck.id, "First law of thermodynamics?", "ΔU = Q − W — energy is conserved; internal energy change equals heat added minus work done by the system.", { correct: 4, incorrect: 1, ease: 2.6, dueInHours: -3, reviewedHoursAgo: 30 }),
    makeCard(physicsDeck.id, "What does the second law of thermodynamics say?", "Entropy of an isolated system never decreases — heat flows spontaneously from hot to cold, not the reverse.", { correct: 2, incorrect: 2, ease: 2.1, dueInHours: -20, reviewedHoursAgo: 50 }),
    makeCard(physicsDeck.id, "Adiabatic process — what's true about Q?", "Q = 0 (no heat exchange), so ΔU = −W.", { correct: 3, incorrect: 0, ease: 2.7, dueInHours: 30 }),
    makeCard(physicsDeck.id, "Carnot efficiency formula?", "η = 1 − T_cold / T_hot (temperatures in Kelvin) — the theoretical maximum for a heat engine.", { correct: 1, incorrect: 3, ease: 1.6, dueInHours: -8, reviewedHoursAgo: 15 }),
    makeCard(physicsDeck.id, "Define a closed thermodynamic system.", "A system that can exchange energy with its surroundings but not matter.", { correct: 5, incorrect: 0, ease: 2.9, dueInHours: 96 }),
    makeCard(physicsDeck.id, "Isochoric process — what's constant?", "Volume is constant, so no work is done (W = 0) and ΔU = Q.", { dueInHours: -1 }),
    makeCard(mathDeck.id, "Quadratic formula?", "x = (−b ± √(b² − 4ac)) / 2a", { correct: 6, incorrect: 1, ease: 2.8, dueInHours: 48 }),
    makeCard(mathDeck.id, "What does a negative discriminant mean?", "No real roots — the two solutions are complex conjugates.", { correct: 2, incorrect: 3, ease: 1.8, dueInHours: -5, reviewedHoursAgo: 40 }),
    makeCard(mathDeck.id, "Vertex x-coordinate of ax² + bx + c?", "x = −b / 2a", { correct: 4, incorrect: 1, ease: 2.4, dueInHours: -12, reviewedHoursAgo: 24 }),
    makeCard(mathDeck.id, "log(x) + log(y) equals?", "log(xy) — the product rule for logarithms.", { correct: 3, incorrect: 0, ease: 2.6, dueInHours: 20 }),
    makeCard(mathDeck.id, "How does f(x + h) transform the graph of f?", "Shifts it horizontally by −h (left if h > 0).", { dueInHours: -2 }),
    makeCard(englishDeck.id, "What do the witches prophesy in Act I?", "That Macbeth will become Thane of Cawdor, then King, and that Banquo's descendants will be kings.", { correct: 5, incorrect: 0, ease: 2.9, dueInHours: 60 }),
    makeCard(englishDeck.id, "How does Macbeth die?", "Killed by Macduff, who was born by caesarean section ('from his mother's womb untimely ripped') — fulfilling the prophecy.", { correct: 3, incorrect: 1, ease: 2.5, dueInHours: -6, reviewedHoursAgo: 20 }),
    makeCard(englishDeck.id, "Why does Macbeth have Banquo murdered?", "To stop Banquo's descendants from taking the throne, as the witches prophesied.", { correct: 2, incorrect: 2, ease: 2.0, dueInHours: -18, reviewedHoursAgo: 45 }),
    makeCard(historyDeck.id, "When did Germany invade Poland?", "September 1939 — the event that triggered British and French declarations of war.", { correct: 4, incorrect: 0, ease: 2.7, dueInHours: 40 }),
    makeCard(historyDeck.id, "What brought the US into WW2?", "Japan's attack on Pearl Harbor, December 1941.", { correct: 3, incorrect: 1, ease: 2.4, dueInHours: -4, reviewedHoursAgo: 10 }),
    makeCard(historyDeck.id, "What turned the tide on the Eastern Front?", "The Battle of Stalingrad, 1942–43.", { dueInHours: -10 }),
  ];

  // ── Quizzes ────────────────────────────────────────────────────────
  function mcq(prompt: string, options: string[], correctAnswer: string, topic: string, difficulty: Quiz["difficulty"], explanation: string): Quiz["questions"][number] {
    return { id: uid("q"), type: "mcq", prompt, options, correctAnswer, explanation, topic, difficulty };
  }

  const physicsQuizQuestions = [
    mcq("Which equation expresses the first law of thermodynamics?", ["ΔU = Q − W", "F = ma", "E = mc²", "PV = nRT"], "ΔU = Q − W", "First law", "easy", "The first law is conservation of energy: internal energy change equals heat in minus work done by the system."),
    mcq("In an adiabatic process, what is true?", ["Q = 0", "W = 0", "ΔU = 0", "T is constant"], "Q = 0", "Processes", "medium", "Adiabatic means no heat is exchanged with the surroundings."),
    mcq("What does entropy measure?", ["Disorder / randomness", "Temperature", "Pressure", "Mass"], "Disorder / randomness", "Second law", "easy", "Entropy quantifies disorder; the second law says it never decreases for an isolated system."),
    mcq("A Carnot engine's efficiency depends only on:", ["The reservoir temperatures", "The gas used", "The piston material", "The engine's size"], "The reservoir temperatures", "Heat engines", "hard", "η = 1 − T_cold/T_hot — only the temperatures of the two reservoirs matter."),
    mcq("Which process has constant volume?", ["Isochoric", "Isobaric", "Isothermal", "Adiabatic"], "Isochoric", "Processes", "medium", "Isochoric = constant volume, so W = 0 and ΔU = Q."),
  ];

  const completedPhysicsQuiz: Quiz = {
    id: uid("quiz"),
    subjectId: physics.id,
    documentId: documents[0].id,
    title: "Thermodynamics — Chapter 3 check",
    topics: ["First law", "Second law", "Processes", "Heat engines"],
    difficulty: "medium",
    questionTypes: ["mcq"],
    timeLimitMinutes: 10,
    questions: physicsQuizQuestions,
    status: "completed",
    createdAt: iso(subDays(now, 4)),
    startedAt: iso(subDays(now, 4)),
    completedAt: iso(subDays(now, 4)),
    answers: {
      [physicsQuizQuestions[0].id]: "ΔU = Q − W",
      [physicsQuizQuestions[1].id]: "W = 0",
      [physicsQuizQuestions[2].id]: "Disorder / randomness",
      [physicsQuizQuestions[3].id]: "The piston material",
      [physicsQuizQuestions[4].id]: "Isochoric",
    },
    score: 60,
    weakTopics: ["Processes", "Heat engines"],
  };

  const mathQuizQuestions = [
    mcq("Solve: what is the discriminant of 2x² − 4x + 2?", ["0", "4", "-8", "16"], "0", "Quadratics", "medium", "b² − 4ac = 16 − 16 = 0, so there's one repeated root."),
    mcq("f(x − 3) shifts the graph of f how?", ["Right by 3", "Left by 3", "Up by 3", "Down by 3"], "Right by 3", "Transformations", "easy", "f(x − h) shifts right by h when h is positive."),
    mcq("log_2(8) = ?", ["3", "4", "2", "8"], "3", "Logarithms", "easy", "2³ = 8, so log₂(8) = 3."),
    { id: uid("q"), type: "true-false" as const, prompt: "A negative discriminant means the quadratic has two real roots.", options: ["True", "False"], correctAnswer: "False", explanation: "A negative discriminant means no real roots (two complex roots).", topic: "Quadratics", difficulty: "easy" as const },
  ];

  const completedMathQuiz: Quiz = {
    id: uid("quiz"),
    subjectId: math.id,
    documentId: documents[1].id,
    title: "Functions & quadratics practice",
    topics: ["Quadratics", "Transformations", "Logarithms"],
    difficulty: "easy",
    questionTypes: ["mcq", "true-false"],
    timeLimitMinutes: 8,
    questions: mathQuizQuestions,
    status: "completed",
    createdAt: iso(subDays(now, 10)),
    startedAt: iso(subDays(now, 10)),
    completedAt: iso(subDays(now, 10)),
    answers: {
      [mathQuizQuestions[0].id]: "0",
      [mathQuizQuestions[1].id]: "Right by 3",
      [mathQuizQuestions[2].id]: "3",
      [mathQuizQuestions[3].id]: "False",
    },
    score: 100,
    weakTopics: [],
  };

  const olderPhysicsQuiz: Quiz = {
    ...completedPhysicsQuiz,
    id: uid("quiz"),
    title: "Energy & heat — warm-up quiz",
    createdAt: iso(subDays(now, 24)),
    startedAt: iso(subDays(now, 24)),
    completedAt: iso(subDays(now, 24)),
    score: 40,
    weakTopics: ["Second law", "Heat engines", "Processes"],
  };

  const quizzes: Quiz[] = [completedPhysicsQuiz, completedMathQuiz, olderPhysicsQuiz];

  // ── Tasks ──────────────────────────────────────────────────────────
  const tasks: StudyTask[] = [
    { id: uid("task"), title: "Finish thermodynamics problem set #4", subjectId: physics.id, description: "Questions 1–12, focus on Carnot efficiency.", deadline: iso(subHours(now, 4)), priority: "high", status: "todo", estimatedMinutes: 60, recurring: null, createdAt: iso(subDays(now, 3)), completedAt: null },
    { id: uid("task"), title: "Read Macbeth Act V", subjectId: english.id, description: "Take notes on the sleepwalking scene.", deadline: iso(addDays(now, 0)), priority: "medium", status: "todo", estimatedMinutes: 40, recurring: null, createdAt: iso(subDays(now, 2)), completedAt: null },
    { id: uid("task"), title: "Review quadratic formula flashcards", subjectId: math.id, description: "", deadline: iso(addDays(now, 0)), priority: "low", status: "in-progress", estimatedMinutes: 15, recurring: "daily", createdAt: iso(subDays(now, 30)), completedAt: null },
    { id: uid("task"), title: "Outline WW2 causes essay", subjectId: history.id, description: "Long-term vs short-term causes, 800 words.", deadline: iso(addDays(now, 2)), priority: "high", status: "todo", estimatedMinutes: 90, recurring: null, createdAt: iso(subDays(now, 1)), completedAt: null },
    { id: uid("task"), title: "Physics lab report — specific heat", subjectId: physics.id, description: "Write conclusion + error analysis.", deadline: iso(addDays(now, 1)), priority: "medium", status: "todo", estimatedMinutes: 45, recurring: null, createdAt: iso(subDays(now, 1)), completedAt: null },
    { id: uid("task"), title: "Practice trigonometry identities", subjectId: math.id, description: "", deadline: iso(addDays(now, 4)), priority: "low", status: "todo", estimatedMinutes: 30, recurring: null, createdAt: iso(now), completedAt: null },
    { id: uid("task"), title: "Submit English essay draft", subjectId: english.id, description: "Ambition as a theme in Macbeth.", deadline: iso(subDays(now, 1)), priority: "high", status: "done", estimatedMinutes: 90, recurring: null, createdAt: iso(subDays(now, 6)), completedAt: iso(subDays(now, 1)) },
    { id: uid("task"), title: "Weekly planner check-in", subjectId: null, description: "Review the week ahead every Monday.", deadline: iso(addDays(now, 6)), priority: "low", status: "todo", estimatedMinutes: 10, recurring: "weekly", createdAt: iso(subDays(now, 40)), completedAt: null },
    { id: uid("task"), title: "Flashcards: WW2 key dates", subjectId: history.id, description: "", deadline: iso(subDays(now, 2)), priority: "medium", status: "done", estimatedMinutes: 20, recurring: null, createdAt: iso(subDays(now, 9)), completedAt: iso(subDays(now, 3)) },
  ];

  // ── Exams ──────────────────────────────────────────────────────────
  function planWeek(weekNumber: number, start: Date, topics: string[], focus: string, done: boolean): Exam["studyPlan"][number] {
    return {
      weekNumber,
      label: `Week ${weekNumber}`,
      startDate: iso(start),
      endDate: iso(addDays(start, 6)),
      topics,
      focus,
      done,
    };
  }

  const mathExamDate = addDays(now, 19);
  const mathExam: Exam = {
    id: uid("exam"),
    subjectId: math.id,
    title: "Mathematics — Midterm Exam",
    date: iso(mathExamDate),
    topics: ["Quadratic functions", "Function transformations", "Logarithms", "Trigonometric identities"],
    currentLevel: "intermediate",
    availableHoursPerWeek: 5,
    studyPlan: [
      planWeek(1, subDays(mathExamDate, 19), ["Quadratic functions", "Completing the square"], "Rebuild the fundamentals before moving on.", true),
      planWeek(2, subDays(mathExamDate, 12), ["Function transformations", "Composite functions"], "Practice graph transformations daily.", false),
      planWeek(3, subDays(mathExamDate, 5), ["Practice exams", "Weak topics review"], "Timed practice + fix recurring mistakes.", false),
    ],
    createdAt: iso(subDays(now, 15)),
  };

  const physicsExamDate = addDays(now, 9);
  const physicsExam: Exam = {
    id: uid("exam"),
    subjectId: physics.id,
    title: "Physics — Thermodynamics Test",
    date: iso(physicsExamDate),
    topics: ["First & second law", "Thermodynamic processes", "Heat engines", "Entropy"],
    currentLevel: "beginner",
    availableHoursPerWeek: 4,
    studyPlan: [
      planWeek(1, subDays(physicsExamDate, 9), ["First law", "Second law"], "Nail the two laws cold — everything else builds on them.", true),
      planWeek(2, subDays(physicsExamDate, 2), ["Heat engines", "Practice exam"], "Carnot efficiency + full timed practice test.", false),
    ],
    createdAt: iso(subDays(now, 6)),
  };

  const historyExamDate = addDays(now, 34);
  const historyExam: Exam = {
    id: uid("exam"),
    subjectId: history.id,
    title: "History — World War II Assessment",
    date: iso(historyExamDate),
    topics: ["Causes of WW2", "European theater", "Pacific theater", "Consequences"],
    currentLevel: "intermediate",
    availableHoursPerWeek: 3,
    studyPlan: [
      planWeek(1, subDays(historyExamDate, 34), ["Causes of WW2"], "Long-term vs short-term causes.", false),
      planWeek(2, subDays(historyExamDate, 27), ["European theater"], "Timeline: Poland to D-Day.", false),
      planWeek(3, subDays(historyExamDate, 20), ["Pacific theater"], "Pearl Harbor to VJ Day.", false),
      planWeek(4, subDays(historyExamDate, 13), ["Consequences", "Practice essays"], "Cold War setup + essay practice.", false),
      planWeek(5, subDays(historyExamDate, 6), ["Full review", "Practice exam"], "Timed practice + weak-topic cleanup.", false),
    ],
    createdAt: iso(subDays(now, 2)),
  };

  const exams = [mathExam, physicsExam, historyExam];

  // ── Study sessions (8 weeks of history, for charts + streak) ──────
  const sessions: StudySession[] = [];
  const sessionSubjects = [math.id, english.id, physics.id, history.id];
  for (let dayOffset = 55; dayOffset >= 0; dayOffset--) {
    const day = subDays(now, dayOffset);
    const weekday = day.getDay();
    // Skip some days to create a realistic, imperfect pattern (and a real streak).
    const skip = dayOffset > 6 && (weekday === 0 || (dayOffset % 7 === 3 && dayOffset % 21 !== 0));
    if (skip) continue;
    const sessionsToday = 1 + Math.floor(Math.random() * 2);
    for (let s = 0; s < sessionsToday; s++) {
      const subjectId = sessionSubjects[Math.floor(Math.random() * sessionSubjects.length)];
      const types: StudySession["type"][] = ["flashcards", "quiz", "reading", "notes", "ai-tutor", "document"];
      sessions.push({
        id: uid("sess"),
        subjectId,
        date: iso(subMinutes(day, Math.floor(Math.random() * 400))),
        durationMinutes: 15 + Math.floor(Math.random() * 50),
        type: types[Math.floor(Math.random() * types.length)],
      });
    }
  }
  // Guarantee today has a session so "today's study time" reads naturally.
  sessions.push({ id: uid("sess"), subjectId: physics.id, date: iso(subHours(now, 2)), durationMinutes: 35, type: "flashcards" });
  sessions.push({ id: uid("sess"), subjectId: math.id, date: iso(subHours(now, 5)), durationMinutes: 25, type: "document" });

  // ── AI Tutor conversation ─────────────────────────────────────────
  const conversation: AIConversation = {
    id: uid("conv"),
    subjectId: physics.id,
    documentId: documents[0].id,
    mode: "simplify",
    title: "Explain thermodynamics like I'm 15",
    createdAt: iso(subDays(now, 5)),
    updatedAt: iso(subDays(now, 5)),
  };
  const messages: AIMessage[] = [
    { id: uid("msg"), conversationId: conversation.id, role: "user", content: "Explain chapter 3 like I'm 15.", createdAt: iso(subDays(now, 5)) },
    {
      id: uid("msg"),
      conversationId: conversation.id,
      role: "assistant",
      content:
        "Sure! Think of energy like money in a bank account.\n\n**The first law** just says you can't create money from nothing — if your balance changes, it's because money came in or went out. In physics: `ΔU = Q − W`. Heat coming in (Q) adds to your account; work your system does on the outside world (W) takes money out.\n\n**The second law** says money naturally flows from the rich account to the poor one, never the other way around by itself — that's why a hot cup of coffee cools down instead of getting hotter on its own. That 'never spontaneously reverses' idea is entropy always increasing.\n\nWant me to walk through a Carnot engine example next, or quiz you on this?",
      createdAt: iso(subDays(now, 5)),
    },
  ];

  // ── Profile ────────────────────────────────────────────────────────
  const profile: Profile = {
    id: uid("user"),
    name: "Alex Rivera",
    email: "alex@example.com",
    school: "Lincoln High School",
    grade: "11th Grade",
    schoolYear: "2025 / 2026",
    learningGoals: ["Improve physics problem-solving", "Keep a daily study streak", "Be exam-ready a week early"],
    preferredStudyTime: "evening",
    onboarded: true,
    streakDays: 6,
    lastActiveDate: iso(now),
    aiUsage: { used: 128, limit: 500 },
    createdAt: iso(subDays(now, 210)),
  };

  return { profile, subjects, documents, notes, decks, flashcards, quizzes, tasks, exams, sessions, conversations: [conversation], messages };
}
