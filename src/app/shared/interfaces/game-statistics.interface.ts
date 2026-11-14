import { GameId } from './game.interface';

export interface GameStatistics {
  gameId: GameId;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}