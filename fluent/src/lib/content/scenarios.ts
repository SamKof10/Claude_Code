export type Naturalness = "awkward" | "good" | "natural";

export interface ScenarioOption {
  text: string;
  quality: Naturalness;
  feedback: string;
}

export interface ScenarioTurn {
  npc: string;
  options: ScenarioOption[];
}

export interface Scenario {
  id: string;
  title: string;
  icon: string;
  setting: string;
  turns: ScenarioTurn[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "airport",
    title: "Airport",
    icon: "Plane",
    setting: "You're checking in for a flight and something's gone wrong with your booking.",
    turns: [
      {
        npc: "I'm sorry, but it looks like your flight has been overbooked — we don't have a seat for you on this one.",
        options: [
          { text: "This is not possible! I have a ticket!", quality: "awkward", feedback: "Understandable frustration, but this comes across as confrontational rather than assertive." },
          { text: "I have a confirmed booking — can you check again, please?", quality: "good", feedback: "Clear and polite. A solid, professional way to push back." },
          { text: "I understand things happen, but I do have a confirmed reservation — could you look into what options I have?", quality: "natural", feedback: "This is how fluent speakers handle friction: acknowledge the situation, then calmly assert your position." },
        ],
      },
      {
        npc: "I can offer you a seat on the next flight in three hours, plus a meal voucher. Would that work?",
        options: [
          { text: "Yes okay.", quality: "awkward", feedback: "Grammatically fine, but sounds resigned rather than engaged." },
          { text: "That would be fine, thank you.", quality: "good", feedback: "Polite and clear — a safe, solid response." },
          { text: "That works for me — would it be possible to get a seat near the front, given the wait?", quality: "natural", feedback: "This shows initiative. 'Would it be possible' is exactly how fluent speakers negotiate politely." },
        ],
      },
    ],
  },
  {
    id: "hotel",
    title: "Hotel",
    icon: "BedDouble",
    setting: "You arrive at your hotel late and there's an issue with your room.",
    turns: [
      {
        npc: "I'm afraid the room you booked isn't available — there was a mix-up with the reservation.",
        options: [
          { text: "That's a big problem for me.", quality: "awkward", feedback: "Correct, but vague and a little dramatic for the situation." },
          { text: "Oh no, that's frustrating. What are my options?", quality: "good", feedback: "Natural reaction, and moves the conversation forward productively." },
          { text: "That's a shame — I was really looking forward to that room. What can you offer instead?", quality: "natural", feedback: "Adds a personal touch while staying calm and solution-focused — very native-like." },
        ],
      },
      {
        npc: "We can upgrade you to a suite at no extra cost as an apology.",
        options: [
          { text: "Good.", quality: "awkward", feedback: "Grammatically fine but sounds curt — almost rude in this context." },
          { text: "That sounds great, thank you.", quality: "good", feedback: "Simple, polite, and appropriate." },
          { text: "That's more than fair — I really appreciate you sorting this out.", quality: "natural", feedback: "Warmer and more specific — 'sorting this out' is a very natural phrasal verb here." },
        ],
      },
    ],
  },
  {
    id: "restaurant",
    title: "Restaurant",
    icon: "UtensilsCrossed",
    setting: "Your order arrives, but it's not what you ordered.",
    turns: [
      {
        npc: "Here's your dish — the salmon, as requested.",
        options: [
          { text: "No, I ordered chicken. This is wrong.", quality: "awkward", feedback: "Direct and correct, but sounds blunt for a service interaction." },
          { text: "Sorry, I think there's been a mistake — I actually ordered the chicken.", quality: "good", feedback: "Polite, clear, and easy to say under pressure." },
          { text: "I hate to be that person, but I'm pretty sure I ordered the chicken, not the salmon.", quality: "natural", feedback: "'I hate to be that person' is a very natural, self-aware way to soften a complaint." },
        ],
      },
      {
        npc: "My apologies — I'll get that fixed right away. Would you like a drink on the house while you wait?",
        options: [
          { text: "Yes I want water.", quality: "awkward", feedback: "Understandable, but a bit blunt — missing softeners like 'please' or 'I'll have'." },
          { text: "Yes, please, that would be nice.", quality: "good", feedback: "Polite and complete." },
          { text: "That's very kind of you, thank you — I'll just have a sparkling water.", quality: "natural", feedback: "Warm, specific, and exactly how a native speaker would accept the gesture." },
        ],
      },
    ],
  },
  {
    id: "job-interview",
    title: "Job Interview",
    icon: "Briefcase",
    setting: "You're being interviewed for a role you really want.",
    turns: [
      {
        npc: "So, tell me — why do you want to work with us?",
        options: [
          { text: "Because I need a job and it's near my home.", quality: "awkward", feedback: "Too honest for an interview — it doesn't show any interest in the company itself." },
          { text: "I think this company has good opportunities and I want to grow.", quality: "good", feedback: "Safe and correct, though a little generic — could be said about almost any company." },
          { text: "What really drew me in was how the team talks about ownership — I want to work somewhere my input actually shapes decisions.", quality: "natural", feedback: "Specific, confident, and shows you've actually thought about the company — exactly what interviewers want to hear." },
        ],
      },
      {
        npc: "What would you say is your biggest weakness?",
        options: [
          { text: "I don't have weaknesses.", quality: "awkward", feedback: "A classic red flag answer — it signals a lack of self-awareness." },
          { text: "Sometimes I take on too much work.", quality: "good", feedback: "A common, safe answer — works, but every interviewer has heard it many times." },
          { text: "I used to struggle with delegating — I've been actively working on trusting my team with bigger pieces of ownership.", quality: "natural", feedback: "Honest, specific, and shows growth — the structure 'used to... but I've been working on...' is a great C1 pattern to reuse." },
        ],
      },
    ],
  },
  {
    id: "university",
    title: "University",
    icon: "GraduationCap",
    setting: "You're meeting your professor to discuss a missed deadline.",
    turns: [
      {
        npc: "You were supposed to submit this last Friday. What happened?",
        options: [
          { text: "I forgot, sorry.", quality: "awkward", feedback: "Honest, but doesn't take the conversation seriously enough for an academic context." },
          { text: "I'm sorry, I had some personal issues that got in the way.", quality: "good", feedback: "Reasonable and polite, if a little vague." },
          { text: "I apologise — I underestimated how long the research would take, and I should have reached out sooner instead of missing the deadline silently.", quality: "natural", feedback: "Accountable and specific — this is the kind of answer that actually builds trust with a professor." },
        ],
      },
      {
        npc: "I can give you until Wednesday, but no later.",
        options: [
          { text: "Ok thanks.", quality: "awkward", feedback: "Understandable, but too casual for the context." },
          { text: "Thank you, I really appreciate it.", quality: "good", feedback: "Polite and appropriate." },
          { text: "Thank you — I won't let it happen again.", quality: "natural", feedback: "Short, confident, and shows real accountability without over-explaining." },
        ],
      },
    ],
  },
  {
    id: "presentation",
    title: "Presentation",
    icon: "Presentation",
    setting: "You're presenting to colleagues and someone challenges your data.",
    turns: [
      {
        npc: "I'm not sure these numbers add up — where did this data come from?",
        options: [
          { text: "It's correct, trust me.", quality: "awkward", feedback: "Sounds defensive and doesn't actually answer the question." },
          { text: "That's a fair question — the data comes from last quarter's report.", quality: "good", feedback: "Calm, clear, and directly answers the concern." },
          { text: "Great question — that's pulled directly from last quarter's report, though I take your point that it's worth double-checking the outliers.", quality: "natural", feedback: "Confident and open at the same time — acknowledging a valid point makes you sound more credible, not less." },
        ],
      },
      {
        npc: "Okay, that makes sense. Can you go back to the previous slide?",
        options: [
          { text: "Yes wait.", quality: "awkward", feedback: "Understandable, but too abrupt for a professional setting." },
          { text: "Sure, one second.", quality: "good", feedback: "Simple and clear." },
          { text: "Of course — let me just pull that back up for you.", quality: "natural", feedback: "Smooth and professional — 'pull up' is exactly the phrasal verb a native speaker would use here." },
        ],
      },
    ],
  },
  {
    id: "business-meeting",
    title: "Business Meeting",
    icon: "Users",
    setting: "A colleague proposes an idea you disagree with.",
    turns: [
      {
        npc: "I think we should cut the marketing budget in half this quarter.",
        options: [
          { text: "No, that's a bad idea.", quality: "awkward", feedback: "Too blunt for a professional disagreement — can come across as dismissive." },
          { text: "I'm not sure that's the best idea, actually.", quality: "good", feedback: "Polite pushback, clearly stated." },
          { text: "I see where you're coming from, but I'm not sure that's the right call given where we are right now.", quality: "natural", feedback: "Diplomatic and confident — validating the other person first makes disagreement land much better." },
        ],
      },
      {
        npc: "Fair enough — what would you suggest instead?",
        options: [
          { text: "I don't know, maybe less.", quality: "awkward", feedback: "Vague — doesn't give your colleague anything concrete to respond to." },
          { text: "Maybe we could reduce it by 20% instead.", quality: "good", feedback: "Specific and constructive." },
          { text: "What if we trimmed it by around 20% and reassessed after Q2, rather than cutting it outright?", quality: "natural", feedback: "This proposes a concrete, lower-risk alternative — exactly how strong ideas get pitched in meetings." },
        ],
      },
    ],
  },
  {
    id: "friends-abroad",
    title: "Making Friends Abroad",
    icon: "HeartHandshake",
    setting: "You're at a social event and someone starts chatting with you.",
    turns: [
      {
        npc: "So, are you new around here? I haven't seen you before.",
        options: [
          { text: "Yes, I come here two months.", quality: "awkward", feedback: "A common tense error — needs 'I moved here' or 'I've been here for two months'." },
          { text: "Yes, I moved here two months ago.", quality: "good", feedback: "Grammatically correct and clear." },
          { text: "Yeah, just moved here a couple of months ago — still finding my feet, to be honest.", quality: "natural", feedback: "Casual, warm, and idiomatic — 'finding my feet' instantly signals a higher level of fluency." },
        ],
      },
      {
        npc: "That's exciting! What brought you here?",
        options: [
          { text: "Work.", quality: "awkward", feedback: "Too terse for small talk — it can shut the conversation down." },
          { text: "I moved here for work.", quality: "good", feedback: "Clear and complete." },
          { text: "Mostly work, but honestly I'd been wanting a change of scenery for a while anyway.", quality: "natural", feedback: "Gives the other person something to follow up on — great for keeping a conversation going." },
        ],
      },
    ],
  },
  {
    id: "small-talk",
    title: "Small Talk",
    icon: "MessageCircle",
    setting: "You're waiting in line and someone starts a casual conversation.",
    turns: [
      {
        npc: "Busy today, isn't it?",
        options: [
          { text: "Yes, very busy.", quality: "awkward", feedback: "Correct but flat — doesn't invite further conversation." },
          { text: "Yeah, it's been like this all morning.", quality: "good", feedback: "Natural and conversational." },
          { text: "Tell me about it — I've been standing here for twenty minutes already!", quality: "natural", feedback: "'Tell me about it' is a great idiom for agreeing enthusiastically — very native-sounding small talk." },
        ],
      },
      {
        npc: "Ha, I feel you. Do you come here often?",
        options: [
          { text: "Sometimes.", quality: "awkward", feedback: "Too short — small talk usually expects a slightly fuller answer." },
          { text: "Yeah, every couple of weeks.", quality: "good", feedback: "Natural and appropriately brief." },
          { text: "Often enough that I probably should know the staff by name by now.", quality: "natural", feedback: "Adds a touch of humour — exactly the kind of light banter native speakers use in small talk." },
        ],
      },
    ],
  },
  {
    id: "doctor",
    title: "Doctor",
    icon: "Stethoscope",
    setting: "You're describing your symptoms to a doctor.",
    turns: [
      {
        npc: "So, what seems to be the problem today?",
        options: [
          { text: "I have pain in stomach since two days.", quality: "awkward", feedback: "Common grammar transfer from German — needs an article ('a stomach') and 'for two days', not 'since two days'." },
          { text: "I've had a stomach ache for two days.", quality: "good", feedback: "Correct present perfect and preposition use." },
          { text: "I've been having stomach pain for a couple of days now — it tends to get worse after eating.", quality: "natural", feedback: "More detail helps the doctor and sounds naturally fluent — 'tends to' is a great C1 pattern for describing recurring symptoms." },
        ],
      },
      {
        npc: "Have you noticed anything that makes it better or worse?",
        options: [
          { text: "No I don't know.", quality: "awkward", feedback: "Understandable, but doesn't give the doctor anything useful to work with." },
          { text: "It gets worse after I eat.", quality: "good", feedback: "Clear and useful information." },
          { text: "It seems to flare up mostly after meals, and lying down seems to help a bit.", quality: "natural", feedback: "'Flare up' is exactly the kind of natural verb native speakers use for recurring symptoms." },
        ],
      },
    ],
  },
  {
    id: "customer-service",
    title: "Customer Service",
    icon: "Headset",
    setting: "You're calling to complain about a faulty product.",
    turns: [
      {
        npc: "Thank you for calling — how can I help you today?",
        options: [
          { text: "My product is broken, I want new one.", quality: "awkward", feedback: "Understandable, but missing articles and sounds overly blunt for a service call." },
          { text: "Hi, I'm calling because the product I ordered arrived damaged.", quality: "good", feedback: "Clear, complete, and polite." },
          { text: "Hi there — I'm calling because the item I received arrived damaged, and I'd like to sort out a replacement or refund.", quality: "natural", feedback: "Efficient and proactive — stating what you want upfront saves everyone time, which native speakers do instinctively." },
        ],
      },
      {
        npc: "I'm sorry to hear that. Could you tell me your order number?",
        options: [
          { text: "Wait I search.", quality: "awkward", feedback: "Too fragmented — needs a full sentence, e.g. 'let me check'." },
          { text: "Sure, one moment while I find it.", quality: "good", feedback: "Clear and polite." },
          { text: "Of course — bear with me a second, I'll dig it out.", quality: "natural", feedback: "'Bear with me' and 'dig it out' are both very natural, idiomatic ways to ask someone to wait." },
        ],
      },
    ],
  },
  {
    id: "renting",
    title: "Renting an Apartment",
    icon: "KeyRound",
    setting: "You're viewing an apartment and speaking with the landlord.",
    turns: [
      {
        npc: "So, what do you think of the place?",
        options: [
          { text: "Is good. I want it.", quality: "awkward", feedback: "Missing subject and article — needs 'It's good' or a fuller sentence." },
          { text: "I really like it — it's exactly what I was looking for.", quality: "good", feedback: "Clear, natural, and enthusiastic." },
          { text: "I really like it — the light in here is great, and it's pretty much exactly what I had in mind.", quality: "natural", feedback: "Adding a specific detail (the light) makes your interest sound genuine, not generic." },
        ],
      },
      {
        npc: "Great — I do need references and proof of income, if that's alright.",
        options: [
          { text: "Ok I send.", quality: "awkward", feedback: "Missing subject, object, and tense — needs a complete sentence." },
          { text: "Sure, no problem, I can send those over today.", quality: "good", feedback: "Clear, complete, and professional." },
          { text: "Of course — I'll have those sent over to you by this evening.", quality: "natural", feedback: "'I'll have those sent over' is a smooth, slightly more formal native structure — great for practical arrangements." },
        ],
      },
    ],
  },
];

export interface AbroadPrompt {
  id: string;
  speaker: string;
  line: string;
  context: string;
  keywords: string[];
  timeLimitSec: number;
}

export const ABROAD_PROMPTS: AbroadPrompt[] = [
  {
    id: "a1",
    speaker: "Stranger, fast pace",
    line: "Sorry, quick one — d'you know if this bus goes anywhere near the station?",
    context: "Someone stops you on the street, talking fast.",
    keywords: ["think", "sorry", "not sure", "station", "bus"],
    timeLimitSec: 12,
  },
  {
    id: "a2",
    speaker: "Barista",
    line: "What can I get started for you?",
    context: "You're ordering coffee in a busy café.",
    keywords: ["coffee", "please", "have", "like", "size"],
    timeLimitSec: 10,
  },
  {
    id: "a3",
    speaker: "Colleague, in a hurry",
    line: "Hey, can you send that file over before you head out? Like, now-now.",
    context: "A colleague rushes past your desk at the end of the day.",
    keywords: ["sure", "send", "now", "one sec", "give me"],
    timeLimitSec: 10,
  },
  {
    id: "a4",
    speaker: "Flatmate",
    line: "Ugh, we're completely out of milk again — did you use the last of it?",
    context: "Casual conversation at home.",
    keywords: ["sorry", "didn't", "yeah", "get", "buy"],
    timeLimitSec: 10,
  },
  {
    id: "a5",
    speaker: "Shop assistant",
    line: "Just so you know, that one's actually on sale — d'you want me to swap it for you?",
    context: "You're browsing in a shop.",
    keywords: ["yes", "please", "sure", "thanks", "that'd"],
    timeLimitSec: 10,
  },
  {
    id: "a6",
    speaker: "Taxi driver",
    line: "Where to, and are we in a rush or have we got time?",
    context: "You just got into a taxi.",
    keywords: ["airport", "station", "please", "rush", "time"],
    timeLimitSec: 10,
  },
  {
    id: "a7",
    speaker: "New acquaintance",
    line: "So what do you actually do, day to day, I mean?",
    context: "Someone asks about your job at a social event.",
    keywords: ["work", "job", "mostly", "basically", "I'm a"],
    timeLimitSec: 12,
  },
  {
    id: "a8",
    speaker: "Receptionist",
    line: "Take a seat, they'll be with you in just a sec — can I get you anything while you wait?",
    context: "You're checking in for an appointment.",
    keywords: ["no thanks", "fine", "water", "that's okay", "I'm good"],
    timeLimitSec: 10,
  },
  {
    id: "a9",
    speaker: "Passer-by",
    line: "Sorry to bug you — is this seat taken, or...?",
    context: "You're sitting alone on a train.",
    keywords: ["no", "go ahead", "free", "sure", "please"],
    timeLimitSec: 8,
  },
  {
    id: "a10",
    speaker: "Event host",
    line: "Right, before we kick off — anyone here for the first time, or are we all regulars?",
    context: "You've just arrived at a group meetup.",
    keywords: ["first time", "new", "actually", "yeah", "I am"],
    timeLimitSec: 12,
  },
];
