import { Injectable } from '@angular/core';

export type PrintOrder = {
  code: string;
  name: string;
  count: number;
};

@Injectable({ providedIn: 'root' })
export class PrintService {
  // Flip to true to simulate printer failure during QA
  private readonly MOCK_FAIL = false;

  printKitchen(orders: PrintOrder[]): Promise<void> {
    return this.mockPrint();
  }

  printTheke(orders: PrintOrder[]): Promise<void> {
    return this.mockPrint();
  }

  private mockPrint(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.MOCK_FAIL) reject(new Error('Drucker nicht erreichbar'));
        else resolve();
      }, 1000);
    });
  }
}
