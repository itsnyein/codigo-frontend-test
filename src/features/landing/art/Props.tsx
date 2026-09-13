import type { CSSProperties } from "react";
import { BLOBS } from "../scene";
import styles from "./props.module.scss";

export function Props() {
  return (
    <div className={styles.props} aria-hidden="true">
      {BLOBS.map((blob, index) => (
        <span
          key={index}
          className={styles.blob}
          data-idle
          data-band={blob.band}
          data-phase={blob.phase}
          style={
            {
              "--blob-x": `${blob.x}%`,
              "--blob-y": `${blob.y}%`,
              "--blob-size": `${blob.size}vw`,
              "--blob-colour": blob.colour,
            } as CSSProperties
          }
        >
          <svg viewBox="0 0 200 200" fill="none">
            <path
              d="M44 22 C86 2 138 10 166 44 C194 78 188 128 158 158 C128 188 78 196 44 174 C10 152 -2 108 8 72 C16 44 26 32 44 22 Z"
              fill="var(--blob-colour)"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}
