import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { Player } from "@/features/players/types";
import { rehydrated } from "@/store/persisted-state";

export interface Team {
  id: string;
  name: string;
  playerCount: number;
  region: string;
  country: string;
}

export interface Assignment {
  teamId: string;
  player: Player;
}

export interface TeamsState {
  teams: Record<string, Team>;
  order: string[];
  assignments: Record<number, Assignment>;
}

const initialState: TeamsState = { teams: {}, order: [], assignments: {} };

export function normaliseName(name: string): string {
  return name.trim().toLowerCase();
}

export interface TeamDraft {
  name: string;
  playerCount: number;
  region: string;
  country: string;
}

export const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    teamCreated: {
      reducer(state, action: PayloadAction<Team>) {
        state.teams[action.payload.id] = action.payload;
        state.order.push(action.payload.id);
      },
      prepare(draft: TeamDraft) {
        return { payload: { ...draft, name: draft.name.trim(), id: nanoid() } };
      },
    },

    teamUpdated(state, action: PayloadAction<{ id: string } & TeamDraft>) {
      const team = state.teams[action.payload.id];
      if (!team) return;

      team.name = action.payload.name.trim();
      team.playerCount = action.payload.playerCount;
      team.region = action.payload.region;
      team.country = action.payload.country;
    },

    teamDeleted(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (!state.teams[id]) return;

      delete state.teams[id];
      state.order = state.order.filter((teamId) => teamId !== id);

      for (const [playerId, assignment] of Object.entries(state.assignments)) {
        if (assignment.teamId === id)
          delete state.assignments[Number(playerId)];
      }
    },

    playerAssigned(
      state,
      action: PayloadAction<{ teamId: string; player: Player }>,
    ) {
      const { teamId, player } = action.payload;
      const team = state.teams[teamId];
      if (!team) return;

      if (state.assignments[player.id]) return;

      const rosterSize = Object.values(state.assignments).filter(
        (assignment) => assignment.teamId === teamId,
      ).length;
      if (rosterSize >= team.playerCount) return;

      state.assignments[player.id] = { teamId, player };
    },

    playerUnassigned(state, action: PayloadAction<number>) {
      delete state.assignments[action.payload];
    },
  },

  extraReducers: (builder) => {
    builder.addCase(rehydrated, (state, action) => {
      const persisted = action.payload.teams;
      if (!persisted) return state;
      return {
        teams: persisted.teams,
        order: persisted.order,
        assignments: persisted.assignments,
      };
    });
  },

  selectors: {
    selectTeams: (state): Team[] =>
      state.order.reduce<Team[]>((list, id) => {
        const team = state.teams[id];
        if (team) list.push(team);
        return list;
      }, []),
    selectAssignments: (state) => state.assignments,
    selectTeamCount: (state) => state.order.length,
  },
});

export const {
  teamCreated,
  teamUpdated,
  teamDeleted,
  playerAssigned,
  playerUnassigned,
} = teamsSlice.actions;

export const { selectTeams, selectAssignments, selectTeamCount } =
  teamsSlice.selectors;

export function rosterFor(
  assignments: Record<number, Assignment>,
  teamId: string,
): Player[] {
  return Object.values(assignments)
    .filter((assignment) => assignment.teamId === teamId)
    .map((assignment) => assignment.player);
}

export function isNameTaken(
  teams: readonly Team[],
  name: string,
  exceptId?: string,
): boolean {
  const candidate = normaliseName(name);
  return teams.some(
    (team) => team.id !== exceptId && normaliseName(team.name) === candidate,
  );
}
