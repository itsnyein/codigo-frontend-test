"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { publicEnv } from "@/lib/env.public";
import {
  playerAssigned,
  type Assignment,
  type Team,
} from "@/features/teams/teamsSlice";
import type { Player } from "./types";
import {
  loadPlayers,
  selectHasMore,
  selectPlayers,
  selectPlayersError,
  selectPlayersStatus,
} from "./playersSlice";
import styles from "@/features/teams/workspace.module.scss";

interface Props {
  teams: readonly Team[];
  assignments: Record<number, Assignment>;
  rosters: Map<string, Player[]>;
}

const PAGE_SIZE = publicEnv.NEXT_PUBLIC_PLAYERS_PAGE_SIZE;

export function PlayerList({ teams, assignments, rosters }: Props) {
  const dispatch = useAppDispatch();
  const players = useAppSelector(selectPlayers);
  const status = useAppSelector(selectPlayersStatus);
  const error = useAppSelector(selectPlayersError);
  const hasMore = useAppSelector(selectHasMore);

  const [page, setPage] = useState(0);

  const fetchMore = useCallback(() => {
    void dispatch(loadPlayers());
  }, [dispatch]);

  useEffect(() => {
    if (players.length === 0) fetchMore();
  }, [players.length, fetchMore]);

  const pageCount = Math.max(1, Math.ceil(players.length / PAGE_SIZE));
  const visible = players.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const loading = status === "loading";

  const goNext = async () => {
    const nextPage = page + 1;

    if (nextPage < pageCount) {
      setPage(nextPage);
      return;
    }

    if (!hasMore) return;

    try {
      await dispatch(loadPlayers()).unwrap();
      setPage(nextPage);
    } catch {
      toast.error("Couldn't load more players", {
        description: "Check your connection, then try again.",
      });
    }
  };

  const teamsWithSpace = teams.filter(
    (team) => (rosters.get(team.id)?.length ?? 0) < team.playerCount,
  );

  const canGoNext = page + 1 < pageCount || hasMore;

  return (
    <section className={styles.column} aria-labelledby="players-heading">
      <header className={styles.columnHeader}>
        <div>
          <h2 id="players-heading" className={styles.columnTitle}>
            Players
          </h2>
          <p className={styles.columnMeta}>
            {players.length === 0
              ? "Loading…"
              : `Page ${page + 1} of ${pageCount}${hasMore ? "+" : ""} · ${players.length} loaded`}
          </p>
        </div>
      </header>

      {status === "failed" && players.length === 0 ? (
        <div className={styles.empty} role="alert">
          <p className={styles.emptyTitle}>Couldn&apos;t load players</p>
          <p className={styles.emptyBody}>{error}</p>
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={fetchMore}
          >
            Try again
          </button>
        </div>
      ) : null}

      {status === "failed" && players.length > 0 ? (
        <p className={styles.inlineError} role="alert">
          {error}{" "}
          <button
            type="button"
            className={styles.retryLink}
            onClick={fetchMore}
          >
            Retry
          </button>
        </p>
      ) : null}

      {loading && players.length === 0 ? (
        <ul className={styles.playerList} aria-busy="true">
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <li key={index} className={styles.skeletonRow} />
          ))}
        </ul>
      ) : null}

      {visible.length > 0 ? (
        <ul className={styles.playerList}>
          {visible.map((player) => {
            const assignment = assignments[player.id];
            const team = assignment
              ? teams.find((candidate) => candidate.id === assignment.teamId)
              : undefined;

            return (
              <li key={player.id} className={styles.playerRow}>
                <div className={styles.playerInfo}>
                  <span className={styles.playerName}>
                    {player.firstName} {player.lastName}
                  </span>
                  <span className={styles.playerMeta}>
                    {player.position || "—"} · {player.nbaTeam}
                  </span>
                </div>

                {assignment ? (
                  <span className={styles.assignedTag}>
                    {team?.name ?? "Assigned"}
                  </span>
                ) : teamsWithSpace.length === 0 ? (
                  <span className={styles.playerMeta}>No space</span>
                ) : (
                  <label className={styles.assignLabel}>
                    <span className="sr-only">
                      Add {player.firstName} {player.lastName} to a team
                    </span>
                    <select
                      className={styles.select}
                      value=""
                      onChange={(event) => {
                        const teamId = event.target.value;
                        if (!teamId) return;

                        const target = teams.find(
                          (candidate) => candidate.id === teamId,
                        );
                        dispatch(playerAssigned({ teamId, player }));
                        toast.success(
                          `${player.firstName} ${player.lastName} added`,
                          target
                            ? { description: `Now playing for ${target.name}.` }
                            : undefined,
                        );
                      }}
                    >
                      <option value="">Add to…</option>
                      {teamsWithSpace.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      {players.length > 0 ? (
        <nav className={styles.pagination} aria-label="Player pages">
          <button
            type="button"
            className={styles.buttonGhostSmall}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={page === 0}
          >
            Previous
          </button>
          <span className={styles.pageStatus}>
            {loading
              ? "Loading…"
              : `${page + 1} / ${pageCount}${hasMore ? "+" : ""}`}
          </span>
          <button
            type="button"
            className={styles.buttonGhostSmall}
            onClick={goNext}
            disabled={!canGoNext || loading}
          >
            Next
          </button>
        </nav>
      ) : null}
    </section>
  );
}
