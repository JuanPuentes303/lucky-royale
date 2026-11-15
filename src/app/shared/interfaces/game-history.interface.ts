import type { GameId, GameOutcome } from './game.interface';

export interface GameHistoryEntry {
  id: string;
  roundId?: string;
  gameId: GameId;
  outcome: GameOutcome;
  playedAt: string;
  details?: string;
}
