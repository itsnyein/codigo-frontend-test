import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_PLAYERS_PAGE_SIZE: z.coerce.number().int().min(1).max(100),
});

export const publicEnv = schema.parse({
  NEXT_PUBLIC_PLAYERS_PAGE_SIZE: process.env.NEXT_PUBLIC_PLAYERS_PAGE_SIZE,
});
