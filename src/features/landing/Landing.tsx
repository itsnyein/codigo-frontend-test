import { SlideDeck } from "./SlideDeck";
import styles from "./landing.module.scss";

const SOCIAL_LINKS = [
  { label: "Discord", href: "#discord" },
  { label: "OpenSea", href: "#opensea" },
  { label: "Twitter", href: "#twitter" },
];

export function Landing() {
  return (
    <SlideDeck
      chrome={
        <>
          <header className={styles.header}>
            <a className={styles.headerLogo} href="#top" data-header-logo>
              Plushy <span className={styles.headerLogoAccent}>BÜNCH</span>
            </a>
          </header>

          <ul className={styles.socials}>
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  className={styles.social}
                  href={link.href}
                  aria-label={link.label}
                >
                  <span className={styles.socialDot} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <a className={styles.cta} href="#collection">
            <span className={styles.ctaShape} aria-hidden="true" />
            <span className={styles.ctaLabel}>view collection</span>
          </a>
        </>
      }
    />
  );
}
