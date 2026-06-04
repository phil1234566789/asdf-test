import { Component, computed, inject, input, output } from '@angular/core';
import { Seat } from '../../models/seat.model';
import { RestaurantConfigService } from '../../services/restaurant-config.service';

@Component({
  selector: 'app-receipt-preview',
  templateUrl: './receipt-preview.component.html',
  styleUrl: './receipt-preview.component.scss',
})
export class ReceiptPreviewComponent {
  private readonly restaurantConfig = inject(RestaurantConfigService);

  seats    = input.required<Seat[]>();
  tableKey = input.required<string>();
  closed   = output<void>();

  readonly config = this.restaurantConfig.config;

  readonly isTakeaway = computed(() => this.tableKey().startsWith('M'));

  readonly tableLabel = computed(() => {
    const key = this.tableKey();
    if (key.startsWith('M')) return 'Außer Haus';
    if (key.startsWith('D')) return `Draußen ${key}`;
    return key;
  });

  readonly groupedItems = computed(() => {
    const map = new Map<string, { name: string; unitPrice: number; count: number }>();
    for (const seat of this.seats()) {
      for (const order of seat.orders) {
        const e = map.get(order.code);
        if (e) e.count++;
        else map.set(order.code, { name: order.name, unitPrice: order.price, count: 1 });
      }
    }
    return Array.from(map.values());
  });

  readonly total = computed(() =>
    this.groupedItems().reduce((sum, i) => sum + i.unitPrice * i.count, 0)
  );

  readonly vatRate = computed(() =>
    this.isTakeaway() ? this.config.vatRates.takeaway : this.config.vatRates.indoor
  );

  readonly vatAmount = computed(() =>
    this.total() * this.vatRate() / (1 + this.vatRate())
  );

  readonly vatLabel = computed(() =>
    this.isTakeaway() ? '7% MwSt' : '19% MwSt'
  );

  formatPrice(price: number): string {
    return price.toFixed(2).replace('.', ',') + ' €';
  }
}
