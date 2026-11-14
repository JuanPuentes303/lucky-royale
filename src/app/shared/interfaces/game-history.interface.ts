import { GameId, GameOutcome } from './game.interface';

export interface GameHistoryEntry {
  id: string;
  gameId: GameId;
  outcome: GameOutcome;
  playedAt: string;
  details?: string;
}