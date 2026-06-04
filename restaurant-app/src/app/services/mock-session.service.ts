import { Injectable, signal } from '@angular/core';
import { OrderSession } from '../models/order-session.model';

const m = (minutes: number) => new Date(Date.now() - minutes * 60_000);

@Injectable({ providedIn: 'root' })
export class MockSessionService {
  private readonly _sessions = signal<OrderSession[]>([
    // Innen – Anna (user-1)
    { id: '1',  tableKey: '2',  zoneId: 'indoor',   isMenu: false, createdAt: m(6),  createdBy: 'user-1', createdByName: 'Anna', status: 'open' },
    { id: '2',  tableKey: '5',  zoneId: 'indoor',   isMenu: true,  createdAt: m(22), createdBy: 'user-1', createdByName: 'Anna', status: 'open' },
    { id: '3',  tableKey: '8',  zoneId: 'indoor',   isMenu: false, createdAt: m(11), createdBy: 'user-1', createdByName: 'Anna', status: 'open' },
    { id: '4',  tableKey: '13', zoneId: 'indoor',   isMenu: true,  createdAt: m(38), createdBy: 'user-1', createdByName: 'Anna', status: 'open' },
    { id: '5',  tableKey: '17', zoneId: 'indoor',   isMenu: false, createdAt: m(4),  createdBy: 'user-1', createdByName: 'Anna', status: 'open' },
    { id: '6',  tableKey: '21', zoneId: 'indoor',   isMenu: false, createdAt: m(19), createdBy: 'user-1', createdByName: 'Anna', status: 'open' },
    { id: '7',  tableKey: '24', zoneId: 'indoor',   isMenu: false, createdAt: m(45), createdBy: 'user-1', createdByName: 'Anna', status: 'open' },

    // Innen – Ben (user-2)
    { id: '8',  tableKey: '3',  zoneId: 'indoor',   isMenu: false, createdAt: m(9),  createdBy: 'user-2', createdByName: 'Ben', status: 'open' },
    { id: '9',  tableKey: '7',  zoneId: 'indoor',   isMenu: true,  createdAt: m(27), createdBy: 'user-2', createdByName: 'Ben', status: 'open' },
    { id: '10', tableKey: '11', zoneId: 'indoor',   isMenu: false, createdAt: m(14), createdBy: 'user-2', createdByName: 'Ben', status: 'open' },
    { id: '11', tableKey: '15', zoneId: 'indoor',   isMenu: false, createdAt: m(33), createdBy: 'user-2', createdByName: 'Ben', status: 'open' },
    { id: '12', tableKey: '30', zoneId: 'indoor',   isMenu: false, createdAt: m(7),  createdBy: 'user-2', createdByName: 'Ben', status: 'open' },

    // Draußen
    { id: '13', tableKey: 'D1', zoneId: 'outdoor',  isMenu: false, createdAt: m(18), createdBy: 'user-1', createdByName: 'Anna', status: 'open' },
    { id: '14', tableKey: 'D3', zoneId: 'outdoor',  isMenu: true,  createdAt: m(41), createdBy: 'user-2', createdByName: 'Ben',  status: 'open' },
    { id: '15', tableKey: 'D5', zoneId: 'outdoor',  isMenu: false, createdAt: m(12), createdBy: 'user-1', createdByName: 'Anna', status: 'open' },
    { id: '16', tableKey: 'D8', zoneId: 'outdoor',  isMenu: false, createdAt: m(29), createdBy: 'user-2', createdByName: 'Ben',  status: 'open' },

    // Mitnehmen
    { id: '17', tableKey: 'M1', zoneId: 'takeaway', isMenu: false, createdAt: m(5),  createdBy: 'user-1', createdByName: 'Anna', status: 'open' },
    { id: '18', tableKey: 'M2', zoneId: 'takeaway', isMenu: false, createdAt: m(17), createdBy: 'user-2', createdByName: 'Ben',  status: 'open' },
    { id: '19', tableKey: 'M3', zoneId: 'takeaway', isMenu: false, createdAt: m(31), createdBy: 'user-1', createdByName: 'Anna', status: 'open' },
  ]);

  readonly sessions = this._sessions.asReadonly();
}
