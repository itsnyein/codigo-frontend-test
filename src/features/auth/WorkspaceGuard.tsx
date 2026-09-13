"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsHydrated } from "@/store/hydration";
import { TeamsWorkspace } from "@/features/teams/TeamsWorkspace";
import { loggedOut, selectUsername } from "./authSlice";
import styles from "./auth.module.scss";

export function WorkspaceGuard() {
  const hydrated = useAppSelector(selectIsHydrated);
  const username = useAppSelector(selectUsername);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && username === null) router.replace("/login");
  }, [hydrated, username, router]);

  if (!hydrated) {
    return (
      <main className={styles.pending} aria-busy="true">
        <p className={styles.pendingText}>Loading your teams…</p>
      </main>
    );
  }

  if (username === null) return null;

  return (
    <main className={styles.workspace}>
      <header className={styles.workspaceHeader}>
        <p className={styles.greeting}>
          Signed in as <strong>{username}</strong>
        </p>
        <button
          type="button"
          className={styles.logout}
          onClick={() => dispatch(loggedOut())}
        >
          Log out
        </button>
      </header>

      <TeamsWorkspace />
    </main>
  );
}
