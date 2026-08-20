export type GrammarCategory =
  | "conditionals"
  | "passive"
  | "reported-speech"
  | "modals"
  | "inversion"
  | "articles"
  | "prepositions"
  | "relative-clauses"
  | "participle-clauses"
  | "word-order"
  | "tenses";

export interface GrammarChallenge {
  id: string;
  category: GrammarCategory;
  level: "B2" | "C1" | "C2";
  broken: string;
  fixed: string;
  explanation: string;
  germanNote: string;
}

export const GRAMMAR_CATEGORY_LABELS: Record<GrammarCategory, string> = {
  conditionals: "Conditionals",
  passive: "Passive voice",
  "reported-speech": "Reported speech",
  modals: "Modal verbs",
  inversion: "Inversion",
  articles: "Articles",
  prepositions: "Prepositions",
  "relative-clauses": "Relative clauses",
  "participle-clauses": "Participle clauses",
  "word-order": "Word order",
  tenses: "Advanced tenses",
};

export const GRAMMAR_CHALLENGES: GrammarChallenge[] = [
  {
    id: "cond-3rd",
    category: "conditionals",
    level: "C1",
    broken: "If I would have known, I had told you.",
    fixed: "If I had known, I would've told you.",
    explanation:
      "Third conditional needs 'if + past perfect' in the if-clause, and 'would have + past participle' in the main clause — never 'would' in both halves.",
    germanNote:
      "Im Deutschen sagt man oft 'Wenn ich es gewusst hätte' und rutscht dabei ins Englische mit 'would have' in beiden Satzhälften ab. Merke: 'if' + Past Perfect, dann 'would have' im Hauptsatz.",
  },
  {
    id: "cond-2nd",
    category: "conditionals",
    level: "B2",
    broken: "If I would be you, I would accept the offer.",
    fixed: "If I were you, I would accept the offer.",
    explanation: "The if-clause of a second conditional uses the simple past ('were'), not 'would'. 'Would' only appears in the main clause.",
    germanNote:
      "'Wenn ich du wäre' verführt zu 'If I would be you' — im Englischen bleibt das 'if' immer im (simple) past, 'would' gehört ausschließlich in den Hauptsatz.",
  },
  {
    id: "reported-speech-1",
    category: "reported-speech",
    level: "B2",
    broken: "She said me that she is tired.",
    fixed: "She told me (that) she was tired.",
    explanation: "'Say' is never followed directly by an object (say something TO someone), so it becomes 'tell me'. In reported speech, tenses also shift back one step: 'is' → 'was'.",
    germanNote:
      "'Sagen' funktioniert im Deutschen mit Objekt ('sie sagte mir'), im Englischen braucht 'say' aber 'to' ('she said to me') oder man nutzt gleich 'tell' + Objekt ohne 'to'.",
  },
  {
    id: "passive-irregular",
    category: "passive",
    level: "B2",
    broken: "The letter was wrote by him.",
    fixed: "The letter was written by him.",
    explanation: "The passive is formed with 'be' + past participle, not the simple past form. 'Write → wrote → written' — the passive needs 'written'.",
    germanNote:
      "Deutsche Lerner setzen oft die Simple-Past-Form ein, weil sie im Kopf 'wrote' als 'geschrieben' abgespeichert haben. Für's Passiv brauchst du immer das Partizip Perfekt (3. Form).",
  },
  {
    id: "modal-to",
    category: "modals",
    level: "B2",
    broken: "I must to go now.",
    fixed: "I must go now.",
    explanation: "Modal verbs (must, can, should, will…) are directly followed by the bare infinitive — never with 'to'.",
    germanNote:
      "'Ich muss zu gehen' — dieses gedankliche 'zu' rutscht oft mit ins Englische. Nach must/can/should/will/may steht nie 'to'.",
  },
  {
    id: "inversion-never",
    category: "inversion",
    level: "C1",
    broken: "Never I have seen such a mess.",
    fixed: "Never have I seen such a mess.",
    explanation: "When a negative adverbial (never, rarely, seldom, not only…) starts the sentence, subject and auxiliary invert, just like in a question.",
    germanNote:
      "Diese Struktur gibt es im Deutschen nicht in dieser Form. Nach 'Never', 'Rarely', 'Not only' etc. am Satzanfang folgt immer die Frageform: Hilfsverb vor dem Subjekt.",
  },
  {
    id: "inversion-neither",
    category: "inversion",
    level: "C1",
    broken: "I don't like it and neither I do.",
    fixed: "I don't like it and neither do I.",
    explanation: "After 'neither' / 'nor' at the start of a clause, the auxiliary comes before the subject: 'neither do I', 'neither can she'.",
    germanNote:
      "Klingt im Kopf logisch ('und ich auch nicht'), aber im Englischen kippt die Wortstellung nach 'neither' genauso wie in einer Frage.",
  },
  {
    id: "articles-headache",
    category: "articles",
    level: "B2",
    broken: "I have headache and I feel bad.",
    fixed: "I have a headache and I feel bad.",
    explanation: "Countable singular nouns like 'headache' need an article. 'A headache' is one instance of a general category of pain.",
    germanNote:
      "'Ich habe Kopfschmerzen' braucht im Deutschen keinen Artikel — im Englischen dagegen fast immer 'a headache', 'a cold', 'a temperature'.",
  },
  {
    id: "prep-interested",
    category: "prepositions",
    level: "B2",
    broken: "I'm interested about photography.",
    fixed: "I'm interested in photography.",
    explanation: "'Interested' pairs with 'in', not 'about'. Prepositions after adjectives rarely translate directly from German.",
    germanNote: "'Interessiert an' verleitet zu 'interested in' zu raten, aber Lerner greifen oft fälschlich zu 'about'. Die feste Kombination ist 'interested IN'.",
  },
  {
    id: "prep-responsible",
    category: "prepositions",
    level: "C1",
    broken: "She's responsible of the whole project.",
    fixed: "She's responsible for the whole project.",
    explanation: "'Responsible' always takes 'for', never 'of'.",
    germanNote: "'Verantwortlich für' — das 'für' verleitet manchmal zu 'of' statt 'for'. Lern die Kombination fest: responsible FOR something.",
  },
  {
    id: "prep-married",
    category: "prepositions",
    level: "B2",
    broken: "He is married with a doctor.",
    fixed: "He is married to a doctor.",
    explanation: "In English, you are 'married to' someone, not 'married with' them.",
    germanNote: "'Verheiratet mit' führt fast automatisch zu 'married with' — im Englischen steht hier aber 'married TO'.",
  },
  {
    id: "relative-which",
    category: "relative-clauses",
    level: "B2",
    broken: "The man which called you is my brother.",
    fixed: "The man who called you is my brother.",
    explanation: "'Which' refers to things; people need 'who' (subject) or 'whom' (object, formal).",
    germanNote: "Im Deutschen sagt man 'der Mann, der' unabhängig davon, ob man von Menschen oder Dingen spricht. Im Englischen trennt sich das strikt: who = Menschen, which = Dinge.",
  },
  {
    id: "participle-but",
    category: "participle-clauses",
    level: "C1",
    broken: "Being tired, but I kept working until midnight.",
    fixed: "Being tired, I kept working until midnight.",
    explanation: "A participle clause already implies contrast or reason on its own — adding 'but' afterwards is redundant and ungrammatical.",
    germanNote: "Der Doppel-Konnektor ('obwohl…, aber…') ist ein typischer Transfer aus dem Deutschen. Im Englischen reicht die Partizipialkonstruktion allein, ohne 'but'.",
  },
  {
    id: "word-order-yesterday",
    category: "word-order",
    level: "B2",
    broken: "Yesterday went I to the cinema with my friends.",
    fixed: "Yesterday I went to the cinema with my friends.",
    explanation: "English keeps subject–verb order even when a time expression opens the sentence — unlike German's verb-second (V2) rule.",
    germanNote:
      "Im Deutschen rutscht das Verb bei einem vorangestellten Zeitwort immer an die zweite Position ('Gestern ging ich…'). Im Englischen bleibt die Subjekt-Verb-Reihenfolge fest, egal was am Satzanfang steht.",
  },
  {
    id: "word-order-adverb",
    category: "word-order",
    level: "C1",
    broken: "I like very much this song.",
    fixed: "I like this song very much.",
    explanation: "Adverbs of degree like 'very much' typically go at the end of the clause in English, after the object.",
    germanNote: "'Ich mag dieses Lied sehr' erlaubt im Deutschen mehr Flexibilität. Im Englischen landet 'very much' fast immer ganz am Satzende.",
  },
  {
    id: "tense-since-for",
    category: "tenses",
    level: "B2",
    broken: "I am living here since three years.",
    fixed: "I have been living here for three years.",
    explanation: "A state that started in the past and continues now needs the present perfect (continuous), not the present simple/continuous. Use 'for' with a duration and 'since' with a starting point.",
    germanNote:
      "Deutsches Präsens ('Ich wohne hier seit drei Jahren') wird oft 1:1 als Present Simple/Continuous übersetzt. Für 'seit einer andauernden Zeitspanne' braucht Englisch das Present Perfect — und 'for' + Dauer, nicht 'since' + Dauer.",
  },
];

export function grammarByCategory(category: GrammarCategory): GrammarChallenge[] {
  return GRAMMAR_CHALLENGES.filter((c) => c.category === category);
}
