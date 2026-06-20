import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export type PrintOrder = {
  code: string;
  name: string;
  count: number;
};

export type PrintContext = {
  tableLabel: string;
  timestamp: Date;
};

@Injectable({ providedIn: 'root' })
export class PrintService {
  private readonly supabase = inject(SupabaseService);

  async printKitchen(orders: PrintOrder[], context: PrintContext): Promise<void> {
    await this._insertJob('kitchen', orders, context);
  }

  async printTheke(orders: PrintOrder[], context: PrintContext): Promise<void> {
    await this._insertJob('theke', orders, context);
  }

  private async _insertJob(target: 'kitchen' | 'theke', orders: PrintOrder[], context: PrintContext): Promise<void> {
    const { error } = await this.supabase.client.from('print_jobs').insert({
      target,
      payload: {
        tableLabel: context.tableLabel,
        orders,
        timestamp: context.timestamp.toISOString(),
      },
    });
    if (error) throw new Error(error.message);
  }
}
