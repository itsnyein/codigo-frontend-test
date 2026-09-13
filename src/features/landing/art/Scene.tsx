import type { CSSProperties, PointerEvent } from "react";
import { buildScene, placementHeight } from "../scene";
import { DEPTH_BANDS } from "../motion";
import { Animal } from "./Animal";
import styles from "./scene.module.scss";

interface Props {
  state: number;
  interactive: boolean;
  onObjectEnter: (event: PointerEvent<HTMLElement>) => void;
  onObjectLeave: (event: PointerEvent<HTMLElement>) => void;
}

export function Scene({
  state,
  interactive,
  onObjectEnter,
  onObjectLeave,
}: Props) {
  const placements = buildScene(state);
  if (placements.length === 0) return null;

  return (
    <div className={styles.scene} aria-hidden="true">
      {state === 0 ? (
        <span className={styles.crowdBackdrop} data-backdrop />
      ) : null}

      {placements.map((placement, index) => {
        const band = DEPTH_BANDS[placement.band];

        return (
          <span
            key={index}
            className={styles.object}
            data-object
            data-idle={state === 0 ? undefined : true}
            data-band={placement.band}
            data-dx={placement.disperseX.toFixed(2)}
            data-dy={placement.disperseY.toFixed(2)}
            data-phase={placement.phase.toFixed(3)}
            onPointerEnter={interactive ? onObjectEnter : undefined}
            onPointerLeave={interactive ? onObjectLeave : undefined}
            style={
              {
                "--object-x": `${placement.x}%`,
                "--object-y": `${placement.y}%`,
                "--object-w": `${placement.size}vw`,
                "--object-h": `${placementHeight(placement).toFixed(2)}vw`,
                "--object-rotate": `${placement.rotate.toFixed(1)}deg`,
                "--band-parallax": band.parallax,
                zIndex: placement.layer,
              } as CSSProperties
            }
          >
            <span className={styles.hover} data-hover>
              <Animal
                species={placement.species}
                palette={placement.palette}
                asleep={placement.asleep}
                rigged
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}
