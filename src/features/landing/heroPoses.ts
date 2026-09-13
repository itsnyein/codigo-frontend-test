import { RIG_PARTS, type RigPart } from "./motion";

/**
 * One rig, three poses. Poses are transforms of the same parts, never a second
 * drawing - that is what carries the character across the three scenes.
 *
 * Measured from the live reference at 1564x784:
 *  - state 0: the hero is the centre figure of the crowd, upright, tile-scale.
 *  - state 1: lying under the wordmark, centre (49%, 61.5%), head to the left.
 *  - state 2: standing, pushed into the left third, larger.
 *
 * Note on rotation: Fable records 0->1 as "rot -60 -> 0", but the reference
 * frame shows the character very close to horizontal in state 1. Observation
 * wins; -75deg reproduces what is on screen and keeps the spec's magnitude.
 */

export interface PartTransform {
  x: number;
  y: number;
  rotate: number;
}

export interface HeroPose {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  parts: Record<RigPart, PartTransform>;
}

const REST: PartTransform = { x: 0, y: 0, rotate: 0 };

function parts(
  overrides: Partial<Record<RigPart, Partial<PartTransform>>>,
): Record<RigPart, PartTransform> {
  const result = {} as Record<RigPart, PartTransform>;
  for (const name of RIG_PARTS) {
    result[name] = { ...REST, ...overrides[name] };
  }
  return result;
}

export const POSE_TILE: HeroPose = {
  x: 50,
  y: 52,
  scale: 1,
  rotate: 0,
  parts: parts({
    armL: { rotate: -8 },
    armR: { rotate: 10 },
    earL: { rotate: -4 },
    earR: { rotate: 5 },
    tail: { rotate: -8 },
  }),
};

export const POSE_LYING: HeroPose = {
  x: 49,
  y: 61.5,
  scale: 1.35,
  rotate: -75,
  parts: parts({
    head: { rotate: -10 },
    armL: { x: 4, y: -6, rotate: -46 },
    armR: { x: -3, y: 8, rotate: 34 },
    legL: { x: 0, y: -4, rotate: -22 },
    legR: { x: 2, y: 6, rotate: 26 },
    earL: { rotate: -16 },
    earR: { rotate: -22 },
    tail: { rotate: 28 },
  }),
};

export const POSE_STANDING: HeroPose = {
  x: 25,
  y: 78,
  scale: 1.7,
  rotate: 0,
  parts: parts({
    head: { rotate: 4 },
    armL: { rotate: -20 },
    armR: { rotate: 14 },
    legL: { rotate: -3 },
    legR: { rotate: 4 },
    earL: { rotate: 7 },
    earR: { rotate: -6 },
    tail: { rotate: -14 },
  }),
};

export const POSES: readonly HeroPose[] = [
  POSE_TILE,
  POSE_LYING,
  POSE_STANDING,
];

export function poseFor(state: number): HeroPose {
  return POSES[state] ?? POSE_LYING;
}
