export type WritingType = "essay" | "email" | "application" | "report" | "opinion" | "informal";

export const WRITING_TYPE_LABELS: Record<WritingType, string> = {
  essay: "Essay",
  email: "Formal email",
  application: "Application",
  report: "Report",
  opinion: "Opinion piece",
  informal: "Informal message",
};

export interface WritingTask {
  id: string;
  type: WritingType;
  title: string;
  prompt: string;
  minWords: number;
  maxWords: number;
  tips: string[];
}

export const WRITING_TASKS: WritingTask[] = [
  {
    id: "w-study-abroad",
    type: "essay",
    title: "Should universities require students to study abroad?",
    prompt:
      "Write 150–200 words explaining whether universities should require students to study abroad as part of their degree. Give at least one argument for and one against, and state your own opinion.",
    minWords: 150,
    maxWords: 200,
    tips: [
      "Open by framing the debate, not just your opinion.",
      "Use connectors like 'however' and 'that said' to transition between arguments.",
      "State your own position clearly in the conclusion.",
    ],
  },
  {
    id: "w-landlord-email",
    type: "email",
    title: "Formal email to your landlord",
    prompt:
      "Write a formal email (120–160 words) to your landlord explaining that the heating in your flat has stopped working, and requesting a repair within the week.",
    minWords: 120,
    maxWords: 160,
    tips: [
      "Open with 'Dear Mr/Ms [Name]' or 'Dear Sir/Madam'.",
      "State the problem and the request in the first two sentences.",
      "Close with 'Kind regards' — never 'Bye' or 'See you' in a formal email.",
    ],
  },
  {
    id: "w-cover-letter",
    type: "application",
    title: "Cover letter paragraph",
    prompt:
      "Write a paragraph (100–150 words) for a job application, explaining why you would be a strong fit for a Marketing Coordinator role at a growing company.",
    minWords: 100,
    maxWords: 150,
    tips: [
      "Lead with a specific, relevant strength rather than a generic claim.",
      "Back up any claim with a concrete example.",
      "Avoid starting every sentence with 'I' — vary your sentence openings.",
    ],
  },
  {
    id: "w-team-report",
    type: "report",
    title: "Remote work satisfaction report",
    prompt:
      "Write a short report (150–200 words) summarising these survey results: 72% of employees prefer hybrid work, 18% prefer fully remote, 10% prefer the office full-time. Satisfaction with hybrid work is rated 8.1/10 on average. Include a brief recommendation.",
    minWords: 150,
    maxWords: 200,
    tips: [
      "Use a neutral, objective tone — reports avoid 'I think'.",
      "Structure it with a short introduction, findings, and a recommendation.",
      "Use precise figures rather than vague words like 'a lot' or 'most'.",
    ],
  },
  {
    id: "w-social-media-opinion",
    type: "opinion",
    title: "Does social media do more harm than good?",
    prompt:
      "Write 150–200 words giving your opinion on whether social media does more harm than good overall. Support your view with at least two reasons.",
    minWords: 150,
    maxWords: 200,
    tips: [
      "State your opinion early, then support it — don't bury your main point.",
      "Acknowledge the other side briefly before restating your position.",
      "Use hedging language like 'arguably' or 'it could be said that' for nuance.",
    ],
  },
  {
    id: "w-catch-up-message",
    type: "informal",
    title: "Catching up with an old friend",
    prompt:
      "Write an informal message (80–120 words) to a friend you haven't spoken to in a while, catching them up on your news and suggesting you meet up soon.",
    minWords: 80,
    maxWords: 120,
    tips: [
      "It's fine to use contractions ('I've', 'it's') — this is informal writing.",
      "Keep sentences shorter and more conversational than in an essay.",
      "End with a concrete suggestion, e.g. 'Let's grab coffee sometime soon?'",
    ],
  },
];
