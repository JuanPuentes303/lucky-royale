
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

type RouletteColor = 'red' | 'black' | 'green';
type PredictionType = 'color' | 'parity' | 'number';
type PredictionValue = RouletteColor | 'even' | 'odd' | number;
type RouletteOutcome = 'win' | 'loss';

interface RouletteNumber {
  value: number;
  color: RouletteColor;
  angle: number;
}

@Component({
  selector: 'app-roulette',
  standalone: true,
  templateUrl: './roulette.page.html',
  styleUrl: './roulette.page.scss',
  imports: [
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
  ],
})
export class RoulettePage {
  private readonly authService = inject(AuthService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);

  private readonly wheelSequence = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34,
    6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
    24, 16, 33, 1, 20, 14, 31, 9, 22, 18,
    29, 7, 28, 12, 35, 3, 26,
  ];

  private readonly redNumbers = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18,
    19, 21, 23, 25, 27, 30, 32, 34, 36,
  ]);

  public readonly wheelNumbers: RouletteNumber[] =
    this.wheelSequence.map((value, index) => ({
      value,
      color: this.getNumberColor(value),
      angle: (index * 360) / 37,
    }));

  public readonly wheelBackground = this.createWheelBackground();

  public rotationDegrees = 0;

  public selectedType: PredictionType | null = null;
  public selectedValue: PredictionValue | null = null;

  public numberInput = 0;

  public resultNumber: number | null = null;
  public resultColor: RouletteColor | null = null;

  public isSpinning = false;
  public hasPlayed = false;

  public resultMessage = 'Selecciona tu predicción para comenzar.';
  public outcome: RouletteOutcome | null = null;

  public get resultColorName(): string {
    switch (this.resultColor) {
      case 'red':
        return 'ROJO';
      case 'black':
        return 'NEGRO';
      case 'green':
        return 'VERDE';
      default:
        return '';
    }
  }

  private getNumberColor(number: number): RouletteColor {
    if (number === 0) {
      return 'green';
    }

    return this.redNumbers.has(number) ? 'red' : 'black';
  }

  private createWheelBackground(): string {
    const segments = this.wheelSequence.map((number, index) => {
      const start = (index * 360) / 37;
      const end = ((index + 1) * 360) / 37;

      const color = this.getNumberColor(number);

      const backgroundColor =
        color === 'green'
          ? '#18834e'
          : color === 'red'
            ? '#b83238'
            : '#171a18';

      return `${backgroundColor} ${start}deg ${end}deg`;
    });

    return `conic-gradient(from 0deg, ${segments.join(', ')})`;
  }

  public selectPrediction(
    type: PredictionType,
    value: PredictionValue,
  ): void {
    if (this.isSpinning) {
      return;
    }

    this.selectedType = type;
    this.selectedValue = value;

    this.hasPlayed = false;
    this.outcome = null;

    this.resultMessage = 'Predicción seleccionada. ¡Gira la ruleta!';
  }

  public onNumberInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);

    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value > 36
    ) {
      return;
    }

    this.numberInput = value;
  }

  public selectNumber(): void {
    if (
      !Number.isInteger(this.numberInput) ||
      this.numberInput < 0 ||
      this.numberInput > 36
    ) {
      return;
    }

    this.selectPrediction('number', this.numberInput);
  }

  

  public async spinRoulette(): Promise<void> {
    if (
        this.selectedType === null ||
        this.selectedValue === null ||
        this.isSpinning
    ) {
        return;
    }

    this.isSpinning = true;
    this.hasPlayed = false;
    this.outcome = null;
    this.resultMessage = 'La ruleta está girando...';

    // Mostrar el estado inicial antes de comenzar la animación.
    this.changeDetector.detectChanges();

    const resultIndex = Math.floor(Math.random() * 37);
    const winningNumber = this.wheelSequence[resultIndex];
    const winningColor = this.getNumberColor(winningNumber);

    const segmentCenter =
        (resultIndex * 360) / 37 + 180 / 37;

    const currentAngle = this.rotationDegrees % 360;

    const alignment =
        (360 - ((currentAngle + segmentCenter) % 360)) % 360;

    const targetRotation =
        this.rotationDegrees + 5 * 360 + alignment;

    try {
        // Esperar dos cuadros para permitir el renderizado inicial.
        await new Promise<void>(resolve =>
        requestAnimationFrame(() => resolve()),
        );

        await new Promise<void>(resolve =>
        requestAnimationFrame(() => resolve()),
        );

        // Iniciar la transición CSS.
        this.rotationDegrees = targetRotation;
        this.changeDetector.detectChanges();

        // Esperar a que termine el giro.
        await new Promise(resolve => setTimeout(resolve, 4700));

        this.resultNumber = winningNumber;
        this.resultColor = winningColor;

        const won = this.checkPrediction(
        winningNumber,
        winningColor,
        );

        this.outcome = won ? 'win' : 'loss';

        this.resultMessage = won
        ? '¡Excelente! Acertaste tu predicción.'
        : 'Esta vez no acertaste. ¡Inténtalo nuevamente!';

        this.hasPlayed = true;

        const user = this.authService.currentUser;

        if (user) {
        this.statisticsService.recordResult(
            user.id,
            'roulette',
            this.outcome,
            `Resultado: ${winningNumber} ${winningColor}. Predicción: ${this.selectedValue}.`,
        );
        }

    } finally {
        this.isSpinning = false;
        this.changeDetector.detectChanges();
    }
    }



  private checkPrediction(
    number: number,
    color: RouletteColor,
  ): boolean {
    if (this.selectedType === 'number') {
      return number === this.selectedValue;
    }

    if (this.selectedType === 'color') {
      return color === this.selectedValue;
    }

    if (this.selectedType === 'parity') {
      if (number === 0) {
        return false;
      }

      return this.selectedValue === 'even'
        ? number % 2 === 0
        : number % 2 !== 0;
    }

    return false;
  }

  public playAgain(): void {
    if (this.isSpinning) {
      return;
    }

    this.selectedType = null;
    this.selectedValue = null;

    this.resultNumber = null;
    this.resultColor = null;

    this.outcome = null;
    this.hasPlayed = false;

    this.resultMessage = 'Selecciona una nueva predicción.';
  }

  public goToDashboard(): void {
    void this.router.navigateByUrl('/dashboard');
  }
}
