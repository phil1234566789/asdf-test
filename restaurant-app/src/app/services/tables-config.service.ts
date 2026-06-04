import { Injectable } from '@angular/core';
import tablesConfig from '@config/tables.config.json';
import { ResolvedTable, TableZone } from '../models/table.model';

type ZoneTables = typeof tablesConfig.zones[0]['tables'];

@Injectable({ providedIn: 'root' })
export class TablesConfigService {
  private readonly config = tablesConfig;

  getAllZones(): TableZone[] {
    return this.config.zones as TableZone[];
  }

  getTablesForZone(zoneId: string): ResolvedTable[] {
    const zone = this.config.zones.find(z => z.id === zoneId);
    if (!zone) return [];

    const result: ResolvedTable[] = [];
    for (let n = 1; n <= zone.tables.count; n++) {
      const key = zone.prefix ? `${zone.prefix}${n}` : `${n}`;
      result.push({ key, zoneId, number: n, ...this.resolveShape(zone.tables, n) });
    }
    return result;
  }

  getResolvedTable(key: string): ResolvedTable | null {
    for (const zone of this.config.zones) {
      const { prefix, tables } = zone;

      let number: number;
      if (prefix === '') {
        number = parseInt(key, 10);
      } else if (key.startsWith(prefix)) {
        number = parseInt(key.slice(prefix.length), 10);
      } else {
        continue;
      }

      if (isNaN(number) || number < 1 || number > tables.count) continue;

      return { key, zoneId: zone.id, number, ...this.resolveShape(tables, number) };
    }
    return null;
  }

  private resolveShape(tables: ZoneTables, number: number): { shape: 'rect' | 'round'; seats: number } {
    let shape: 'rect' | 'round' = (tables as { defaultShape?: 'rect' | 'round' }).defaultShape ?? 'rect';
    let seats = (tables as { defaultSeats?: number }).defaultSeats ?? 4;

    const overrides = (tables as { overrides?: { numbers: number[]; shape?: 'rect' | 'round'; seats?: number }[] }).overrides;
    if (overrides) {
      for (const o of overrides) {
        if (o.numbers.includes(number)) {
          if (o.shape) shape = o.shape;
          if (o.seats) seats = o.seats;
          break;
        }
      }
    }
    return { shape, seats };
  }
}
