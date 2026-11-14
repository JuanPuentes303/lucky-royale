
import { Injectable, inject } from '@angular/core';

import { StorageService } from './storage.service';
import { LegalConsent } from '../../shared/interfaces/legal-consent.interface';

@Injectable({
  providedIn: 'root',
})
export class LegalConsentService {
  private readonly storageService = inject(StorageService);

  public readonly termsVersion = '1.0';
  public readonly privacyVersion = '1.0';

  private getConsentKey(userId: string): string {
    return `lucky-royale.legal-consent.${userId}`;
  }

  public recordConsent(
    userId: string,
    termsAccepted: boolean,
    dataProcessingAuthorized: boolean,
  ): LegalConsent {
    if (
      !userId.trim() ||
      !termsAccepted ||
      !dataProcessingAuthorized
    ) {
      throw new Error(
        'Debes aceptar los documentos legales para continuar.',
      );
    }

    const acceptedAt = new Date().toISOString();

    const consent: LegalConsent = {
      userId,
      termsVersion: this.termsVersion,
      privacyVersion: this.privacyVersion,
      termsAcceptedAt: acceptedAt,
      dataProcessingAuthorizedAt: acceptedAt,
    };

    this.storageService.set(
      this.getConsentKey(userId),
      consent,
    );

    return consent;
  }

  public getConsent(userId: string): LegalConsent | null {
    return this.storageService.get<LegalConsent>(
      this.getConsentKey(userId),
    );
  }

  public hasCurrentConsent(userId: string): boolean {
    const consent = this.getConsent(userId);

    return !!consent &&
      consent.termsVersion === this.termsVersion &&
      consent.privacyVersion === this.privacyVersion;
  }
}
