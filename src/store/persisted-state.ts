import { createAction } from "@reduxjs/toolkit";
import { z } from "zod";
import { createPersistence } from "./persistence";

const STORAGE_KEY = "juicy-bunch:state:v1";

const playerSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  position: z.string(),
  nbaTeam: z.string(),
});

const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  playerCount: z.number(),
  region: z.string(),
  country: z.string(),
});

export const persistedStateSchema = z.object({
  auth: z.object({ username: z.string().nullable() }).optional(),
  teams: z
    .object({
      teams: z.record(z.string(), teamSchema),
      order: z.array(z.string()),
      assignments: z.record(
        z.string(),
        z.object({ teamId: z.string(), player: playerSchema }),
      ),
    })
    .optional(),
});

export type PersistedState = z.infer<typeof persistedStateSchema>;

export const statePersistence = createPersistence(
  STORAGE_KEY,
  persistedStateSchema,
);

export const rehydrated = createAction<PersistedState>("app/rehydrated");
