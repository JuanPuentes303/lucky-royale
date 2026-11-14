
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

type BaccaratSide = 'player' | 'banker' | 'tie';
type BaccaratOutcome = 'win' | 'loss' | 'draw';

interface BaccaratCard {
  rank: string;
  value: number;
  suit: string;
  color: 'red' | 'black';
}

@Component({
  selector: 'app-baccarat',
  standalone: true,
  templateUrl: './baccarat.page.html',
  styleUrl: './baccarat.page.scss',
  imports: [
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
  ],
})
export class BaccaratPage {
  private readonly authService = inject(AuthService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);

  private deck: BaccaratCard[] = [];

  public playerCards: BaccaratCard[] = [];
  public bankerCards: BaccaratCard[] = [];

  public prediction: BaccaratSide | null = null;
  public resultSide: BaccaratSide | null = null;

  public outcome: BaccaratOutcome | null = null;

  public isPlaying = false;
  public hasPlayed = false;

  public resultMessage =
    'Selecciona tu predicción para comenzar la partida.';

  public get playerScore(): number {
    return this.calculateScore(this.playerCards);
  }

  public get bankerScore(): number {
    return this.calculateScore(this.bankerCards);
  }

  public get resultLabel(): string {
    const labels: Record<BaccaratSide, string> = {
      player: 'JUGADOR',
      banker: 'BANCA',
      tie: 'EMPATE',
    };

    return this.resultSide ? labels[this.resultSide] : '';
  }

  public get predictionLabel(): string {
    const labels: Record<BaccaratSide, string> = {
      player: 'Jugador',
      banker: 'Banca',
      tie: 'Empate',
    };

    return this.prediction ? labels[this.prediction] : '';
  }

  private createDeck(): BaccaratCard[] {
    const suits = ['♠', '♥', '♦', '♣'];

    const ranks = [
      'A', '2', '3', '4', '5', '6', '7',
      '8', '9', '10', 'J', 'Q', 'K',
    ];

    return suits.flatMap(suit =>
      ranks.map(rank => {
        const value =
          rank === 'A'
            ? 1
            : ['10', 'J', 'Q', 'K'].includes(rank)
              ? 0
              : Number(rank);

        return {
          rank,
          value,
          suit,
          color:
            suit === '♥' || suit === '♦'
              ? 'red' as const
              : 'black' as const,
        };
      }),
    );
  }

  private shuffleDeck(cards: BaccaratCard[]): BaccaratCard[] {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
  }

  private drawCard(): BaccaratCard {
    const card = this.deck.pop();

    if (!card) {
      throw new Error('No quedan cartas en la baraja.');
    }

    return card;
  }

  private calculateScore(cards: BaccaratCard[]): number {
    return cards.reduce(
      (total, card) => total + card.value,
      0,
    ) % 10;
  }

  private wait(milliseconds: number): Promise<void> {
    return new Promise(resolve =>
      setTimeout(resolve, milliseconds),
    );
  }

  public selectPrediction(side: BaccaratSide): void {
    if (this.isPlaying || this.hasPlayed) {
      return;
    }

    this.prediction = side;
    this.resultMessage =
      `Predicción seleccionada: ${this.predictionLabel}.`;
  }

  private shouldBankerDraw(
    bankerScore: number,
    playerThirdCard: number | null,
  ): boolean {
    if (playerThirdCard === null) {
      return bankerScore <= 5;
    }

    if (bankerScore <= 2) {
      return true;
    }

    if (bankerScore === 3) {
      return playerThirdCard !== 8;
    }

    if (bankerScore === 4) {
      return playerThirdCard >= 2 && playerThirdCard <= 7;
    }

    if (bankerScore === 5) {
      return playerThirdCard >= 4 && playerThirdCard <= 7;
    }

    if (bankerScore === 6) {
      return playerThirdCard === 6 || playerThirdCard === 7;
    }

    return false;
  }

  public async startRound(): Promise<void> {
    if (!this.prediction || this.isPlaying || this.hasPlayed) {
      return;
    }

    this.isPlaying = true;
    this.hasPlayed = false;

    this.playerCards = [];
    this.bankerCards = [];

    this.resultSide = null;
    this.outcome = null;

    this.resultMessage = 'Repartiendo las cartas...';

    this.deck = this.shuffleDeck(this.createDeck());

    this.changeDetector.detectChanges();

    try {
      // Reparto inicial alternado.
      this.playerCards.push(this.drawCard());
      this.changeDetector.detectChanges();
      await this.wait(400);

      this.bankerCards.push(this.drawCard());
      this.changeDetector.detectChanges();
      await this.wait(400);

      this.playerCards.push(this.drawCard());
      this.changeDetector.detectChanges();
      await this.wait(400);

      this.bankerCards.push(this.drawCard());
      this.changeDetector.detectChanges();
      await this.wait(600);

      const initialPlayerScore = this.playerScore;
      const initialBankerScore = this.bankerScore;

      // Natural: 8 o 9. Ninguna mano solicita tercera carta.
      const natural =
        initialPlayerScore >= 8 ||
        initialBankerScore >= 8;

      let playerThirdCard: number | null = null;

      if (!natural) {
        // Regla de tercera carta del jugador.
        if (this.playerScore <= 5) {
          const card = this.drawCard();

          this.playerCards.push(card);
          playerThirdCard = card.value;

          this.changeDetector.detectChanges();
          await this.wait(500);
        }

        // Regla de tercera carta de la banca.
        if (
          this.shouldBankerDraw(
            this.bankerScore,
            playerThirdCard,
          )
        ) {
          this.bankerCards.push(this.drawCard());

          this.changeDetector.detectChanges();
          await this.wait(500);
        }
      }

      // Comparar las puntuaciones finales.
      if (this.playerScore > this.bankerScore) {
        this.resultSide = 'player';
      } else if (this.bankerScore > this.playerScore) {
        this.resultSide = 'banker';
      } else {
        this.resultSide = 'tie';
      }

      this.finishRound();

    } finally {
      this.isPlaying = false;
      this.changeDetector.detectChanges();
    }
  }

  private finishRound(): void {
    if (!this.resultSide || !this.prediction) {
      return;
    }

    this.hasPlayed = true;

    if (this.prediction === this.resultSide) {
      this.outcome = 'win';

      this.resultMessage =
        `¡Acertaste! El resultado fue ${this.resultLabel}.`;

    } else if (this.resultSide === 'tie') {
      this.outcome = 'draw';

      this.resultMessage =
        'La ronda terminó en empate. Tu predicción no coincidió.';

    } else {
      this.outcome = 'loss';

      this.resultMessage =
        `El resultado fue ${this.resultLabel}. Esta vez no acertaste.`;
    }

    const user = this.authService.currentUser;

    if (user && this.outcome) {
      this.statisticsService.recordResult(
        user.id,
        'baccarat',
        this.outcome,
        `Jugador: ${this.playerScore}. Banca: ${this.bankerScore}. Resultado: ${this.resultLabel}. Predicción: ${this.predictionLabel}.`,
      );
    }
  }

  public playAgain(): void {
    if (this.isPlaying) {
      return;
    }

    this.playerCards = [];
    this.bankerCards = [];

    this.prediction = null;
    this.resultSide = null;
    this.outcome = null;

    this.hasPlayed = false;

    this.resultMessage =
      'Selecciona una nueva predicción para comenzar.';
  }

  public goToDashboard(): void {
    void this.router.navigateByUrl('/dashboard');
  }
}
