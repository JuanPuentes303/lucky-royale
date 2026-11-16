import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent } from '@ionic/angular';

import { AuthService } from '../../../core/services/auth.service';
import { StatisticsService } from '../../../core/services/statistics.service';

type DiceChoice = 'high' | 'low';
type DiceOutcome = 'win' | 'loss' | 'draw';

@Component({
  selector: 'app-dice',
  standalone: true,
  templateUrl: './dice.page.html',
  styleUrl: './dice.page.scss',
  imports: [IonContent, IonButton, IonCard, IonCardContent],
})
export class DicePage {
  private readonly authService = inject(AuthService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private currentRoundId: string | null = null;

  public diceOne = 1;
  public diceTwo = 1;

  public selectedChoice: DiceChoice | null = null;

  public isRolling = false;
  public hasPlayed = false;

  public resultMessage = 'Selecciona tu predicción para comenzar.';
  public outcome: DiceOutcome | null = null;

  public get total(): number {
    return this.diceOne + this.diceTwo;
  }

  public selectChoice(choice: DiceChoice): void {
    if (this.isRolling) {
      return;
    }

    this.selectedChoice = choice;
    this.hasPlayed = false;
    this.outcome = null;
    this.resultMessage = '¡Preparado! Lanza los dados.';
  }

  public async rollDice(): Promise<void> {
    if (!this.selectedChoice || this.isRolling || this.hasPlayed) {
      return;
    }

    this.currentRoundId = crypto.randomUUID();

    this.isRolling = true;
    this.hasPlayed = false;
    this.outcome = null;
    this.resultMessage = 'Los dados están rodando...';

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      this.diceOne = Math.floor(Math.random() * 6) + 1;
      this.diceTwo = Math.floor(Math.random() * 6) + 1;

      const sum = this.total;

      let result: DiceOutcome;

      if (sum === 7) {
        result = 'draw';
        this.resultMessage = '¡Empate! La suma fue 7.';
      } else if ((this.selectedChoice === 'high' && sum >= 8) || (this.selectedChoice === 'low' && sum <= 6)) {
        result = 'win';
        this.resultMessage = '¡Excelente! Acertaste tu predicción.';
      } else {
        result = 'loss';
        this.resultMessage = 'No acertaste esta vez. ¡Inténtalo de nuevo!';
      }

      this.outcome = result;
      this.hasPlayed = true;

      const user = this.authService.currentUser;

      if (user) {
        this.statisticsService.recordResult(
          user.id,
          'dice',
          result,
          `Dados: ${this.diceOne} + ${this.diceTwo} = ${sum}. Predicción: ${
            this.selectedChoice === 'high' ? 'Alta' : 'Baja'
          }.`,
          this.currentRoundId,
        );
      }
    } finally {
      this.isRolling = false;

      // Actualizar la interfaz después de la operación asíncrona.
      this.changeDetector.markForCheck();
    }
  }

  public playAgain(): void {
    if (this.isRolling) {
      return;
    }

    this.selectedChoice = null;
    this.currentRoundId = null;
    this.hasPlayed = false;
    this.outcome = null;

    this.diceOne = 1;
    this.diceTwo = 1;

    this.resultMessage = 'Selecciona una nueva predicción.';
  }

  public goToDashboard(): void {
    void this.router.navigateByUrl('/dashboard');
  }
}
