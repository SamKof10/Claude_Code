/** The non-linguistic half of a review: who wrote it and what they own. */
export interface ReviewMeta {
  id: string;
  name: string;
  rating: number;
  variant: string;
}

export const REVIEW_META: ReviewMeta[] = [
  { id: "r1", name: "Marit Hollander", rating: 5, variant: "ARC MAX · Graphit" },
  { id: "r2", name: "Tobias Reuter", rating: 5, variant: "ARC MAX · Alabaster" },
  { id: "r3", name: "Sana Iqbal", rating: 4, variant: "ARC · Sand" },
  { id: "r4", name: "Jonas Bakke", rating: 5, variant: "ARC · Graphit" },
  { id: "r5", name: "Elena Fischer", rating: 5, variant: "ARC MAX · Graphit" },
  { id: "r6", name: "Peter Lindqvist", rating: 4, variant: "ARC · Alabaster" },
];

export const REVIEW_STATS = {
  average: 4.8,
  count: 2417,
  recommendPct: 96,
  fiveStarPct: 84,
};

/** Countries we actually ship to, grouped so the select stays scannable. */
export const SHIPPING_REGIONS: { region: "eu" | "europe" | "world"; countries: string[] }[] = [
  {
    region: "eu",
    countries: [
      "Deutschland",
      "Österreich",
      "Belgien",
      "Dänemark",
      "Spanien",
      "Finnland",
      "Frankreich",
      "Irland",
      "Italien",
      "Luxemburg",
      "Niederlande",
      "Polen",
      "Portugal",
      "Schweden",
      "Tschechien",
    ],
  },
  { region: "europe", countries: ["Schweiz", "Vereinigtes Königreich", "Norwegen", "Island"] },
  {
    region: "world",
    countries: [
      "USA",
      "Kanada",
      "Australien",
      "Neuseeland",
      "Japan",
      "Südkorea",
      "Singapur",
      "Hongkong",
      "Vereinigte Arabische Emirate",
      "Brasilien",
      "Mexiko",
      "Südafrika",
    ],
  },
];
