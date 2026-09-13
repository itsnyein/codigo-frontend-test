import gsap from "gsap";
import { HOVER } from "./motion";
import { PART_ORIGIN } from "./art/Animal";

interface PartMove {
  part: string;
  y?: number;
  rotate?: number;
  lag: number;
  ease: string;
}

const ENTER: readonly PartMove[] = [
  { part: "body", y: -6, lag: 0, ease: "power2.out" },
  { part: "head", y: -4, rotate: 3.5, lag: 0.03, ease: "power2.out" },
  { part: "earL", rotate: -13, lag: 0.07, ease: "back.out(2.4)" },
  { part: "earR", rotate: 11, lag: 0.09, ease: "back.out(2.4)" },
  { part: "armL", rotate: -9, lag: 0.06, ease: "back.out(1.8)" },
  { part: "armR", rotate: 8, lag: 0.08, ease: "back.out(1.8)" },
  { part: "legL", rotate: -3, lag: 0.05, ease: "power2.out" },
  { part: "legR", rotate: 3, lag: 0.06, ease: "power2.out" },
  { part: "tail", rotate: 24, lag: 0.12, ease: "back.out(2.8)" },
];

function partsOf(root: Element): Map<string, Element> {
  const map = new Map<string, Element>();
  for (const node of root.querySelectorAll("[data-part]")) {
    const name = (node as HTMLElement).dataset.part;
    if (name && !map.has(name)) map.set(name, node);
  }
  return map;
}

export function hoverIn(container: Element) {
  const shell = container.querySelector("[data-hover]");
  const parts = partsOf(container);

  if (shell) {
    gsap.to(shell, {
      scale: HOVER.scale,
      duration: HOVER.inSeconds,
      ease: HOVER.easeIn,
      overwrite: "auto",
    });
  }

  for (const move of ENTER) {
    const node = parts.get(move.part);
    if (!node) continue;

    gsap.to(node, {
      y: move.y ?? 0,
      rotation: move.rotate ?? 0,
      svgOrigin: PART_ORIGIN[move.part],
      duration: HOVER.inSeconds - move.lag * 0.5,
      delay: move.lag,
      ease: move.ease,
      overwrite: "auto",
    });
  }
}

export function hoverOut(container: Element) {
  const shell = container.querySelector("[data-hover]");
  const parts = partsOf(container);

  if (shell) {
    gsap.to(shell, {
      scale: 1,
      duration: HOVER.outSeconds,
      ease: HOVER.easeOut,
      overwrite: "auto",
    });
  }

  for (const move of ENTER) {
    const node = parts.get(move.part);
    if (!node) continue;

    const floppy =
      move.part === "tail" || move.part === "earL" || move.part === "earR";

    gsap.to(node, {
      y: 0,
      rotation: 0,
      svgOrigin: PART_ORIGIN[move.part],
      duration: floppy ? HOVER.outSeconds * 1.5 : HOVER.outSeconds,
      delay: move.lag * 0.6,
      ease: floppy ? "elastic.out(1, 0.55)" : "power2.out",
      overwrite: "auto",
    });
  }
}
