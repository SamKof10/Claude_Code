export interface ConfusablePair {
  id: string;
  a: { word: string; meaning: string };
  b: { word: string; meaning: string };
  explanation: string;
  exercise: { sentence: string; correct: "a" | "b" };
}

export const CONFUSABLE_PAIRS: ConfusablePair[] = [
  {
    id: "affect-effect",
    a: { word: "affect", meaning: "verb: to influence something" },
    b: { word: "effect", meaning: "noun: a result of something" },
    explanation: "'Affect' is almost always a verb (the weather affects my mood); 'effect' is almost always a noun (the effect of the weather on my mood).",
    exercise: { sentence: "The new policy will ______ everyone in the department.", correct: "a" },
  },
  {
    id: "lend-borrow",
    a: { word: "lend", meaning: "to give something to someone temporarily" },
    b: { word: "borrow", meaning: "to take something temporarily, with the intention of returning it" },
    explanation: "Direction matters: you lend something TO someone, and you borrow something FROM someone.",
    exercise: { sentence: "Could I ______ your charger for five minutes?", correct: "b" },
  },
  {
    id: "actually-currently",
    a: { word: "actually", meaning: "in fact, in reality (often to correct something)" },
    b: { word: "currently", meaning: "at the moment, now" },
    explanation: "German 'aktuell' pulls learners towards 'actually' when they mean 'currently'. Keep them separate: currently = right now, actually = in fact.",
    exercise: { sentence: "We're ______ working on a new version of the app.", correct: "b" },
  },
  {
    id: "since-for",
    a: { word: "since", meaning: "used with a starting point in time" },
    b: { word: "for", meaning: "used with a duration of time" },
    explanation: "'Since' pairs with a fixed point (since 2020, since Monday); 'for' pairs with a length of time (for three years, for a while).",
    exercise: { sentence: "I've lived in this city ______ 2021.", correct: "a" },
  },
  {
    id: "make-do",
    a: { word: "make", meaning: "to create or produce something" },
    b: { word: "do", meaning: "to perform an action or activity" },
    explanation: "'Make' is for creating things (make a decision, make a mistake); 'do' is for activities and tasks (do homework, do the dishes).",
    exercise: { sentence: "I still need to ______ my homework before dinner.", correct: "b" },
  },
  {
    id: "say-tell",
    a: { word: "say", meaning: "never followed directly by a person as object" },
    b: { word: "tell", meaning: "always followed directly by a person" },
    explanation: "You say something (to someone), but you tell someone (something). 'She said me' is always wrong — it has to be 'she told me' or 'she said to me'.",
    exercise: { sentence: "Can you ______ me what happened at the meeting?", correct: "b" },
  },
  {
    id: "bring-take",
    a: { word: "bring", meaning: "movement towards the speaker's location" },
    b: { word: "take", meaning: "movement away from the speaker's location" },
    explanation: "Direction relative to the speaker decides it: bring something here, take something there.",
    exercise: { sentence: "Don't forget to ______ your umbrella when you leave.", correct: "b" },
  },
  {
    id: "historic-historical",
    a: { word: "historic", meaning: "important, famous in history" },
    b: { word: "historical", meaning: "relating to history in general, from the past" },
    explanation: "'Historic' = significant (a historic decision). 'Historical' = simply from the past, not necessarily important (historical records).",
    exercise: { sentence: "This is a ______ moment for the entire company.", correct: "a" },
  },
  {
    id: "economic-economical",
    a: { word: "economic", meaning: "relating to the economy" },
    b: { word: "economical", meaning: "cost-efficient, not wasteful" },
    explanation: "'Economic' relates to economics/the economy (economic growth); 'economical' describes something that saves money (an economical car).",
    exercise: { sentence: "The government announced new ______ policies this week.", correct: "a" },
  },
  {
    id: "sensible-sensitive",
    a: { word: "sensible", meaning: "showing good sense; practical, reasonable" },
    b: { word: "sensitive", meaning: "easily affected emotionally or physically" },
    explanation: "A false-friend trap: German 'sensibel' means 'sensitive', not 'sensible'. 'Sensible' is about being practical and wise.",
    exercise: { sentence: "Try to be gentle with her — she's quite ______ about criticism.", correct: "b" },
  },
];
