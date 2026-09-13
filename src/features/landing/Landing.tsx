import { SlideDeck } from "./SlideDeck";
import { SocialIcon, type SocialName } from "./art/SocialIcon";
import styles from "./landing.module.scss";

const SOCIAL_LINKS: readonly { label: string; name: SocialName }[] = [
  { label: "Discord", name: "discord" },
  { label: "OpenSea", name: "opensea" },
  { label: "Twitter", name: "twitter" },
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
                  href="#top"
                  aria-label={link.label}
                >
                  <SocialIcon name={link.name} />
                </a>
              </li>
            ))}
          </ul>

          <a className={styles.cta} href="#top">
            <span className={styles.ctaShape} aria-hidden="true" />
            <span className={styles.ctaLabel}>view collection</span>
          </a>
        </>
      }
    />
  );
}
