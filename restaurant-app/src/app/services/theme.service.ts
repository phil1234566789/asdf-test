import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(
    (localStorage.getItem('theme') as Theme) ?? 'light'
  );

  readonly theme = this._theme.asReadonly();

  constructor() {
    document.body.classList.toggle('dark', this._theme() === 'dark');

    effect(() => {
      document.body.classList.toggle('dark', this._theme() === 'dark');
      localStorage.setItem('theme', this._theme());
    });
  }

  toggle(): void {
    this._theme.update(t => (t === 'light' ? 'dark' : 'light'));
  }
}
