import { createAction } from "@reduxjs/toolkit";
import { z } from "zod";
import { createPersistence } from "./persistence";

const STORAGE_KEY = "juicy-bunch:state:v1";

export const persistedStateSchema = z.object({});

export type PersistedState = z.infer<typeof persistedStateSchema>;

export const statePersistence = createPersistence(
  STORAGE_KEY,
  persistedStateSchema,
);

export const rehydrated = createAction<PersistedState>("app/rehydrated");
