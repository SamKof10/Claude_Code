export interface TutorRule {
  id: string;
  triggers: string[];
  correction: string;
}

/**
 * A small rule-based "gentle correction" engine — not a real model. Matching
 * is a case-insensitive substring check against `triggers`, done in the
 * TutorChat component. Kept simple and swappable so a real API can later
 * replace `respondTo()` without touching the UI.
 */
export const TUTOR_RULES: TutorRule[] = [
  {
    id: "present-perfect",
    triggers: ["i have went", "i have did", "i have ate", "i have wrote", "i have took", "i have saw"],
    correction:
      "Nice — small correction: after 'have', English wants the past participle (gone/done/eaten/written), not the simple past form. So: '...I've gone...' Keep going!",
  },
  {
    id: "am-agree",
    triggers: ["i am agree", "i m agree", "she is agree", "he is agree"],
    correction: "One small thing: 'agree' is a verb, not an adjective — so it's just 'I agree', no 'am' needed.",
  },
  {
    id: "since-duration",
    triggers: ["since three years", "since 3 years", "since two years", "since 2 years", "since many years"],
    correction: "Quick fix: with a length of time like 'three years', use 'for', not 'since' — 'since' pairs with a starting point, like 'since 2021'.",
  },
  {
    id: "make-sport",
    triggers: ["i make sport", "i make sports", "we make sport"],
    correction: "Small note: in English we 'work out' or 'exercise' — 'make sport' is a direct translation from German that doesn't quite land.",
  },
  {
    id: "modal-to",
    triggers: ["i must to", "i can to", "i should to", "you must to"],
    correction: "Tiny grammar note: after modal verbs like 'must/can/should', there's no 'to' — just the base verb.",
  },
  {
    id: "uncountables",
    triggers: ["informations", "advices", "furnitures", "feedbacks"],
    correction: "Heads up: 'information', 'advice', and 'furniture' are uncountable in English — no plural -s.",
  },
  {
    id: "bored-boring",
    triggers: ["i am boring", "i'm boring", "im boring"],
    correction: "Careful — if you mean you feel bored, it's 'I'm bored'. 'Boring' describes something that causes boredom in others.",
  },
  {
    id: "become-get",
    triggers: ["can i become", "i become a coffee", "i became a coffee", "i become a beer"],
    correction: "Small false-friend catch: 'become' means 'werden', not 'bekommen'. For receiving something, use 'get': 'Can I get a coffee?'",
  },
  {
    id: "age-have",
    triggers: ["i have 20 years", "i have 25 years", "i have 30 years", "i have twenty years", "i have thirty years"],
    correction: "In English we don't 'have' an age — it's 'I'm 25' (I am ... years old).",
  },
  {
    id: "depend-of",
    triggers: ["depends of", "depend of"],
    correction: "'Depend' pairs with 'on', not 'of' — 'it depends on the weather'.",
  },
  {
    id: "interested-about",
    triggers: ["interested about"],
    correction: "Small preposition fix: 'interested' pairs with 'in', not 'about'.",
  },
  {
    id: "actually-currently",
    triggers: ["actually working on", "actually living in", "actually studying"],
    correction: "Quick check — did you mean 'currently'? 'Actually' means 'in fact', while 'currently' means 'right now'. Both are useful, just don't mix them up.",
  },
  {
    id: "responsible-of",
    triggers: ["responsible of"],
    correction: "Small fix: it's 'responsible for', not 'responsible of'.",
  },
];

export const TUTOR_FOLLOW_UPS = [
  "That's interesting — what made you think of that?",
  "Nice! Can you tell me a bit more about that?",
  "I see what you mean. How did that make you feel?",
  "Got it. And what happened after that?",
  "That's a good point. Do you think that's always the case?",
  "Interesting — is that something you deal with often?",
  "Makes sense. What would you do differently next time?",
  "I hear you. What's your take on it, generally?",
  "Fair point. Has anyone ever disagreed with you on that?",
  "Good to know — what's on your mind next?",
];

export interface TutorVocabTip {
  trigger: string;
  suggestion: string;
}

export const TUTOR_VOCAB_TIPS: TutorVocabTip[] = [
  { trigger: "very important", suggestion: "Small tip: instead of 'very important', try 'crucial' or 'essential' — a notch more advanced." },
  { trigger: "very good", suggestion: "Tip: 'excellent' or 'outstanding' land a bit stronger than 'very good'." },
  { trigger: "very big", suggestion: "Tip: 'substantial' or 'considerable' work well instead of 'very big' in a more formal context." },
  { trigger: "i think", suggestion: "Variation to mix in sometimes: 'I'd argue that...' or 'From my perspective...' instead of always 'I think'." },
  { trigger: "a lot of", suggestion: "You could also say 'a great deal of' or 'a fair amount of' for a slightly more sophisticated tone." },
  { trigger: "i want", suggestion: "In polite conversation, 'I'd like to...' often sounds smoother than 'I want to...'." },
];

export const TUTOR_STARTERS = [
  "Tell me about your week so far.",
  "What's something that annoyed you recently?",
  "Describe your ideal weekend.",
  "What's a decision you're currently on the fence about?",
  "Tell me about a place you'd love to visit.",
  "What's a skill you're trying to improve right now?",
  "Describe your job the way you'd explain it to a stranger.",
  "What's something you've changed your mind about recently?",
];
