import { addDays, subDays, subHours, subMinutes } from "date-fns";
import { uid } from "@/lib/utils";
import { currentSchoolYear } from "@/lib/school";
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
  const math: Subject = { id: uid("subj"), name: "Mathematik", icon: "Sigma", color: "subj-1", createdAt: iso(subDays(now, 210)) };
  const english: Subject = { id: uid("subj"), name: "Englisch", icon: "BookOpen", color: "subj-2", createdAt: iso(subDays(now, 210)) };
  const physics: Subject = { id: uid("subj"), name: "Physik", icon: "Atom", color: "subj-3", createdAt: iso(subDays(now, 200)) };
  const history: Subject = { id: uid("subj"), name: "Geschichte", icon: "Landmark", color: "subj-4", createdAt: iso(subDays(now, 200)) };
  const subjects = [math, english, physics, history];

  // ── Documents ──────────────────────────────────────────────────────
  const physicsThermoContent = `Kapitel 3 — Thermodynamik

3.1 System und Umgebung
Ein thermodynamisches System ist der Ausschnitt der Materie, den wir betrachten; alles andere ist die Umgebung. Systeme sind offen (Austausch von Materie und Energie), geschlossen (nur Energie) oder abgeschlossen (weder noch).

3.2 Der erste Hauptsatz der Thermodynamik
Energie kann weder erzeugt noch vernichtet, sondern nur umgewandelt werden. Für ein geschlossenes System gilt: Die Änderung der inneren Energie ΔU ist die zugeführte Wärme Q minus die vom System verrichtete Arbeit W, also ΔU = Q − W. Das ist nichts anderes als der Energieerhaltungssatz, angewandt auf Wärme und Arbeit.

3.3 Wärme, Arbeit und innere Energie
Die innere Energie U ist die Summe der kinetischen und potentiellen Energien aller Teilchen eines Systems. Wärme Q ist Energie, die aufgrund eines Temperaturunterschieds übertragen wird. Arbeit W ist im Fall von Gas und Kolben die Energie, die beim Ausdehnen oder Zusammendrücken übertragen wird: W = p·ΔV bei konstantem Druck.

3.4 Der zweite Hauptsatz und die Entropie
Wärme fließt von selbst immer von warm nach kalt, nie umgekehrt — ohne Arbeit von außen. Die Entropie S ist ein Maß für die Unordnung; die Gesamtentropie eines abgeschlossenen Systems nimmt nie ab. Das erklärt, warum manche Vorgänge (etwa das Schmelzen eines Eiswürfels) von selbst ablaufen, ihre Umkehrung aber nicht.

3.5 Thermodynamische Prozesse
Isotherm (konstante Temperatur), adiabatisch (kein Wärmeaustausch), isobar (konstanter Druck) und isochor (konstantes Volumen) — jeder Prozess vereinfacht den ersten Hauptsatz auf eigene Weise. Beim adiabatischen Prozess ist Q = 0, also ΔU = −W: Die gesamte verrichtete Arbeit geht direkt in die innere Energie.

3.6 Wärmekraftmaschinen und Wirkungsgrad
Eine Wärmekraftmaschine wandelt Wärme in Arbeit um, indem sie einen Kreisprozess zwischen einem warmen und einem kalten Reservoir durchläuft. Der Wirkungsgrad η = W / Q_warm liegt immer unter 100% — der zweite Hauptsatz garantiert, dass ein Teil der Wärme an das kalte Reservoir abgegeben wird. Der Carnot-Prozess setzt die theoretische Obergrenze: η_Carnot = 1 − T_kalt / T_warm (Temperaturen in Kelvin).`;

  const mathFunctionsContent = `Funktionen und Graphen

Kapitel 4: Quadratische Funktionen
Eine quadratische Funktion hat die Form f(x) = ax² + bx + c mit a ≠ 0. Ihr Graph ist eine Parabel. Für a > 0 ist sie nach oben geöffnet und hat ein Minimum, für a < 0 nach unten und hat ein Maximum. Der Scheitelpunkt liegt bei x = −b/2a.

Quadratische Gleichungen löst man durch Faktorisieren, quadratische Ergänzung oder mit der Lösungsformel x = (−b ± √(b² − 4ac)) / 2a. Die Diskriminante b² − 4ac verrät die Anzahl der reellen Lösungen: positiv ergibt zwei, null eine doppelte, negativ keine (zwei komplexe).

Kapitel 5: Funktionen und Transformationen
Eine Funktion ordnet jedem Eingabewert genau einen Ausgabewert zu. Transformationen von f(x): f(x) + k verschiebt senkrecht, f(x + h) waagrecht, −f(x) spiegelt an der x-Achse, a·f(x) streckt oder staucht. Die Verkettung (f∘g)(x) = f(g(x)) wendet eine Funktion auf das Ergebnis einer anderen an.

Kapitel 6: Exponential- und Logarithmusfunktionen
Exponentielles Wachstum und Zerfall: f(x) = a·bˣ. Der Logarithmus ist die Umkehrung: Ist bˣ = y, dann ist log_b(y) = x. Die wichtigsten Regeln: log(xy) = log x + log y, log(x/y) = log x − log y, log(xⁿ) = n·log x.`;

  const englishMacbethContent = `Macbeth — Zusammenfassung nach Akten und Themen

Akt I: Drei Hexen prophezeien Macbeth, er werde Thane of Cawdor und später König. Ein Teil der Prophezeiung trifft sofort ein und pflanzt den Ehrgeiz. Lady Macbeth drängt ihren zögernden Mann zum Mord an König Duncan.

Akt II: Macbeth ermordet Duncan im Schlaf, während dieser Gast in seinem eigenen Schloss ist — ein doppelter Verrat an Verwandtschaft und Gastrecht. Die Schuld zeigt sich sofort: Macbeth halluziniert vor der Tat einen blutigen Dolch und bringt danach kein „Amen“ heraus.

Akt III: Macbeth, nun König, lässt seinen früheren Verbündeten Banquo ermorden, um den Teil der Prophezeiung zu verhindern, der Banquos Nachkommen den Thron versprach. Banquos Geist erscheint beim Bankett, sichtbar nur für Macbeth — das Schuldmotiv verschärft sich.

Akt IV: Macbeth sucht die Hexen erneut auf und erhält weitere Prophezeiungen, die ihn selbstsicher machen („keiner, den ein Weib geboren, schadet Macbeth“). Er lässt Macduffs Familie ermorden — der Schritt vom Ehrgeiz zur reinen Tyrannei.

Akt V: Lady Macbeth, von Schuld zerfressen, wandelt im Schlaf und versucht zwanghaft, eingebildetes Blut von den Händen zu waschen; sie stirbt hinter der Bühne. Macduff, der „aus dem Leib der Mutter geschnitten“ wurde, tötet Macbeth und erfüllt damit das Rätsel der Hexen.

Zentrale Themen: entfesselter Ehrgeiz, die verderbende Wirkung von Macht, Schuld als psychologische Kraft und die Spannung zwischen Schicksal und freiem Willen — die Hexen sagen voraus, aber Macbeth entscheidet sich zu handeln.`;

  const historyWW2Content = `Der Zweite Weltkrieg — Überblick

Ursachen: Der Vertrag von Versailles hinterließ ein wirtschaftlich zerrüttetes und verbittertes Deutschland; die Weltwirtschaftskrise der 1930er Jahre ermöglichte den Aufstieg faschistischer und militaristischer Regierungen in Deutschland, Italien und Japan. Die Appeasement-Politik Großbritanniens und Frankreichs konnte die deutsche Expansion nicht aufhalten.

Verlauf in Europa: Deutschland überfiel im September 1939 Polen, worauf Großbritannien und Frankreich den Krieg erklärten. Die Blitzkrieg-Taktik führte 1940 zum raschen Fall Frankreichs. 1941 griff Deutschland die Sowjetunion an (Unternehmen Barbarossa) und eröffnete damit eine gewaltige Ostfront. Nach Stalingrad (1942/43) und der Landung in der Normandie (Juni 1944) wendete sich das Blatt.

Pazifik: Der japanische Angriff auf Pearl Harbor (Dezember 1941) brachte die USA in den Krieg. Das Vorrücken von Insel zu Insel und Seeschlachten wie Midway drängten Japan zurück; der Krieg endete nach den Atombombenabwürfen auf Hiroshima und Nagasaki im August 1945.

Folgen: Mit rund 70 bis 85 Millionen Toten war er der verlustreichste Konflikt der Menschheitsgeschichte. Der Holocaust, der systematische Völkermord an sechs Millionen Jüdinnen und Juden und Millionen weiteren Menschen, bleibt sein bestimmendes Verbrechen. Der Krieg ordnete die Welt neu: Die UNO wurde gegründet, die Kolonialreiche begannen zu zerfallen, und die USA und die UdSSR standen sich als rivalisierende Supermächte gegenüber — der Beginn des Kalten Krieges.`;

  const documents: StudyDocument[] = [
    {
      id: uid("doc"),
      subjectId: physics.id,
      name: "Thermodynamik — Kapitel 3.pdf",
      fileType: "pdf",
      uploadDate: iso(subDays(now, 6)),
      sizeBytes: 3_400_000,
      pages: 40,
      status: "ready",
      tags: ["thermodynamik", "energie", "entropie"],
      content: physicsThermoContent,
      summary:
        "Behandelt den ersten und zweiten Hauptsatz, Wärme, Arbeit und innere Energie, die vier klassischen Prozesse sowie den Wirkungsgrad von Wärmekraftmaschinen bis zur Carnot-Grenze.",
      starred: true,
    },
    {
      id: uid("doc"),
      subjectId: math.id,
      name: "Funktionen und Graphen.pdf",
      fileType: "pdf",
      uploadDate: iso(subDays(now, 14)),
      sizeBytes: 2_100_000,
      pages: 24,
      status: "ready",
      tags: ["algebra", "quadratische-funktionen", "funktionen"],
      content: mathFunctionsContent,
      summary: "Quadratische Funktionen und die Diskriminante, Transformationen von Funktionen sowie Exponential- und Logarithmusregeln.",
    },
    {
      id: uid("doc"),
      subjectId: math.id,
      name: "Trigonometrie — Formelsammlung.pdf",
      fileType: "pdf",
      uploadDate: iso(subDays(now, 3)),
      sizeBytes: 540_000,
      pages: 4,
      status: "ready",
      tags: ["trigonometrie", "formeln"],
      content:
        "Grundbeziehungen: sin²θ + cos²θ = 1. tan θ = sin θ / cos θ. Additionstheoreme: sin(A±B) = sinA cosB ± cosA sinB, cos(A±B) = cosA cosB ∓ sinA sinB. Sinussatz: a/sinA = b/sinB = c/sinC. Kosinussatz: c² = a² + b² − 2ab·cosC.",
    },
    {
      id: uid("doc"),
      subjectId: english.id,
      name: "Macbeth — Zusammenfassung der Akte.docx",
      fileType: "docx",
      uploadDate: iso(subDays(now, 21)),
      sizeBytes: 180_000,
      pages: 9,
      status: "ready",
      tags: ["shakespeare", "tragödie", "themen"],
      content: englishMacbethContent,
      summary: "Handlung von Macbeth Akt für Akt, mit Schwerpunkt auf Ehrgeiz, Schuld und Schicksal gegen freien Willen.",
    },
    {
      id: uid("doc"),
      subjectId: history.id,
      name: "Zweiter Weltkrieg — Überblick.pdf",
      fileType: "pdf",
      uploadDate: iso(subDays(now, 9)),
      sizeBytes: 4_800_000,
      pages: 32,
      status: "ready",
      tags: ["zweiter-weltkrieg", "20-jahrhundert", "ursachen-und-folgen"],
      content: historyWW2Content,
      summary: "Ursachen, Kriegsschauplätze in Europa und im Pazifik sowie die langfristigen Folgen des Zweiten Weltkriegs.",
    },
    {
      id: uid("doc"),
      subjectId: physics.id,
      name: "Laborbericht — Spezifische Wärmekapazität.docx",
      fileType: "docx",
      uploadDate: iso(subHours(now, 20)),
      sizeBytes: 260_000,
      pages: 3,
      status: "processing",
      tags: ["labor", "kalorimetrie"],
      content: "Protokoll zur Messung der spezifischen Wärmekapazität von Aluminium und Kupfer mit dem Kalorimeter.",
    },
  ];

  // ── Notes ──────────────────────────────────────────────────────────
  const notes: Note[] = [
    {
      id: uid("note"),
      subjectId: physics.id,
      title: "Thermo — erster Hauptsatz in eigenen Worten",
      contentHTML:
        "<h2>Erster Hauptsatz</h2><p>Im geschlossenen System bleibt die Energie erhalten: <strong>ΔU = Q − W</strong>.</p><ul><li>Q positiv = Wärme wird dem System zugeführt</li><li>W positiv = Arbeit wird <em>vom</em> System verrichtet (z. B. Gas dehnt sich aus)</li></ul><p>Merksatz: Wärme <strong>hinein</strong> ist positiv, Arbeit <strong>hinaus</strong> ist positiv.</p><h2>Zweiter Hauptsatz</h2><p>Die Entropie eines abgeschlossenen Systems nimmt nie ab. Das erklärt den Zeitpfeil — warum der Eiswürfel schmilzt, aber nie von selbst wieder gefriert.</p>",
      tags: ["thermodynamik", "prüfungsvorbereitung"],
      pinned: true,
      createdAt: iso(subDays(now, 5)),
      updatedAt: iso(subHours(now, 30)),
    },
    {
      id: uid("note"),
      subjectId: math.id,
      title: "Quadratische Gleichungen — welche Methode wann",
      contentHTML:
        "<h2>Methode wählen</h2><ol><li>Faktoren offensichtlich? → direkt faktorisieren.</li><li>Leitkoeffizient 1 und b gerade? → quadratisch ergänzen.</li><li>Sonst → Lösungsformel, funktioniert immer.</li></ol><p>Diskriminante <code>b² − 4ac</code>: positiv → 2 Lösungen, null → 1 Lösung, negativ → keine reelle Lösung.</p>",
      tags: ["algebra"],
      pinned: false,
      createdAt: iso(subDays(now, 12)),
      updatedAt: iso(subDays(now, 2)),
    },
    {
      id: uid("note"),
      subjectId: english.id,
      title: "Macbeth: Zitate zum Ehrgeiz, auswendig",
      contentHTML:
        '<p>„Stars, hide your fires; Let not light see my black and deep desires“ — Macbeth, Akt I. Zeigt: Er weiß bereits, dass sein Ehrgeiz falsch ist.</p><p>„Look like the innocent flower, but be the serpent under\'t“ — Lady Macbeth lehrt die Täuschung.</p><p>„I am in blood stepped in so far…“ — Akt III, der Punkt ohne Wiederkehr.</p>',
      tags: ["zitate", "themen"],
      pinned: true,
      createdAt: iso(subDays(now, 18)),
      updatedAt: iso(subDays(now, 4)),
    },
    {
      id: uid("note"),
      subjectId: history.id,
      title: "Ursachen Zweiter Weltkrieg — Kurzübersicht",
      contentHTML:
        "<h2>Langfristig</h2><ul><li>Verbitterung über den Vertrag von Versailles</li><li>Weltwirtschaftskrise → Extremismus</li></ul><h2>Kurzfristig</h2><ul><li>Gescheiterte Appeasement-Politik</li><li>Überfall auf Polen, September 1939</li></ul>",
      tags: ["ursachen"],
      pinned: false,
      createdAt: iso(subDays(now, 8)),
      updatedAt: iso(subDays(now, 8)),
    },
  ];

  // ── Flashcard decks & cards ───────────────────────────────────────
  const physicsDeck: FlashcardDeck = {
    id: uid("deck"),
    subjectId: physics.id,
    name: "Thermodynamik — das Wichtigste",
    description: "Hauptsätze, Größen und Definitionen aus Kapitel 3.",
    sourceDocumentId: documents[0].id,
    createdAt: iso(subDays(now, 5)),
  };
  const mathDeck: FlashcardDeck = {
    id: uid("deck"),
    subjectId: math.id,
    name: "Quadratische Funktionen",
    description: "Formeln und Transformationsregeln.",
    sourceDocumentId: documents[1].id,
    createdAt: iso(subDays(now, 13)),
  };
  const englishDeck: FlashcardDeck = {
    id: uid("deck"),
    subjectId: english.id,
    name: "Macbeth — Handlung und Themen",
    description: "Wichtige Ereignisse und Zitate, Akt für Akt.",
    createdAt: iso(subDays(now, 17)),
  };
  const historyDeck: FlashcardDeck = {
    id: uid("deck"),
    subjectId: history.id,
    name: "Zweiter Weltkrieg — Daten und Begriffe",
    description: "Daten, Schlachten und Begriffe.",
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
    makeCard(physicsDeck.id, "Erster Hauptsatz der Thermodynamik?", "ΔU = Q − W — Energie bleibt erhalten: Die Änderung der inneren Energie ist die zugeführte Wärme minus die verrichtete Arbeit.", { correct: 4, incorrect: 1, ease: 2.6, dueInHours: -3, reviewedHoursAgo: 30 }),
    makeCard(physicsDeck.id, "Was besagt der zweite Hauptsatz?", "Die Entropie eines abgeschlossenen Systems nimmt nie ab — Wärme fließt von selbst von warm nach kalt, nie umgekehrt.", { correct: 2, incorrect: 2, ease: 2.1, dueInHours: -20, reviewedHoursAgo: 50 }),
    makeCard(physicsDeck.id, "Adiabatischer Prozess — was gilt für Q?", "Q = 0 (kein Wärmeaustausch), also ΔU = −W.", { correct: 3, incorrect: 0, ease: 2.7, dueInHours: 30 }),
    makeCard(physicsDeck.id, "Formel für den Carnot-Wirkungsgrad?", "η = 1 − T_kalt / T_warm (Temperaturen in Kelvin) — das theoretische Maximum einer Wärmekraftmaschine.", { correct: 1, incorrect: 3, ease: 1.6, dueInHours: -8, reviewedHoursAgo: 15 }),
    makeCard(physicsDeck.id, "Definiere ein geschlossenes thermodynamisches System.", "Ein System, das mit der Umgebung Energie austauscht, aber keine Materie.", { correct: 5, incorrect: 0, ease: 2.9, dueInHours: 96 }),
    makeCard(physicsDeck.id, "Isochorer Prozess — was bleibt konstant?", "Das Volumen. Also wird keine Arbeit verrichtet (W = 0) und ΔU = Q.", { dueInHours: -1 }),
    makeCard(mathDeck.id, "Lösungsformel für quadratische Gleichungen?", "x = (−b ± √(b² − 4ac)) / 2a", { correct: 6, incorrect: 1, ease: 2.8, dueInHours: 48 }),
    makeCard(mathDeck.id, "Was bedeutet eine negative Diskriminante?", "Keine reelle Lösung — die beiden Lösungen sind konjugiert komplex.", { correct: 2, incorrect: 3, ease: 1.8, dueInHours: -5, reviewedHoursAgo: 40 }),
    makeCard(mathDeck.id, "x-Koordinate des Scheitelpunkts von ax² + bx + c?", "x = −b / 2a", { correct: 4, incorrect: 1, ease: 2.4, dueInHours: -12, reviewedHoursAgo: 24 }),
    makeCard(mathDeck.id, "log(x) + log(y) ergibt?", "log(xy) — die Produktregel für Logarithmen.", { correct: 3, incorrect: 0, ease: 2.6, dueInHours: 20 }),
    makeCard(mathDeck.id, "Wie verändert f(x + h) den Graphen von f?", "Verschiebt ihn waagrecht um −h (nach links, wenn h > 0).", { dueInHours: -2 }),
    makeCard(englishDeck.id, "Was prophezeien die Hexen in Akt I?", "Dass Macbeth Thane of Cawdor und dann König wird — und dass Banquos Nachkommen Könige sein werden.", { correct: 5, incorrect: 0, ease: 2.9, dueInHours: 60 }),
    makeCard(englishDeck.id, "Wie stirbt Macbeth?", "Getötet von Macduff, der per Kaiserschnitt zur Welt kam („from his mother's womb untimely ripped“) — damit erfüllt sich die Prophezeiung.", { correct: 3, incorrect: 1, ease: 2.5, dueInHours: -6, reviewedHoursAgo: 20 }),
    makeCard(englishDeck.id, "Warum lässt Macbeth Banquo ermorden?", "Damit Banquos Nachkommen nicht auf den Thron kommen, wie es die Hexen vorhergesagt haben.", { correct: 2, incorrect: 2, ease: 2.0, dueInHours: -18, reviewedHoursAgo: 45 }),
    makeCard(historyDeck.id, "Wann überfiel Deutschland Polen?", "Im September 1939 — daraufhin erklärten Großbritannien und Frankreich den Krieg.", { correct: 4, incorrect: 0, ease: 2.7, dueInHours: 40 }),
    makeCard(historyDeck.id, "Was brachte die USA in den Zweiten Weltkrieg?", "Der japanische Angriff auf Pearl Harbor im Dezember 1941.", { correct: 3, incorrect: 1, ease: 2.4, dueInHours: -4, reviewedHoursAgo: 10 }),
    makeCard(historyDeck.id, "Was wendete das Blatt an der Ostfront?", "Die Schlacht von Stalingrad, 1942/43.", { dueInHours: -10 }),
  ];

  // ── Quizzes ────────────────────────────────────────────────────────
  function mcq(prompt: string, options: string[], correctAnswer: string, topic: string, difficulty: Quiz["difficulty"], explanation: string): Quiz["questions"][number] {
    return { id: uid("q"), type: "mcq", prompt, options, correctAnswer, explanation, topic, difficulty };
  }

  const physicsQuizQuestions = [
    mcq("Welche Gleichung drückt den ersten Hauptsatz aus?", ["ΔU = Q − W", "F = ma", "E = mc²", "pV = nRT"], "ΔU = Q − W", "Erster Hauptsatz", "easy", "Der erste Hauptsatz ist der Energieerhaltungssatz: Änderung der inneren Energie = zugeführte Wärme minus verrichtete Arbeit."),
    mcq("Was gilt bei einem adiabatischen Prozess?", ["Q = 0", "W = 0", "ΔU = 0", "T ist konstant"], "Q = 0", "Prozesse", "medium", "Adiabatisch heißt: kein Wärmeaustausch mit der Umgebung."),
    mcq("Was misst die Entropie?", ["Unordnung", "Temperatur", "Druck", "Masse"], "Unordnung", "Zweiter Hauptsatz", "easy", "Die Entropie beziffert die Unordnung; nach dem zweiten Hauptsatz nimmt sie in einem abgeschlossenen System nie ab."),
    mcq("Der Wirkungsgrad einer Carnot-Maschine hängt nur ab von:", ["den Temperaturen der Reservoirs", "dem verwendeten Gas", "dem Material des Kolbens", "der Größe der Maschine"], "den Temperaturen der Reservoirs", "Wärmekraftmaschinen", "hard", "η = 1 − T_kalt/T_warm — nur die Temperaturen der beiden Reservoirs zählen."),
    mcq("Bei welchem Prozess bleibt das Volumen konstant?", ["isochor", "isobar", "isotherm", "adiabatisch"], "isochor", "Prozesse", "medium", "Isochor = konstantes Volumen, also W = 0 und ΔU = Q."),
  ];

  const completedPhysicsQuiz: Quiz = {
    id: uid("quiz"),
    subjectId: physics.id,
    documentId: documents[0].id,
    title: "Thermodynamik — Test zu Kapitel 3",
    topics: ["Erster Hauptsatz", "Zweiter Hauptsatz", "Prozesse", "Wärmekraftmaschinen"],
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
      [physicsQuizQuestions[2].id]: "Unordnung",
      [physicsQuizQuestions[3].id]: "dem Material des Kolbens",
      [physicsQuizQuestions[4].id]: "isochor",
    },
    score: 60,
    weakTopics: ["Prozesse", "Wärmekraftmaschinen"],
  };

  const mathQuizQuestions = [
    mcq("Solve: what is the discriminant of 2x² − 4x + 2?", ["0", "4", "-8", "16"], "0", "Quadratische Funktionen", "medium", "b² − 4ac = 16 − 16 = 0, so there's one repeated root."),
    mcq("Wie verschiebt f(x − 3) den Graphen von f?", ["um 3 nach rechts", "um 3 nach links", "um 3 nach oben", "um 3 nach unten"], "um 3 nach rechts", "Transformationen", "easy", "f(x − h) verschiebt um h nach rechts, wenn h positiv ist."),
    mcq("log₂(8) = ?", ["3", "4", "2", "8"], "3", "Logarithmen", "easy", "2³ = 8, so log₂(8) = 3."),
    { id: uid("q"), type: "true-false" as const, prompt: "Eine negative Diskriminante bedeutet, dass die quadratische Gleichung zwei reelle Lösungen hat.", options: ["Wahr", "Falsch"], correctAnswer: "Falsch", explanation: "Eine negative Diskriminante bedeutet keine reelle Lösung (zwei komplexe).", topic: "Quadratische Funktionen", difficulty: "easy" as const },
  ];

  const completedMathQuiz: Quiz = {
    id: uid("quiz"),
    subjectId: math.id,
    documentId: documents[1].id,
    title: "Übung: Funktionen und quadratische Gleichungen",
    topics: ["Quadratische Funktionen", "Transformationen", "Logarithmen"],
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
      [mathQuizQuestions[1].id]: "um 3 nach rechts",
      [mathQuizQuestions[2].id]: "3",
      [mathQuizQuestions[3].id]: "Falsch",
    },
    score: 100,
    weakTopics: [],
  };

  const olderPhysicsQuiz: Quiz = {
    ...completedPhysicsQuiz,
    id: uid("quiz"),
    title: "Energie und Wärme — Aufwärmquiz",
    createdAt: iso(subDays(now, 24)),
    startedAt: iso(subDays(now, 24)),
    completedAt: iso(subDays(now, 24)),
    score: 40,
    weakTopics: ["Zweiter Hauptsatz", "Wärmekraftmaschinen", "Prozesse"],
  };

  const quizzes: Quiz[] = [completedPhysicsQuiz, completedMathQuiz, olderPhysicsQuiz];

  // ── Tasks ──────────────────────────────────────────────────────────
  const tasks: StudyTask[] = [
    { id: uid("task"), title: "Aufgabenblatt 4 Thermodynamik fertig machen", subjectId: physics.id, description: "Aufgaben 1–12, Schwerpunkt Carnot-Wirkungsgrad.", deadline: iso(subHours(now, 4)), priority: "high", status: "todo", estimatedMinutes: 60, recurring: null, createdAt: iso(subDays(now, 3)), completedAt: null },
    { id: uid("task"), title: "Macbeth Akt V lesen", subjectId: english.id, description: "Notizen zur Schlafwandelszene machen.", deadline: iso(addDays(now, 0)), priority: "medium", status: "todo", estimatedMinutes: 40, recurring: null, createdAt: iso(subDays(now, 2)), completedAt: null },
    { id: uid("task"), title: "Karteikarten zur Lösungsformel wiederholen", subjectId: math.id, description: "", deadline: iso(addDays(now, 0)), priority: "low", status: "in-progress", estimatedMinutes: 15, recurring: "daily", createdAt: iso(subDays(now, 30)), completedAt: null },
    { id: uid("task"), title: "Aufsatz zu den Kriegsursachen gliedern", subjectId: history.id, description: "Langfristige gegen kurzfristige Ursachen, 800 Wörter.", deadline: iso(addDays(now, 2)), priority: "high", status: "todo", estimatedMinutes: 90, recurring: null, createdAt: iso(subDays(now, 1)), completedAt: null },
    { id: uid("task"), title: "Laborbericht Physik — spezifische Wärme", subjectId: physics.id, description: "Schluss und Fehlerbetrachtung schreiben.", deadline: iso(addDays(now, 1)), priority: "medium", status: "todo", estimatedMinutes: 45, recurring: null, createdAt: iso(subDays(now, 1)), completedAt: null },
    { id: uid("task"), title: "Trigonometrische Identitäten üben", subjectId: math.id, description: "", deadline: iso(addDays(now, 4)), priority: "low", status: "todo", estimatedMinutes: 30, recurring: null, createdAt: iso(now), completedAt: null },
    { id: uid("task"), title: "Entwurf des Englisch-Aufsatzes abgeben", subjectId: english.id, description: "Ehrgeiz als Thema in Macbeth.", deadline: iso(subDays(now, 1)), priority: "high", status: "done", estimatedMinutes: 90, recurring: null, createdAt: iso(subDays(now, 6)), completedAt: iso(subDays(now, 1)) },
    { id: uid("task"), title: "Wochenplanung", subjectId: null, description: "Jeden Montag die kommende Woche durchgehen.", deadline: iso(addDays(now, 6)), priority: "low", status: "todo", estimatedMinutes: 10, recurring: "weekly", createdAt: iso(subDays(now, 40)), completedAt: null },
    { id: uid("task"), title: "Karteikarten: Daten Zweiter Weltkrieg", subjectId: history.id, description: "", deadline: iso(subDays(now, 2)), priority: "medium", status: "done", estimatedMinutes: 20, recurring: null, createdAt: iso(subDays(now, 9)), completedAt: iso(subDays(now, 3)) },
  ];

  // ── Exams ──────────────────────────────────────────────────────────
  function planWeek(weekNumber: number, start: Date, topics: string[], focus: string, done: boolean): Exam["studyPlan"][number] {
    return {
      weekNumber,
      label: `Woche ${weekNumber}`,
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
    title: "Mathematik — Schularbeit",
    date: iso(mathExamDate),
    topics: ["Quadratische Funktionen", "Transformationen", "Logarithmen", "Trigonometrische Identitäten"],
    currentLevel: "intermediate",
    availableHoursPerWeek: 5,
    studyPlan: [
      planWeek(1, subDays(mathExamDate, 19), ["Quadratische Funktionen", "Quadratische Ergänzung"], "Zuerst die Grundlagen wieder festigen.", true),
      planWeek(2, subDays(mathExamDate, 12), ["Transformationen", "Verkettete Funktionen"], "Täglich Graphentransformationen üben.", false),
      planWeek(3, subDays(mathExamDate, 5), ["Probeprüfungen", "Schwache Themen"], "Unter Zeitdruck üben und wiederkehrende Fehler abstellen.", false),
    ],
    createdAt: iso(subDays(now, 15)),
  };

  const physicsExamDate = addDays(now, 9);
  const physicsExam: Exam = {
    id: uid("exam"),
    subjectId: physics.id,
    title: "Physik — Test Thermodynamik",
    date: iso(physicsExamDate),
    topics: ["Erster und zweiter Hauptsatz", "Thermodynamische Prozesse", "Wärmekraftmaschinen", "Entropie"],
    currentLevel: "beginner",
    availableHoursPerWeek: 4,
    studyPlan: [
      planWeek(1, subDays(physicsExamDate, 9), ["Erster Hauptsatz", "Zweiter Hauptsatz"], "Die beiden Hauptsätze müssen sitzen — alles andere baut darauf auf.", true),
      planWeek(2, subDays(physicsExamDate, 2), ["Wärmekraftmaschinen", "Probeprüfung"], "Carnot-Wirkungsgrad und ein vollständiger Test unter Zeitdruck.", false),
    ],
    createdAt: iso(subDays(now, 6)),
  };

  const historyExamDate = addDays(now, 34);
  const historyExam: Exam = {
    id: uid("exam"),
    subjectId: history.id,
    title: "Geschichte — Prüfung Zweiter Weltkrieg",
    date: iso(historyExamDate),
    topics: ["Kriegsursachen", "Kriegsschauplatz Europa", "Kriegsschauplatz Pazifik", "Folgen"],
    currentLevel: "intermediate",
    availableHoursPerWeek: 3,
    studyPlan: [
      planWeek(1, subDays(historyExamDate, 34), ["Kriegsursachen"], "Langfristige gegen kurzfristige Ursachen.", false),
      planWeek(2, subDays(historyExamDate, 27), ["Kriegsschauplatz Europa"], "Zeitleiste: von Polen bis zur Landung in der Normandie.", false),
      planWeek(3, subDays(historyExamDate, 20), ["Kriegsschauplatz Pazifik"], "Von Pearl Harbor bis zur Kapitulation Japans.", false),
      planWeek(4, subDays(historyExamDate, 13), ["Folgen", "Aufsätze üben"], "Vorgeschichte des Kalten Kriegs und Aufsatztraining.", false),
      planWeek(5, subDays(historyExamDate, 6), ["Gesamtwiederholung", "Probeprüfung"], "Unter Zeitdruck üben und die letzten Lücken schließen.", false),
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
    title: "Erklär mir Thermodynamik, als wäre ich 15",
    createdAt: iso(subDays(now, 5)),
    updatedAt: iso(subDays(now, 5)),
  };
  const messages: AIMessage[] = [
    { id: uid("msg"), conversationId: conversation.id, role: "user", content: "Erklär mir Kapitel 3, als wäre ich 15.", createdAt: iso(subDays(now, 5)) },
    {
      id: uid("msg"),
      conversationId: conversation.id,
      role: "assistant",
      content:
        "Klar! Stell dir Energie wie Geld auf einem Bankkonto vor.\n\n**Der erste Hauptsatz** sagt nur: Aus dem Nichts entsteht kein Geld. Ändert sich dein Kontostand, ist etwas hinein- oder hinausgegangen. In der Physik: `ΔU = Q − W`. Zugeführte Wärme (Q) kommt aufs Konto, Arbeit, die dein System nach außen verrichtet (W), geht davon ab.\n\n**Der zweite Hauptsatz** sagt: Geld fließt von selbst immer vom reichen zum armen Konto, nie umgekehrt. Deshalb kühlt heißer Kaffee ab und wird nicht von allein heißer. Genau dieses „läuft nie von selbst rückwärts“ ist die Entropie, die immer zunimmt.\n\nSoll ich als Nächstes ein Beispiel zur Carnot-Maschine durchgehen oder dich dazu abfragen?",
      createdAt: iso(subDays(now, 5)),
    },
  ];

  // ── Profile ────────────────────────────────────────────────────────
  const profile: Profile = {
    id: uid("user"),
    name: "Lena Oberhofer",
    email: "lena@example.com",
    school: "Oberschulzentrum Südtirol",
    grade: "3. Klasse",
    // Derived, not written down: a hard-coded year would be wrong the moment
    // the demo is loaded in a later school year.
    schoolYear: currentSchoolYear(now),
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
