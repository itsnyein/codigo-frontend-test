export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  nbaTeam: string;
}

export interface PlayersPage {
  players: Player[];
  nextCursor: number | null;
}

export function playerFullName(player: Player): string {
  return `${player.firstName} ${player.lastName}`.trim();
}
