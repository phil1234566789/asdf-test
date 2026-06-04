import { Injectable } from '@angular/core';
import menuConfig from '@config/menu.config.json';
import { ResolvedDish } from '../models/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuConfigService {
  private readonly config = menuConfig;

  resolveCode(code: string): ResolvedDish | null {
    const upper = code.toUpperCase();

    if (upper.startsWith('HC')) {
      const item = this.config.hotcooked.items[upper as keyof typeof this.config.hotcooked.items];
      if (item) return { name: item.name, price: item.price };
    }

    if (upper.startsWith('RN')) {
      const item = this.config.reisNudel.items[upper as keyof typeof this.config.reisNudel.items];
      if (item) return { name: item.name, price: item.price };
    }

    if (upper.startsWith('C')) {
      const item = this.config.chefSpecials[upper as keyof typeof this.config.chefSpecials];
      if (item) return { name: item.name, price: item.price };
    }

    if (/^\d{2}$/.test(code)) {
      const main = this.config.kombinieren.mainDishes[code[0] as keyof typeof this.config.kombinieren.mainDishes];
      const sauce = this.config.kombinieren.sauces[code[1] as keyof typeof this.config.kombinieren.sauces];
      if (main && sauce) return { name: `${main.name} + ${sauce.name}`, price: main.price };
    }

    return null;
  }
}
