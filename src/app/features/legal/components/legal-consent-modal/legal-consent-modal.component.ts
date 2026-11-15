import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCheckbox, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-legal-consent-modal',
  standalone: true,
  templateUrl: './legal-consent-modal.component.html',
  styleUrl: './legal-consent-modal.component.scss',
  imports: [FormsModule, IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCheckbox],
})
export class LegalConsentModalComponent {
  @ViewChild(IonModal)
  private modal?: IonModal;

  @Input() isOpen = false;

  @Output() accepted = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();

  public termsAccepted = false;
  public privacyAccepted = false;

  public async accept(): Promise<void> {
    if (!this.termsAccepted || !this.privacyAccepted) {
      return;
    }

    // Cerrar físicamente el modal antes de continuar.
    await this.modal?.dismiss(undefined, 'accept');

    this.accepted.emit();
  }

  public async close(): Promise<void> {
    await this.modal?.dismiss(undefined, 'cancel');
  }

  public onDidDismiss(event: CustomEvent): void {
    this.isOpen = false;

    this.termsAccepted = false;
    this.privacyAccepted = false;

    const role = (event.detail as { role?: string } | undefined)?.role;

    // Si fue aceptado, no emitir el evento de cancelación.
    if (role !== 'accept') {
      this.dismissed.emit();
    }
  }
}
