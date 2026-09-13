"use client";

import { useEffect, type RefObject } from "react";
import { TEXT_WAVE } from "./motion";

export function useTextWave(
  root: RefObject<HTMLElement | null>,
  active: boolean,
  reduced: boolean,
) {
  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl || reduced || !active) return;

    const chars = Array.from(
      rootEl.querySelectorAll<HTMLElement>("[data-copy] [data-char]"),
    );
    if (chars.length === 0) return;

    let frame = 0;
    const started = performance.now();

    const tick = (now: number) => {
      const t = ((now - started) / 1000 / TEXT_WAVE.period) * Math.PI * 2;

      for (let i = 0; i < chars.length; i += 1) {
        const offset =
          Math.sin(t + i * TEXT_WAVE.phasePerChar) * TEXT_WAVE.amplitude;
        chars[i]!.style.setProperty("--wave", `${offset.toFixed(2)}px`);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [root, active, reduced]);
}
