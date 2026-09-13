export const WHEEL_FIRE_PX = 70;
export const WHEEL_DECAY = 0.9;
export const LOCK_TAIL_MS = 200;

export const TYPEWRITER = {
  stagger: 0.07,
  charDuration: 0.12,
  riseFromEm: 0.96,
  exitOpacity: 0.2,
  exitDuration: 0.2,
  paragraphGap: 1.2,
} as const;

export const T_CROWD_TO_WORDMARK = {
  total: 1.4,
  pushIn: { dur: 0.3, at: 0, ease: "power2.in", scale: 1.2 },
  tilesOut: { dur: 0.4, at: "-=0.10", ease: "expo.out" },
  bgToCream: { dur: 0.3, at: "-=0.30", ease: "none" },
  heroPose: { dur: 0.9, at: "-=0.35", ease: "power2.inOut" },
  wordmarkIn: { dur: 0.6, at: "-=0.60", ease: "power2.out", from: 0.92 },
} as const;

export const T_WORDMARK_TO_STANDING = {
  total: 0.9,
  wordmarkOut: { dur: 0.4, at: 0, ease: "power2.in" },
  headerLogoIn: { dur: 0.3, at: 0.1, ease: "power2.out" },
  heroPose: { dur: 0.5, at: "-=0.30", ease: "power2.inOut" },
  animalsIn: { dur: 0.5, at: "-=0.20", ease: "back.out(1.6)", stagger: 0.04 },
  typewriter: { startAt: 1.0 },
} as const;

export const TEXT_WAVE = {
  amplitudeEm: 0.22,
  phasePerChar: 0.9,
  period: 2.4,
} as const;

export const IDLE = {
  bob: { amplitude: 7, period: 4.5 },
  spin: { amplitude: 4, period: 6 },
  drift: { amplitude: 12, period: 11 },
} as const;

export const DEPTH_BANDS = {
  far: { speed: 0.45, parallax: 0.3 },
  mid: { speed: 0.75, parallax: 0.65 },
  near: { speed: 1.1, parallax: 1 },
} as const;

export type BandName = keyof typeof DEPTH_BANDS;

export const PARALLAX = { maxPx: 24, lerp: 0.06 } as const;

export const HOVER = {
  scale: 1.14,
  inSeconds: 0.5,
  outSeconds: 0.35,
  easeIn: "back.out(1.7)",
  easeOut: "power2.out",
} as const;

export const RIG_SPRING = {
  body: { stiffness: 250, damping: 0.96 },
  head: { stiffness: 220, damping: 0.94 },
  armL: { stiffness: 190, damping: 0.9 },
  armR: { stiffness: 180, damping: 0.9 },
  legL: { stiffness: 165, damping: 0.9 },
  legR: { stiffness: 155, damping: 0.89 },
  earL: { stiffness: 120, damping: 0.78 },
  earR: { stiffness: 112, damping: 0.76 },
  tail: { stiffness: 100, damping: 0.74 },
} as const;

export type RigPart = keyof typeof RIG_SPRING;

export const RIG_PARTS = Object.keys(RIG_SPRING) as readonly RigPart[];

export const IDLE_RIG = {
  breath: { amplitude: 0.018, period: 3.4 },
  ear: { amplitude: 5, period: 2.9 },
  tail: { amplitude: 9, period: 2.3 },
} as const;
