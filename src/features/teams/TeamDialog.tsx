"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/components/Dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  isNameTaken,
  selectTeams,
  teamCreated,
  teamUpdated,
  type Team,
} from "./teamsSlice";
import styles from "./workspace.module.scss";

const schema = z.object({
  name: z.string().trim().min(1, { error: "Team name is required." }),
  playerCount: z.coerce
    .number({ error: "Enter a number." })
    .int({ error: "Whole numbers only." })
    .min(1, { error: "A team needs at least 1 player." })
    .max(30, { error: "30 players is the maximum." }),
  region: z.string().trim().min(1, { error: "Region is required." }),
  country: z.string().trim().min(1, { error: "Country is required." }),
});

type Values = z.input<typeof schema>;

interface Props {
  open: boolean;
  team: Team | null;
  rosterSize: number;
  onClose: () => void;
}

export function TeamDialog({ open, team, rosterSize, onClose }: Props) {
  const dispatch = useAppDispatch();
  const teams = useAppSelector(selectTeams);
  const editing = team !== null;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;
    reset(
      team
        ? {
            name: team.name,
            playerCount: team.playerCount,
            region: team.region,
            country: team.country,
          }
        : { name: "", playerCount: 5, region: "", country: "" },
    );
  }, [open, team, reset]);

  const onSubmit = handleSubmit((raw) => {
    const values = schema.parse(raw);

    if (isNameTaken(teams, values.name, team?.id)) {
      setError("name", { message: "Another team already uses that name." });
      return;
    }

    if (editing && values.playerCount < rosterSize) {
      setError("playerCount", {
        message: `This team already has ${rosterSize} player${rosterSize === 1 ? "" : "s"}.`,
      });
      return;
    }

    if (team) dispatch(teamUpdated({ id: team.id, ...values }));
    else dispatch(teamCreated(values));

    onClose();
  });

  return (
    <Dialog
      open={open}
      title={editing ? "Edit team" : "New team"}
      description={
        editing
          ? "Update the team's details."
          : "Create a team, then add players to it."
      }
      onClose={onClose}
    >
      <form onSubmit={onSubmit} noValidate>
        <div className={styles.formGrid}>
          <Field label="Team name" error={errors.name?.message} htmlFor="name">
            <input id="name" className={styles.input} autoComplete="off" {...register("name")} />
          </Field>

          <Field label="Player count" error={errors.playerCount?.message} htmlFor="playerCount">
            <input
              id="playerCount"
              className={styles.input}
              type="number"
              min={1}
              max={30}
              {...register("playerCount")}
            />
          </Field>

          <Field label="Region" error={errors.region?.message} htmlFor="region">
            <input id="region" className={styles.input} autoComplete="off" {...register("region")} />
          </Field>

          <Field label="Country" error={errors.country?.message} htmlFor="country">
            <input id="country" className={styles.input} autoComplete="off" {...register("country")} />
          </Field>
        </div>

        <footer className={styles.dialogFooter}>
          <button type="button" className={styles.buttonGhost} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.buttonPrimary}>
            {editing ? "Save changes" : "Create team"}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className={styles.fieldError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
