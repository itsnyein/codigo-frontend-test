"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsHydrated } from "@/store/hydration";
import { Dialog } from "@/components/Dialog";
import { TeamsWorkspace } from "@/features/teams/TeamsWorkspace";
import { loggedOut, selectUsername } from "./authSlice";
import styles from "./auth.module.scss";

export function WorkspaceGuard() {
  const hydrated = useAppSelector(selectIsHydrated);
  const username = useAppSelector(selectUsername);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

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
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <p className={styles.identity}>
            <span className={styles.avatar} aria-hidden="true">
              {username.trim().charAt(0).toUpperCase()}
            </span>
            <span className={styles.identityText}>
              <span className={styles.identityLabel}>Signed in as</span>
              <span className={styles.identityName}>{username}</span>
            </span>
          </p>

          <button
            type="button"
            className={styles.logout}
            onClick={() => setConfirmingLogout(true)}
          >
            <svg
              className={styles.logoutIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className={styles.logoutLabel}>Log out</span>
          </button>
        </div>
      </header>

      <main className={styles.workspace}>
        <TeamsWorkspace />
      </main>

      <Dialog
        open={confirmingLogout}
        title="Log out?"
        description="Your teams stay saved on this device, so they will be here when you sign back in."
        onClose={() => setConfirmingLogout(false)}
        footer={
          <>
            <button
              type="button"
              className={styles.dialogCancel}
              onClick={() => setConfirmingLogout(false)}
            >
              Stay signed in
            </button>
            <button
              type="button"
              className={styles.dialogConfirm}
              onClick={() => {
                setConfirmingLogout(false);
                dispatch(loggedOut());
                toast.success("Signed out", {
                  description: "Your teams stay saved on this device.",
                });
              }}
            >
              Log out
            </button>
          </>
        }
      />
    </div>
  );
}
