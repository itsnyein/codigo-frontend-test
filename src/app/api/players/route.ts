import type { NextRequest } from "next/server";
import { z } from "zod";
import { serverEnv } from "@/lib/env.server";
import { publicEnv } from "@/lib/env.public";
import { FIXTURE_PLAYERS } from "@/features/players/fixture";
import type { Player, PlayersPage } from "@/features/players/types";

const upstreamSchema = z.object({
  data: z.array(
    z.object({
      id: z.number(),
      first_name: z.string(),
      last_name: z.string(),
      position: z.string(),
      team: z.object({ full_name: z.string() }).nullish(),
    }),
  ),
  meta: z.object({ next_cursor: z.number().nullish() }).optional(),
});

const cursorSchema = z.coerce.number().int().min(0).catch(0);

export async function GET(request: NextRequest): Promise<Response> {
  const cursor = cursorSchema.parse(
    request.nextUrl.searchParams.get("cursor") ?? 0,
  );
  const apiKey = serverEnv.BALLDONTLIE_API_KEY;

  try {
    const page = apiKey
      ? await fetchUpstream(cursor, apiKey)
      : readFixture(cursor);

    return Response.json(page satisfies PlayersPage);
  } catch {
    return Response.json(
      { error: "Could not load players right now." },
      { status: 502 },
    );
  }
}

async function fetchUpstream(
  cursor: number,
  apiKey: string,
): Promise<PlayersPage> {
  const url = new URL(serverEnv.BALLDONTLIE_API_URL);
  url.searchParams.set(
    "per_page",
    String(publicEnv.NEXT_PUBLIC_PLAYERS_PAGE_SIZE),
  );
  if (cursor > 0) url.searchParams.set("cursor", String(cursor));

  const response = await fetch(url, {
    headers: { Authorization: apiKey },
    next: { revalidate: 3600 },
  });

  if (!response.ok) throw new Error(`Upstream responded ${response.status}`);

  const payload = upstreamSchema.parse(await response.json());

  return {
    players: payload.data.map((entry): Player => ({
      id: entry.id,
      firstName: entry.first_name,
      lastName: entry.last_name,
      position: entry.position,
      nbaTeam: entry.team?.full_name ?? "Free agent",
    })),
    nextCursor: payload.meta?.next_cursor ?? null,
  };
}

function readFixture(cursor: number): PlayersPage {
  const players = FIXTURE_PLAYERS.slice(
    cursor,
    cursor + publicEnv.NEXT_PUBLIC_PLAYERS_PAGE_SIZE,
  );
  const nextCursor = cursor + players.length;

  return {
    players: [...players],
    nextCursor: nextCursor < FIXTURE_PLAYERS.length ? nextCursor : null,
  };
}
