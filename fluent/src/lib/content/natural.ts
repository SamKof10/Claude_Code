export interface NaturalUpgrade {
  id: string;
  context: string;
  basic: string;
  natural: string;
  advanced: string;
  toneNote: string;
}

export const NATURAL_UPGRADES: NaturalUpgrade[] = [
  {
    id: "n-dont-like",
    context: "Disagreeing politely",
    basic: "I don't like this idea.",
    natural: "I'm not really sold on the idea.",
    advanced: "I'm not particularly convinced that this is the right approach.",
    toneNote:
      "The basic version is blunt and personal. 'Not sold on it' softens the disagreement into something professional. The advanced version adds distance and precision — you're questioning the approach, not attacking the idea outright.",
  },
  {
    id: "n-nice-place",
    context: "Describing a place you like",
    basic: "This place is very nice.",
    natural: "I find this place incredibly appealing.",
    advanced: "What really draws me to this place is its atmosphere.",
    toneNote:
      "'Very nice' is flat and generic — the kind of thing a B1 learner says about everything. 'Incredibly appealing' is more expressive; the advanced version goes further by naming a specific reason, which always sounds more genuine.",
  },
  {
    id: "n-question",
    context: "Asking for something",
    basic: "I have a question.",
    natural: "Can I ask you something?",
    advanced: "I was wondering if I could pick your brain about something.",
    toneNote:
      "'I have a question' is correct but transactional. 'Can I ask you something' is how people actually open a conversation. 'Pick your brain' is a warm, idiomatic way to ask for someone's insight or advice.",
  },
  {
    id: "n-sport",
    context: "Talking about exercise (a common German calque)",
    basic: "I make sport on weekends.",
    natural: "I work out on weekends.",
    advanced: "I try to stay active on weekends — mostly running, with the occasional gym session.",
    toneNote:
      "'I make sport' is a direct translation of 'Sport machen' and doesn't exist in English. 'Work out' or 'exercise' is the natural verb. The advanced version adds real detail, which always reads as more fluent than a general statement.",
  },
  {
    id: "n-agree",
    context: "Agreeing with someone",
    basic: "I am agree with you.",
    natural: "I agree with you.",
    advanced: "I couldn't agree more, actually.",
    toneNote:
      "'I am agree' is a very common error — 'agree' is a verb in English, not an adjective, so no 'am' is needed. 'Couldn't agree more' is the emphatic, natural way fluent speakers show strong agreement.",
  },
  {
    id: "n-big-problem",
    context: "Describing a serious issue",
    basic: "It's a big problem.",
    natural: "It's a real issue we need to tackle.",
    advanced: "This is arguably one of the most pressing issues we're facing.",
    toneNote:
      "'Big problem' sounds almost childish in a professional context. 'Tackle' adds a sense of action; the advanced version adds weight and precision with 'arguably' and 'pressing' — vocabulary that signals C1 register.",
  },
  {
    id: "n-sorry-delay",
    context: "Apologising professionally",
    basic: "I am sorry for the delay.",
    natural: "Sorry about the delay.",
    advanced: "Apologies for the hold-up — I know your time is valuable.",
    toneNote:
      "The basic form is fine, just stiff. 'Sorry about' is what people actually say out loud. The advanced version adds empathy by acknowledging the impact on the other person — a very C1 move in professional writing.",
  },
  {
    id: "n-important",
    context: "Emphasising importance",
    basic: "This is very important.",
    natural: "This really matters.",
    advanced: "This is nothing short of essential.",
    toneNote:
      "'Very important' is the go-to phrase for every level — which is exactly why it sounds unremarkable. 'Nothing short of essential' is a stronger, more memorable way to make the same point.",
  },
  {
    id: "n-jump-in",
    context: "Interrupting in a meeting or debate",
    basic: "I want to say something.",
    natural: "Can I jump in for a second?",
    advanced: "If I could just add something here...",
    toneNote:
      "'I want to say something' works, but sounds abrupt. 'Jump in' is the standard, friendly way to interrupt in English conversation; the advanced phrase is the smoothest way to do it in a formal meeting.",
  },
  {
    id: "n-bad-weather",
    context: "Small talk about the weather",
    basic: "The weather is bad today.",
    natural: "The weather's pretty rubbish today.",
    advanced: "It's an absolutely miserable day out there.",
    toneNote:
      "'Bad' is correct but colourless. 'Rubbish' (mainly British, informal) is exactly what a native speaker might say casually. 'Miserable' paints a vivid picture and works in both spoken and written English.",
  },
  {
    id: "n-dont-know",
    context: "Admitting you don't know something",
    basic: "I don't know.",
    natural: "I'm not sure, to be honest.",
    advanced: "That's a good question — I honestly couldn't tell you off the top of my head.",
    toneNote:
      "A flat 'I don't know' can sound dismissive. Hedging with 'to be honest' softens it. The advanced version buys time gracefully and sounds confident even while admitting uncertainty — a genuinely useful C1 skill.",
  },
  {
    id: "n-good-job",
    context: "Praising someone's skills",
    basic: "He is very good at his job.",
    natural: "He really knows what he's doing.",
    advanced: "He's genuinely one of the most capable people I've worked with.",
    toneNote:
      "'Very good' is generic praise. 'Knows what he's doing' feels more like a real, specific compliment. The advanced version adds credibility by comparing him to others — the kind of detail that makes praise sound sincere.",
  },
];
