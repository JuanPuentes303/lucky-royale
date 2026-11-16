import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, type Observable } from 'rxjs';

import type { UserProfile } from '../../shared/interfaces/user.interface';

import { StorageService } from './storage.service';

interface StoredUser extends UserProfile {
  passwordHash: string;
  salt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly usersKey = 'lucky-royale.users';
  private readonly sessionKey = 'lucky-royale.session';

  private readonly storageService = inject(StorageService);

  private readonly currentUserSubject = new BehaviorSubject<UserProfile | null>(
    this.storageService.get<UserProfile>(this.sessionKey),
  );

  public readonly currentUser$: Observable<UserProfile | null> = this.currentUserSubject.asObservable();

  public get currentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public async register(name: string, email: string, password: string): Promise<UserProfile> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!name.trim() || !normalizedEmail || password.length < 8) {
      throw new Error('Completa los datos correctamente.');
    }

    const users = this.storageService.get<StoredUser[]>(this.usersKey) ?? [];

    if (users.some((user) => user.email === normalizedEmail)) {
      throw new Error('Este correo ya tiene una cuenta.');
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
      salt: this.toBase64(salt),
      passwordHash: await this.hashPassword(password, salt),
    };

    this.storageService.set(this.usersKey, [...users, newUser]);

    const profile = this.toProfile(newUser);

    this.saveSession(profile);

    return profile;
  }

  public async login(email: string, password: string): Promise<UserProfile> {
    const normalizedEmail = email.trim().toLowerCase();

    const users = this.storageService.get<StoredUser[]>(this.usersKey) ?? [];

    const user = users.find((item) => item.email === normalizedEmail);

    if (!user) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    const salt = this.fromBase64(user.salt);

    const passwordHash = await this.hashPassword(password, salt);

    if (!this.safeEquals(passwordHash, user.passwordHash)) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    const profile = this.toProfile(user);

    this.saveSession(profile);

    return profile;
  }

  public logout(): void {
    this.storageService.remove(this.sessionKey);
    this.currentUserSubject.next(null);
  }

  private saveSession(user: UserProfile): void {
    this.storageService.set(this.sessionKey, user);
    this.currentUserSubject.next(user);
  }

  private toProfile(user: StoredUser): UserProfile {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  private async hashPassword(password: string, salt: Uint8Array): Promise<string> {
    const passwordKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
      'deriveBits',
    ]);

    const saltBuffer = new ArrayBuffer(salt.byteLength);
    new Uint8Array(saltBuffer).set(salt);

    const hash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 310000,
        hash: 'SHA-256',
      },
      passwordKey,
      256,
    );

    return Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private toBase64(value: Uint8Array): string {
    return btoa(String.fromCharCode(...value));
  }

  private fromBase64(value: string): Uint8Array {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }

  private safeEquals(first: string, second: string): boolean {
    if (first.length !== second.length) {
      return false;
    }

    let difference = 0;

    for (let index = 0; index < first.length; index++) {
      difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
    }

    return difference === 0;
  }
}
