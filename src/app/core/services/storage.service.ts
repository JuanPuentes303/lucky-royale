import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly cache = new Map<string, string>();
  private readonly isNative = Capacitor.isNativePlatform();

  private initialized = false;
  private writeQueue: Promise<void> = Promise.resolve();
  private lastWriteError: unknown = null;

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (!this.isNative) {
      this.initialized = true;
      return;
    }

    // Identificar los datos que ya existen en Android.
    const { keys: nativeKeys } = await Preferences.keys();
    const existingKeys = new Set(nativeKeys);

    // Migrar los datos antiguos de localStorage sin sobrescribir
    // información que ya exista en Capacitor Preferences.
    const legacyKeys: string[] = [];

    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);

      if (key?.startsWith('lucky-royale.')) {
        legacyKeys.push(key);
      }
    }

    for (const key of legacyKeys) {
      if (!existingKeys.has(key)) {
        const value = localStorage.getItem(key);

        if (value !== null) {
          await Preferences.set({ key, value });
        }
      }
    }

    // Cargar los datos persistentes en memoria.
    const { keys } = await Preferences.keys();

    for (const key of keys) {
      if (!key.startsWith('lucky-royale.')) {
        continue;
      }

      const { value } = await Preferences.get({ key });

      if (value !== null) {
        this.cache.set(key, value);
      }
    }

    this.initialized = true;
  }

  public get<T>(key: string): T | null {
    try {
      const value = this.isNative ? (this.cache.get(key) ?? null) : localStorage.getItem(key);

      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  public set<T>(key: string, value: T): void {
    const serialized = JSON.stringify(value);

    if (serialized === undefined) {
      throw new Error('No se pudo serializar el dato.');
    }

    if (!this.isNative) {
      localStorage.setItem(key, serialized);
      return;
    }

    // Actualizar inmediatamente la memoria.
    this.cache.set(key, serialized);

    // Guardar de forma persistente en Android.
    this.enqueueWrite(() =>
      Preferences.set({
        key,
        value: serialized,
      }),
    );
  }

  public remove(key: string): void {
    if (!this.isNative) {
      localStorage.removeItem(key);
      return;
    }

    this.cache.delete(key);

    this.enqueueWrite(() => Preferences.remove({ key }));
  }

  private enqueueWrite(operation: () => Promise<void>): void {
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        await operation();
        this.lastWriteError = null;
      } catch (error) {
        this.lastWriteError = error;
      }
    });
  }

  public async flush(): Promise<void> {
    await this.writeQueue;

    if (this.lastWriteError !== null) {
      throw this.lastWriteError;
    }
  }
}
