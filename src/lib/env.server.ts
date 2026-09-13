import "server-only";
import { z } from "zod";

const schema = z.object({
  BALLDONTLIE_API_URL: z.url(),
  BALLDONTLIE_API_KEY: z.string().optional(),
  AUTH_USERNAME: z.string().min(1).default("admin"),
  AUTH_PASSWORD: z.string().min(1).default("codigo2026"),
});

export const serverEnv = schema.parse({
  BALLDONTLIE_API_URL: process.env.BALLDONTLIE_API_URL,
  BALLDONTLIE_API_KEY: process.env.BALLDONTLIE_API_KEY || undefined,
  AUTH_USERNAME: process.env.AUTH_USERNAME || undefined,
  AUTH_PASSWORD: process.env.AUTH_PASSWORD || undefined,
});
