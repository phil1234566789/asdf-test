import {
  AfterViewInit, Component, DestroyRef, ElementRef,
  OnInit, ViewChild, computed, inject, signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TablesConfigService } from '../../services/tables-config.service';
import { MockSessionService } from '../../services/mock-session.service';
import { Seat, SeatOrder } from '../../models/seat.model';

const SEAT_X = 27;
const SEAT_Y = 38;
const TABLE_H = 140;
const TABLE_GAP = 4;
const SEAT_CIRCLE_R = 110;

type SeatView = Seat & { x: number; y: number };
type ShapeView = { x: number; y: number; shape: 'rect' | 'round' };

@Component({
  selector: 'app-order-entry',
  templateUrl: './order-entry.component.html',
  styleUrl: './order-entry.component.scss',
})
export class OrderEntryComponent implements OnInit, AfterViewInit {
  @ViewChild('tblArea') private tblAreaRef!: ElementRef<HTMLDivElement>;

  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly tablesConfig = inject(TablesConfigService);
  private readonly sessionService = inject(MockSessionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly key = inject(ActivatedRoute).snapshot.paramMap.get('key') ?? '';
  private readonly resolvedTable = this.tablesConfig.getResolvedTable(this.key);

  readonly extTop = signal(false);
  readonly extBottom = signal(false);
  readonly seats = signal<SeatView[]>([]);
  readonly tableShapes = signal<ShapeView[]>([]);
  readonly activeSeatId = signal<number | null>(null);
  readonly now = signal(Date.now());

  private longPressTimer?: ReturnType<typeof setTimeout>;

  readonly session = computed(() =>
    this.sessionService.sessions().find(s => s.tableKey === this.key)
  );

  readonly minutes = computed(() => {
    const s = this.session();
    if (!s) return 0;
    return Math.floor((this.now() - s.createdAt.getTime()) / 60_000);
  });

  readonly timerClass = computed(() => {
    const m = this.minutes();
    if (m < 15) return 'chip--green';
    if (m < 30) return 'chip--yellow';
    return 'chip--red';
  });

  readonly tableLabel = computed(() => {
    if (this.key.startsWith('D')) return `Draußen ${this.key}`;
    if (this.key.startsWith('M')) return `Mitnehmen ${this.key}`;
    return `Tisch ${this.key}`;
  });

  readonly showExtTop = computed(() =>
    this.resolvedTable?.shape === 'rect' &&
    this.resolvedTable?.seats === 4 &&
    !this.extTop()
  );

  readonly showExtBottom = computed(() =>
    this.resolvedTable?.shape === 'rect' &&
    this.resolvedTable?.seats === 4 &&
    !this.extBottom()
  );

  readonly statusText = computed(() => {
    const id = this.activeSeatId();
    if (id !== null) return `Platz ${id} ausgewählt`;
    const total = this.seats().reduce((sum, s) => sum + s.orders.length, 0);
    const n = this.seats().length;
    return `${n} Plätze · ${total} Gericht${total !== 1 ? 'e' : ''}`;
  });

  ngOnInit(): void {
    const id = setInterval(() => this.now.set(Date.now()), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }

  ngAfterViewInit(): void {
    this.recalcLayout();
    const observer = new ResizeObserver(() => this.recalcLayout());
    observer.observe(this.tblAreaRef.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private recalcLayout(): void {
    const el = this.tblAreaRef.nativeElement;
    const cx = el.offsetWidth / 2;
    const cy = el.offsetHeight / 2;
    if (!cx || !cy || !this.resolvedTable) return;

    const { shape, seats: seatCount } = this.resolvedTable;

    if (shape === 'round') {
      this.tableShapes.set([{ x: cx, y: cy, shape: 'round' }]);
      this.seats.set(
        Array.from({ length: seatCount }, (_, i) => {
          const angle = (2 * Math.PI * i / seatCount) - Math.PI / 2;
          return {
            id: i + 1,
            x: cx + SEAT_CIRCLE_R * Math.cos(angle),
            y: cy + SEAT_CIRCLE_R * Math.sin(angle),
            isRef: i === 0,
            orders: [],
          };
        })
      );
      return;
    }

    if (seatCount === 6) {
      this.tableShapes.set([{ x: cx, y: cy, shape: 'rect' }]);
      this.seats.set([
        { id: 1, x: cx - SEAT_X, y: cy - SEAT_Y * 2, isRef: true,  orders: [] },
        { id: 2, x: cx + SEAT_X, y: cy - SEAT_Y * 2, isRef: false, orders: [] },
        { id: 3, x: cx + SEAT_X, y: cy,               isRef: false, orders: [] },
        { id: 4, x: cx - SEAT_X, y: cy,               isRef: false, orders: [] },
        { id: 5, x: cx - SEAT_X, y: cy + SEAT_Y * 2, isRef: false, orders: [] },
        { id: 6, x: cx + SEAT_X, y: cy + SEAT_Y * 2, isRef: false, orders: [] },
      ]);
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
        return prev
          ? { ...prev, x: pos.x, y: pos.y }
          : { id: i + 1, x: pos.x, y: pos.y, isRef: i === 0 && !existing.length, orders: [] };
      })
    );
  }

  addExtension(side: 'top' | 'bottom'): void {
    if (side === 'top') this.extTop.set(true);
    else this.extBottom.set(true);
    this.recalcLayout();
  }

  selectSeat(id: number): void {
    this.activeSeatId.set(id);
  }

  deselectSeat(): void {
    this.activeSeatId.set(null);
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

  navigateToSend(): void {
    this.router.navigate(['/send', this.key]);
  }

  back(): void {
    this.location.back();
  }
}
