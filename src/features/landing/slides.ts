export interface Slide {
  id: string;
  paragraphs?: readonly (readonly string[])[];
}

export const SLIDES: readonly Slide[] = [
  { id: "crowd" },
  { id: "wordmark" },
  {
    id: "standing",
    paragraphs: [
      ["ふわふわの仲間たちに、", "囲まれて暮らしたい。"],
      ["ぬいぐるみが好きなあなたへ。"],
    ],
  },
];
