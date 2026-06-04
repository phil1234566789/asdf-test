import {
  AfterViewInit, Component, DestroyRef, ElementRef,
  ViewChild, computed, inject, signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { TablesConfigService } from '../../services/tables-config.service';
import { MockSessionService } from '../../services/mock-session.service';
import { Seat, SeatOrder } from '../../models/seat.model';
import { NumpadComponent } from '../../components/numpad/numpad.component';

const SEAT_X = 27;
const SEAT_Y = 38;
const TABLE_H = 140;
const TABLE_GAP = 4;
const SEAT_CIRCLE_R = 88; // Sitze direkt an der Tischkante (Tisch-Radius 74px + Dot-Radius 14px)
// Extra cy shift per order on the top seat of a round table
const ROUND_TOP_SEAT_ORDER_SHIFT = 9;

type SeatView = Seat & {
  x: number;
  y: number;
  isLeft: boolean;
  isRound: boolean;
  tagDirX: number; // normalized direction for radial tag placement
  tagDirY: number;
};
type ShapeView = { x: number; y: number; shape: 'rect' | 'round' };

@Component({
  selector: 'app-order-entry',
  templateUrl: './order-entry.component.html',
  styleUrl: './order-entry.component.scss',
  imports: [NumpadComponent],
})
export class OrderEntryComponent implements AfterViewInit {
  @ViewChild('tblArea') private tblAreaRef?: ElementRef<HTMLDivElement>;

  private readonly location = inject(Location);
  private readonly tablesConfig = inject(TablesConfigService);
  private readonly sessionService = inject(MockSessionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly key = inject(ActivatedRoute).snapshot.paramMap.get('key') ?? '';
  readonly isTakeaway = this.key.startsWith('M');
  private readonly resolvedTable = this.tablesConfig.getResolvedTable(this.key);

  readonly extTop = signal(false);
  readonly extBottom = signal(false);
  readonly seats = signal<SeatView[]>([]);
  readonly tableShapes = signal<ShapeView[]>([]);
  readonly activeSeatId = signal<number | null>(null);
  readonly inputCode = signal('');
  readonly viewMode = signal<'table' | 'list'>('table');
  readonly isLoading = signal(false);
  readonly showSuccessToast = signal(false);

  // Tracked for tag-visibility safety check
  private tblAreaH = 0;

  private longPressTimer?: ReturnType<typeof setTimeout>;

  readonly tableLabel = computed(() => {
    if (this.key.startsWith('D')) return `Draußen ${this.key}`;
    if (this.key.startsWith('M')) return `Mitnehmen ${this.key}`;
    return `Tisch ${this.key}`;
  });

  readonly showExtTop = computed(() =>
    this.resolvedTable?.shape === 'rect' && !this.extTop() && this.activeSeatId() === null
  );

  readonly showExtBottom = computed(() =>
    this.resolvedTable?.shape === 'rect' && !this.extBottom() && this.activeSeatId() === null
  );

  readonly activeSeat = computed(() =>
    this.seats().find(s => s.id === this.activeSeatId()) ?? null
  );

  readonly allOrders = computed(() =>
    this.seats().flatMap(s => s.orders)
  );

  readonly totalPrice = computed(() =>
    this.allOrders().reduce((sum, o) => sum + o.price, 0)
  );

  readonly totalCount = computed(() =>
    this.allOrders().length
  );

  readonly seatsWithOrders = computed(() =>
    this.seats().filter(s => s.orders.length > 0)
  );

  readonly showPriceBar = computed(() =>
    this.activeSeatId() === null && this.totalCount() > 0
  );

  ngAfterViewInit(): void {
    if (this.isTakeaway) {
      this.seats.set([{
        id: 1, x: 0, y: 0, isLeft: false, isRound: false,
        tagDirX: 0, tagDirY: 0, isRef: false, orders: [],
      }]);
      this.activeSeatId.set(1);
      return;
    }
    if (!this.tblAreaRef) return;
    this.recalcLayout();
    const observer = new ResizeObserver(() => this.recalcLayout());
    observer.observe(this.tblAreaRef.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private recalcLayout(): void {
    const el = this.tblAreaRef?.nativeElement;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!w || !h || !this.resolvedTable) return;

    this.tblAreaH = h;
    const cx = w / 2;
    const rawCy = h / 2;
    const { shape, seats: seatCount } = this.resolvedTable;

    if (shape === 'round') {
      // Shift table down proportionally to orders on the topmost seat (seat 1)
      const topOrders = this.seats().find(s => s.id === 1)?.orders.length ?? 0;
      const minCy = SEAT_CIRCLE_R + 20; // keep top seat at least 20px from top edge
      const orderShift = topOrders * ROUND_TOP_SEAT_ORDER_SHIFT;
      const cy = Math.min(Math.max(rawCy, minCy) + orderShift, h - SEAT_CIRCLE_R - 20);

      this.tableShapes.set([{ x: cx, y: cy, shape: 'round' }]);

      const existing = this.seats();
      this.seats.set(
        Array.from({ length: seatCount }, (_, i) => {
          const angle = (2 * Math.PI * i / seatCount) - Math.PI / 2;
          const x = cx + SEAT_CIRCLE_R * Math.cos(angle);
          const y = cy + SEAT_CIRCLE_R * Math.sin(angle);
          const prev = existing.find(e => e.id === i + 1);
          return {
            id: i + 1, x, y,
            isLeft: x <= cx,
            isRound: true,
            tagDirX: Math.cos(angle),
            tagDirY: Math.sin(angle),
            isRef: prev?.isRef ?? (i === 0),
            orders: prev?.orders ?? [],
          };
        })
      );
      return;
    }

    const cy = rawCy;

    if (seatCount === 6) {
      const extTopY = cy - TABLE_H - TABLE_GAP;
      const extBotY = cy + TABLE_H + TABLE_GAP;

      const shapes: ShapeView[] = [{ x: cx, y: cy, shape: 'rect' }];
      if (this.extTop())    shapes.unshift({ x: cx, y: extTopY, shape: 'rect' });
      if (this.extBottom()) shapes.push({ x: cx, y: extBotY, shape: 'rect' });
      this.tableShapes.set(shapes);

      const R: Pick<SeatView, 'isRound' | 'tagDirX' | 'tagDirY'> = { isRound: false, tagDirX: 0, tagDirY: 0 };
      const newSeats: SeatView[] = [
        { id: 1, x: cx - SEAT_X, y: cy - SEAT_Y * 2, isLeft: true,  isRef: true,  orders: [], ...R, tagDirX: -1 },
        { id: 2, x: cx + SEAT_X, y: cy - SEAT_Y * 2, isLeft: false, isRef: false, orders: [], ...R, tagDirX:  1 },
        { id: 3, x: cx + SEAT_X, y: cy,               isLeft: false, isRef: false, orders: [], ...R, tagDirX:  1 },
        { id: 4, x: cx - SEAT_X, y: cy,               isLeft: true,  isRef: false, orders: [], ...R, tagDirX: -1 },
        { id: 5, x: cx - SEAT_X, y: cy + SEAT_Y * 2, isLeft: true,  isRef: false, orders: [], ...R, tagDirX: -1 },
        { id: 6, x: cx + SEAT_X, y: cy + SEAT_Y * 2, isLeft: false, isRef: false, orders: [], ...R, tagDirX:  1 },
      ];
      let nextId = 7;
      if (this.extTop()) {
        newSeats.push(
          { id: nextId++, x: cx - SEAT_X, y: extTopY - SEAT_Y, isLeft: true,  isRef: false, orders: [], ...R, tagDirX: -1 },
          { id: nextId++, x: cx + SEAT_X, y: extTopY - SEAT_Y, isLeft: false, isRef: false, orders: [], ...R, tagDirX:  1 },
        );
      }
      if (this.extBottom()) {
        newSeats.push(
          { id: nextId++, x: cx - SEAT_X, y: extBotY + SEAT_Y, isLeft: true,  isRef: false, orders: [], ...R, tagDirX: -1 },
          { id: nextId++, x: cx + SEAT_X, y: extBotY + SEAT_Y, isLeft: false, isRef: false, orders: [], ...R, tagDirX:  1 },
        );
      }

      const existing = this.seats();
      this.seats.set(newSeats.map(s => {
        const prev = existing.find(e => e.id === s.id);
        return prev ? { ...s, orders: prev.orders, isRef: prev.isRef } : s;
      }));
      return;
    }

    // Standard 4-seat with optional extensions
    const sections = (this.extTop() ? 1 : 0) + 1 + (this.extBottom() ? 1 : 0);
    const totalH = sections * TABLE_H + (sections - 1) * TABLE_GAP;
    const startCY = cy - totalH / 2 + TABLE_H / 2;

    const shapes: ShapeView[] = [];
    const positions: { x: number; y: number }[] = [];

    for (let i = 0; i < sections; i++) {
      const scy = startCY + i * (TABLE_H + TABLE_GAP);
      shapes.push({ x: cx, y: scy, shape: 'rect' });
      positions.push(
        { x: cx - SEAT_X, y: scy - SEAT_Y },
        { x: cx + SEAT_X, y: scy - SEAT_Y },
        { x: cx + SEAT_X, y: scy + SEAT_Y },
        { x: cx - SEAT_X, y: scy + SEAT_Y },
      );
    }

    this.tableShapes.set(shapes);

    const existing = this.seats();
    this.seats.set(
      positions.map((pos, i) => {
        const prev = existing[i];
        const isLeft = pos.x < cx;
        const tagDirX = isLeft ? -1 : 1;
        return prev
          ? { ...prev, x: pos.x, y: pos.y, isLeft, isRound: false, tagDirX, tagDirY: 0 }
          : { id: i + 1, x: pos.x, y: pos.y, isLeft, isRound: false, tagDirX, tagDirY: 0, isRef: i === 0 && !existing.length, orders: [] };
      })
    );
  }

  /** Safety check: don't render tags whose center falls outside the tbl-area */
  isTagInBounds(x: number, y: number): boolean {
    const w = this.tblAreaRef?.nativeElement.offsetWidth ?? 0;
    return x >= 0 && x <= w && y >= 0 && y <= this.tblAreaH;
  }

  tagX(seat: SeatView, index: number): number {
    if (seat.isRound) return seat.x + seat.tagDirX * (24 + index * 18);
    return seat.isLeft ? seat.x - 46 : seat.x + 26;
  }

  tagY(seat: SeatView, index: number): number {
    if (seat.isRound) return seat.y + seat.tagDirY * (24 + index * 18);
    return seat.y - 8 + index * 18;
  }

  addExtension(side: 'top' | 'bottom'): void {
    if (side === 'top') this.extTop.set(true);
    else this.extBottom.set(true);
    this.recalcLayout();
  }

  selectSeat(id: number): void {
    this.activeSeatId.set(id);
    this.inputCode.set('');
    // Numpad becomes visible → tbl-area shrinks → recalc after render
    requestAnimationFrame(() => this.recalcLayout());
  }

  deselectSeat(): void {
    this.activeSeatId.set(null);
    this.inputCode.set('');
    // Numpad disappears → tbl-area grows → recalc after render
    requestAnimationFrame(() => this.recalcLayout());
  }

  onKeyInput(key: string): void {
    if (key === '⌫') {
      this.inputCode.update(c => c.slice(0, -1));
    } else if (key === 'HC' || key === 'RN') {
      this.inputCode.set(key);
    } else if (key === 'C') {
      this.inputCode.set('C');
    } else {
      this.inputCode.update(c => c + key);
    }
  }

  onConfirmed(order: SeatOrder): void {
    const id = this.activeSeatId();
    if (id === null) return;
    this.seats.update(seats =>
      seats.map(s => s.id === id ? { ...s, orders: [...s.orders, order] } : s)
    );
    // Delay clear for 320ms flash, then recalc (e.g. round table shift)
    setTimeout(() => {
      this.inputCode.set('');
      requestAnimationFrame(() => this.recalcLayout());
    }, 320);
  }

  onNumpadClosed(): void {
    this.deselectSeat();
  }

  readonly takeawayOrders = computed(() =>
    this.seats().find(s => s.id === 1)?.orders ?? []
  );

  readonly groupedTakeawayOrders = computed(() => {
    const map = new Map<string, { code: string; name: string; unitPrice: number; count: number }>();
    for (const order of this.takeawayOrders()) {
      const entry = map.get(order.code);
      if (entry) entry.count++;
      else map.set(order.code, { code: order.code, name: order.name, unitPrice: order.price, count: 1 });
    }
    return Array.from(map.values());
  });

  readonly takeawayTotal = computed(() =>
    this.takeawayOrders().reduce((sum, o) => sum + o.price, 0)
  );

  formatPrice(price: number): string {
    return price.toFixed(2).replace('.', ',') + ' €';
  }

  startLongPress(event: PointerEvent, id: number): void {
    event.stopPropagation();
    this.longPressTimer = setTimeout(() => {
      this.seats.update(seats => seats.map(s => ({ ...s, isRef: s.id === id })));
      if (navigator.vibrate) navigator.vibrate(30);
    }, 500);
  }

  cancelLongPress(): void {
    clearTimeout(this.longPressTimer);
  }

  seatTotal(seat: Seat): number {
    return seat.orders.reduce((sum, o) => sum + o.price, 0);
  }

  setViewMode(mode: 'table' | 'list'): void {
    if (mode === 'list') this.deselectSeat();
    this.viewMode.set(mode);
    if (mode === 'table') {
      requestAnimationFrame(() => this.recalcLayout());
    }
  }

  submitOrder(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    setTimeout(() => {
      this.sessionService.updateStatus(this.key, 'in_progress');
      this.isLoading.set(false);
      this.showSuccessToast.set(true);
      setTimeout(() => this.showSuccessToast.set(false), 3000);
    }, 1000);
  }

  back(): void {
    this.location.back();
  }
}
