import type { Metadata } from "next";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Frontend Assessment - Nyein Phyo Aung",
  description: "Animation task and team management task.",
};

const TASKS = [
  {
    href: "/animation",
    eyebrow: "Task 1",
    title: "Animation Task",
    description:
      "A scroll-driven landing experience: three staged scenes with a locked, choreographed transition per gesture.",
    points: [
      "GSAP choreography",
      "Original SVG artwork",
      "Responsive + reduced motion",
    ],
  },
  {
    href: "/teams",
    eyebrow: "Task 2",
    title: "Management Task",
    description:
      "Team management with player assignment, validation and state that survives a refresh.",
    points: [
      "Redux Toolkit + localStorage",
      "Team CRUD in dialogs",
      "Paginated player list",
    ],
  },
] as const;

export default function HomePage() {
  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Frontend Assessment</p>
          <h1 className={styles.title}>Two tasks, one project</h1>
          <p className={styles.lead}>
            Both tasks live in the same Next.js application. Pick either to
            begin.
          </p>
        </header>

        <ul className={styles.cards}>
          {TASKS.map((task) => (
            <li key={task.href}>
              <a className={styles.card} href={task.href}>
                <span className={styles.cardEyebrow}>{task.eyebrow}</span>
                <h2 className={styles.cardTitle}>{task.title}</h2>
                <p className={styles.cardBody}>{task.description}</p>

                <ul className={styles.points}>
                  {task.points.map((point) => (
                    <li key={point} className={styles.point}>
                      {point}
                    </li>
                  ))}
                </ul>

                <span className={styles.cardAction} aria-hidden="true">
                  Open →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
