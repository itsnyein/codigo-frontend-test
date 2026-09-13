import "server-only";
import { z } from "zod";

const schema = z.object({
  BALLDONTLIE_API_URL: z.url(),
  BALLDONTLIE_API_KEY: z.string().optional(),
});

export const serverEnv = schema.parse({
  BALLDONTLIE_API_URL: process.env.BALLDONTLIE_API_URL,
  BALLDONTLIE_API_KEY: process.env.BALLDONTLIE_API_KEY || undefined,
});
