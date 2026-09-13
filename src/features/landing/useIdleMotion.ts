"use client";

import { useEffect, type RefObject } from "react";
import { DEPTH_BANDS, IDLE, PARALLAX, type BandName } from "./motion";

export function useIdleMotion(
  root: RefObject<HTMLElement | null>,
  reduced: boolean,
  state: number,
) {
  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl || reduced) return;

    /**
     * Resolved once per state, not per frame. Re-querying ~80 nodes every tick
     * was enough to peg the main thread on the crowd scene.
     */
    const targets = Array.from(
      rootEl.querySelectorAll<HTMLElement>("[data-idle]"),
    ).map((node) => ({
      node,
      band: (node.dataset.band ?? "mid") as BandName,
      phase: Number(node.dataset.phase ?? 0),
    }));

    let frame = 0;
    let elapsed = 0;
    let last = performance.now();

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (event: PointerEvent) => {
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      elapsed += dt;

      pointer.x += (pointer.tx - pointer.x) * PARALLAX.lerp;
      pointer.y += (pointer.ty - pointer.y) * PARALLAX.lerp;

      for (const { node, band, phase } of targets) {
        const config = DEPTH_BANDS[band] ?? DEPTH_BANDS.mid;

        const bob =
          Math.sin(
            (elapsed / (IDLE.bob.period / config.speed)) * Math.PI * 2 + phase,
          ) * IDLE.bob.amplitude;

        const sway =
          Math.sin(
            (elapsed / (IDLE.drift.period / config.speed)) * Math.PI * 2 +
              phase * 0.7,
          ) * IDLE.drift.amplitude;

        const spin =
          Math.sin(
            (elapsed / (IDLE.spin.period / config.speed)) * Math.PI * 2 + phase,
          ) * IDLE.spin.amplitude;

        const px = pointer.x * PARALLAX.maxPx * config.parallax;
        const py = pointer.y * PARALLAX.maxPx * config.parallax * 0.6;

        node.style.setProperty(
          "--idle",
          `translate3d(${(sway + px).toFixed(2)}px, ${(bob + py).toFixed(2)}px, 0) rotate(${spin.toFixed(2)}deg)`,
        );
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [root, reduced, state]);
}
