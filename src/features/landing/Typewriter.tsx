import styles from "./landing.module.scss";

export function Typewriter({
  paragraphs,
}: {
  paragraphs: readonly (readonly string[])[];
}) {
  return (
    <>
      {paragraphs.map((lines, paragraphIndex) => (
        <p
          key={paragraphIndex}
          className={styles.copyParagraph}
          data-paragraph={paragraphIndex}
        >
          {lines.map((line, lineIndex) => (
            <span key={lineIndex} className={styles.copyLine}>
              {Array.from(line).map((character, charIndex) => (
                <span key={charIndex} className={styles.char} data-char>
                  {character}
                </span>
              ))}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}
