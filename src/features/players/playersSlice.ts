import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { PlayersPage } from "./types";

type Status = "idle" | "loading" | "succeeded" | "failed";

export interface PlayersState {
  items: PlayersPage["players"];
  nextCursor: number | null;
  status: Status;
  error: string | null;
  retryAt: number | null;
}

const initialState: PlayersState = {
  items: [],
  nextCursor: 0,
  status: "idle",
  error: null,
  retryAt: null,
};

export const loadPlayers = createAsyncThunk<
  PlayersPage,
  void,
  {
    state: RootState;
    rejectValue: { message: string; retryAt: number | null };
  }
>(
  "players/load",
  async (_arg, { getState, signal, rejectWithValue }) => {
    const cursor = getState().players.nextCursor ?? 0;
    const response = await fetch(`/api/players?cursor=${cursor}`, { signal });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        retryAfter?: number;
      } | null;
      return rejectWithValue({
        message: body?.error ?? "We couldn't load players. Please try again.",
        retryAt: body?.retryAfter ? Date.now() + body.retryAfter * 1000 : null,
      });
    }
    return (await response.json()) as PlayersPage;
  },
  {
    condition: (_arg, { getState }) => {
      const { status, nextCursor } = getState().players;
      return status !== "loading" && nextCursor !== null;
    },
  },
);

export const playersSlice = createSlice({
  name: "players",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPlayers.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.retryAt = null;
      })
      .addCase(loadPlayers.fulfilled, (state, action) => {
        const known = new Set(state.items.map((player) => player.id));
        state.items.push(
          ...action.payload.players.filter((player) => !known.has(player.id)),
        );
        state.nextCursor = action.payload.nextCursor;
        state.status = "succeeded";
      })
      .addCase(loadPlayers.rejected, (state, action) => {
        if (action.meta.aborted || action.meta.condition) return;
        state.status = "failed";
        state.error = action.payload?.message ?? "Something went wrong.";
        state.retryAt = action.payload?.retryAt ?? null;
      });
  },
  selectors: {
    selectPlayers: (state) => state.items,
    selectPlayersStatus: (state) => state.status,
    selectPlayersError: (state) => state.error,
    selectRetryAt: (state) => state.retryAt,
    selectHasMore: (state) => state.nextCursor !== null,
  },
});

export const {
  selectPlayers,
  selectPlayersStatus,
  selectPlayersError,
  selectRetryAt,
  selectHasMore,
} = playersSlice.selectors;
