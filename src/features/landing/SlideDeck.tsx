"use client";

import { useRef, useState, type ReactNode } from "react";
import { Hero } from "./art/Hero";
import { Props } from "./art/Props";
import { Scene } from "./art/Scene";
import { SLIDES } from "./slides";
import { Typewriter } from "./Typewriter";
import { useHeroRig } from "./useHeroRig";
import { useIdleMotion } from "./useIdleMotion";
import { usePreloader } from "./usePreloader";
import { useSceneDirector } from "./useSceneDirector";
import { useTextWave } from "./useTextWave";
import styles from "./landing.module.scss";

export function SlideDeck({ chrome }: { chrome: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState(0);
  const [poseState, setPoseState] = useState(0);

  const { onObjectEnter, onObjectLeave } = useSceneDirector({
    root,
    sceneCount: SLIDES.length,
    onStateChange: setState,
    onPoseChange: setPoseState,
  });

  const ready = usePreloader();
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useHeroRig({ root, state: poseState, reduced });
  useIdleMotion(root, reduced, state);
  useTextWave(root, state === 2, reduced);

  return (
    <div ref={root} className={styles.root}>
      <div className={styles.stage} data-stage data-state={state}>
        <div className={styles.blobLayer} data-blobs>
          <Props />
        </div>

        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={styles.layer}
            data-layer={index}
            data-slide={slide.id}
          >
            <Scene
              state={index}
              interactive={index === state}
              onObjectEnter={onObjectEnter}
              onObjectLeave={onObjectLeave}
            />
          </div>
        ))}
        <Hero />

        <h2 className={styles.wordmark} data-wordmark>
          <span>Plushy</span>
          <span className={styles.wordmarkAccent}>BÜNCH</span>
        </h2>

        {SLIDES.map((slide, index) =>
          slide.paragraphs ? (
            <div key={slide.id} className={styles.copy} data-copy={index}>
              <Typewriter paragraphs={slide.paragraphs} />
            </div>
          ) : null,
        )}

        {chrome}

        <div className={styles.loader} data-ready={ready} aria-hidden="true">
          <span className={styles.loaderMark} />
          <p className={styles.loaderText}>LOADING..</p>
        </div>
      </div>
    </div>
  );
}
