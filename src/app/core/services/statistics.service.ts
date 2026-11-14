
import { Injectable, inject } from '@angular/core';

import { StorageService } from './storage.service';
import { GAMES } from '../../shared/models/game.model';

import {
  GameId,
  GameOutcome,
} from '../../shared/interfaces/game.interface';

import {
  GameStatistics,
} from '../../shared/interfaces/game-statistics.interface';

import {
  GameHistoryEntry,
} from '../../shared/interfaces/game-history.interface';

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
    const savedStatistics =
      this.storageService.get<GameStatistics[]>(
        this.getStatisticsKey(userId),
      ) ?? [];

    return GAMES.map((game) => {
      const existing = savedStatistics.find(
        (item) => item.gameId === game.id,
      );

      return existing ?? {
        gameId: game.id,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      };
    });
  }

  public getHistory(userId: string): GameHistoryEntry[] {
    return (
      this.storageService.get<GameHistoryEntry[]>(
        this.getHistoryKey(userId),
      ) ?? []
    );
  }

  public recordResult(
    userId: string,
    gameId: GameId,
    outcome: GameOutcome,
    details?: string,
  ): void {
    const statistics = this.getStatistics(userId);

    const gameStatistics = statistics.find(
      (item) => item.gameId === gameId,
    );

    if (!gameStatistics) {
      return;
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

    this.storageService.set(
      this.getStatisticsKey(userId),
      statistics,
    );

    const history = this.getHistory(userId);

    const newEntry: GameHistoryEntry = {
      id: crypto.randomUUID(),
      gameId,
      outcome,
      playedAt: new Date().toISOString(),
      details,
    };

    history.unshift(newEntry);

    this.storageService.set(
      this.getHistoryKey(userId),
      history.slice(0, 100),
    );
  }

  public getTotalGames(userId: string): number {
    return this.getStatistics(userId).reduce(
      (total, game) => total + game.gamesPlayed,
      0,
    );
  }

  public getTotalWins(userId: string): number {
    return this.getStatistics(userId).reduce(
      (total, game) => total + game.wins,
      0,
    );
  }

  public getTotalLosses(userId: string): number {
    return this.getStatistics(userId).reduce(
      (total, game) => total + game.losses,
      0,
    );
  }

  public getTotalDraws(userId: string): number {
    return this.getStatistics(userId).reduce(
      (total, game) => total + game.draws,
      0,
    );
  }
}
