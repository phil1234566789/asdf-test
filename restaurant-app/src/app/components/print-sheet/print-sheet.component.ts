import { Component, inject, input, output, signal } from '@angular/core';
import { PrintOrder, PrintService } from '../../services/print.service';

export type PrintTarget = 'kitchen' | 'bar' | 'both';

@Component({
  selector: 'app-print-sheet',
  templateUrl: './print-sheet.component.html',
  styleUrl: './print-sheet.component.scss',
})
export class PrintSheetComponent {
  private readonly printService = inject(PrintService);

  kitchenOrders = input.required<PrintOrder[]>();
  barOrders     = input.required<PrintOrder[]>();

  done   = output<PrintTarget>();
  closed = output<void>();

  readonly loading    = signal<PrintTarget | null>(null);
  readonly error      = signal<string | null>(null);
  readonly success    = signal<PrintTarget | null>(null);
  lastTarget: PrintTarget = 'kitchen';

  get canKitchen(): boolean { return this.kitchenOrders().length > 0; }
  get canBar():     boolean { return this.barOrders().length > 0; }
  get canBoth():    boolean { return this.canKitchen && this.canBar; }

  async print(target: PrintTarget): Promise<void> {
    this.lastTarget = target;
    this.loading.set(target);
    this.error.set(null);
    try {
      if (target === 'kitchen' || target === 'both') {
        await this.printService.printKitchen(this.kitchenOrders());
      }
      if (target === 'bar' || target === 'both') {
        await this.printService.printBar(this.barOrders());
      }
      this.loading.set(null);
      this.success.set(target);
      this.done.emit(target);
      setTimeout(() => this.closed.emit(), 1500);
    } catch {
      this.loading.set(null);
      this.error.set('Drucker nicht erreichbar');
    }
  }

  close(): void {
    if (this.loading() !== null) return;
    this.closed.emit();
  }
}
