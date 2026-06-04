import { Injectable } from '@angular/core';
import menuConfig from '@config/menu.config.json';
import { CodeResolution, ResolvedDish } from '../models/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuConfigService {
  private readonly config = menuConfig;

  getCodeResolution(code: string): CodeResolution {
    const upper = code.toUpperCase().trim();

    if (!upper) return { type: 'empty' };
    if (upper === 'HC') return { type: 'hint', message: 'Hotcooked: HC1–HC4' };
    if (upper === 'RN') return { type: 'hint', message: 'Reis/Nudeln: RN1–RN5' };
    if (upper === 'C')  return { type: 'hint', message: 'Chef Specials: C01–C20' };

    if (/^HC/.test(upper)) {
      const item = this.config.hotcooked.items[upper as keyof typeof this.config.hotcooked.items];
      return item
        ? { type: 'valid', name: item.name, price: item.price }
        : { type: 'error', message: `„${upper}" unbekannt` };
    }

    if (/^RN/.test(upper)) {
      const item = this.config.reisNudel.items[upper as keyof typeof this.config.reisNudel.items];
      return item
        ? { type: 'valid', name: item.name, price: item.price }
        : { type: 'error', message: `„${upper}" unbekannt` };
    }

    if (/^C\d/.test(upper)) {
      const normalized = 'C' + String(parseInt(upper.slice(1))).padStart(2, '0');
      const item = this.config.chefSpecials[normalized as keyof typeof this.config.chefSpecials];
      return item
        ? { type: 'valid', name: item.name, price: item.price }
        : { type: 'error', message: `„${upper}" unbekannt` };
    }

    if (/^\d$/.test(upper)) {
      const main = this.config.kombinieren.mainDishes[upper as keyof typeof this.config.kombinieren.mainDishes];
      return main
        ? { type: 'hint', message: `${main.name} + Sauce wählen (1–7)` }
        : { type: 'error', message: `Gericht „${upper}" unbekannt` };
    }

    if (/^\d{2}$/.test(upper)) {
      const main = this.config.kombinieren.mainDishes[upper[0] as keyof typeof this.config.kombinieren.mainDishes];
      const sauce = this.config.kombinieren.sauces[upper[1] as keyof typeof this.config.kombinieren.sauces];
      return (main && sauce)
        ? { type: 'valid', name: `${main.name} + ${sauce.name}`, price: main.price }
        : { type: 'error', message: `Kombination „${upper}" unbekannt` };
    }

    return { type: 'error', message: `„${upper}" nicht erkannt` };
  }

  resolveCode(code: string): ResolvedDish | null {
    const r = this.getCodeResolution(code);
    return r.type === 'valid' ? { name: r.name, price: r.price } : null;
  }
}
