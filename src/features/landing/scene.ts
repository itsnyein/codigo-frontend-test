import { ANIMAL_ASPECT, SPECIES, type Species } from "./art/Animal";
import type { BandName } from "./motion";

export type Tone = "pale" | "soft" | "vivid" | "deep";

export interface Palette {
  fur: string;
  furDark: string;
  inner: string;
  ink: string;
}

const INK = "#233876";

const FUR: Record<string, Record<Tone, string>> = {
  cream: {
    vivid: "#f6e2c4",
    soft: "#faecd8",
    pale: "#fdf6ea",
    deep: "#c9a97c",
  },
  apricot: {
    vivid: "#f2913f",
    soft: "#f6b271",
    pale: "#fbdcba",
    deep: "#b4620f",
  },
  rose: { vivid: "#ef7f92", soft: "#f4a6b3", pale: "#fbd8de", deep: "#b44357" },
  sky: { vivid: "#6fa8e0", soft: "#9cc4ea", pale: "#d3e5f7", deep: "#2f5f9c" },
  moss: { vivid: "#78b06a", soft: "#a3c999", pale: "#d6e7d0", deep: "#3f6f38" },
  charcoal: {
    vivid: "#3b3f52",
    soft: "#6a6e82",
    pale: "#c3c6d2",
    deep: "#22263a",
  },
  snow: { vivid: "#ffffff", soft: "#f6f7fb", pale: "#ffffff", deep: "#d9dce8" },
};

type FurName = keyof typeof FUR;

const FUR_NAMES = Object.keys(FUR) as FurName[];

function paletteFor(fur: FurName, tone: Tone): Palette {
  const shades = FUR[fur] ?? FUR.cream!;
  return {
    fur: shades[tone],
    furDark: shades.deep,
    inner: shades.pale,
    ink: INK,
  };
}

export interface Placement {
  species: Species;
  palette: Palette;
  x: number;
  y: number;
  mx: number;
  my: number;
  size: number;
  rotate: number;
  band: BandName;
  layer: number;
  disperseX: number;
  disperseY: number;
  asleep: boolean;
  phase: number;
}

const round = (value: number) => Math.round(value * 1000) / 1000;

function noise(n: number): number {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

const DISPERSE_REACH = 58;

interface Seed {
  species: Species;
  fur: FurName;
  tone: Tone;
  x: number;
  y: number;
  mx?: number;
  my?: number;
  size: number;
  rotate: number;
  band: BandName;
  layer: number;
  asleep?: boolean;
}

function place(seed: Seed, index: number): Placement {
  const offsetX = seed.x - 50;
  const offsetY = seed.y - 50;
  const length = Math.hypot(offsetX, offsetY) || 1;

  return {
    species: seed.species,
    palette: paletteFor(seed.fur, seed.tone),
    x: round(seed.x),
    y: round(seed.y),
    mx: round(seed.mx ?? seed.x),
    my: round(seed.my ?? seed.y),
    size: round(seed.size),
    rotate: round(seed.rotate),
    band: seed.band,
    layer: seed.layer,
    disperseX: round((offsetX / length) * DISPERSE_REACH),
    disperseY: round((offsetY / length) * DISPERSE_REACH),
    asleep: seed.asleep ?? false,
    phase: round(noise(index * 13 + 7) * Math.PI * 2),
  };
}

const CROWD_ROWS = [-10, 6, 22, 38, 54, 70, 88, 104];
const CROWD_COLUMNS = 10;
const CROWD_STEP = 12;

function crowd(): Placement[] {
  const placements: Placement[] = [];
  let index = 0;

  for (let row = 0; row < CROWD_ROWS.length; row += 1) {
    for (let column = 0; column < CROWD_COLUMNS; column += 1) {
      const n = row * CROWD_COLUMNS + column;
      const stagger = (row % 2) * (CROWD_STEP / 2);
      const x = column * CROWD_STEP + stagger - 8 + (noise(n + 11) - 0.5) * 7;
      const y = (CROWD_ROWS[row] ?? 0) + (noise(n + 23) - 0.5) * 8;

      const nearHero = Math.abs(x - 50) < 13 && Math.abs(y - 52) < 20;
      if (nearHero) continue;

      const tonePool: Tone[] = [
        "vivid",
        "soft",
        "pale",
        "deep",
        "vivid",
        "soft",
      ];

      placements.push(
        place(
          {
            species:
              SPECIES[Math.floor(noise(n + 3) * SPECIES.length)] ?? "cat",
            fur:
              FUR_NAMES[Math.floor(noise(n + 41) * FUR_NAMES.length)] ??
              "cream",
            tone:
              tonePool[Math.floor(noise(n + 83) * tonePool.length)] ?? "soft",
            x,
            y,
            size: 19 + noise(n + 57) * 9,
            rotate: (noise(n + 71) - 0.5) * 30,
            band:
              noise(n + 97) > 0.6
                ? "near"
                : noise(n + 97) > 0.3
                  ? "mid"
                  : "far",
            layer: noise(n + 97) > 0.6 ? 3 : noise(n + 97) > 0.3 ? 2 : 1,
            asleep: noise(n + 93) > 0.62,
          },
          index,
        ),
      );
      index += 1;
    }
  }

  return placements;
}

const STANDING_SEEDS: readonly Seed[] = [
  {
    species: "rabbit",
    fur: "cream",
    tone: "soft",
    x: 62,
    y: 16,
    mx: 18,
    my: 42,
    size: 9,
    rotate: -6,
    band: "far",
    layer: 1,
  },
  {
    species: "bear",
    fur: "apricot",
    tone: "pale",
    x: 84,
    y: 24,
    mx: 82,
    my: 44,
    size: 10,
    rotate: 8,
    band: "far",
    layer: 1,
  },
  {
    species: "cat",
    fur: "charcoal",
    tone: "soft",
    x: 33,
    y: 14,
    mx: 48,
    my: 38,
    size: 9,
    rotate: -10,
    band: "far",
    layer: 1,
    asleep: true,
  },
  {
    species: "panda",
    fur: "snow",
    tone: "pale",
    x: 95,
    y: 70,
    mx: 90,
    my: 60,
    size: 10,
    rotate: 5,
    band: "far",
    layer: 1,
  },

  {
    species: "fox",
    fur: "apricot",
    tone: "vivid",
    x: 62,
    y: 86,
    mx: 28,
    my: 57,
    size: 15,
    rotate: -8,
    band: "mid",
    layer: 2,
  },
  {
    species: "dog",
    fur: "cream",
    tone: "vivid",
    x: 47,
    y: 72,
    mx: 70,
    my: 64,
    size: 14,
    rotate: 7,
    band: "mid",
    layer: 2,
  },
  {
    species: "cat",
    fur: "rose",
    tone: "soft",
    x: 88,
    y: 76,
    mx: 10,
    my: 68,
    size: 15,
    rotate: -12,
    band: "mid",
    layer: 2,
  },
  {
    species: "rabbit",
    fur: "sky",
    tone: "soft",
    x: 22,
    y: 24,
    mx: 86,
    my: 76,
    size: 13,
    rotate: 9,
    band: "mid",
    layer: 2,
    asleep: true,
  },

  {
    species: "bear",
    fur: "moss",
    tone: "vivid",
    x: 40,
    y: 95,
    mx: 24,
    my: 93,
    size: 22,
    rotate: -5,
    band: "near",
    layer: 4,
  },
  {
    species: "cat",
    fur: "charcoal",
    tone: "vivid",
    x: 68,
    y: 99,
    mx: 64,
    my: 96,
    size: 21,
    rotate: 6,
    band: "near",
    layer: 4,
  },
  {
    species: "panda",
    fur: "snow",
    tone: "vivid",
    x: 95,
    y: 94,
    mx: 96,
    my: 88,
    size: 23,
    rotate: -9,
    band: "near",
    layer: 4,
  },
  {
    species: "fox",
    fur: "rose",
    tone: "vivid",
    x: 14,
    y: 97,
    mx: 4,
    my: 86,
    size: 20,
    rotate: 11,
    band: "near",
    layer: 4,
  },
];

export interface Blob {
  x: number;
  y: number;
  size: number;
  colour: string;
  band: BandName;
  phase: number;
}

export const BLOBS: readonly Blob[] = [
  {
    x: 6,
    y: 10,
    size: 20,
    colour: "var(--blob-salmon)",
    band: "far",
    phase: 0.2,
  },
  {
    x: 88,
    y: 18,
    size: 22,
    colour: "var(--blob-salmon)",
    band: "mid",
    phase: 1.1,
  },
  { x: 38, y: 6, size: 17, colour: "var(--blob-sky)", band: "far", phase: 2.4 },
  {
    x: 3,
    y: 58,
    size: 19,
    colour: "var(--blob-salmon)",
    band: "mid",
    phase: 3.3,
  },
  {
    x: 96,
    y: 62,
    size: 18,
    colour: "var(--blob-salmon)",
    band: "far",
    phase: 4.1,
  },
  {
    x: 44,
    y: 92,
    size: 21,
    colour: "var(--blob-sky)",
    band: "mid",
    phase: 5.0,
  },
  {
    x: 60,
    y: 74,
    size: 15,
    colour: "var(--blob-rose)",
    band: "far",
    phase: 5.8,
  },
];

export function buildScene(state: number): Placement[] {
  if (state === 0) return crowd();
  if (state === 2) return STANDING_SEEDS.map(place);
  return [];
}

export function placementHeight(placement: Placement): number {
  return placement.size / ANIMAL_ASPECT;
}
