
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

@Component({
  selector: 'app-legal-consent-modal',
  standalone: true,
  templateUrl: './legal-consent-modal.component.html',
  styleUrl: './legal-consent-modal.component.scss',
  imports: [
    FormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCheckbox,
  ],
})
export class LegalConsentModalComponent {
  @Input() isOpen = false;

  @Output() accepted = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();

  public termsAccepted = false;
  public privacyAccepted = false;

  public accept(): void {
    if (!this.termsAccepted || !this.privacyAccepted) {
      return;
    }

    this.accepted.emit();
  }

  public close(): void {
    this.dismissed.emit();
  }
}
