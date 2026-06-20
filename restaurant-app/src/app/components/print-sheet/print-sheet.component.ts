import { Component, inject, input, output, signal } from '@angular/core';
import { PrintContext, PrintOrder, PrintService } from '../../services/print.service';

export type PrintTarget = 'kitchen' | 'theke' | 'both';

@Component({
  selector: 'app-print-sheet',
  templateUrl: './print-sheet.component.html',
  styleUrl: './print-sheet.component.scss',
})
export class PrintSheetComponent {
  private readonly printService = inject(PrintService);

  kitchenOrders = input.required<PrintOrder[]>();
  thekenOrders  = input.required<PrintOrder[]>();
  tableLabel    = input.required<string>();

  done   = output<PrintTarget>();
  closed = output<void>();

  readonly loading    = signal<PrintTarget | null>(null);
  readonly error      = signal<string | null>(null);
  readonly success    = signal<PrintTarget | null>(null);
  lastTarget: PrintTarget = 'kitchen';

  get canKitchen(): boolean { return this.kitchenOrders().length > 0; }
  get canTheke():   boolean { return this.thekenOrders().length > 0; }
  get canBoth():    boolean { return this.canKitchen && this.canTheke; }

  async print(target: PrintTarget): Promise<void> {
    this.lastTarget = target;
    this.loading.set(target);
    this.error.set(null);
    const context: PrintContext = { tableLabel: this.tableLabel(), timestamp: new Date() };
    try {
      if (target === 'kitchen' || target === 'both') {
        await this.printService.printKitchen(this.kitchenOrders(), context);
      }
      if (target === 'theke' || target === 'both') {
        await this.printService.printTheke(this.thekenOrders(), context);
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
