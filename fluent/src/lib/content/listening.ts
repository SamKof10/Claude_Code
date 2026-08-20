export type Accent = "british" | "american" | "australian" | "irish" | "canadian";
export type ListeningTopic =
  | "technology"
  | "business"
  | "travel"
  | "sports"
  | "science"
  | "culture"
  | "psychology"
  | "everyday"
  | "university"
  | "work"
  | "politics"
  | "economics"
  | "interviews";

export const ACCENT_LABELS: Record<Accent, { flag: string; label: string }> = {
  british: { flag: "🇬🇧", label: "British" },
  american: { flag: "🇺🇸", label: "American" },
  australian: { flag: "🇦🇺", label: "Australian" },
  irish: { flag: "🇮🇪", label: "Irish" },
  canadian: { flag: "🇨🇦", label: "Canadian" },
};

export interface ListeningQuestion {
  q: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface ListeningExercise {
  id: string;
  title: string;
  topic: ListeningTopic;
  accent: Accent;
  level: "B2" | "C1" | "C2";
  speaker: string;
  durationSec: number;
  transcript: string;
  questions: ListeningQuestion[];
}

export const LISTENING_EXERCISES: ListeningExercise[] = [
  {
    id: "l-remote-work",
    title: "The Case Against the Open-Plan Office",
    topic: "work",
    accent: "british",
    level: "C1",
    speaker: "Rebecca, workplace consultant",
    durationSec: 96,
    transcript:
      "So, I used to think open-plan offices were just, you know, a way to save money on square footage. But actually, the data tells a different story. Companies that switched to open-plan layouts saw a measurable drop in face-to-face interaction — people just started messaging each other instead, even when they were sitting three metres apart. There's this irony where the space that's supposed to bring people together ends up pushing them into headphones and private chats. That's not to say open-plan is always bad — it can work brilliantly for certain kinds of collaborative teams. But if deep, focused work is the priority, you're arguably better off with a mix: open areas for collaboration, and quiet pods people can book when they need to actually think.",
    questions: [
      {
        q: "According to Rebecca, what happened when companies switched to open-plan offices?",
        options: [
          "Face-to-face interaction increased noticeably.",
          "Employees started messaging each other instead of talking.",
          "Productivity dropped for every kind of task.",
        ],
        answerIndex: 1,
        explanation: "She says people 'started messaging each other instead, even when they were sitting three metres apart.'",
      },
      {
        q: "What solution does she suggest?",
        options: [
          "Going back entirely to closed offices.",
          "A mix of open collaboration areas and bookable quiet pods.",
          "Banning messaging apps at work.",
        ],
        answerIndex: 1,
        explanation: "She recommends 'open areas for collaboration, and quiet pods people can book when they need to actually think.'",
      },
    ],
  },
  {
    id: "l-ai-jobs",
    title: "Will AI Actually Take Your Job?",
    topic: "technology",
    accent: "american",
    level: "C1",
    speaker: "Marcus, tech journalist",
    durationSec: 84,
    transcript:
      "Okay, here's the thing everyone gets wrong about AI and jobs. It's not really about whole jobs disappearing overnight — it's about tasks getting automated, one by one, inside a job that still exists. A radiologist isn't gonna vanish because an algorithm can spot a tumor; the job just shifts toward the parts a machine can't do — explaining results to a scared patient, making a judgment call in an ambiguous case, taking responsibility. Honestly, the roles most at risk aren't the creative or the highly technical ones — they're the ones built almost entirely out of repetitive, predictable tasks. So if your job is ninety percent pattern-matching, that's where I'd be paying attention.",
    questions: [
      {
        q: "What is Marcus's main point about AI and employment?",
        options: [
          "Whole professions will disappear immediately.",
          "Individual tasks get automated while jobs evolve around what remains.",
          "AI mainly threatens creative jobs.",
        ],
        answerIndex: 1,
        explanation: "He says it's 'about tasks getting automated, one by one, inside a job that still exists.'",
      },
      {
        q: "Which jobs does he say are most at risk?",
        options: [
          "Jobs built mostly around repetitive, predictable tasks.",
          "Highly creative jobs.",
          "Jobs that require face-to-face contact.",
        ],
        answerIndex: 0,
        explanation: "\"If your job is ninety percent pattern-matching, that's where I'd be paying attention.\"",
      },
    ],
  },
  {
    id: "l-solo-travel",
    title: "Why I Started Travelling Alone",
    topic: "travel",
    accent: "australian",
    level: "B2",
    speaker: "Priya, travel blogger",
    durationSec: 78,
    transcript:
      "I used to think solo travel was, like, a last resort — something you did if nobody else could come. But my first solo trip completely changed how I saw it. There's this thing that happens when there's no one else to defer to — you actually have to make decisions, talk to strangers, figure things out. I got hopelessly lost in Lisbon on day one and ended up having dinner with a family who ran a tiny restaurant near the port, purely because I had to ask them for directions. That never would've happened if I'd been travelling with a group. Now honestly, I look forward to the trips I take by myself more than the ones with friends.",
    questions: [
      {
        q: "What changed Priya's opinion about solo travel?",
        options: [
          "A guidebook she read before her trip.",
          "Her first solo trip, where she had to make her own decisions.",
          "Advice from a friend who travels alone.",
        ],
        answerIndex: 1,
        explanation: "She says her first solo trip 'completely changed how I saw it' because she had to make decisions herself.",
      },
      {
        q: "How did she end up having dinner with a local family?",
        options: [
          "She had booked the restaurant in advance.",
          "She got lost and had to ask them for directions.",
          "A tour guide introduced her.",
        ],
        answerIndex: 1,
        explanation: "\"I got hopelessly lost in Lisbon... purely because I had to ask them for directions.\"",
      },
    ],
  },
  {
    id: "l-attention-span",
    title: "The Myth of the Shrinking Attention Span",
    topic: "psychology",
    accent: "irish",
    level: "C2",
    speaker: "Dr. Conor Byrne, cognitive scientist",
    durationSec: 92,
    transcript:
      "There's this widely repeated claim that our attention spans are shrinking, that we've somehow evolved to have the focus of a goldfish. And look, it makes for a great headline, but the research really doesn't back it up in the way people think. What's actually changing isn't our biological capacity for attention — it's the environment we're asking that attention to operate in. We're surrounded by systems specifically engineered to interrupt us: notifications, autoplay, infinite scroll. So when someone struggles to read for twenty minutes without checking their phone, that's not a broken brain — arguably, that's a rational response to an environment optimised to fragment your focus at every turn.",
    questions: [
      {
        q: "What does Dr. Byrne say about the claim that attention spans are shrinking biologically?",
        options: [
          "He confirms it with new research.",
          "He says the research doesn't really support it.",
          "He says it only applies to older generations.",
        ],
        answerIndex: 1,
        explanation: "\"The research really doesn't back it up in the way people think.\"",
      },
      {
        q: "What does he say is actually changing?",
        options: [
          "Our biological capacity for focus.",
          "The environment attention has to operate in, full of engineered interruptions.",
          "Nothing has changed at all.",
        ],
        answerIndex: 1,
        explanation: "He points to systems 'engineered to interrupt us: notifications, autoplay, infinite scroll.'",
      },
    ],
  },
  {
    id: "l-startup-funding",
    title: "What Investors Actually Look For",
    topic: "business",
    accent: "canadian",
    level: "C1",
    speaker: "Jordan, venture investor",
    durationSec: 88,
    transcript:
      "People assume we're mostly evaluating the idea itself, but honestly, ideas are cheap — everyone's got one. What we're really trying to figure out is whether this specific team can execute under pressure, and whether they can adapt when the first version of the plan inevitably falls apart. I've backed founders with, frankly, mediocre first ideas who pivoted into something brilliant, and I've passed on incredible ideas because the team couldn't take feedback. So in a pitch, I'm listening less for the perfect answer and more for how someone responds when I push back on their assumptions. That tells me way more than the slide deck ever could.",
    questions: [
      {
        q: "What does Jordan say investors are really trying to evaluate?",
        options: [
          "Whether the idea itself is perfect.",
          "Whether the team can execute and adapt under pressure.",
          "The quality of the slide deck.",
        ],
        answerIndex: 1,
        explanation: "\"What we're really trying to figure out is whether this specific team can execute under pressure.\"",
      },
      {
        q: "What does he specifically listen for during a pitch?",
        options: [
          "How someone responds when he pushes back on their assumptions.",
          "Whether they memorised their pitch perfectly.",
          "How much funding they're asking for.",
        ],
        answerIndex: 0,
        explanation: "\"I'm listening... for how someone responds when I push back on their assumptions.\"",
      },
    ],
  },
  {
    id: "l-city-planning",
    title: "The 15-Minute City, Explained",
    topic: "culture",
    accent: "british",
    level: "B2",
    speaker: "Alistair, urban planner",
    durationSec: 74,
    transcript:
      "The idea's actually pretty simple, even though it sounds like a buzzword. A fifteen-minute city just means you can reach everything you need — work, shops, a doctor, a park — within a fifteen-minute walk or bike ride from home. It's not about banning cars, whatever people online might tell you. It's about not being forced to depend on one. Some cities are already halfway there without even planning for it; others are having to redesign entire neighbourhoods from scratch. The tricky part isn't really the concept — it's convincing people that a slower, more local pace of life is something to look forward to, not something they're being forced into.",
    questions: [
      {
        q: "What is a '15-minute city'?",
        options: [
          "A city where cars are completely banned.",
          "A city where daily needs are reachable within a 15-minute walk or bike ride.",
          "A city with a 15-minute commute by train only.",
        ],
        answerIndex: 1,
        explanation: "\"You can reach everything you need... within a fifteen-minute walk or bike ride from home.\"",
      },
      {
        q: "What does Alistair say is the tricky part?",
        options: [
          "Designing the concept itself.",
          "Convincing people that a more local pace of life is a positive change.",
          "Finding funding from the government.",
        ],
        answerIndex: 1,
        explanation: "\"Convincing people that a slower, more local pace of life is something to look forward to.\"",
      },
    ],
  },
  {
    id: "l-university-choice",
    title: "Choosing a Degree for the Wrong Reasons",
    topic: "university",
    accent: "american",
    level: "B2",
    speaker: "Dana, academic advisor",
    durationSec: 70,
    transcript:
      "So many students pick a major based on what sounds impressive at a dinner table, and honestly, that's a pretty rough way to plan the next four years. I always ask them the same question: if nobody ever found out what you studied, would you still choose it? That usually cuts through a lot of the noise pretty fast. It's not that prestige doesn't matter at all — it can open doors, sure — but if you hate what you're doing every single day, that door isn't going to feel like much of an opportunity once you're through it.",
    questions: [
      {
        q: "What question does Dana ask students?",
        options: [
          "Would you still choose this major if nobody found out?",
          "How much money will this major earn you?",
          "What did your parents study?",
        ],
        answerIndex: 0,
        explanation: "\"If nobody ever found out what you studied, would you still choose it?\"",
      },
      {
        q: "What is her overall point?",
        options: [
          "Prestige is the only thing that matters.",
          "Enjoying the daily work matters more than how impressive the subject sounds.",
          "Students should avoid university altogether.",
        ],
        answerIndex: 1,
        explanation: "\"If you hate what you're doing every single day, that door isn't going to feel like much of an opportunity.\"",
      },
    ],
  },
  {
    id: "l-climate-economics",
    title: "Why Green Policy Is Really About Money",
    topic: "economics",
    accent: "irish",
    level: "C2",
    speaker: "Dr. Niamh O'Sullivan, economist",
    durationSec: 90,
    transcript:
      "People frame climate policy as a moral question, and sure, there's a moral dimension — but if you actually want it to happen at scale, you have to talk about it as an economic one. Subsidies, carbon pricing, investment incentives — these are the levers that move entire industries, far more reliably than appeals to conscience ever will. That's not cynical, it's just realistic. A factory owner might genuinely care about emissions, but they're not going to retool their entire production line unless the numbers make sense on a spreadsheet. So the policies that actually work tend to be the ones that make the sustainable option the cheaper option, not the ones that simply ask people to be better.",
    questions: [
      {
        q: "What is Dr. O'Sullivan's main argument?",
        options: [
          "Climate policy should focus purely on morality.",
          "Effective climate policy needs to work as economic incentive, not just moral appeal.",
          "Subsidies never work for climate goals.",
        ],
        answerIndex: 1,
        explanation: "\"If you actually want it to happen at scale, you have to talk about it as an economic one.\"",
      },
      {
        q: "What does she say makes policies actually work?",
        options: [
          "Making the sustainable option the cheaper option.",
          "Asking companies to volunteer.",
          "Public shaming campaigns.",
        ],
        answerIndex: 0,
        explanation: "\"The policies that actually work tend to be the ones that make the sustainable option the cheaper option.\"",
      },
    ],
  },
  {
    id: "l-team-sports",
    title: "What Team Sports Taught Me About Failure",
    topic: "sports",
    accent: "australian",
    level: "B2",
    speaker: "Liam, former athlete",
    durationSec: 76,
    transcript:
      "In individual sports, when you lose, it's just you — there's nowhere to hide, but there's also nobody else's mistake to think about. Team sports are a completely different beast. You can play the best game of your life and still lose because someone else on the field had an off day, and vice versa. That messed with my head for years, if I'm honest. But eventually it taught me something I don't think I would've learned otherwise: that you can do everything right and still not get the outcome you wanted, and that's not failure — that's just how anything involving other people actually works.",
    questions: [
      {
        q: "What's the key difference Liam describes between individual and team sports?",
        options: [
          "Team sports are always easier to win.",
          "In team sports, your result also depends on other people's performance.",
          "Individual sports don't involve losing.",
        ],
        answerIndex: 1,
        explanation: "\"You can play the best game of your life and still lose because someone else... had an off day.\"",
      },
      {
        q: "What lesson did he eventually take from this?",
        options: [
          "You can do everything right and still not get the outcome you wanted — that isn't failure.",
          "Individual sports are better than team sports.",
          "Winning is the only thing that matters.",
        ],
        answerIndex: 0,
        explanation: "\"You can do everything right and still not get the outcome you wanted, and that's not failure.\"",
      },
    ],
  },
  {
    id: "l-election-turnout",
    title: "Why Young People Don't Vote",
    topic: "politics",
    accent: "canadian",
    level: "C1",
    speaker: "Sam, political researcher",
    durationSec: 82,
    transcript:
      "The lazy explanation is that young people just don't care, but that's not really what the data shows. What we actually see is a trust problem — a lot of young voters believe, rightly or wrongly, that their vote doesn't meaningfully change the outcome, especially in systems that aren't proportional. So it's less apathy and more a kind of rational disengagement — why show up to a system you don't believe is listening to you? If you want turnout to go up, the fix isn't another awareness campaign telling people to vote. It's making the connection between voting and an actual, visible outcome much clearer than it currently is.",
    questions: [
      {
        q: "According to Sam, what's the real reason many young people don't vote?",
        options: [
          "They genuinely don't care about politics.",
          "A trust problem — they doubt their vote changes anything.",
          "They don't know when elections happen.",
        ],
        answerIndex: 1,
        explanation: "\"What we actually see is a trust problem... their vote doesn't meaningfully change the outcome.\"",
      },
      {
        q: "What does he say is NOT the right fix?",
        options: [
          "Making outcomes more visible.",
          "Another awareness campaign telling people to vote.",
          "Changing the voting system.",
        ],
        answerIndex: 1,
        explanation: "\"The fix isn't another awareness campaign telling people to vote.\"",
      },
    ],
  },
];

export interface ConnectedSpeechItem {
  id: string;
  formal: string;
  spoken: string;
  example: string;
  note: string;
}

export const CONNECTED_SPEECH: ConnectedSpeechItem[] = [
  {
    id: "want-to",
    formal: "want to",
    spoken: "wanna",
    example: "I wanna get this finished before lunch.",
    note: "Extremely common in casual speech — never write 'wanna' in an email or essay.",
  },
  {
    id: "going-to",
    formal: "going to",
    spoken: "gonna",
    example: "We're gonna be late if we don't leave now.",
    note: "Used for the future 'going to' form — not for literal movement ('I'm going to the store' stays as is, though it can still reduce in fast speech).",
  },
  {
    id: "got-to",
    formal: "have got to / have to",
    spoken: "gotta",
    example: "I gotta call my landlord back today.",
    note: "Informal equivalent of 'have to' / 'must' — common in spoken American and British English alike.",
  },
  {
    id: "did-you",
    formal: "did you",
    spoken: "didja",
    example: "Didja see the game last night?",
    note: "A reduction almost never written down, but extremely common to hear — recognising it matters more than producing it.",
  },
  {
    id: "would-have",
    formal: "would have",
    spoken: "would've (sounds like 'would of')",
    example: "I would've called you if I'd known.",
    note: "Because it sounds like 'of', many native speakers even misspell this in writing — but the grammar is always 'would have'.",
  },
  {
    id: "give-me",
    formal: "give me",
    spoken: "gimme",
    example: "Gimme a second, I'll be right there.",
    note: "Very casual — fine among friends, never in professional writing.",
  },
  {
    id: "kind-of",
    formal: "kind of / sort of",
    spoken: "kinda / sorta",
    example: "It's kinda hard to explain without showing you.",
    note: "Softens a statement — a spoken-English hedge word, similar in function to 'somewhat'.",
  },
  {
    id: "dont-know",
    formal: "I don't know",
    spoken: "dunno",
    example: "Dunno, maybe we should just ask her directly.",
    note: "Common filler when someone is thinking out loud or being deliberately casual.",
  },
  {
    id: "let-me",
    formal: "let me",
    spoken: "lemme",
    example: "Lemme think about it and get back to you.",
    note: "Reduction of 'let me' — heard constantly, essentially never written.",
  },
  {
    id: "what-are-you",
    formal: "what are you",
    spoken: "whatcha",
    example: "Whatcha up to this weekend?",
    note: "Very informal — typical of relaxed, friendly small talk, not used with strangers or in formal contexts.",
  },
];
