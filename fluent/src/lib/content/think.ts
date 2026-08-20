export interface ThinkPrompt {
  id: string;
  situation: string;
  usefulPhrases: { phrase: string; note: string }[];
}

export const THINK_PROMPTS: ThinkPrompt[] = [
  {
    id: "th-directions",
    situation: "You're walking through London and a stranger stops you and asks for directions to the nearest pharmacy.",
    usefulPhrases: [
      { phrase: "It's just around the corner.", note: "Used when something is very close by." },
      { phrase: "Keep going straight until you hit the main road.", note: "'Hit' here means 'reach' — very natural in directions." },
      { phrase: "You can't miss it.", note: "A reassuring way to end directions." },
      { phrase: "I'm not actually from around here, sorry.", note: "A natural way to admit you can't help." },
    ],
  },
  {
    id: "th-late",
    situation: "A colleague asks why you were late to this morning's meeting.",
    usefulPhrases: [
      { phrase: "Sorry about that, my train got delayed.", note: "Short, natural apology + reason." },
      { phrase: "I got held up on a call — apologies.", note: "'Get held up' is a common way to explain a delay." },
      { phrase: "It won't happen again.", note: "A confident way to close the topic." },
    ],
  },
  {
    id: "th-wrong-order",
    situation: "You're at a café and the barista gives you the wrong order.",
    usefulPhrases: [
      { phrase: "I think there's been a mix-up.", note: "Softer than 'you made a mistake'." },
      { phrase: "I actually ordered the...", note: "Polite way to correct someone." },
      { phrase: "No worries, these things happen.", note: "Gracious response once it's fixed." },
    ],
  },
  {
    id: "th-cancelled",
    situation: "A friend cancels plans on you last minute for the second time this month.",
    usefulPhrases: [
      { phrase: "No worries, but is everything okay?", note: "Checks in without sounding passive-aggressive." },
      { phrase: "It's fine, just let me know earlier next time if you can.", note: "Sets a boundary gently." },
      { phrase: "I was kind of looking forward to it, to be honest.", note: "Honest but not confrontational." },
    ],
  },
  {
    id: "th-failure",
    situation: "In a job interview, you're asked to describe a time you failed at something.",
    usefulPhrases: [
      { phrase: "One thing that comes to mind is...", note: "A natural way to introduce an example." },
      { phrase: "Looking back, I should have...", note: "Shows reflection without over-apologising." },
      { phrase: "That experience taught me to...", note: "Turns failure into a positive takeaway." },
    ],
  },
  {
    id: "th-what-do-you-do",
    situation: "Someone at a party asks what you do for a living, but you'd rather not talk about work right now.",
    usefulPhrases: [
      { phrase: "Oh, nothing too exciting — what about you?", note: "Redirects the conversation smoothly." },
      { phrase: "Let's just say it pays the bills.", note: "A light, humorous deflection." },
      { phrase: "I'd honestly rather not talk shop tonight.", note: "'Talk shop' = talk about work — very natural." },
    ],
  },
  {
    id: "th-end-call",
    situation: "You need to politely end a phone call because you're busy.",
    usefulPhrases: [
      { phrase: "I don't want to cut this short, but I've got to run.", note: "Softens the interruption." },
      { phrase: "Can I call you back a bit later?", note: "Keeps the door open." },
      { phrase: "Great chatting — speak soon!", note: "A warm, natural sign-off." },
    ],
  },
  {
    id: "th-compliment",
    situation: "A stranger compliments your English. How do you respond naturally — not just 'thank you'?",
    usefulPhrases: [
      { phrase: "That's really kind of you to say.", note: "Warmer than a flat 'thank you'." },
      { phrase: "I still get nervous sometimes, but thank you!", note: "Honest and humble." },
      { phrase: "I've been working on it for a while, so that means a lot.", note: "Acknowledges the effort behind it." },
    ],
  },
  {
    id: "th-disagree-meeting",
    situation: "You disagree with a plan your team just proposed in a meeting.",
    usefulPhrases: [
      { phrase: "I see the logic, but I'm not fully convinced.", note: "Diplomatic disagreement." },
      { phrase: "Can we play devil's advocate for a second?", note: "A great idiom for raising objections constructively." },
      { phrase: "What if we considered an alternative?", note: "Opens a discussion instead of shutting it down." },
    ],
  },
  {
    id: "th-recommend",
    situation: "A tourist asks you to recommend a restaurant nearby.",
    usefulPhrases: [
      { phrase: "You can't go wrong with...", note: "A confident, natural recommendation." },
      { phrase: "It's a bit of a hidden gem.", note: "Idiom for a great place not many people know about." },
      { phrase: "It gets pretty busy, so I'd book ahead if I were you.", note: "Adds a helpful, natural tip." },
    ],
  },
];
