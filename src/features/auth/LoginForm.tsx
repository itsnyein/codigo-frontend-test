"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    dispatch(loggedIn(values.username));
    router.push("/teams");
  });

  return (
    <div className={styles.card}>
      <header className={styles.cardHeader}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.lead}>
          Enter any name and password to continue - credentials are not sent
          anywhere.
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
          <input
            id="password"
            type="password"
            className={styles.input}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password ? (
            <p id="password-error" className={styles.error} role="alert">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          Sign in
        </button>
      </form>
    </div>
  );
}
