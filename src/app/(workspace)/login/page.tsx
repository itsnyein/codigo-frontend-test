import { LoginForm } from "@/features/auth/LoginForm";
import styles from "./page.module.scss";

export default function LoginPage() {
  return (
    <main className={styles.main}>
      <LoginForm />
    </main>
  );
}
