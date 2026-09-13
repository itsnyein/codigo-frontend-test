import { RIG_PARTS, type RigPart } from "./motion";

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
    armL: { x: 4, y: -6, rotate: -16 },
    armR: { x: -3, y: 8, rotate: 12 },
    legL: { x: 0, y: -4, rotate: -9 },
    legR: { x: 2, y: 6, rotate: 11 },
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
    armL: { rotate: -7 },
    armR: { rotate: 5 },
    legL: { rotate: -2 },
    legR: { rotate: 3 },
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
