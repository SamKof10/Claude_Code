export interface SpeakingPrompt {
  id: string;
  prompt: string;
  level: "B2" | "C1" | "C2";
  tips: string[];
  sampleRewrite: { before: string; after: string };
}

export const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  {
    id: "sp-place-to-live",
    prompt: "Describe a place you'd love to live in for a year.",
    level: "B2",
    tips: ["Say why, not just where.", "Mention one specific detail (a street, a season, a habit you'd pick up)."],
    sampleRewrite: {
      before: "I think that this place is very nice.",
      after: "I find the place incredibly appealing — what really draws me to it is the pace of life.",
    },
  },
  {
    id: "sp-on-the-fence",
    prompt: "Talk about a decision you're currently on the fence about.",
    level: "C1",
    tips: ["Present both sides before landing on where you lean.", "Try using 'on the fence about' naturally."],
    sampleRewrite: {
      before: "I don't know if I should do it.",
      after: "Honestly, I'm still on the fence about it — there are compelling arguments either way.",
    },
  },
  {
    id: "sp-influence",
    prompt: "Describe someone who has influenced the way you think.",
    level: "B2",
    tips: ["Give one concrete example, not just an adjective.", "Explain what specifically changed for you."],
    sampleRewrite: {
      before: "My teacher was very good and helped me a lot.",
      after: "My teacher had a real knack for making complex ideas feel simple, and that stuck with me.",
    },
  },
  {
    id: "sp-skill-earlier",
    prompt: "What's a skill you wish you'd learned earlier in life?",
    level: "B2",
    tips: ["Use 'wish I'd + past participle' for a natural regret structure.", "Add why it would have helped."],
    sampleRewrite: {
      before: "I wish I learned how to cook when I was young.",
      after: "If I'm honest, I wish I'd picked up cooking far earlier than I did.",
    },
  },
  {
    id: "sp-remote-work",
    prompt: "Argue for or against remote work becoming the default.",
    level: "C1",
    tips: ["Pick a side clearly.", "Use at least one connector like 'arguably' or 'that said'."],
    sampleRewrite: {
      before: "I think remote work is better because you have more free time.",
      after: "Arguably, remote work gives people back a huge amount of time they'd otherwise lose commuting.",
    },
  },
  {
    id: "sp-ideal-sunday",
    prompt: "Describe your ideal Sunday, from morning to night.",
    level: "B2",
    tips: ["Move through the day in order.", "Use a few varied time expressions (later on, by the evening...)."],
    sampleRewrite: {
      before: "I wake up late and I relax all day.",
      after: "I like to ease into the day slowly, and just let the rest of it unfold.",
    },
  },
  {
    id: "sp-adapt-change",
    prompt: "Talk about a time you had to adapt quickly to a change.",
    level: "C1",
    tips: ["Set the scene briefly before describing what you did.", "Reflect on what it taught you."],
    sampleRewrite: {
      before: "I had to change fast and it was hard.",
      after: "I had to adapt almost overnight, and it really pushed me out of my comfort zone.",
    },
  },
  {
    id: "sp-advice-younger-self",
    prompt: "What's a piece of advice you'd give your younger self?",
    level: "B2",
    tips: ["Be specific rather than generic ('be more confident' is vague).", "Explain why, briefly."],
    sampleRewrite: {
      before: "I would say don't be afraid.",
      after: "I'd tell my younger self not to take rejection so personally.",
    },
  },
  {
    id: "sp-book-changed",
    prompt: "Describe a book, film or show that changed how you see something.",
    level: "C1",
    tips: ["Name the specific thing that changed.", "Avoid just summarising the plot."],
    sampleRewrite: {
      before: "This book changed how I think about things.",
      after: "That book completely reshaped the way I think about failure.",
    },
  },
  {
    id: "sp-habit",
    prompt: "Talk about a habit you're trying to build or break.",
    level: "B2",
    tips: ["Use present perfect continuous for an ongoing effort ('I've been trying to...').", "Mention one obstacle."],
    sampleRewrite: {
      before: "I am trying to stop using my phone so much.",
      after: "I've been actively trying to cut down on my screen time.",
    },
  },
];
