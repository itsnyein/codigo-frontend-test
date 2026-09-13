import styles from "./landing.module.scss";

export function Typewriter({ lines }: { lines: readonly string[] }) {
  let index = 0;

  return (
    <>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className={styles.copyLine}>
          {Array.from(line).map((character) => {
            const key = index;
            index += 1;
            return (
              <span key={key} className={styles.char} data-char>
                {character === " " ? " " : character}
              </span>
            );
          })}
        </span>
      ))}
    </>
  );
}
