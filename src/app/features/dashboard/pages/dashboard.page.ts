
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
} from '@ionic/angular';

import { AuthService } from '../../../core/services/auth.service';
import { GAMES } from '../../../shared/models/game.model';
import { GameId } from '../../../shared/interfaces/game.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  imports: [
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonChip,
  ],
})
export class DashboardPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public readonly games = GAMES;

  public readonly gameSymbols: Record<GameId, string> = {
    blackjack: '♠',
    roulette: '◎',
    poker: '♦',
    dice: '⚄',
    slots: '🎰',
    baccarat: '♣',
  };

  public openProfile(): void {
    void this.router.navigateByUrl('/profile');
  }

  public openDice(): void {
    void this.router.navigateByUrl('/games/dice');
  }

  public openRoulette(): void {
    void this.router.navigateByUrl('/games/roulette');
  }

  public openSlots(): void {
    void this.router.navigateByUrl('/games/slots');
  }

  public openBlackjack(): void {
    void this.router.navigateByUrl('/games/blackjack');
  }

  public openPoker(): void {
    void this.router.navigateByUrl('/games/poker');
  }

  public get userName(): string {
    return this.authService.currentUser?.name ?? 'Jugador';
  }

  public get userInitial(): string {
    return this.userName.charAt(0).toUpperCase();
  }

  public logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/auth/login');
  }
}
