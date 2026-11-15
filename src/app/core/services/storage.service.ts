import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  public get<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);

      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  public set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  public remove(key: string): void {
    localStorage.removeItem(key);
  }
}
