
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
} from '@ionic/angular';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  imports: [
    IonContent,
    IonButton,
  ],
})
export class DashboardPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public get userName(): string {
    return this.authService.currentUser?.name ?? 'Jugador';
  }

  public logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/auth/login');
  }
}
