import { Injectable, inject } from '@angular/core';

import type { GameHistoryEntry } from '../../shared/interfaces/game-history.interface';
import type { GameStatistics } from '../../shared/interfaces/game-statistics.interface';
import type { GameId, GameOutcome } from '../../shared/interfaces/game.interface';
import { GAMES } from '../../shared/models/game.model';

import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private readonly storageService = inject(StorageService);

  private getStatisticsKey(userId: string): string {
    return `lucky-royale.statistics.${userId}`;
  }

  private getHistoryKey(userId: string): string {
    return `lucky-royale.history.${userId}`;
  }

  public getStatistics(userId: string): GameStatistics[] {
    const savedStatistics = this.storageService.get<GameStatistics[]>(this.getStatisticsKey(userId)) ?? [];

    return GAMES.map((game) => {
      const existing = savedStatistics.find((item) => item.gameId === game.id);

      return (
        existing ?? {
          gameId: game.id,
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0,
        }
      );
    });
  }

  public getHistory(userId: string): GameHistoryEntry[] {
    return this.storageService.get<GameHistoryEntry[]>(this.getHistoryKey(userId)) ?? [];
  }

  public recordResult(
    userId: string,
    gameId: GameId,
    outcome: GameOutcome,
    details?: string,
    roundId?: string,
  ): boolean {
    if (!userId.trim()) {
      return false;
    }

    const validGame = GAMES.some((game) => game.id === gameId);

    const validOutcomes: GameOutcome[] = ['win', 'loss', 'draw'];

    if (!validGame || !validOutcomes.includes(outcome)) {
      return false;
    }

    const effectiveRoundId = roundId?.trim() || crypto.randomUUID();

    const history = this.getHistory(userId);

    // Evitar registrar dos veces la misma partida.
    const alreadyRegistered = history.some((entry) => entry.roundId === effectiveRoundId);

    if (alreadyRegistered) {
      return false;
    }

    const statistics = this.getStatistics(userId);

    const gameStatistics = statistics.find((item) => item.gameId === gameId);

    if (!gameStatistics) {
      return false;
    }

    gameStatistics.gamesPlayed++;

    switch (outcome) {
      case 'win':
        gameStatistics.wins++;
        break;

      case 'loss':
        gameStatistics.losses++;
        break;

      case 'draw':
        gameStatistics.draws++;
        break;
    }

    const newEntry: GameHistoryEntry = {
      id: crypto.randomUUID(),
      roundId: effectiveRoundId,
      gameId,
      outcome,
      playedAt: new Date().toISOString(),
      details,
    };

    history.unshift(newEntry);

    this.storageService.set(this.getStatisticsKey(userId), statistics);

    this.storageService.set(this.getHistoryKey(userId), history.slice(0, 100));

    return true;
  }

  public getTotalGames(userId: string): number {
    return this.getStatistics(userId).reduce((total, game) => total + game.gamesPlayed, 0);
  }

  public getTotalWins(userId: string): number {
    return this.getStatistics(userId).reduce((total, game) => total + game.wins, 0);
  }

  public getTotalLosses(userId: string): number {
    return this.getStatistics(userId).reduce((total, game) => total + game.losses, 0);
  }

  public getTotalDraws(userId: string): number {
    return this.getStatistics(userId).reduce((total, game) => total + game.draws, 0);
  }
}
