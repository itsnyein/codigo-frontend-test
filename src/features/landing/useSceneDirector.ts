"use client";

import { useRef, type PointerEvent, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  HOVER,
  LOCK_TAIL_MS,
  TYPEWRITER,
  T_CROWD_TO_WORDMARK,
  T_WORDMARK_TO_STANDING,
  WHEEL_DECAY,
  WHEEL_FIRE_PX,
} from "./motion";

gsap.registerPlugin(useGSAP);

interface Options {
  root: RefObject<HTMLElement | null>;
  sceneCount: number;
  onStateChange: (index: number) => void;
}

/**
 * A state director, not a scrubbed timeline: one wheel or swipe gesture
 * advances exactly one state and plays a locked choreography. Input during a
 * transition is discarded, which is what makes the reference's pacing feel
 * deliberate rather than elastic.
 *
 * Each transition is built as a single master timeline with the position
 * offsets Fable measured, so reverse is literally the same timeline played
 * backwards - not a second, differently-shaped animation.
 */
export function useSceneDirector({ root, sceneCount, onStateChange }: Options) {
  const state = useRef(0);
  const locked = useRef(false);

  const { contextSafe } = useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const q = gsap.utils.selector(rootEl);
      const layerOf = (i: number) =>
        rootEl.querySelector(`[data-layer="${i}"]`);
      const objectsOf = (i: number) =>
        gsap.utils.toArray<HTMLElement>(
          `[data-layer="${i}"] [data-object]`,
          rootEl,
        );
      const charsOf = (i: number) =>
        gsap.utils.toArray<HTMLElement>(
          `[data-copy="${i}"] [data-char]`,
          rootEl,
        );

      const wordmark = q("[data-wordmark]")[0] ?? null;
      const headerLogo = q("[data-header-logo]")[0] ?? null;
      const stage = q("[data-stage]")[0] ?? null;

      const crowdToWordmark = () => {
        const t = T_CROWD_TO_WORDMARK;
        const tl = gsap.timeline({ paused: true });

        tl.to(
          layerOf(0),
          {
            scale: t.pushIn.scale,
            duration: t.pushIn.dur,
            ease: t.pushIn.ease,
          },
          0,
        )
          .to(
            objectsOf(0),
            {
              xPercent: (_i, el: HTMLElement) =>
                Number(el.dataset.dx ?? 0) * 1.7,
              yPercent: (_i, el: HTMLElement) =>
                Number(el.dataset.dy ?? 0) * 1.7,
              autoAlpha: 0,
              duration: t.tilesOut.dur,
              ease: t.tilesOut.ease,
            },
            t.tilesOut.at,
          )
          .to(
            stage,
            {
              "--bg-cream": 1,
              duration: t.bgToCream.dur,
              ease: t.bgToCream.ease,
            },
            t.bgToCream.at,
          )
          .to(
            layerOf(1),
            { autoAlpha: 1, duration: t.bgToCream.dur, ease: "none" },
            "<",
          )
          .to(
            rootEl.querySelector("[data-backdrop]"),
            { autoAlpha: 0, duration: t.bgToCream.dur, ease: "none" },
            "<",
          )
          .to({}, { duration: t.heroPose.dur }, t.heroPose.at)
          .fromTo(
            wordmark,
            { autoAlpha: 0, scale: t.wordmarkIn.from },
            {
              autoAlpha: 1,
              scale: 1,
              duration: t.wordmarkIn.dur,
              ease: t.wordmarkIn.ease,
            },
            t.wordmarkIn.at,
          )
          .to(
            headerLogo,
            { autoAlpha: 0, duration: 0.3, ease: "power2.in" },
            t.wordmarkIn.at,
          );

        return tl;
      };

      const wordmarkToStanding = () => {
        const t = T_WORDMARK_TO_STANDING;
        const tl = gsap.timeline({ paused: true });

        tl.to(
          wordmark,
          {
            autoAlpha: 0,
            scale: 0.94,
            duration: t.wordmarkOut.dur,
            ease: t.wordmarkOut.ease,
          },
          0,
        )
          .to(
            headerLogo,
            {
              autoAlpha: 1,
              duration: t.headerLogoIn.dur,
              ease: t.headerLogoIn.ease,
            },
            t.headerLogoIn.at,
          )
          .to({}, { duration: t.heroPose.dur }, t.heroPose.at)
          .to(
            layerOf(2),
            { autoAlpha: 1, duration: 0.01, ease: "none" },
            t.animalsIn.at,
          )
          .fromTo(
            objectsOf(2),
            { scale: 0, autoAlpha: 0 },
            {
              scale: 1,
              autoAlpha: 1,
              transformOrigin: "50% 50%",
              duration: t.animalsIn.dur,
              ease: t.animalsIn.ease,
              stagger: t.animalsIn.stagger,
            },
            "<",
          )
          .fromTo(
            charsOf(2),
            { autoAlpha: 0, y: TYPEWRITER.riseFrom },
            {
              autoAlpha: 1,
              y: 0,
              duration: TYPEWRITER.charDuration,
              ease: "power2.out",
              stagger: TYPEWRITER.stagger,
            },
            t.typewriter.at,
          );

        return tl;
      };

      const timelines = [crowdToWordmark(), wordmarkToStanding()];

      const go = (to: number) => {
        if (locked.current) return;
        if (to === state.current || to < 0 || to >= sceneCount) return;

        const from = state.current;
        const forward = to > from;
        const tl = timelines[forward ? from : to];
        if (!tl) return;

        locked.current = true;
        state.current = to;
        onStateChange(to);

        if (reduced) tl.timeScale(1 / 0.6);

        const unlock = () => {
          gsap.delayedCall(LOCK_TAIL_MS / 1000, () => {
            locked.current = false;
          });
        };

        if (forward) {
          tl.eventCallback("onComplete", unlock);
          tl.eventCallback("onReverseComplete", null);
          tl.play();
        } else {
          gsap.to(charsOf(from), {
            autoAlpha: TYPEWRITER.exitOpacity,
            duration: TYPEWRITER.exitDuration,
            overwrite: true,
          });
          tl.eventCallback("onReverseComplete", unlock);
          tl.eventCallback("onComplete", null);
          tl.reverse();
        }
      };

      let accumulated = 0;
      let decayFrame = 0;

      const decay = () => {
        accumulated *= WHEEL_DECAY;
        decayFrame = requestAnimationFrame(decay);
      };
      decayFrame = requestAnimationFrame(decay);

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        if (locked.current) return;

        accumulated += event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
        if (Math.abs(accumulated) < WHEEL_FIRE_PX) return;

        const direction = accumulated > 0 ? 1 : -1;
        accumulated = 0;
        go(state.current + direction);
      };

      const onKeyDown = (event: KeyboardEvent) => {
        const forward = ["ArrowDown", "PageDown", " "].includes(event.key);
        const back = ["ArrowUp", "PageUp"].includes(event.key);
        if (!forward && !back) return;
        event.preventDefault();
        go(state.current + (forward ? 1 : -1));
      };

      let touchStart: number | null = null;
      const onTouchStart = (e: TouchEvent) => {
        touchStart = e.touches[0]?.clientY ?? null;
      };
      const onTouchEnd = (e: TouchEvent) => {
        const end = e.changedTouches[0]?.clientY;
        if (touchStart === null || end === undefined) return;
        const travelled = touchStart - end;
        touchStart = null;
        if (Math.abs(travelled) < 60) return;
        go(state.current + (travelled > 0 ? 1 : -1));
      };

      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchend", onTouchEnd);

      return () => {
        cancelAnimationFrame(decayFrame);
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchend", onTouchEnd);
      };
    },
    { scope: root, dependencies: [sceneCount] },
  );

  const onObjectEnter = contextSafe((event: PointerEvent<HTMLElement>) => {
    const target = event.currentTarget.querySelector("[data-hover]");
    if (!target) return;
    gsap.to(target, {
      scale: HOVER.scale,
      duration: HOVER.inSeconds,
      ease: HOVER.easeIn,
      overwrite: true,
    });
  });

  const onObjectLeave = contextSafe((event: PointerEvent<HTMLElement>) => {
    const target = event.currentTarget.querySelector("[data-hover]");
    if (!target) return;
    gsap.to(target, {
      scale: 1,
      duration: HOVER.outSeconds,
      ease: HOVER.easeOut,
      overwrite: true,
    });
  });

  return { onObjectEnter, onObjectLeave };
}
