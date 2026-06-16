import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'waiter_name';

@Injectable({ providedIn: 'root' })
export class WaiterNameService {
  readonly name = signal<string | null>(localStorage.getItem(STORAGE_KEY));
  readonly isEditing = signal<boolean>(false);

  get hasName(): boolean { return !!this.name(); }

  setName(value: string): void {
    const trimmed = value.trim();
    localStorage.setItem(STORAGE_KEY, trimmed);
    this.name.set(trimmed);
    this.isEditing.set(false);
  }

  startEditing(): void {
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }
}
