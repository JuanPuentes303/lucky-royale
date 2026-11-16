export type GameId = 'blackjack' | 'roulette' | 'poker' | 'dice' | 'slots' | 'baccarat';

export type GameOutcome = 'win' | 'loss' | 'draw';

export interface GameDefinition {
  id: GameId;
  title: string;
  description: string;
  route: string;
  icon: string;
}
