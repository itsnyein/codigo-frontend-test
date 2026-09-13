"use client";

import { useEffect, useRef, type RefObject } from "react";
import { poseFor, type HeroPose, type PartTransform } from "./heroPoses";
import {
  IDLE_RIG,
  PARALLAX,
  RIG_PARTS,
  RIG_SPRING,
  type RigPart,
} from "./motion";

interface Spring {
  x: number;
  y: number;
  rotate: number;
  vx: number;
  vy: number;
  vr: number;
}

interface Options {
  root: RefObject<HTMLElement | null>;
  state: number;
  reduced: boolean;
}

export function useHeroRig({ root, state, reduced }: Options) {
  const stateRef = useRef(state);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl) return;

    const rig = rootEl.querySelector<HTMLElement>("[data-hero-rig]");
    if (!rig) return;

    const nodes = new Map<RigPart, HTMLElement>();
    for (const name of RIG_PARTS) {
      const node = rig.querySelector<HTMLElement>(`[data-part="${name}"]`);
      if (node) nodes.set(name, node);
    }

    const springs = new Map<RigPart, Spring>();
    const initial = poseFor(stateRef.current);
    for (const name of RIG_PARTS) {
      const target = initial.parts[name];
      springs.set(name, {
        x: target.x,
        y: target.y,
        rotate: target.rotate,
        vx: 0,
        vy: 0,
        vr: 0,
      });
    }

    const rigSpring: Spring = {
      x: initial.x,
      y: initial.y,
      rotate: initial.rotate,
      vx: 0,
      vy: 0,
      vr: 0,
    };
    let scale = initial.scale;
    let scaleVelocity = 0;

    const onPointerMove = (event: PointerEvent) => {
      pointer.current.tx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.ty = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const step = (
      spring: Spring,
      target: PartTransform,
      stiffness: number,
      damping: number,
      dt: number,
    ) => {
      const k = stiffness;
      const c = 2 * damping * Math.sqrt(k);

      spring.vx += (-k * (spring.x - target.x) - c * spring.vx) * dt;
      spring.vy += (-k * (spring.y - target.y) - c * spring.vy) * dt;
      spring.vr += (-k * (spring.rotate - target.rotate) - c * spring.vr) * dt;

      spring.x += spring.vx * dt;
      spring.y += spring.vy * dt;
      spring.rotate += spring.vr * dt;
    };

    let frame = 0;
    let last = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      elapsed += dt;

      const pose: HeroPose = poseFor(stateRef.current);

      step(
        rigSpring,
        { x: pose.x, y: pose.y, rotate: pose.rotate },
        200,
        0.95,
        dt,
      );

      const scaleStiffness = 200;
      const scaleDamping = 2 * 0.95 * Math.sqrt(scaleStiffness);
      scaleVelocity +=
        (-scaleStiffness * (scale - pose.scale) -
          scaleDamping * scaleVelocity) *
        dt;
      scale += scaleVelocity * dt;

      pointer.current.x +=
        (pointer.current.tx - pointer.current.x) * PARALLAX.lerp;
      pointer.current.y +=
        (pointer.current.ty - pointer.current.y) * PARALLAX.lerp;

      const parallaxX = reduced ? 0 : pointer.current.x * PARALLAX.maxPx * 0.4;
      const parallaxY = reduced ? 0 : pointer.current.y * PARALLAX.maxPx * 0.25;

      rig.style.transform =
        `translate3d(calc(${rigSpring.x}vw - 50%), calc(${rigSpring.y}vh - 50%), 0) ` +
        `translate3d(${parallaxX.toFixed(2)}px, ${parallaxY.toFixed(2)}px, 0) ` +
        `rotate(${rigSpring.rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

      for (const name of RIG_PARTS) {
        const node = nodes.get(name);
        const spring = springs.get(name);
        if (!node || !spring) continue;

        const config = RIG_SPRING[name];
        step(spring, pose.parts[name], config.stiffness, config.damping, dt);

        let idleRotate = 0;
        let idleScale = 1;

        if (!reduced) {
          if (name === "earL" || name === "earR") {
            const phase = name === "earL" ? 0 : Math.PI / 3;
            idleRotate =
              Math.sin((elapsed / IDLE_RIG.ear.period) * Math.PI * 2 + phase) *
              IDLE_RIG.ear.amplitude;
          } else if (name === "tail") {
            idleRotate =
              Math.sin((elapsed / IDLE_RIG.tail.period) * Math.PI * 2) *
              IDLE_RIG.tail.amplitude;
          } else if (name === "body") {
            idleScale =
              1 +
              Math.sin((elapsed / IDLE_RIG.breath.period) * Math.PI * 2) *
                IDLE_RIG.breath.amplitude;
          }
        }

        node.style.transform =
          `translate(${spring.x.toFixed(2)}px, ${spring.y.toFixed(2)}px) ` +
          `rotate(${(spring.rotate + idleRotate).toFixed(2)}deg)` +
          (idleScale === 1 ? "" : ` scale(${idleScale.toFixed(4)})`);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [root, reduced]);
}
