"use client";

import { useMemo, useState } from "react";
import { Dialog } from "@/components/Dialog";
import { PlayerList } from "@/features/players/PlayerList";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  playerUnassigned,
  rosterFor,
  selectAssignments,
  selectTeams,
  teamDeleted,
  type Team,
} from "./teamsSlice";
import { TeamDialog } from "./TeamDialog";
import styles from "./workspace.module.scss";

export function TeamsWorkspace() {
  const dispatch = useAppDispatch();
  const teams = useAppSelector(selectTeams);
  const assignments = useAppSelector(selectAssignments);

  const [editing, setEditing] = useState<Team | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Team | null>(null);

  const rosters = useMemo(() => {
    const map = new Map<string, ReturnType<typeof rosterFor>>();
    for (const team of teams) map.set(team.id, rosterFor(assignments, team.id));
    return map;
  }, [teams, assignments]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditing(team);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (pendingDelete) dispatch(teamDeleted(pendingDelete.id));
    setPendingDelete(null);
  };

  return (
    <div className={styles.grid}>
      <section className={styles.column} aria-labelledby="teams-heading">
        <header className={styles.columnHeader}>
          <div>
            <h2 id="teams-heading" className={styles.columnTitle}>
              Teams
            </h2>
            <p className={styles.columnMeta}>
              {teams.length === 0
                ? "No teams yet"
                : `${teams.length} team${teams.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button type="button" className={styles.buttonPrimary} onClick={openCreate}>
            New team
          </button>
        </header>

        {teams.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No teams yet</p>
            <p className={styles.emptyBody}>
              Create a team, then add players to it from the list.
            </p>
          </div>
        ) : (
          <ul className={styles.teamList}>
            {teams.map((team) => {
              const roster = rosters.get(team.id) ?? [];
              return (
                <li key={team.id} className={styles.teamCard}>
                  <div className={styles.teamTop}>
                    <div>
                      <h3 className={styles.teamName}>{team.name}</h3>
                      <p className={styles.teamMeta}>
                        {team.region} · {team.country}
                      </p>
                    </div>
                    <span className={styles.badge}>
                      {roster.length}/{team.playerCount}
                    </span>
                  </div>

                  {roster.length === 0 ? (
                    <p className={styles.rosterEmpty}>No players yet.</p>
                  ) : (
                    <ul className={styles.roster}>
                      {roster.map((player) => (
                        <li key={player.id} className={styles.rosterRow}>
                          <span>
                            {player.firstName} {player.lastName}
                          </span>
                          <button
                            type="button"
                            className={styles.buttonGhostSmall}
                            onClick={() => dispatch(playerUnassigned(player.id))}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <footer className={styles.teamActions}>
                    <button type="button" className={styles.buttonGhostSmall} onClick={() => openEdit(team)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.buttonDangerSmall}
                      onClick={() => setPendingDelete(team)}
                    >
                      Delete
                    </button>
                  </footer>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <PlayerList teams={teams} assignments={assignments} rosters={rosters} />

      <TeamDialog
        open={formOpen}
        team={editing}
        rosterSize={editing ? (rosters.get(editing.id)?.length ?? 0) : 0}
        onClose={() => setFormOpen(false)}
      />

      <Dialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.name ?? "team"}?`}
        description="Its players go back to the available list. This cannot be undone."
        onClose={() => setPendingDelete(null)}
      >
        <footer className={styles.dialogFooter}>
          <button type="button" className={styles.buttonGhost} onClick={() => setPendingDelete(null)}>
            Cancel
          </button>
          <button type="button" className={styles.buttonDanger} onClick={confirmDelete}>
            Delete team
          </button>
        </footer>
      </Dialog>
    </div>
  );
}
