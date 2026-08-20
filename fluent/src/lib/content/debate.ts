export interface DebateTopic {
  id: string;
  title: string;
  context: string;
  sampleWeak: string;
  sampleStrong: string;
}

export const DEBATE_TOPICS: DebateTopic[] = [
  {
    id: "d-social-media",
    title: "Should social media companies be responsible for misinformation?",
    context: "Platforms argue they're neutral hosts; critics argue their algorithms actively amplify false content.",
    sampleWeak: "I think social media is bad because fake news spreads fast and companies don't do anything.",
    sampleStrong:
      "From my perspective, platforms can't claim to be neutral when their algorithms actively reward the most engaging content — which is often the most extreme. That said, holding them fully responsible raises real questions about who decides what counts as 'misinformation'. The main issue here is accountability without turning platforms into censors.",
  },
  {
    id: "d-free-university",
    title: "Should university be free for everyone?",
    context: "Some countries offer tuition-free higher education funded by taxes; others rely on tuition and loans.",
    sampleWeak: "University should be free because not everyone can pay and it's not fair.",
    sampleStrong:
      "Arguably, free tuition removes one of the biggest barriers to social mobility. A counterargument would be that 'free' just shifts the cost onto taxpayers who never attend university themselves. Even so, I'd argue the long-term economic benefit of a better-educated workforce outweighs that cost.",
  },
  {
    id: "d-remote-work",
    title: "Is remote work better than office work?",
    context: "Remote work expanded rapidly after 2020; many companies are now pulling employees back to offices.",
    sampleWeak: "Remote work is better because you don't have to travel and you have more free time.",
    sampleStrong:
      "It's arguably a double-edged sword: remote work gives people back hours they used to spend commuting, but it can quietly erode the kind of spontaneous collaboration that happens in person. What's more, the answer probably depends heavily on the type of work — creative, high-trust collaboration suffers more than solo, focused tasks.",
  },
  {
    id: "d-four-day-week",
    title: "Should there be a four-day work week?",
    context: "Several pilot studies report similar or higher productivity with a shorter working week.",
    sampleWeak: "A four-day week is good because people are less tired and work better.",
    sampleStrong:
      "The evidence from recent pilots is genuinely compelling — several companies reported unchanged or even improved output. That said, a four-day week is far easier to implement in some industries than others; a hospital or a factory can't simply close a day early. Ultimately, the model needs to be adapted, not applied uniformly.",
  },
  {
    id: "d-plastics-ban",
    title: "Should countries ban single-use plastics entirely?",
    context: "Single-use plastics are convenient and cheap, but a major contributor to pollution.",
    sampleWeak: "Plastic is bad for the environment so it should be banned completely.",
    sampleStrong:
      "Nobody seriously disputes that single-use plastic is an environmental disaster. However, a total ban risks unintended consequences — some medical and food-safety uses genuinely lack a viable alternative yet. A more nuanced approach might be a strict ban on non-essential uses, paired with real investment in alternatives for the essential ones.",
  },
  {
    id: "d-eating-meat",
    title: "Is it ethical to eat meat in 2026?",
    context: "Concerns about animal welfare and climate impact are colliding with cultural and economic realities.",
    sampleWeak: "Eating meat is bad for animals and the planet, so people should stop.",
    sampleStrong:
      "Admittedly, the environmental case against industrial meat production is hard to argue with. That said, framing this purely as an individual moral failing arguably lets the real culprit — industrial-scale farming practices — off the hook. The main issue here is less about individual choice and more about systemic incentives.",
  },
  {
    id: "d-ai-regulation",
    title: "Should artificial intelligence be regulated more strictly?",
    context: "AI capability is advancing faster than most legal frameworks can keep pace with.",
    sampleWeak: "AI is dangerous so governments should control it more.",
    sampleStrong:
      "Some would argue that heavy-handed regulation stifles innovation, and there's truth to that. Even so, the pace of deployment right now is arguably outstripping our ability to understand the risks — which is precisely the kind of situation regulation exists for. The real debate isn't whether to regulate, but how to do it without freezing progress entirely.",
  },
  {
    id: "d-ai-homework",
    title: "Should students be allowed to use AI tools for homework?",
    context: "AI writing tools are widely available; schools disagree on how — or whether — to allow them.",
    sampleWeak: "Students shouldn't use AI for homework because it's cheating and they don't learn anything.",
    sampleStrong:
      "It's tempting to call this straightforward cheating, but I'd push back on that a little. Used badly, sure, it undermines learning entirely. Used well — say, to get feedback on a draft — it can arguably teach more than an unaided attempt would. The real question schools need to answer isn't 'ban or allow', but what kind of use actually supports learning.",
  },
];

export interface DebatePhrase {
  id: string;
  phrase: string;
  function: "opening" | "counter" | "concede" | "conclude";
}

export const DEBATE_PHRASE_LABELS: Record<DebatePhrase["function"], string> = {
  opening: "Opening your point",
  counter: "Raising a counter-argument",
  concede: "Conceding a point",
  conclude: "Concluding",
};

export const DEBATE_PHRASES: DebatePhrase[] = [
  { id: "p-in-my-opinion", phrase: "In my opinion, …", function: "opening" },
  { id: "p-from-my-perspective", phrase: "From my perspective, …", function: "opening" },
  { id: "p-id-argue", phrase: "I'd argue that …", function: "opening" },
  { id: "p-arguably", phrase: "Arguably, the most important factor is …", function: "opening" },
  { id: "p-counterargument", phrase: "A counterargument would be that …", function: "counter" },
  { id: "p-some-might-say", phrase: "Some might say that …, but …", function: "counter" },
  { id: "p-push-back", phrase: "I'd push back on that a little — …", function: "counter" },
  { id: "p-one-could-argue", phrase: "One could argue the opposite: …", function: "counter" },
  { id: "p-that-said", phrase: "That said, …", function: "concede" },
  { id: "p-admittedly", phrase: "Admittedly, there's some truth to that.", function: "concede" },
  { id: "p-i-take-your-point", phrase: "I take your point, but …", function: "concede" },
  { id: "p-fair-enough", phrase: "Fair enough — but consider this: …", function: "concede" },
  { id: "p-main-issue", phrase: "The main issue here is …", function: "conclude" },
  { id: "p-all-things-considered", phrase: "All things considered, …", function: "conclude" },
  { id: "p-at-the-end-of-the-day", phrase: "At the end of the day, …", function: "conclude" },
  { id: "p-ultimately", phrase: "Ultimately, it comes down to …", function: "conclude" },
];
