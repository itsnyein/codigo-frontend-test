/**
 * Reference states 0, 1 and 2 only. The brief asks for three of the seven
 * slides; these three are consecutive, so both transitions are ones Fable
 * actually measured, and together they exercise every behaviour the research
 * marks as identity-carrying: the crowd clear-out, the wordmark hand-off, the
 * hero's pose continuity, depth-banded animals and the typewriter.
 */

export interface Slide {
  id: string;
  lines?: readonly string[];
}

export const SLIDES: readonly Slide[] = [
  { id: "crowd" },
  { id: "wordmark" },
  {
    id: "standing",
    lines: [
      "ふわふわの仲間たちに、",
      "囲まれて暮らしたい。",
      "ぬいぐるみが好きなあなたへ。",
    ],
  },
];
