# Dev Stories – Restaurant Bestellungs-App

Chronologisches Log aller Implementierungsschritte.
Neue Stories werden unten angehängt.

---

## Story 1 – Angular-Projekt aufsetzen

**Datum:** 2026-06-04
**Status:** Offen

### Ziel

Leeres Angular-Projekt erstellen, das als Basis für alle weiteren Stories dient.
Keine Features, kein Backend – nur Fundament, Build und Deployment-Struktur.

### Schritte

1. **Angular CLI installieren** (falls noch nicht global vorhanden)
   ```
   npm install -g @angular/cli
   ```

2. **Neues Projekt anlegen**
   ```
   ng new restaurant-app --routing --style=scss --ssr=false
   ```
   - Name: `restaurant-app`
   - Routing: aktiviert
   - Styles: SCSS
   - SSR: deaktiviert (GitHub Pages = statisches Hosting)

3. **Viewport-Meta für Mobile-only** – in `index.html`:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
   ```

4. **Globale CSS-Variablen** – in `styles.scss`:
   - Dark-Mode-Tokens aus dem Mockup übernehmen (`--bg`, `--surface`, `--accent`, Zonen-Farben etc.)
   - Dark Mode ist Standard; Light Mode per `.light`-Klasse auf `<body>`

5. **`resolveJsonModule`** in `tsconfig.json` prüfen – ist in Angular-Projekten standardmäßig aktiv. Config-JSONs werden direkt per `import` eingebunden, kein Assets-Umweg nötig.

6. **`HashLocationStrategy`** für Routing einrichten – URLs enthalten `#` (z.B. `/#/table/3`), der Browser schickt den Hash-Teil nie an den Server, GitHub Pages liefert immer `index.html`. Kein Build-Nachbearbeitung nötig.

7. **`base-href` für GitHub Pages** setzen:
   ```
   ng build --base-href /[repo-name]/
   ```

### Ergebnis

- `ng serve` läuft ohne Fehler
- `ng build` produziert deploybare Ausgabe
- Config-JSONs sind unter `/assets/config/` erreichbar

---

## Story 2 – Models & Config-Services

**Datum:** 2026-06-04
**Status:** Offen

### Ziel

TypeScript-Interfaces und Services für alle statischen Stammdaten anlegen.
Kein Backend – rein lokale JSON-Dateien.

### Models (`src/app/models/`)

#### `table.model.ts`
```typescript
export type TableZone = {
  id: string;         // 'indoor' | 'outdoor' | 'takeaway'
  label: string;      // 'Innen' | 'Draußen' | 'Mitnehmen'
  prefix: string;     // '' | 'D' | 'M'
  tables: TableZoneConfig;
};

export type TableZoneConfig = {
  count: number;
  defaultShape?: 'rect' | 'round';
  defaultSeats?: number;
  overrides?: TableOverride[];
};

export type TableShape = {
  shape?: 'rect' | 'round';
  seats?: number;
};

export type TableOverride = TableShape & {
  numbers: number[];
};

export type ResolvedTable = Required<TableShape> & {
  key: string;    // '3', 'D5', 'M2'
  zoneId: string;
  number: number;
};
```

#### `user.model.ts`
```typescript
export type User = {
  id: string;
  name: string;
  email: string;
};
```

#### `order-session.model.ts` *(Übersicht-relevant)*
```typescript
export type OrderStatus = 'open' | 'completed';

export type OrderSession = {
  id: string;
  tableKey: string;       // '3', 'D5', 'M2'
  zoneId: string;
  isMenu: boolean;        // Platzhalter – true = Nachspeisen-Indikator anzeigen
  createdAt: Date;
  createdBy: string;      // User-ID
  createdByName: string;  // Name der Bedienung (denormalisiert für Übersicht)
  status: OrderStatus;
};
```

#### `menu.model.ts`
```typescript
export type MenuItem = {
  name: string;
  description?: string;
  price: number;
  spiceLevel: number;
};

export type MenuConfig = {
  meta: { title: string; lunchHours: string; lunchIncludes: string };
  kombinieren: {
    mainDishes: Record<string, MenuItem & { price: number }>;
    sauces: Record<string, { name: string; spiceLevel: number }>;
  };
  hotcooked: { items: Record<string, MenuItem> };
  reisNudel: { items: Record<string, MenuItem> };
  chefSpecials: Record<string, MenuItem>;
};
```

### Services (`src/app/services/`)

#### `tables-config.service.ts`
- Importiert `tables.config.json` direkt (`import tablesConfig from '../../../config/tables.config.json'`)
- Methode `getResolvedTable(key: string): ResolvedTable | null`
  – löst Overrides auf, gibt Tischdaten zurück
- Methode `getAllZones(): TableZone[]`

#### `menu-config.service.ts`
- Importiert `menu.config.json` direkt (`import menuConfig from '../../../config/menu.config.json'`)
- Methode `resolveCode(code: string): { name: string; price: number } | null`
  – löst Codes wie `'33'`, `'HC2'`, `'RN1'`, `'C07'` auf
  – Kombinieren: erster Zeichen = Hauptgericht-Index, zweiter = Sauce-Index

#### `mock-session.service.ts` *(temporär – wird durch Supabase-Service ersetzt)*
- Gibt ein `Signal<OrderSession[]>` zurück mit einigen Beispiel-Sessions
- Simuliert Zeitstempel für Timer-Tests

### Ergebnis

- Alle Interfaces sind typsicher definiert
- Services laden die JSONs und exponieren sie als Observable/Signal
- `resolveCode()` kann alle bekannten Codes korrekt auflösen

---

## Story 3 – Übersichtsseite

**Datum:** 2026-06-04
**Status:** Offen

### Ziel

Die Hauptansicht der App: alle offenen Tische auf einen Blick.
Kein Backend – Mock-Daten. Navigation zu Tischansicht (Stub-Route reicht).

### Komponenten

#### `OverviewComponent` (`/src/app/pages/overview/`)

**Header:**
- App-Titel links
- Eingeloggte B (Name) als Chip rechts
- Dark/Light-Toggle (Icon-Button, jederzeit erreichbar)

**Inhaltsbereich (scroll):**
- Drei Sektionen: **Innen** / **Draußen** / **Mitnehmen**
- Sektions-Label in Zonenfarbe (blau / grün / lila)
- Sessions als 3-spaltiges Grid (`TableCardComponent`)
- Leere Sektionen werden nicht angezeigt

**FAB (Floating Action Button):**
- Unten rechts, Akzentfarbe
- Tippen → drei Sub-Buttons mit Labels „Innen", „Draußen", „Mitnehmen"
- Tippen auf Zone → öffnet Tischnummer-Picker (Story 4 oder Stub)

#### `TableCardComponent`

Zeigt genau vier Informationen (laut Requirements):

| Element | Inhalt |
|---|---|
| Tischkennung | z.B. `3`, `D5`, `M2` |
| B-Name | Name der zuständigen Bedienung |
| Timer | Minuten seit `createdAt` (läuft in Echtzeit) |
| Bestellstatus | Pill/Chip mit aktuellem Status |

**Varianten:**
- `.mine` – farbiger Rand in Zonenfarbe (eigene Tische)
- `.menu-indicator` – auffälliger Badge wenn `isMenu === true`
- Timer-Farbe: grün < 15 min → gelb < 30 min → rot ≥ 30 min *(Schwellenwerte vorläufig)*

### Timer-Logik

- `setInterval` alle 60 Sekunden (kein Sub-Minuten-Update nötig)
- Berechnung: `Math.floor((now - createdAt) / 60_000)` Minuten
- Cleanup via `DestroyRef` / `takeUntilDestroyed`

### Dark/Light-Mode

- `ThemeService` hält den aktuellen Mode als Signal (`'light' | 'dark'`)
- Default: `'light'`
- Umschalten: `<body>` bekommt Klasse `dark` (Light ist der Normalzustand ohne Klasse)
- Mode wird in `localStorage` persistiert

### Routing

```
/          → OverviewComponent
/table/:key → TableComponent (Stub – kommt in Story 4+)
```

### Ergebnis

- Übersicht zeigt Mock-Sessions korrekt gruppiert nach Zone
- Timer läuft sichtbar
- Eigene Tische sind hervorgehoben
- Nachspeisen-Indikator erscheint bei `isMenu: true`
- Dark/Light-Toggle funktioniert

---

## Offene Fragen / Backlog

- **Menü-Kategorie in Config:** `isMenu` im Session-Modell ist ein Platzhalter. Sobald Menü-Gerichte in `menu.config.json` erscheinen, muss das automatisch aus den bestellten Items abgeleitet werden.
- **Tischnummer-Picker:** Wird in Story 4 gebaut – wie soll er aussehen? Grid aus allen verfügbaren Tischnummern oder Eingabefeld?
- **Bestellstatus-Werte:** `open | completed` reicht für die Übersicht, aber was wird auf der Karte angezeigt? Noch offen.
- **GitHub Pages Repo-Name:** Für `base-href` beim Build benötigt.
- **Supabase-Projekt:** Wird angelegt, sobald Auth/Backend gebraucht wird.
