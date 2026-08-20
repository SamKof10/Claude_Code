export interface LevelInfo {
  id: string;
  canDo: string;
  focus: string;
}

export const LEVELS: LevelInfo[] = [
  {
    id: "B2",
    canDo: "I can communicate independently in most situations and discuss familiar topics with reasonable fluency.",
    focus: "Building a wider vocabulary and fixing recurring grammar transfer errors from German.",
  },
  {
    id: "B2+",
    canDo: "I can hold my own in most conversations, though I still search for words under pressure or in debate.",
    focus: "Learning natural phrasing instead of translating, and starting to use phrasal verbs and idioms.",
  },
  {
    id: "C1",
    canDo: "I can express complex ideas fluently and spontaneously, without obviously searching for expressions.",
    focus: "Sounding more native: connectors, nuanced vocabulary, and understanding fast, connected speech.",
  },
  {
    id: "C1+",
    canDo: "I can use language flexibly for social, academic and professional purposes, structuring long arguments clearly.",
    focus: "Refining tone and register — formal vs informal, persuasive language, and subtle synonym choices.",
  },
  {
    id: "C2",
    canDo: "I can understand virtually everything with ease and express myself with a high degree of precision and nuance.",
    focus: "Polishing idiom, rhetoric and accent comprehension until English no longer feels like a second language.",
  },
];
