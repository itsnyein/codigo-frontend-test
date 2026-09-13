"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./dialog.module.scss";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export function Dialog({ open, title, description, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id="dialog-title" className={styles.title}>
            {title}
          </h2>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </header>
        {children}
      </div>
    </dialog>
  );
}
