import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { WaiterNameService } from './waiter-name.service';
import { OrderSession, OrderStatus } from '../models/order-session.model';
import { Seat, GuestOrder } from '../models/seat.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly supabase = inject(SupabaseService);
  private readonly waiterName = inject(WaiterNameService);

  private readonly _sessions = signal<OrderSession[]>([]);
  private readonly _seatCache = new Map<string, Seat[]>();
  private readonly _splitGroupsCache = new Map<string, Map<number, string>>();
  private readonly _extensionsCache = new Map<string, { extTop: boolean; extBottom: boolean }>();
  private readonly _sessionIdByKey = new Map<string, string>();
  private readonly _saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly _loadedKeys = new Set<string>();

  readonly sessions = this._sessions.asReadonly();

  constructor() {
    this._loadSessions();
  }

  private async _loadSessions(): Promise<void> {
    const { data } = await this.supabase.client
      .from('order_sessions')
      .select('*')
      .neq('status', 'completed')
      .order('created_at', { ascending: false });

    if (!data) return;

    const sessions = data.map(row => this._rowToSession(row));
    this._sessions.set(sessions);

    for (const row of data) {
      const tableKey = this._rowToTableKey(row);
      this._sessionIdByKey.set(tableKey, row.id);
    }
  }

  async loadSession(tableKey: string): Promise<void> {
    if (this._loadedKeys.has(tableKey)) return;
    this._loadedKeys.add(tableKey);

    const sessionId = this._sessionIdByKey.get(tableKey);

    if (!sessionId) {
      this._seatCache.set(tableKey, []);
      return;
    }

    const [itemsResult, sessionResult] = await Promise.all([
      this.supabase.client
        .from('order_items')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true }),
      this.supabase.client
        .from('order_sessions')
        .select('ref_seat_number, split_groups, table_state')
        .eq('id', sessionId)
        .single(),
    ]);

    const items = itemsResult.data ?? [];
    const sessionMeta = sessionResult.data;
    const refSeatNumber: number = sessionMeta?.ref_seat_number ?? 1;

    const seatMap = new Map<number, GuestOrder[]>();
    for (const item of items) {
      const seatId: number = item.seat_number ?? 1;
      if (!seatMap.has(seatId)) seatMap.set(seatId, []);
      seatMap.get(seatId)!.push({
        code: item.dish_code,
        name: item.dish_name,
        price: Number(item.price),
        destination: item.destination === 'bar' ? 'theke' : 'kitchen',
        printed: item.status === 'sent' || item.status === 'completed',
      });
    }

    const uniqueSeatIds = Array.from(seatMap.keys());
    const seats: Seat[] = uniqueSeatIds.map(id => ({
      id,
      isRef: id === refSeatNumber,
      orders: seatMap.get(id) ?? [],
    }));
    this._seatCache.set(tableKey, seats);

    if (sessionMeta?.split_groups) {
      const groups = new Map<number, string>();
      for (const [k, v] of Object.entries(sessionMeta.split_groups as Record<string, string>)) {
        groups.set(parseInt(k), v);
      }
      this._splitGroupsCache.set(tableKey, groups);
    }

    const tableState = (sessionMeta?.table_state ?? {}) as Record<string, unknown>;
    this._extensionsCache.set(tableKey, {
      extTop: (tableState['extTop'] as boolean) ?? false,
      extBottom: (tableState['extBottom'] as boolean) ?? false,
    });
  }

  private async _createSession(tableKey: string): Promise<string> {
    const fields = this._tableKeyToDbFields(tableKey);
    const ext = this._extensionsCache.get(tableKey) ?? { extTop: false, extBottom: false };
    const { data } = await this.supabase.client
      .from('order_sessions')
      .insert({ ...fields, created_by: this.waiterName.name() ?? '', table_state: ext })
      .select('id')
      .single();

    const id: string = data!.id;
    this._sessionIdByKey.set(tableKey, id);

    const newSession: OrderSession = {
      id,
      tableKey,
      zoneId: this._deriveZone(tableKey),
      isMenu: false,
      createdAt: new Date(),
      createdBy: this.waiterName.name() ?? '',
      createdByName: this.waiterName.name() ?? '',
      status: 'new',
    };
    this._sessions.update(s => [newSession, ...s]);

    return id;
  }

  getSeats(tableKey: string): Seat[] {
    return this._seatCache.get(tableKey) ?? [];
  }

  saveSeats(tableKey: string, seats: Seat[]): void {
    if (!this._loadedKeys.has(tableKey)) return;
    this._seatCache.set(tableKey, seats);
    clearTimeout(this._saveTimers.get(tableKey));
    this._saveTimers.set(tableKey, setTimeout(() => this._flushSeats(tableKey, seats), 1000));
  }

  private async _flushSeats(tableKey: string, seats: Seat[]): Promise<void> {
    const allOrders = seats.flatMap(s => s.orders);
    let sessionId = this._sessionIdByKey.get(tableKey);

    if (!sessionId) {
      if (allOrders.length === 0) return;
      if (tableKey.startsWith('M')) return;
      sessionId = await this._createSession(tableKey);
    }

    const isTakeaway = tableKey.startsWith('M');
    const taxRate = isTakeaway ? 0.07 : 0.19;
    const refSeat = seats.find(s => s.isRef);

    await this.supabase.client.from('order_items').delete().eq('session_id', sessionId);

    const items = seats.flatMap(seat =>
      seat.orders.map(order => ({
        session_id: sessionId,
        seat_number: seat.id,
        dish_code: order.code,
        dish_name: order.name,
        price: order.price,
        category: this._deriveCategory(order.code),
        tax_rate: taxRate,
        destination: order.destination === 'theke' ? 'bar' : 'kitchen',
        status: order.printed ? 'sent' : 'pending',
      }))
    );

    if (items.length > 0) {
      await this.supabase.client.from('order_items').insert(items);
    }

    await this.supabase.client
      .from('order_sessions')
      .update({ ref_seat_number: refSeat?.id ?? 1 })
      .eq('id', sessionId);
  }

  async ensureSessionAndFlush(tableKey: string): Promise<void> {
    const seats = this._seatCache.get(tableKey) ?? [];
    if (seats.flatMap(s => s.orders).length === 0) return;
    clearTimeout(this._saveTimers.get(tableKey));
    if (!this._sessionIdByKey.get(tableKey)) {
      await this._createSession(tableKey);
    }
    await this._flushSeats(tableKey, seats);
  }

  getExtensions(tableKey: string): { extTop: boolean; extBottom: boolean } {
    return this._extensionsCache.get(tableKey) ?? { extTop: false, extBottom: false };
  }

  saveExtensions(tableKey: string, extTop: boolean, extBottom: boolean): void {
    this._extensionsCache.set(tableKey, { extTop, extBottom });
    const sessionId = this._sessionIdByKey.get(tableKey);
    if (!sessionId) return;
    this.supabase.client
      .from('order_sessions')
      .update({ table_state: { extTop, extBottom } })
      .eq('id', sessionId)
      .then();
  }

  getSplitGroups(tableKey: string): Map<number, string> {
    return this._splitGroupsCache.get(tableKey) ?? new Map();
  }

  saveSplitGroups(tableKey: string, groups: Map<number, string>): void {
    this._splitGroupsCache.set(tableKey, new Map(groups));
    const sessionId = this._sessionIdByKey.get(tableKey);
    if (!sessionId) return;
    const obj: Record<string, string> = {};
    groups.forEach((v, k) => (obj[k] = v));
    this.supabase.client
      .from('order_sessions')
      .update({ split_groups: obj })
      .eq('id', sessionId)
      .then();
  }

  updateStatus(tableKey: string, status: OrderStatus): void {
    this._sessions.update(sessions =>
      sessions.map(s => s.tableKey === tableKey ? { ...s, status } : s)
    );
    const sessionId = this._sessionIdByKey.get(tableKey);
    if (!sessionId) return;
    const update: Record<string, unknown> = { status };
    if (status === 'completed') update['completed_at'] = new Date().toISOString();
    this.supabase.client.from('order_sessions').update(update).eq('id', sessionId).then();
  }

  private _rowToSession(row: Record<string, unknown>): OrderSession {
    const tableKey = this._rowToTableKey(row);
    return {
      id: row['id'] as string,
      tableKey,
      zoneId: this._deriveZone(tableKey),
      isMenu: false,
      createdAt: new Date(row['created_at'] as string),
      createdBy: (row['created_by'] as string) ?? '',
      createdByName: (row['created_by'] as string) ?? '',
      status: row['status'] as OrderStatus,
    };
  }

  private _rowToTableKey(row: Record<string, unknown>): string {
    if (row['is_takeaway']) return `M${row['takeaway_slot']}`;
    return row['table_number'] as string;
  }

  private _tableKeyToDbFields(tableKey: string): Record<string, unknown> {
    if (tableKey.startsWith('M')) {
      return { is_takeaway: true, takeaway_slot: parseInt(tableKey.slice(1)), table_number: null };
    }
    return { is_takeaway: false, takeaway_slot: null, table_number: tableKey };
  }

  private _deriveZone(tableKey: string): string {
    if (tableKey.startsWith('M')) return 'takeaway';
    if (tableKey.startsWith('D')) return 'outdoor';
    return 'indoor';
  }

  private _deriveCategory(code: string): string {
    const u = code.toUpperCase();
    if (u.startsWith('HC')) return 'hotcooked';
    if (u.startsWith('RN')) return 'reis_nudel';
    if (/^C\d/.test(u)) return 'chef_special';
    return 'kombinieren';
  }
}
