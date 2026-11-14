
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
} from '@ionic/angular';

import { AuthService } from '../../../core/services/auth.service';
import { StatisticsService } from '../../../core/services/statistics.service';

type SlotsOutcome = 'win' | 'loss' | 'draw';

@Component({
  selector: 'app-slots',
  standalone: true,
  templateUrl: './slots.page.html',
  styleUrl: './slots.page.scss',
  imports: [
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
  ],
})
export class SlotsPage {
  private readonly authService = inject(AuthService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private currentRoundId: string | null = null;

  public readonly symbols = [
    '🍒',
    '🍋',
    '🍉',
    '🔔',
    '⭐',
    '💎',
    '7️⃣',
  ];

  public reels: string[] = ['🍒', '🍋', '🔔'];

  public spinningReels: boolean[] = [false, false, false];

  public isSpinning = false;
  public hasPlayed = false;

  public outcome: SlotsOutcome | null = null;

  public resultMessage =
    '¡Prepárate! Pulsa el botón para iniciar los carretes.';

  private getRandomSymbol(): string {
    const index = Math.floor(Math.random() * this.symbols.length);

    return this.symbols[index] ?? '🍒';
  }

  public async spinSlots(): Promise<void> {
    if (this.isSpinning) {
      return;
    }

    this.currentRoundId = crypto.randomUUID();
    this.isSpinning = true;
    this.hasPlayed = false;
    this.outcome = null;

    this.resultMessage = '¡Los carretes están girando!';

    const winningSymbols = [
      this.getRandomSymbol(),
      this.getRandomSymbol(),
      this.getRandomSymbol(),
    ];

    this.spinningReels = [true, true, true];

    this.changeDetector.detectChanges();

    try {
      // Permitir que el navegador renderice la animación.
      await new Promise<void>(resolve =>
        requestAnimationFrame(() => resolve()),
      );

      const stopDelays = [900, 650, 650];

      // Detener cada carrete de forma independiente.
      for (let index = 0; index < 3; index++) {
        await new Promise(resolve =>
          setTimeout(resolve, stopDelays[index]),
        );

        this.reels[index] = winningSymbols[index];
        this.spinningReels[index] = false;

        this.changeDetector.detectChanges();
      }

      const [first, second, third] = winningSymbols;

      if (first === second && second === third) {
        this.outcome = 'win';
        this.resultMessage =
          '¡Tres símbolos iguales! ¡Excelente resultado!';
      } else if (
        first === second ||
        first === third ||
        second === third
      ) {
        this.outcome = 'draw';
        this.resultMessage =
          '¡Dos símbolos iguales! Has conseguido un empate.';
      } else {
        this.outcome = 'loss';
        this.resultMessage =
          'Esta vez no hubo coincidencias. ¡Puedes intentarlo de nuevo!';
      }

      this.hasPlayed = true;

      const user = this.authService.currentUser;

      if (user && this.outcome) {
        this.statisticsService.recordResult(
          user.id,
          'slots',
          this.outcome,
          `Resultado: ${winningSymbols.join(' | ')}`,
          this.currentRoundId ?? undefined,
        );
      }

    } finally {
      this.spinningReels = [false, false, false];
      this.isSpinning = false;

      this.changeDetector.detectChanges();
    }
  }

  public playAgain(): void {
    if (this.isSpinning) {
      return;
    }

    this.currentRoundId = null;
    this.reels = ['🍒', '🍋', '🔔'];
    this.spinningReels = [false, false, false];

    this.hasPlayed = false;
    this.outcome = null;

    this.resultMessage =
      '¡Prepárate! Pulsa el botón para iniciar los carretes.';
  }

  public goToDashboard(): void {
    void this.router.navigateByUrl('/dashboard');
  }
}
