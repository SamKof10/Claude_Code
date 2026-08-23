export type FlightCategory = "freestyle" | "race" | "long-range"

export interface FlightLogEntry {
  seed: number
  title: string
  description: string
  location: string
  date: string
  duration: string
  setup: string
  category: FlightCategory
}

export const CATEGORY_LABEL: Record<FlightCategory, string> = {
  freestyle: "Freestyle",
  race: "Race",
  "long-range": "Long-Range",
}

export const flightLog: FlightLogEntry[] = [
  {
    seed: 17,
    title: "Donaukanal Dive",
    description: "Nachtflug durch die beleuchteten Unterführungen am Kanal.",
    location: "Wien, Donaukanal",
    date: "03/2026",
    duration: "2:41",
    setup: '5" Freestyle · 4S',
    category: "freestyle",
  },
  {
    seed: 42,
    title: "Steinbruch Line",
    description: "Enge Gaps zwischen den Felswänden im letzten Licht.",
    location: "Steinbruch, NÖ",
    date: "01/2026",
    duration: "3:05",
    setup: '5" Freestyle · 6S',
    category: "freestyle",
  },
  {
    seed: 8,
    title: "Alpine Descent",
    description: "Bombrun vom Grat bis ins Tal — 800 Höhenmeter am Stück.",
    location: "Zillertal, Tirol",
    date: "11/2025",
    duration: "4:12",
    setup: '7" Long-Range · 6S',
    category: "long-range",
  },
  {
    seed: 63,
    title: "Gate Rush",
    description: "Schnellste Runde der Session: 21,4 Sekunden.",
    location: "Rennstrecke, Graz",
    date: "10/2025",
    duration: "1:58",
    setup: '5" Race · 4S',
    category: "race",
  },
  {
    seed: 29,
    title: "Industriebrache",
    description: "Power-Loops zwischen den Stahlträgern der alten Halle.",
    location: "Werksgelände, Linz",
    date: "08/2025",
    duration: "2:27",
    setup: '5" Freestyle · 6S',
    category: "freestyle",
  },
  {
    seed: 55,
    title: "Skatepark Sesh",
    description: "Technische Lines durch die Bowls, tief und schnell.",
    location: "Skatepark, Salzburg",
    date: "06/2025",
    duration: "1:44",
    setup: '3.5" Freestyle · 4S',
    category: "freestyle",
  },
]
