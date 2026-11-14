
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
} from '@ionic/angular';

import { AuthService } from '../../../core/services/auth.service';
import { StatisticsService } from '../../../core/services/statistics.service';

interface PlayingCard {
  rank: string;
  suit: string;
  value: number;
}

type BlackjackOutcome = 'win' | 'loss' | 'draw';

@Component({
  selector: 'app-blackjack',
  standalone: true,
  templateUrl: './blackjack.page.html',
  styleUrl: './blackjack.page.scss',
  imports: [
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
  ],
})
export class BlackjackPage {
  private readonly authService = inject(AuthService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly router = inject(Router);
  private currentRoundId: string | null = null;

  private deck: PlayingCard[] = [];

  public playerCards: PlayingCard[] = [];
  public dealerCards: PlayingCard[] = [];

  public isRoundActive = false;
  public dealerRevealed = false;
  public hasPlayed = false;

  public outcome: BlackjackOutcome | null = null;

  public resultMessage =
    'Consigue 21 puntos sin pasarte. ¡Que comience la partida!';

  public get playerTotal(): number {
    return this.calculateHand(this.playerCards);
  }

  public get dealerTotal(): number {
    return this.calculateHand(this.dealerCards);
  }

  public get visibleDealerTotal(): number {
    return this.dealerCards.length
      ? this.calculateHand([this.dealerCards[0]])
      : 0;
  }

  private createDeck(): PlayingCard[] {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = [
      'A', '2', '3', '4', '5', '6', '7',
      '8', '9', '10', 'J', 'Q', 'K',
    ];

    const cards: PlayingCard[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        const value =
          rank === 'A'
            ? 11
            : ['J', 'Q', 'K'].includes(rank)
              ? 10
              : Number(rank);

        cards.push({ rank, suit, value });
      }
    }

    return cards;
  }

  private shuffleDeck(cards: PlayingCard[]): PlayingCard[] {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
  }

  private drawCard(): PlayingCard {
    const card = this.deck.pop();

    if (!card) {
      throw new Error('No quedan cartas en la baraja.');
    }

    return card;
  }

  private calculateHand(cards: PlayingCard[]): number {
    let total = cards.reduce(
      (sum, card) => sum + card.value,
      0,
    );

    let aces = cards.filter(card => card.rank === 'A').length;

    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  }

  public startGame(): void {
    if (this.isRoundActive) {
      return;
    }

    this.currentRoundId = crypto.randomUUID();
    this.deck = this.shuffleDeck(this.createDeck());

    this.playerCards = [];
    this.dealerCards = [];

    this.outcome = null;
    this.hasPlayed = false;
    this.dealerRevealed = false;
    this.isRoundActive = true;

    this.resultMessage = 'Repartiendo cartas...';

    // Reparto alternado.
    this.playerCards.push(this.drawCard());
    this.dealerCards.push(this.drawCard());
    this.playerCards.push(this.drawCard());
    this.dealerCards.push(this.drawCard());

    this.resultMessage = 'Tu turno. Pide una carta o plántate.';

    // Blackjack inicial.
    if (
      this.playerTotal === 21 ||
      this.dealerTotal === 21
    ) {
      this.finishRound();
    }
  }

  public hit(): void {
    if (!this.isRoundActive) {
      return;
    }

    this.playerCards = [
      ...this.playerCards,
      this.drawCard(),
    ];

    if (this.playerTotal > 21) {
      this.finishRound();
      return;
    }

    this.resultMessage = 'Carta recibida. ¿Qué deseas hacer?';
  }

  public stand(): void {
    if (!this.isRoundActive) {
      return;
    }

    this.finishRound();
  }

  private finishRound(): void {
    if (!this.isRoundActive) {
      return;
    }

    // El crupier debe alcanzar al menos 17.
    while (this.dealerTotal < 17) {
      this.dealerCards = [
        ...this.dealerCards,
        this.drawCard(),
      ];
    }

    this.dealerRevealed = true;
    this.isRoundActive = false;
    this.hasPlayed = true;

    if (this.playerTotal > 21) {
      this.outcome = 'loss';
      this.resultMessage = '¡Te pasaste de 21! Gana el crupier.';
    } else if (this.dealerTotal > 21) {
      this.outcome = 'win';
      this.resultMessage = '¡El crupier se pasó de 21! ¡Ganaste!';
    } else if (this.playerTotal > this.dealerTotal) {
      this.outcome = 'win';
      this.resultMessage = '¡Excelente partida! ¡Has ganado!';
    } else if (this.playerTotal < this.dealerTotal) {
      this.outcome = 'loss';
      this.resultMessage = 'El crupier consiguió más puntos. ¡Inténtalo otra vez!';
    } else {
      this.outcome = 'draw';
      this.resultMessage = '¡Empate! Ambos tienen la misma puntuación.';
    }

    const user = this.authService.currentUser;

    if (user && this.outcome) {
      this.statisticsService.recordResult(
        user.id,
        'blackjack',
        this.outcome,
        `Jugador: ${this.playerTotal} puntos. Crupier: ${this.dealerTotal} puntos.`,
        this.currentRoundId ?? undefined,
      );
    }
  }

  public playAgain(): void {
    this.startGame();
  }

  public goToDashboard(): void {
    void this.router.navigateByUrl('/dashboard');
  }
}
