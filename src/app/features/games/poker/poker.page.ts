
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

type PokerSuit = '♠' | '♥' | '♦' | '♣';
type PokerOutcome = 'win' | 'loss' | 'draw';
type PokerStage = 'ready' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

interface PokerCard {
  rank: string;
  value: number;
  suit: PokerSuit;
  color: 'red' | 'black';
}

interface HandValue {
  category: number;
  kickers: number[];
  name: string;
}

@Component({
  selector: 'app-poker',
  standalone: true,
  templateUrl: './poker.page.html',
  styleUrl: './poker.page.scss',
  imports: [
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
  ],
})
export class PokerPage {
  private readonly authService = inject(AuthService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly router = inject(Router);
  private currentRoundId: string | null = null;

  private deck: PokerCard[] = [];

  public playerCards: PokerCard[] = [];
  public opponentCards: PokerCard[] = [];
  public communityCards: PokerCard[] = [];

  public stage: PokerStage = 'ready';

  public isRoundActive = false;
  public opponentRevealed = false;
  public hasPlayed = false;

  public outcome: PokerOutcome | null = null;

  public resultMessage =
    'Prepárate para jugar Texas Hold’em.';

  private createDeck(): PokerCard[] {
    const suits: PokerSuit[] = ['♠', '♥', '♦', '♣'];

    const ranks = [
      { rank: '2', value: 2 },
      { rank: '3', value: 3 },
      { rank: '4', value: 4 },
      { rank: '5', value: 5 },
      { rank: '6', value: 6 },
      { rank: '7', value: 7 },
      { rank: '8', value: 8 },
      { rank: '9', value: 9 },
      { rank: '10', value: 10 },
      { rank: 'J', value: 11 },
      { rank: 'Q', value: 12 },
      { rank: 'K', value: 13 },
      { rank: 'A', value: 14 },
    ];

    return suits.flatMap(suit =>
      ranks.map(card => ({
        ...card,
        suit,
        color:
          suit === '♥' || suit === '♦'
            ? 'red' as const
            : 'black' as const,
      })),
    );
  }

  private shuffleDeck(cards: PokerCard[]): PokerCard[] {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
  }

  private drawCard(): PokerCard {
    const card = this.deck.pop();

    if (!card) {
      throw new Error('No quedan cartas en la baraja.');
    }

    return card;
  }

  public get stageLabel(): string {
    const labels: Record<PokerStage, string> = {
      ready: 'LISTO PARA COMENZAR',
      preflop: 'PRE-FLOP',
      flop: 'FLOP',
      turn: 'TURN',
      river: 'RIVER',
      showdown: 'RESULTADO FINAL',
    };

    return labels[this.stage];
  }

  public get actionLabel(): string {
    const labels: Record<PokerStage, string> = {
      ready: 'REPARTIR CARTAS',
      preflop: 'REVELAR FLOP',
      flop: 'REVELAR TURN',
      turn: 'REVELAR RIVER',
      river: 'REVELAR RESULTADO',
      showdown: 'VOLVER A JUGAR',
    };

    return labels[this.stage];
  }

  public get playerHandName(): string {
    const cards = [...this.playerCards, ...this.communityCards];

    if (cards.length < 5) {
      return 'Mano en formación';
    }

    return this.evaluateBestHand(cards).name;
  }

  public get opponentHandName(): string {
    if (!this.opponentRevealed) {
      return 'Cartas ocultas';
    }

    return this.evaluateBestHand([
      ...this.opponentCards,
      ...this.communityCards,
    ]).name;
  }

  public startGame(): void {
    if (this.isRoundActive) {
      return;
    }

    this.currentRoundId = crypto.randomUUID();
    this.deck = this.shuffleDeck(this.createDeck());

    this.playerCards = [];
    this.opponentCards = [];
    this.communityCards = [];

    this.outcome = null;
    this.hasPlayed = false;
    this.opponentRevealed = false;

    this.isRoundActive = true;
    this.stage = 'preflop';

    // Reparto alternado.
    this.playerCards.push(this.drawCard());
    this.opponentCards.push(this.drawCard());

    this.playerCards.push(this.drawCard());
    this.opponentCards.push(this.drawCard());

    this.resultMessage =
      'Cartas repartidas. Prepárate para revelar el Flop.';
  }

  public advanceRound(): void {
    if (!this.isRoundActive) {
      return;
    }

    if (this.stage === 'preflop') {
      // Flop: tres cartas comunitarias.
      this.communityCards.push(
        this.drawCard(),
        this.drawCard(),
        this.drawCard(),
      );

      this.stage = 'flop';
      this.resultMessage = 'Flop revelado. Continúa con el Turn.';

    } else if (this.stage === 'flop') {
      // Turn: cuarta carta.
      this.communityCards.push(this.drawCard());

      this.stage = 'turn';
      this.resultMessage = 'Turn revelado. Solo falta el River.';

    } else if (this.stage === 'turn') {
      // River: quinta carta.
      this.communityCards.push(this.drawCard());

      this.stage = 'river';
      this.resultMessage = 'River revelado. Ya puedes conocer el resultado.';

    } else if (this.stage === 'river') {
      this.finishRound();
    }
  }

  private evaluateFive(cards: PokerCard[]): HandValue {
    const values = cards
      .map(card => card.value)
      .sort((a, b) => b - a);

    const counts = new Map<number, number>();

    for (const value of values) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }

    const groups = [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || b[0] - a[0],
    );

    const isFlush = cards.every(
      card => card.suit === cards[0].suit,
    );

    const uniqueValues = [...new Set(values)];

    if (uniqueValues.includes(14)) {
      uniqueValues.push(1);
    }

    let straightHigh = 0;

    for (let i = 0; i <= uniqueValues.length - 5; i++) {
      if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
        straightHigh = uniqueValues[i];
        break;
      }
    }

    // Escalera de color.
    if (isFlush && straightHigh > 0) {
      return {
        category: 8,
        kickers: [straightHigh],
        name: straightHigh === 14
          ? 'Escalera real'
          : 'Escalera de color',
      };
    }

    // Póker.
    if (groups[0][1] === 4) {
      return {
        category: 7,
        kickers: [
          groups[0][0],
          groups[1][0],
        ],
        name: 'Póker',
      };
    }

    // Full house.
    if (
      groups[0][1] === 3 &&
      groups[1][1] === 2
    ) {
      return {
        category: 6,
        kickers: [groups[0][0], groups[1][0]],
        name: 'Full house',
      };
    }

    // Color.
    if (isFlush) {
      return {
        category: 5,
        kickers: values,
        name: 'Color',
      };
    }

    // Escalera.
    if (straightHigh > 0) {
      return {
        category: 4,
        kickers: [straightHigh],
        name: 'Escalera',
      };
    }

    // Trío.
    if (groups[0][1] === 3) {
      return {
        category: 3,
        kickers: [
          groups[0][0],
          ...groups.slice(1).map(group => group[0]),
        ],
        name: 'Trío',
      };
    }

    const pairs = groups
      .filter(group => group[1] === 2)
      .map(group => group[0])
      .sort((a, b) => b - a);

    // Doble pareja.
    if (pairs.length === 2) {
      return {
        category: 2,
        kickers: [
          ...pairs,
          groups.find(group => group[1] === 1)?.[0] ?? 0,
        ],
        name: 'Doble pareja',
      };
    }

    // Pareja.
    if (pairs.length === 1) {
      return {
        category: 1,
        kickers: [
          pairs[0],
          ...groups
            .filter(group => group[1] === 1)
            .map(group => group[0])
            .sort((a, b) => b - a),
        ],
        name: 'Pareja',
      };
    }

    return {
      category: 0,
      kickers: values,
      name: 'Carta alta',
    };
  }

  private compareHands(a: HandValue, b: HandValue): number {
    if (a.category !== b.category) {
      return a.category - b.category;
    }

    for (let i = 0; i < Math.max(a.kickers.length, b.kickers.length); i++) {
      const difference =
        (a.kickers[i] ?? 0) - (b.kickers[i] ?? 0);

      if (difference !== 0) {
        return difference;
      }
    }

    return 0;
  }

  private evaluateBestHand(cards: PokerCard[]): HandValue {
    let best: HandValue | null = null;

    // Evaluar todas las combinaciones posibles de cinco cartas.
    for (let a = 0; a < cards.length - 4; a++) {
      for (let b = a + 1; b < cards.length - 3; b++) {
        for (let c = b + 1; c < cards.length - 2; c++) {
          for (let d = c + 1; d < cards.length - 1; d++) {
            for (let e = d + 1; e < cards.length; e++) {
              const hand = this.evaluateFive([
                cards[a],
                cards[b],
                cards[c],
                cards[d],
                cards[e],
              ]);

              if (!best || this.compareHands(hand, best) > 0) {
                best = hand;
              }
            }
          }
        }
      }
    }

    if (!best) {
      throw new Error('No fue posible evaluar la mano.');
    }

    return best;
  }

  private finishRound(): void {
    if (!this.isRoundActive) {
      return;
    }

    const playerHand = this.evaluateBestHand([
      ...this.playerCards,
      ...this.communityCards,
    ]);

    const opponentHand = this.evaluateBestHand([
      ...this.opponentCards,
      ...this.communityCards,
    ]);

    const comparison = this.compareHands(
      playerHand,
      opponentHand,
    );

    this.opponentRevealed = true;
    this.isRoundActive = false;
    this.hasPlayed = true;
    this.stage = 'showdown';

    if (comparison > 0) {
      this.outcome = 'win';
      this.resultMessage = '¡Has ganado la partida!';
    } else if (comparison < 0) {
      this.outcome = 'loss';
      this.resultMessage = 'El oponente tiene una mejor mano.';
    } else {
      this.outcome = 'draw';
      this.resultMessage = '¡Empate! Ambos tienen la misma mano.';
    }

    const user = this.authService.currentUser;

    if (user && this.outcome) {
      this.statisticsService.recordResult(
        user.id,
        'poker',
        this.outcome,
        `Jugador: ${playerHand.name}. Oponente: ${opponentHand.name}.`,
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

  public fold(): void {
    if (!this.isRoundActive) {
        return;
    }

    const abandonedStage = this.stage;

    this.isRoundActive = false;
    this.hasPlayed = true;
    this.stage = 'showdown';

    // El oponente conserva sus cartas ocultas.
    this.opponentRevealed = false;

    this.outcome = 'loss';

    this.resultMessage =
        'Te has retirado de la mano. El oponente gana la ronda.';

    const user = this.authService.currentUser;

    if (user) {
        this.statisticsService.recordResult(
          user.id,
          'poker',
          'loss',
          `Jugador se retiró durante la fase: ${abandonedStage}.`,
          this.currentRoundId ?? undefined,
        );
    }
    }
}
