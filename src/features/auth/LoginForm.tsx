"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { loggedIn } from "./authSlice";
import styles from "./auth.module.scss";

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(2, { error: "Enter at least 2 characters." })
    .max(40, { error: "That name is too long." }),
  password: z
    .string()
    .min(6, { error: "Use at least 6 characters." })
    .max(64, { error: "That password is too long." }),
});

type Values = z.infer<typeof schema>;

export function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [redirecting, setRedirecting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const toastId = toast.loading("Signing in…");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        toast.error("Wrong credentials", {
          id: toastId,
          description: "Check your name and password, then try again.",
        });
        return;
      }

      const { username } = (await response.json()) as { username: string };

      setRedirecting(true);
      toast.success(`Welcome back, ${username}`, {
        id: toastId,
        description: "Taking you to your teams…",
      });

      dispatch(loggedIn(username));
      router.push("/teams");
    } catch {
      toast.error("Could not sign in right now", {
        id: toastId,
        description: "Please check your connection and try again.",
      });
    }
  });

  const busy = isSubmitting || redirecting;

  return (
    <div className={styles.card}>
      <header className={styles.cardHeader}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.lead}>
          Demo credentials: <strong>admin</strong> / <strong>codigo2026</strong>
        </p>
      </header>

      <form onSubmit={onSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="username">
            Name
          </label>
          <input
            id="username"
            className={styles.input}
            autoComplete="username"
            placeholder="Your name"
            aria-invalid={errors.username ? true : undefined}
            aria-describedby={errors.username ? "username-error" : undefined}
            {...register("username")}
          />
          {errors.username ? (
            <p id="username-error" className={styles.error} role="alert">
              {errors.username.message}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <div className={styles.passwordField}>
            <input
              id="password"
              type={passwordVisible ? "text" : "password"}
              className={`${styles.input} ${styles.passwordInput}`}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              aria-pressed={passwordVisible}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {passwordVisible ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className={styles.error} role="alert">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <button
          className={styles.submit}
          type="submit"
          disabled={busy}
          aria-busy={busy}
        >
          {busy ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              {redirecting ? "Signing in…" : "Checking credentials…"}
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </div>
  );
}
