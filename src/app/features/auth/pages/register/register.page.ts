import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent, IonInput, IonItem, IonLabel, IonNote } from '@ionic/angular';

import { AuthService } from '../../../../core/services/auth.service';
import { LegalConsentService } from '../../../../core/services/legal-consent.service';
import { LegalConsentModalComponent } from '../../../legal/components/legal-consent-modal/legal-consent-modal.component';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonNote,
    LegalConsentModalComponent,
  ],
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly legalConsentService = inject(LegalConsentService);

  public showLegalModal = false;
  public errorMessage = '';
  public isLoading = false;

  public readonly registerForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  public onSubmit(): void {
    if (this.registerForm.invalid || this.isLoading) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.registerForm.getRawValue();

    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.errorMessage = '';
    this.showLegalModal = true;
  }

  public async onLegalAccepted(): Promise<void> {
    if (this.isLoading || this.registerForm.invalid) {
      return;
    }

    const { name, email, password, confirmPassword } = this.registerForm.getRawValue();

    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      this.showLegalModal = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const user = await this.authService.register(name, email, password);

      this.legalConsentService.recordConsent(user.id, true, true);

      this.showLegalModal = false;

      await this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.showLegalModal = false;

      this.errorMessage = error instanceof Error ? error.message : 'No fue posible crear la cuenta.';
    } finally {
      this.showLegalModal = false;
      this.isLoading = false;
    }
  }

  public onLegalDismissed(): void {
    this.showLegalModal = false;
  }
}
