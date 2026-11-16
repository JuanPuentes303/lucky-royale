import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { StatisticsService } from './statistics.service';
import { StorageService } from './storage.service';

describe('StatisticsService', () => {
  let service: StatisticsService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [StatisticsService, StorageService],
    });

    service = TestBed.inject(StatisticsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize statistics for all six games', () => {
    const statistics = service.getStatistics('user-1');

    expect(statistics.length).toBe(6);
    expect(service.getTotalGames('user-1')).toBe(0);
  });

  it('should register a victory correctly', () => {
    const registered = service.recordResult('user-1', 'dice', 'win', 'Resultado de prueba', 'round-001');

    expect(registered).toBe(true);
    expect(service.getTotalGames('user-1')).toBe(1);
    expect(service.getTotalWins('user-1')).toBe(1);

    const dice = service.getStatistics('user-1').find((game) => game.gameId === 'dice');

    expect(dice?.gamesPlayed).toBe(1);
    expect(dice?.wins).toBe(1);
  });

  it('should reject duplicate round identifiers', () => {
    const first = service.recordResult('user-1', 'dice', 'win', 'Primera partida', 'round-002');

    const second = service.recordResult('user-1', 'dice', 'win', 'Partida duplicada', 'round-002');

    expect(first).toBe(true);
    expect(second).toBe(false);

    expect(service.getTotalGames('user-1')).toBe(1);
    expect(service.getHistory('user-1').length).toBe(1);
  });

  it('should count wins, losses and draws correctly', () => {
    service.recordResult('user-1', 'roulette', 'win', undefined, 'round-003');
    service.recordResult('user-1', 'roulette', 'loss', undefined, 'round-004');
    service.recordResult('user-1', 'roulette', 'draw', undefined, 'round-005');

    const roulette = service.getStatistics('user-1').find((game) => game.gameId === 'roulette');

    expect(roulette?.gamesPlayed).toBe(3);
    expect(roulette?.wins).toBe(1);
    expect(roulette?.losses).toBe(1);
    expect(roulette?.draws).toBe(1);
  });

  it('should keep statistics separated between users', () => {
    service.recordResult('user-1', 'blackjack', 'win', undefined, 'round-006');

    expect(service.getTotalGames('user-1')).toBe(1);
    expect(service.getTotalGames('user-2')).toBe(0);
  });

  it('should save the result in the history', () => {
    service.recordResult('user-1', 'poker', 'loss', 'Jugador se retiró', 'round-007');

    const history = service.getHistory('user-1');

    expect(history.length).toBe(1);
    expect(history[0].gameId).toBe('poker');
    expect(history[0].outcome).toBe('loss');
    expect(history[0].roundId).toBe('round-007');
  });
});
