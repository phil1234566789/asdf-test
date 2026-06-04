import { Injectable, signal } from '@angular/core';
import { OrderSession, OrderStatus } from '../models/order-session.model';
import { Seat } from '../models/seat.model';

const m = (minutes: number) => new Date(Date.now() - minutes * 60_000);

// Sample pre-populated seat data for manual testing
const SAMPLE_SEATS: Record<string, Seat[]> = {
  '2': [
    { id: 1, isRef: true,  orders: [{ code: '33',  name: 'Hühnerfilet + Kokos Curry',   price: 9.90,  destination: 'kitchen', printed: true }] },
    { id: 2, isRef: false, orders: [{ code: 'HC2', name: 'Thai Basilikum Huhn',          price: 12.80, destination: 'kitchen', printed: true }] },
    { id: 3, isRef: false, orders: [] },
    { id: 4, isRef: false, orders: [] },
  ],
  '5': [
    { id: 1, isRef: true,  orders: [{ code: '11',  name: 'Gemüse + Chop Suey',           price: 9.90,  destination: 'kitchen', printed: true  }, { code: 'RN1', name: 'Gebratener Reis', price: 3.50, destination: 'kitchen', printed: false }] },
    { id: 2, isRef: false, orders: [{ code: 'HC1', name: 'Rindfleisch scharf gebraten',  price: 12.80, destination: 'kitchen', printed: true  }] },
    { id: 3, isRef: false, orders: [{ code: '23',  name: 'Tofu + Kokos Curry',           price: 9.90,  destination: 'kitchen', printed: false }] },
    { id: 4, isRef: false, orders: [] },
  ],
  'M1': [
    { id: 1, isRef: false, orders: [{ code: '33',  name: 'Hühnerfilet + Kokos Curry', price: 9.90, destination: 'kitchen', printed: true }, { code: 'HC3', name: 'Garnelen gebraten', price: 14.50, destination: 'kitchen', printed: true }] },
  ],
};

@Injectable({ providedIn: 'root' })
export class MockSessionService {
  private readonly _sessions = signal<OrderSession[]>([
    // Innen – Anna
    { id: '1',  tableKey: '2',  zoneId: 'indoor',   isMenu: false, createdAt: m(6),  createdBy: 'user-1', createdByName: 'Anna', status: 'new' },
    { id: '2',  tableKey: '5',  zoneId: 'indoor',   isMenu: true,  createdAt: m(22), createdBy: 'user-1', createdByName: 'Anna', status: 'in_progress' },
    { id: '3',  tableKey: '8',  zoneId: 'indoor',   isMenu: false, createdAt: m(11), createdBy: 'user-1', createdByName: 'Anna', status: 'in_progress' },
    { id: '4',  tableKey: '13', zoneId: 'indoor',   isMenu: true,  createdAt: m(38), createdBy: 'user-1', createdByName: 'Anna', status: 'payment_pending' },
    { id: '5',  tableKey: '17', zoneId: 'indoor',   isMenu: false, createdAt: m(4),  createdBy: 'user-1', createdByName: 'Anna', status: 'new' },
    { id: '6',  tableKey: '21', zoneId: 'indoor',   isMenu: false, createdAt: m(19), createdBy: 'user-1', createdByName: 'Anna', status: 'in_progress' },
    { id: '7',  tableKey: '24', zoneId: 'indoor',   isMenu: false, createdAt: m(45), createdBy: 'user-1', createdByName: 'Anna', status: 'payment_pending' },
    // Innen – Ben
    { id: '8',  tableKey: '3',  zoneId: 'indoor',   isMenu: false, createdAt: m(9),  createdBy: 'user-2', createdByName: 'Ben', status: 'new' },
    { id: '9',  tableKey: '7',  zoneId: 'indoor',   isMenu: true,  createdAt: m(27), createdBy: 'user-2', createdByName: 'Ben', status: 'in_progress' },
    { id: '10', tableKey: '11', zoneId: 'indoor',   isMenu: false, createdAt: m(14), createdBy: 'user-2', createdByName: 'Ben', status: 'in_progress' },
    { id: '11', tableKey: '15', zoneId: 'indoor',   isMenu: false, createdAt: m(33), createdBy: 'user-2', createdByName: 'Ben', status: 'payment_pending' },
    { id: '12', tableKey: '30', zoneId: 'indoor',   isMenu: false, createdAt: m(7),  createdBy: 'user-2', createdByName: 'Ben', status: 'new' },
    // Draußen
    { id: '13', tableKey: 'D1', zoneId: 'outdoor',  isMenu: false, createdAt: m(18), createdBy: 'user-1', createdByName: 'Anna', status: 'in_progress' },
    { id: '14', tableKey: 'D3', zoneId: 'outdoor',  isMenu: true,  createdAt: m(41), createdBy: 'user-2', createdByName: 'Ben',  status: 'payment_pending' },
    { id: '15', tableKey: 'D5', zoneId: 'outdoor',  isMenu: false, createdAt: m(12), createdBy: 'user-1', createdByName: 'Anna', status: 'new' },
    { id: '16', tableKey: 'D8', zoneId: 'outdoor',  isMenu: false, createdAt: m(29), createdBy: 'user-2', createdByName: 'Ben',  status: 'in_progress' },
    // Mitnehmen
    { id: '17', tableKey: 'M1', zoneId: 'takeaway', isMenu: false, createdAt: m(5),  createdBy: 'user-1', createdByName: 'Anna', status: 'in_progress' },
    { id: '18', tableKey: 'M2', zoneId: 'takeaway', isMenu: false, createdAt: m(17), createdBy: 'user-2', createdByName: 'Ben',  status: 'in_progress' },
    { id: '19', tableKey: 'M3', zoneId: 'takeaway', isMenu: false, createdAt: m(31), createdBy: 'user-1', createdByName: 'Anna', status: 'payment_pending' },
  ]);

  private readonly _seatData = signal<Map<string, Seat[]>>(new Map(Object.entries(SAMPLE_SEATS)));

  readonly sessions = this._sessions.asReadonly();

  updateStatus(tableKey: string, status: OrderStatus): void {
    this._sessions.update(sessions =>
      sessions.map(s => s.tableKey === tableKey ? { ...s, status } : s)
    );
  }

  getSeats(tableKey: string): Seat[] {
    return this._seatData().get(tableKey) ?? [];
  }

  saveSeats(tableKey: string, seats: Seat[]): void {
    this._seatData.update(map => {
      const next = new Map(map);
      next.set(tableKey, seats.map(s => ({ id: s.id, orders: s.orders, isRef: s.isRef })));
      return next;
    });
  }
}
