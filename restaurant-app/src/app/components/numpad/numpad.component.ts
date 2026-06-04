import { Component, computed, inject, input, output } from '@angular/core';
import { MenuConfigService } from '../../services/menu-config.service';
import { Seat, SeatOrder } from '../../models/seat.model';

const KEYS = [
  ['HC', 'RN', 'C'],
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['⌫', '0', '✓'],
] as const;

@Component({
  selector: 'app-numpad',
  templateUrl: './numpad.component.html',
  styleUrl: './numpad.component.scss',
})
export class NumpadComponent {
  private readonly menuService = inject(MenuConfigService);

  seat       = input.required<Seat>();
  inputCode  = input.required<string>();

  keyInput   = output<string>();
  confirmed  = output<SeatOrder>();
  closed     = output<void>();

  readonly keys = KEYS;

  readonly resolution = computed(() => this.menuService.getCodeResolution(this.inputCode()));

  readonly isValid      = computed(() => this.resolution().type === 'valid');
  readonly hintMessage  = computed(() => { const r = this.resolution(); return r.type === 'hint'  ? r.message : ''; });
  readonly errorMessage = computed(() => { const r = this.resolution(); return r.type === 'error' ? r.message : ''; });
  readonly validName    = computed(() => { const r = this.resolution(); return r.type === 'valid' ? r.name    : ''; });
  readonly priceDisplay = computed(() => {
    const r = this.resolution();
    if (r.type !== 'valid') return '';
    return r.price.toFixed(2).replace('.', ',') + ' €';
  });

  press(key: string): void {
    this.keyInput.emit(key);
  }

  confirm(): void {
    const r = this.resolution();
    if (r.type !== 'valid') return;
    this.confirmed.emit({ code: this.inputCode(), name: r.name, price: r.price });
  }
}
