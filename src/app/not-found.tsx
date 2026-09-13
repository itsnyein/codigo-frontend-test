import Link from "next/link";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <main className={styles.main}>
      <div className={styles.panel}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.body}>
          That page doesn&apos;t exist. It may have been moved or the address
          mistyped.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/">
            Back to tasks
          </Link>
          <Link className={styles.ghost} href="/teams">
            Open Management Task
          </Link>
        </div>
      </div>
    </main>
  );
}
