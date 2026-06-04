import { Injectable } from '@angular/core';
import tablesConfig from '@config/tables.config.json';
import { ResolvedTable, TableZone } from '../models/table.model';

@Injectable({ providedIn: 'root' })
export class TablesConfigService {
  private readonly config = tablesConfig;

  getAllZones(): TableZone[] {
    return this.config.zones as TableZone[];
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

      let shape: 'rect' | 'round' = (tables as { defaultShape?: 'rect' | 'round' }).defaultShape ?? 'rect';
      let seats: number = (tables as { defaultSeats?: number }).defaultSeats ?? 4;

      const overrides = (tables as { overrides?: { numbers: number[]; shape?: 'rect' | 'round'; seats?: number }[] }).overrides;
      if (overrides) {
        for (const override of overrides) {
          if (override.numbers.includes(number)) {
            if (override.shape) shape = override.shape;
            if (override.seats) seats = override.seats;
            break;
          }
        }
      }

      return { key, zoneId: zone.id, number, shape, seats };
    }

    return null;
  }
}
