"use client";

import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
  const formId = useId();

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
      toast.error("Team name already taken", {
        description: "Every team needs a unique name.",
      });
      return;
    }

    if (editing && values.playerCount < rosterSize) {
      const message = `This team already has ${rosterSize} player${rosterSize === 1 ? "" : "s"}.`;
      setError("playerCount", { message });
      toast.error("Player count too low", { description: message });
      return;
    }

    if (team) {
      dispatch(teamUpdated({ id: team.id, ...values }));
      toast.success(`${values.name} updated`);
    } else {
      dispatch(teamCreated(values));
      toast.success(`${values.name} created`, {
        description: `Room for ${values.playerCount} player${values.playerCount === 1 ? "" : "s"}.`,
      });
    }

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
      footer={
        <>
          <button
            type="button"
            className={styles.buttonGhost}
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" form={formId} className={styles.buttonPrimary}>
            {editing ? "Save changes" : "Create team"}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate>
        <div className={styles.formGrid}>
          <Field
            label="Team name"
            error={errors.name?.message}
            htmlFor={`${formId}-name`}
          >
            <input
              id={`${formId}-name`}
              className={styles.input}
              autoComplete="off"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={
                errors.name ? `${formId}-name-error` : undefined
              }
              {...register("name")}
            />
          </Field>

          <Field
            label="Player count"
            error={errors.playerCount?.message}
            htmlFor={`${formId}-playerCount`}
          >
            <input
              id={`${formId}-playerCount`}
              className={styles.input}
              type="number"
              min={1}
              max={30}
              aria-invalid={errors.playerCount ? true : undefined}
              aria-describedby={
                errors.playerCount ? `${formId}-playerCount-error` : undefined
              }
              {...register("playerCount")}
            />
          </Field>

          <Field
            label="Region"
            error={errors.region?.message}
            htmlFor={`${formId}-region`}
          >
            <input
              id={`${formId}-region`}
              className={styles.input}
              autoComplete="off"
              aria-invalid={errors.region ? true : undefined}
              aria-describedby={
                errors.region ? `${formId}-region-error` : undefined
              }
              {...register("region")}
            />
          </Field>

          <Field
            label="Country"
            error={errors.country?.message}
            htmlFor={`${formId}-country`}
          >
            <input
              id={`${formId}-country`}
              className={styles.input}
              autoComplete="off"
              aria-invalid={errors.country ? true : undefined}
              aria-describedby={
                errors.country ? `${formId}-country-error` : undefined
              }
              {...register("country")}
            />
          </Field>
        </div>
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
        <p id={`${htmlFor}-error`} className={styles.fieldError} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
