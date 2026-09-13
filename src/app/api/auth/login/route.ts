import type { NextRequest } from "next/server";
import { z } from "zod";
import { serverEnv } from "@/lib/env.server";

const credentialsSchema = z.object({
  username: z.string(),
  password: z.string(),
});

function safeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function POST(request: NextRequest): Promise<Response> {
  const parsed = credentialsSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: "Wrong credentials" }, { status: 400 });
  }

  const username = parsed.data.username.trim();
  const matches =
    safeEquals(username, serverEnv.AUTH_USERNAME) &&
    safeEquals(parsed.data.password, serverEnv.AUTH_PASSWORD);

  if (!matches) {
    return Response.json({ error: "Wrong credentials" }, { status: 401 });
  }

  return Response.json({ username });
}
