import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import type { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonChip, IonContent } from '@ionic/angular';

import { AuthService } from '../../../core/services/auth.service';
import { StatisticsService } from '../../../core/services/statistics.service';
import type { GameHistoryEntry } from '../../../shared/interfaces/game-history.interface';
import type { GameStatistics } from '../../../shared/interfaces/game-statistics.interface';
import type { GameId } from '../../../shared/interfaces/game.interface';
import { GAMES } from '../../../shared/models/game.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  imports: [DatePipe, IonContent, IonButton, IonCard, IonCardContent, IonChip],
})
export class ProfilePage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly router = inject(Router);

  public readonly games = GAMES;

  public userName = '';
  public userEmail = '';
  public createdAt = '';

  public statistics: GameStatistics[] = [];
  public history: GameHistoryEntry[] = [];

  public totalGames = 0;
  public totalWins = 0;
  public totalLosses = 0;
  public totalDraws = 0;

  public readonly gameNames: Record<GameId, string> = {
    blackjack: 'Blackjack',
    roulette: 'Ruleta',
    poker: 'Póker',
    dice: 'Dados',
    slots: 'Tragamonedas',
    baccarat: 'Bacará',
  };

  ngOnInit(): void {
    this.loadProfile();
  }

  ionViewWillEnter(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    const user = this.authService.currentUser;

    if (!user) {
      void this.router.navigateByUrl('/auth/login');
      return;
    }

    this.userName = user.name;
    this.userEmail = user.email;
    this.createdAt = user.createdAt;

    this.statistics = this.statisticsService.getStatistics(user.id);

    this.history = this.statisticsService.getHistory(user.id);

    this.totalGames = this.statisticsService.getTotalGames(user.id);

    this.totalWins = this.statisticsService.getTotalWins(user.id);

    this.totalLosses = this.statisticsService.getTotalLosses(user.id);

    this.totalDraws = this.statisticsService.getTotalDraws(user.id);
  }

  public getGameName(gameId: GameId): string {
    return this.gameNames[gameId];
  }

  public getWinPercentage(statistic: GameStatistics): number {
    if (statistic.gamesPlayed === 0) {
      return 0;
    }

    return Math.round((statistic.wins / statistic.gamesPlayed) * 100);
  }

  public logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/auth/login');
  }

  public goToDashboard(): void {
    void this.router.navigateByUrl('/dashboard');
  }
}
