import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { Seat } from '../../models/seat.model';
import { RestaurantConfigService } from '../../services/restaurant-config.service';
import { MockSessionService } from '../../services/mock-session.service';
import { groupColor } from '../../utils/group-colors';

@Component({
  selector: 'app-receipt-preview',
  templateUrl: './receipt-preview.component.html',
  styleUrl: './receipt-preview.component.scss',
})
export class ReceiptPreviewComponent implements OnInit {
  private readonly restaurantConfig = inject(RestaurantConfigService);
  private readonly sessionService = inject(MockSessionService);

  seats    = input.required<Seat[]>();
  tableKey = input.required<string>();
  closed   = output<void>();

  readonly config = this.restaurantConfig.config;

  readonly seatGroups     = signal<Map<number, string>>(new Map());
  readonly activeGroupIdx = signal(0);

  readonly isTakeaway = computed(() => this.tableKey().startsWith('M'));

  readonly tableLabel = computed(() => {
    const key = this.tableKey();
    if (key.startsWith('M')) return 'Außer Haus';
    if (key.startsWith('D')) return `Draußen ${key}`;
    return key;
  });

  readonly vatRate = computed(() =>
    this.isTakeaway() ? this.config.vatRates.takeaway : this.config.vatRates.indoor
  );

  readonly vatLabel = computed(() => this.isTakeaway() ? '7% MwSt' : '19% MwSt');

  // ── Group navigation ──────────────────────────────────────────────────────

  readonly activeGroups = computed(() =>
    [...new Set(this.seatGroups().values())].sort()
  );

  readonly groupCount = computed(() => this.activeGroups().length);

  readonly currentGroupLetter = computed(() => {
    const groups = this.activeGroups();
    return groups[Math.min(this.activeGroupIdx(), groups.length - 1)] ?? 'A';
  });

  // ── Displayed receipt (filtered by group when split active) ───────────────

  readonly displayedItems = computed(() => {
    const isSplit = this.groupCount() > 1;
    const letter  = this.currentGroupLetter();
    const map = new Map<string, { name: string; unitPrice: number; count: number }>();
    for (const seat of this.seats()) {
      if (isSplit && this.seatGroups().get(seat.id) !== letter) continue;
      for (const order of seat.orders) {
        const e = map.get(order.code);
        if (e) e.count++;
        else map.set(order.code, { name: order.name, unitPrice: order.price, count: 1 });
      }
    }
    return Array.from(map.values());
  });

  readonly displayedTotal = computed(() =>
    this.displayedItems().reduce((sum, i) => sum + i.unitPrice * i.count, 0)
  );

  readonly displayedVatAmount = computed(() =>
    this.displayedTotal() * this.vatRate() / (1 + this.vatRate())
  );

  ngOnInit(): void {
    const stored = this.sessionService.getSplitGroups(this.tableKey());
    const groups = new Map<number, string>();
    if (stored.size > 0) {
      for (const [id, letter] of stored) groups.set(id, letter);
    } else {
      for (const seat of this.seats()) {
        if (seat.orders.length > 0) groups.set(seat.id, 'A');
      }
    }
    this.seatGroups.set(groups);
  }

  prevGroup(): void { this.activeGroupIdx.update(i => Math.max(0, i - 1)); }
  nextGroup(): void { this.activeGroupIdx.update(i => Math.min(this.groupCount() - 1, i + 1)); }

  groupColor(letter: string): string { return groupColor(letter); }

  formatPrice(price: number): string {
    return price.toFixed(2).replace('.', ',') + ' €';
  }
}
