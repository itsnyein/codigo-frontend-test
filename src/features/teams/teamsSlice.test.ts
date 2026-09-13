import { describe, expect, it } from "vitest";
import type { Player } from "@/features/players/types";
import { rehydrated } from "@/store/persisted-state";
import {
  isNameTaken,
  playerAssigned,
  playerUnassigned,
  rosterFor,
  teamCreated,
  teamDeleted,
  teamsSlice,
  teamUpdated,
  type TeamsState,
} from "./teamsSlice";

const reducer = teamsSlice.reducer;

const player = (id: number): Player => ({
  id,
  firstName: `First${id}`,
  lastName: `Last${id}`,
  position: "G",
  nbaTeam: "Somewhere",
});

function withTeam(name = "Lakers", playerCount = 3) {
  const state = reducer(undefined, teamCreated({ name, playerCount, region: "West", country: "USA" }));
  const id = state.order[0]!;
  return { state, id };
}

describe("teams", () => {
  it("creates a team and keeps display order", () => {
    let state = reducer(undefined, teamCreated({ name: "Alpha", playerCount: 5, region: "West", country: "USA" }));
    state = reducer(state, teamCreated({ name: "Beta", playerCount: 5, region: "East", country: "USA" }));

    expect(state.order).toHaveLength(2);
    expect(state.order.map((id) => state.teams[id]?.name)).toEqual(["Alpha", "Beta"]);
  });

  it("trims the team name on create and update", () => {
    const { state, id } = withTeam("  Spaced  ");
    expect(state.teams[id]?.name).toBe("Spaced");

    const updated = reducer(state, teamUpdated({ id, name: "  Renamed ", playerCount: 4, region: "E", country: "USA" }));
    expect(updated.teams[id]?.name).toBe("Renamed");
  });
});

describe("team name uniqueness", () => {
  it("is case and whitespace insensitive", () => {
    const { state } = withTeam("Lakers");
    const teams = Object.values(state.teams);

    expect(isNameTaken(teams, "lakers")).toBe(true);
    expect(isNameTaken(teams, "  LAKERS  ")).toBe(true);
    expect(isNameTaken(teams, "Celtics")).toBe(false);
  });

  it("lets a team keep its own name while editing", () => {
    const { state, id } = withTeam("Lakers");
    const teams = Object.values(state.teams);

    expect(isNameTaken(teams, "Lakers", id)).toBe(false);
    expect(isNameTaken(teams, "Lakers")).toBe(true);
  });
});

describe("player assignment", () => {
  it("assigns a player to a team", () => {
    const { state, id } = withTeam();
    const next = reducer(state, playerAssigned({ teamId: id, player: player(1) }));

    expect(rosterFor(next.assignments, id)).toHaveLength(1);
  });

  it("never lets a player belong to two teams", () => {
    let state = reducer(undefined, teamCreated({ name: "A", playerCount: 5, region: "W", country: "USA" }));
    state = reducer(state, teamCreated({ name: "B", playerCount: 5, region: "E", country: "USA" }));
    const [first, second] = state.order as [string, string];

    state = reducer(state, playerAssigned({ teamId: first, player: player(7) }));
    state = reducer(state, playerAssigned({ teamId: second, player: player(7) }));

    expect(rosterFor(state.assignments, first)).toHaveLength(1);
    expect(rosterFor(state.assignments, second)).toHaveLength(0);
    expect(state.assignments[7]?.teamId).toBe(first);
  });

  it("refuses to exceed the declared player count", () => {
    const { state, id } = withTeam("Small", 2);
    let next = reducer(state, playerAssigned({ teamId: id, player: player(1) }));
    next = reducer(next, playerAssigned({ teamId: id, player: player(2) }));
    next = reducer(next, playerAssigned({ teamId: id, player: player(3) }));

    expect(rosterFor(next.assignments, id)).toHaveLength(2);
  });

  it("ignores assignment to a team that does not exist", () => {
    const next = reducer(undefined, playerAssigned({ teamId: "ghost", player: player(1) }));
    expect(next.assignments).toEqual({});
  });

  it("removes a player and returns them to the pool", () => {
    const { state, id } = withTeam();
    let next = reducer(state, playerAssigned({ teamId: id, player: player(1) }));
    next = reducer(next, playerUnassigned(1));

    expect(rosterFor(next.assignments, id)).toHaveLength(0);
    expect(next.assignments[1]).toBeUndefined();
  });

  it("stores a full player snapshot so rosters survive a reload", () => {
    const { state, id } = withTeam();
    const next = reducer(state, playerAssigned({ teamId: id, player: player(42) }));

    expect(next.assignments[42]?.player.lastName).toBe("Last42");
  });
});

describe("deleting a team", () => {
  it("releases its players but leaves other teams untouched", () => {
    let state = reducer(undefined, teamCreated({ name: "A", playerCount: 5, region: "W", country: "USA" }));
    state = reducer(state, teamCreated({ name: "B", playerCount: 5, region: "E", country: "USA" }));
    const [first, second] = state.order as [string, string];

    state = reducer(state, playerAssigned({ teamId: first, player: player(1) }));
    state = reducer(state, playerAssigned({ teamId: second, player: player(2) }));
    state = reducer(state, teamDeleted(first));

    expect(state.teams[first]).toBeUndefined();
    expect(state.order).toEqual([second]);
    expect(state.assignments[1]).toBeUndefined();
    expect(state.assignments[2]?.teamId).toBe(second);
  });

  it("lets a released player join another team afterwards", () => {
    let state = reducer(undefined, teamCreated({ name: "A", playerCount: 5, region: "W", country: "USA" }));
    state = reducer(state, teamCreated({ name: "B", playerCount: 5, region: "E", country: "USA" }));
    const [first, second] = state.order as [string, string];

    state = reducer(state, playerAssigned({ teamId: first, player: player(9) }));
    state = reducer(state, teamDeleted(first));
    state = reducer(state, playerAssigned({ teamId: second, player: player(9) }));

    expect(state.assignments[9]?.teamId).toBe(second);
  });

  it("ignores deletion of an unknown team", () => {
    const { state } = withTeam();
    expect(reducer(state, teamDeleted("ghost"))).toEqual(state);
  });
});

describe("rehydration", () => {
  it("restores teams, order and assignments", () => {
    const persisted: TeamsState = {
      teams: { t1: { id: "t1", name: "Saved", playerCount: 4, region: "W", country: "USA" } },
      order: ["t1"],
      assignments: { 5: { teamId: "t1", player: player(5) } },
    };

    const state = reducer(undefined, rehydrated({ teams: persisted }));

    expect(state.order).toEqual(["t1"]);
    expect(rosterFor(state.assignments, "t1")).toHaveLength(1);
  });

  it("leaves state untouched when nothing was persisted", () => {
    const { state } = withTeam();
    expect(reducer(state, rehydrated({}))).toEqual(state);
  });
});
