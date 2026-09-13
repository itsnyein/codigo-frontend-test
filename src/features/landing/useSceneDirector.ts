"use client";

import { useRef, type PointerEvent, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  LOCK_TAIL_MS,
  TYPEWRITER,
  T_CROWD_TO_WORDMARK,
  T_WORDMARK_TO_STANDING,
} from "./motion";
import { createGestureReader } from "./gesture";
import { hoverIn, hoverOut } from "./hoverRig";

gsap.registerPlugin(useGSAP);

interface Options {
  root: RefObject<HTMLElement | null>;
  sceneCount: number;
  onStateChange: (index: number) => void;
  onPoseChange: (index: number) => void;
}

const HERO_POSE_AT = [0.25, 0.1];

export function useSceneDirector({
  root,
  sceneCount,
  onStateChange,
  onPoseChange,
}: Options) {
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
      const paragraphsOf = (i: number) =>
        gsap.utils.toArray<HTMLElement>(
          `[data-copy="${i}"] [data-paragraph]`,
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
          );

        return tl;
      };

      let copyTl: gsap.core.Timeline | null = null;

      const copyBlockOf = (i: number) =>
        rootEl.querySelector<HTMLElement>(`[data-copy="${i}"]`);

      const typeCopy = (index: number) => {
        copyTl?.kill();
        const block = copyBlockOf(index);
        if (block) gsap.set(block, { visibility: "visible" });
        const tl = gsap.timeline({ delay: t2.typewriter.startAt });
        let cursor = 0;

        for (const paragraph of paragraphsOf(index)) {
          const chars = gsap.utils.toArray<HTMLElement>(
            "[data-char]",
            paragraph,
          );
          if (chars.length === 0) continue;

          tl.fromTo(
            chars,
            { autoAlpha: 0, "--rise": `${TYPEWRITER.riseFrom}px` },
            {
              autoAlpha: 1,
              "--rise": "0px",
              duration: TYPEWRITER.charDuration,
              ease: "power2.out",
              stagger: TYPEWRITER.stagger,
            },
            cursor,
          );
          cursor +=
            chars.length * TYPEWRITER.stagger +
            TYPEWRITER.charDuration +
            TYPEWRITER.paragraphGap;
        }

        copyTl = tl;
      };

      const dimCopy = (index: number) => {
        copyTl?.kill();
        copyTl = null;
        const block = copyBlockOf(index);

        gsap.to(charsOf(index), {
          autoAlpha: TYPEWRITER.exitOpacity,
          duration: TYPEWRITER.exitDuration,
          overwrite: true,
          onComplete: () => {
            if (block) gsap.set(block, { visibility: "hidden" });
          },
        });
      };

      const t2 = T_WORDMARK_TO_STANDING;
      const timelines = [
        { tl: crowdToWordmark(), total: T_CROWD_TO_WORDMARK.total },
        { tl: wordmarkToStanding(), total: T_WORDMARK_TO_STANDING.total },
      ];
      const gesture = createGestureReader();

      const go = (to: number) => {
        if (locked.current) return;
        if (to === state.current || to < 0 || to >= sceneCount) return;

        const from = state.current;
        const forward = to > from;
        const entry = timelines[forward ? from : to];
        if (!entry) return;
        const { tl, total } = entry;

        locked.current = true;
        gesture.disarm();
        state.current = to;
        onStateChange(to);

        const poseAt = HERO_POSE_AT[Math.min(from, to)] ?? 0;
        gsap.delayedCall(reduced ? poseAt * 0.6 : poseAt, () =>
          onPoseChange(to),
        );

        if (reduced) tl.timeScale(1 / 0.6);

        const lockFor = (reduced ? total * 0.6 : total) + LOCK_TAIL_MS / 1000;
        gsap.delayedCall(lockFor, () => {
          locked.current = false;
        });

        if (forward) {
          tl.play();
          typeCopy(to);
        } else {
          dimCopy(from);
          tl.reverse();
        }
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();

        const direction = gesture.read(event, event.timeStamp);
        if (locked.current || direction === 0) return;

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
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchend", onTouchEnd);
      };
    },
    { scope: root, dependencies: [sceneCount] },
  );

  const onObjectEnter = contextSafe((event: PointerEvent<HTMLElement>) => {
    hoverIn(event.currentTarget);
  });

  const onObjectLeave = contextSafe((event: PointerEvent<HTMLElement>) => {
    hoverOut(event.currentTarget);
  });

  return { onObjectEnter, onObjectLeave };
}
