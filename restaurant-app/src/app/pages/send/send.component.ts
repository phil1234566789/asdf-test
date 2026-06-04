import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-send',
  template: `
    <div style="padding: 16px; font-family: inherit;">
      <button (click)="back()" style="background: none; border: none; color: var(--accent); font-size: 24px; cursor: pointer;">‹</button>
      <h2 style="margin-top: 8px; color: var(--text);">Senden · {{ key }}</h2>
      <p style="color: var(--text3); margin-top: 8px;">Folgt in Story 7.</p>
    </div>
  `,
})
export class SendComponent {
  private readonly location = inject(Location);
  readonly key = inject(ActivatedRoute).snapshot.paramMap.get('key') ?? '';
  back(): void { this.location.back(); }
}
