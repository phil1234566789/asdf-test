import { Component, computed, input } from '@angular/core';
import { OrderSession } from '../../models/order-session.model';

@Component({
  selector: 'app-table-card',
  templateUrl: './table-card.component.html',
  styleUrl: './table-card.component.scss',
})
export class TableCardComponent {
  session = input.required<OrderSession>();
  isOwn = input.required<boolean>();
  now = input.required<number>();

  minutes = computed(() =>
    Math.floor((this.now() - this.session().createdAt.getTime()) / 60_000)
  );
}
