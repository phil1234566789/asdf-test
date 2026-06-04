import { Injectable, signal } from '@angular/core';
import { OrderSession } from '../models/order-session.model';

@Injectable({ providedIn: 'root' })
export class MockSessionService {
  private readonly _sessions = signal<OrderSession[]>([
    {
      id: '1',
      tableKey: '3',
      zoneId: 'indoor',
      isMenu: false,
      createdAt: new Date(Date.now() - 8 * 60_000),
      createdBy: 'user-1',
      createdByName: 'Anna',
      status: 'open',
    },
    {
      id: '2',
      tableKey: '7',
      zoneId: 'indoor',
      isMenu: true,
      createdAt: new Date(Date.now() - 32 * 60_000),
      createdBy: 'user-2',
      createdByName: 'Ben',
      status: 'open',
    },
    {
      id: '3',
      tableKey: 'D2',
      zoneId: 'outdoor',
      isMenu: false,
      createdAt: new Date(Date.now() - 18 * 60_000),
      createdBy: 'user-1',
      createdByName: 'Anna',
      status: 'open',
    },
    {
      id: '4',
      tableKey: 'M1',
      zoneId: 'takeaway',
      isMenu: false,
      createdAt: new Date(Date.now() - 5 * 60_000),
      createdBy: 'user-1',
      createdByName: 'Anna',
      status: 'open',
    },
  ]);

  readonly sessions = this._sessions.asReadonly();
}
