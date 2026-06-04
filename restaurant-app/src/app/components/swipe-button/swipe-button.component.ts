import { Component, ElementRef, ViewChild, computed, input, output, signal } from '@angular/core';

const THUMB_R = 22; // px – half the thumb diameter

@Component({
  selector: 'app-swipe-button',
  templateUrl: './swipe-button.component.html',
  styleUrl: './swipe-button.component.scss',
})
export class SwipeButtonComponent {
  @ViewChild('track') private trackRef!: ElementRef<HTMLDivElement>;

  label = input<string>('Serviert');
  confirmed = output<void>();

  private readonly _trackWidth = signal(0);
  readonly thumbOffset = signal(0); // px from center, negative = left
  readonly isDragging   = signal(false);
  readonly isConfirmed  = signal(false);

  private startX = 0;

  private get maxOffset(): number {
    return Math.max(0, this._trackWidth() / 2 - THUMB_R);
  }

  readonly thumbTransform = computed(() =>
    `translate(calc(-50% + ${this.thumbOffset()}px), -50%)`
  );

  readonly fillLeft = computed(() => {
    const o = this.thumbOffset();
    return this._trackWidth() / 2 + (o < 0 ? o : 0);
  });

  readonly fillWidth = computed(() => Math.abs(this.thumbOffset()));

  onPointerDown(event: PointerEvent): void {
    if (this.isConfirmed()) return;
    event.preventDefault();
    this.trackRef.nativeElement.setPointerCapture(event.pointerId);
    this._trackWidth.set(this.trackRef.nativeElement.offsetWidth);
    this.startX = event.clientX;
    this.isDragging.set(true);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) return;
    const raw = event.clientX - this.startX;
    const clamped = Math.max(-this.maxOffset, Math.min(this.maxOffset, raw));
    this.thumbOffset.set(clamped);
  }

  onPointerUp(): void {
    if (!this.isDragging()) return;
    this.isDragging.set(false);
    if (Math.abs(this.thumbOffset()) >= this.maxOffset * 0.85) {
      this.trigger();
    } else {
      this.thumbOffset.set(0);
    }
  }

  onPointerCancel(): void {
    this.isDragging.set(false);
    this.thumbOffset.set(0);
  }

  private trigger(): void {
    this.isConfirmed.set(true);
    if (navigator.vibrate) navigator.vibrate(40);
    setTimeout(() => this.confirmed.emit(), 400);
  }
}
