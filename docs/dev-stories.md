# Dev Stories – Restaurant Bestellungs-App

Chronologisches Log aller Implementierungsschritte.
Neue Stories werden unten angehängt.

---

## ✅ Story 1 – Angular-Projekt aufsetzen

**Datum:** 2026-06-04
**Status:** Fertig

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

## ✅ Story 2 – Models & Config-Services

**Datum:** 2026-06-04
**Status:** Fertig

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

## ✅ Story 3 – Übersichtsseite

**Datum:** 2026-06-04
**Status:** Fertig

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
/table/:key → OrderEntryComponent (Stub – kommt in Story 4+)
```

### Ergebnis

- Übersicht zeigt Mock-Sessions korrekt gruppiert nach Zone
- Timer läuft sichtbar
- Eigene Tische sind hervorgehoben
- Nachspeisen-Indikator erscheint bei `isMenu: true`
- Dark/Light-Toggle funktioniert

---

## ✅ Story 4 – Tischauswahl-Seite

**Datum:** 2026-06-04
**Status:** Fertig

### Ziel

Nach dem Tippen auf „Tisch" im FAB öffnet sich eine Seite die alle verfügbaren und belegten Tische auf einen Blick zeigt. Tisch antippen → öffnet die Tischansicht (Story 5).

### Orientierung

Mockup `design/mockup.html` → Screen „Tisch wählen": 5-spaltiges Grid, belegte Tische farbig hervorgehoben, runde Tische als Kreise.

### FAB anpassen

Der FAB bekommt nur zwei Optionen (wie im Mockup):
- **Tisch** → `/pick` (zeigt Innen + Draußen)
- **Mitnehmen** → `/pick/takeaway` (zeigt nur M1–M5)

### Route

```
/pick           → TablePickerComponent (Innen + Draußen)
/pick/takeaway  → TablePickerComponent (nur Mitnehmen)
/table/:key     → OrderEntryComponent (Stub – kommt Story 5)
```

### `TablePickerComponent` (`src/app/pages/table-picker/`)

**Header:**
- Zurück-Button (‹) → navigiert zur Übersicht
- Titel „Tisch wählen" bzw. „Mitnehmen"

**Grid:**
- 5-spaltig, `aspect-ratio: 1` (quadratische Buttons)
- **Freie Tische:** neutrale Farbe (surface + surface3-Rahmen)
- **Belegte Tische:** Zonenfarbe (Hintergrund + Rahmen), `cursor: not-allowed` oder Navigation zur bestehenden Session
- **Runde Tische** (8, 9, 11, 12 laut config): `border-radius: 50%`
- **Rechteckige Tische:** `border-radius: 8px`
- Tische werden dynamisch aus `TablesConfigService` geladen – kein Hardcoding

**Belegte-Tisch-Logik:**
- `occupiedKeys = Set<string>` aus den aktiven Sessions (MockSessionService)
- Belegt = Session vorhanden und Status ≠ `completed`
- Tippen auf belegten Tisch → navigiert zur bestehenden Session (nicht disabled, sondern Shortcut)
- Tippen auf freien Tisch → navigiert zu `/table/:key` (neue Session)

**Mitnehmen-Variante:**
- Zeigt nur M1–M5 als 5 große Buttons
- Belegte Slots (aus Sessions) hervorgehoben, freie antippen → neue Session

### Ergebnis

- FAB navigiert korrekt zu `/pick` und `/pick/takeaway`
- Alle Tische werden aus Config geladen, korrekte Form (rund/eckig)
- Belegte Tische sind sofort erkennbar
- Navigation zu `/table/:key` funktioniert (Stub reicht)

---

## ✅ Story 5 – Tischvisualisierung

**Datum:** 2026-06-04
**Status:** Fertig

### Ziel

Tischform und Sitzplätze korrekt darstellen. Sitzplatz antippen → Auswahl (Numpad kommt Story 6). Referenzgast per Long Press markieren.

### Orientierung

Mockup `design/mockup.html` → Screen „Bestellaufnahme", Funktionen `openTable()`, `autoPlaceSeats()`, `renderGuests()`.

---

### Neue Models (`src/app/models/seat.model.ts`)

```typescript
export type SeatOrder = {
  code: string;
  name: string;
  price: number;
};

export type Seat = {
  id: number;
  orders: SeatOrder[];
  isRef: boolean;
};
```

---

### `OrderEntryComponent` – Ersetzt Stub

#### Header
- `‹` Zurück → `location.back()`
- Tischbezeichnung: `"Tisch 3"` / `"Draußen D5"` (abgeleitet aus Key)
- Timer-Chip (grün/gelb/rot) – läuft ab `session.createdAt`
- `"Senden →"` Button → Stub, navigiert zu `/send/:key` (Story 7)

#### Tisch-Visualisierung (`div.tbl-area`)

Relativer Container, Tischform + Sitzplatz-Dots absolut positioniert. Maße aus Mockup:

| Konstante | Wert | Bedeutung |
|---|---|---|
| `TABLE_W` | 104px | Breite Rechteck-Tisch |
| `TABLE_H` | 140px | Höhe Rechteck-Tisch |
| `TABLE_R` | 148px | Durchmesser Rund-Tisch |
| `SEAT_X` | 27px | Horizontaler Abstand Dot ↔ Tischmitte |
| `SEAT_Y` | 38px | Vertikaler Abstand Dot ↔ Tischmitte-Reihe |
| `SEAT_R` | 110px | Radius Sitzkreis bei runden Tischen |

Positionen in `afterViewInit` berechnet (`cx = width/2`, `cy = height/2`):

- **4er-Tisch:** Plätze an `(±SEAT_X, ±SEAT_Y)` – Erweiterungs-Buttons (+) oben/unten
- **6er-Tisch (Tisch 12):** 3 Plätze links + 3 rechts bei `cy−SEAT_Y×2`, `cy`, `cy+SEAT_Y×2`
- **Runder Tisch (8, 9, 11):** `angle = 2π×i/seats − π/2`, Radius 110px

**Tisch-Extension (nur 4er):**
- `+` oben/unten → weiterer Tischabschnitt (104×140px) + 4 neue Plätze
- Max. 1× oben, 1× unten

#### Sitzplatz-Dots

- 42×42px Kreis, nummeriert
- States: normal / aktiv (Akzentfarbe, 48×48px) / Referenz (gelber Rand)
- Tap → `selectSeat(id)` – Numpad-Stub (Status-Leiste zeigt „Platz X ausgewählt")
- Long Press (500ms) → `setRef(id)` + `navigator.vibrate(30)`

#### Status-Leiste

- Idle: `"N Plätze · M Gerichte"`
- Aktiv: `"Platz X ausgewählt"`

#### State

```typescript
readonly seats = signal<Seat[]>([]);
readonly activeSeatId = signal<number | null>(null);
```

Session aus `MockSessionService` (für Timer). Bestellungen nur in-memory.

### Ergebnis

- Tischform + Sitzplatzanzahl aus Config, kein Hardcoding
- Korrekte Positionen für 4er, 6er, runde Tische
- Tisch-Extension funktioniert
- Referenzgast markierbar
- Numpad noch nicht vorhanden (Stub-Statusleiste reicht)

---

## ✅ Story 6 – Numpad & Codeeingabe

**Datum:** 2026-06-04
**Status:** Fertig

### Ziel

Numpad-Overlay in die Tischansicht integrieren. Sitzplatz antippen → Numpad öffnet sich, Code eingeben, Gericht wird live aufgelöst und dem Sitzplatz zugeordnet.

### `NumpadComponent` (`src/app/components/numpad/`)

Eigenständige Komponente, erscheint als Overlay von unten.

**Inputs:** `seat: Seat`, `inputCode: string`
**Outputs:** `codeChange: string`, `confirm: SeatOrder`, `close: void`

#### Code-Display
- Code groß in Akzentfarbe
- Darunter Live-Auflösung via `MenuConfigService.resolveCode()`:
  - Gültiger Code → Name + Preis (grün)
  - Präfix (`HC`, `RN`, `C`) → Hinweis auf folgende Codes
  - Einzelziffer → Hinweis „+ Sauce wählen (1–7)"
  - Unbekannt → Fehlermeldung (rot)

#### Numpad-Layout
```
[ HC ]  [ RN ]  [ C  ]
[  7 ]  [  8 ]  [  9 ]
[  4 ]  [  5 ]  [  6 ]
[  1 ]  [  2 ]  [  3 ]
[  ⌫ ]  [  0 ]  [  ✓ ]
```
- `✓` disabled bis Code gültig
- Nach `✓`: kurz grün → Reset, Numpad bleibt offen

### Integration in `OrderEntryComponent`

- Sitzplatz antippen → Numpad erscheint
- Tippen auf Tischbereich (außerhalb Dots) → Numpad schließt
- Bestätigtes Gericht → `SeatOrder` in `seat.orders` pushen, Tag neben Dot rendern

#### Bestell-Tags

Kleines Label neben dem Dot (nach Bestätigung):
- Linke Dots: `dot.x − 62px`
- Rechte Dots: `dot.x + 26px`
- Text: eingegebener Code (`"33"`, `"HC2"`)

### Ergebnis

- Vollständige Codeeingabe für alle Kategorien (Kombinieren, HC, RN, C)
- Fehlerhafte Codes klar erkennbar
- Gerichte erscheinen als Tags an den Sitzplätzen

---

## ✅ Story 7 – Mitnehmen-Flow

**Datum:** 2026-06-04
**Status:** Fertig

### Ziel

Mitnehmen-Bestellungen haben keine Tischauswahl und keine Sitzplatz-Visualisierung. Der FAB weist automatisch den nächsten freien M-Slot zu und öffnet direkt die Bestellaufnahme.

### FAB-Änderung (OverviewComponent)

- „Mitnehmen"-Button → prüft welche M-Slots (M1–M5) bereits belegt sind
- Weist automatisch den niedrigsten freien Slot zu (M1, dann M2 usw.)
- Navigiert direkt zu `/table/M1` (kein Picker-Umweg)
- Alle 5 Slots belegt → Toast: „Alle Mitnehmen-Plätze belegt"

### `OrderEntryComponent` – Mitnehmen-Variante

`OrderEntryComponent` erkennt Mitnehmen-Keys (`key.startsWith('M')`) und rendert eine andere Ansicht:

**Kein Tischbereich** – stattdessen:
- Einfache scrollbare Bestellliste (Gerichte untereinander, mit Code + Name + Preis)
- Numpad dauerhaft sichtbar (kein Sitzplatz-Antippen nötig)
- Alle Gerichte landen in einer einzigen Gruppe (kein Seat-Konzept)

**Header** identisch: `"Mitnehmen M1"`, Timer, „Senden →"

### Ergebnis

- FAB weist M-Slot automatisch zu
- Keine überflüssige Tischauswahl für Mitnehmen
- Numpad dauerhaft offen, Gerichte in einfacher Liste

---

## ✅ Story 8 – Bestellübersicht & Abschließen

**Datum:** 2026-06-04
**Status:** fertig

### Ziel

B kann zwischen der Tischvisualisierung und einer strukturierten Bestellübersicht hin- und herwechseln. Die Liste zeigt alle Gerichte pro Sitzplatz mit Preisen und Gesamtsumme. Von dort aus wird die Bestellung mit einem Tap abgeschlossen (HTTP POST an Backend, gemockt mit 1 Sek. Verzögerung).

---

### Änderungen am Header (`OrderEntryComponent`)

- **„Senden →" Button entfernen** – wird durch den neuen Flow ersetzt
- **Toggle-Buttons** im Header: `Tisch` | `Liste`
  - Icons oder kurze Labels, visuell als aktiver/inaktiver State
  - Steuern welche View im Inhaltsbereich gezeigt wird

---

### View A – Tischvisualisierung (bestehend)

Keine inhaltlichen Änderungen. Neu:

- Wenn Numpad **geschlossen** ist: schmale Gesamtpreis-Leiste am unteren Rand sichtbar
  ```
  ┌─────────────────────────────┐
  │  4 Gerichte      24,80 €   │
  └─────────────────────────────┘
  ```
- Wenn Numpad **offen** ist: Leiste ausgeblendet (Platz sparen)

---

### View B – Bestellliste

Gleiche Struktur wie Mitnehmen-Ansicht, aber pro Sitzplatz gegliedert:

```
Platz 1 ★                    12,80 €
  HC2  Thai Basilikum Huhn   12,80 €

Platz 2                       9,90 €
  33   Hühnerfilet + Kokos    9,90 €

Platz 3                      22,70 €
  11   Gemüse + Chop Suey     9,90 €
  HC1  Rindfleisch            12,80 €
─────────────────────────────────────
Gesamt                       45,40 €

      [ Bestellung abschließen ]
```

- Referenzplatz (★) wird hervorgehoben
- Plätze ohne Bestellung werden nicht angezeigt
- Scrollen wenn Gäste viele Bestellungen haben
- **„Bestellung abschließen"** Button am Ende der Liste, immer sichtbar (sticky oder nach der Liste)

---

### „Bestellung abschließen" – Flow

1. B tippt auf Button
2. **Ladeindikator** erscheint (Overlay mit Spinner)
3. Mock: 1 Sekunde Verzögerung (simuliert HTTP POST)
4. **Erfolg-Toast**: „✓ Bestellung gespeichert" für 3 Sekunden
5. Session-Status wechselt auf `in_progress` im `MockSessionService`
6. Button deaktiviert solange Ladevorgang läuft

---

### Neue Models / Typen

Keine neuen Models nötig – die bestehenden `Seat`, `SeatOrder`, `OrderSession` reichen.

---

### Ergebnis

- B kann jederzeit zwischen Tisch-Grafik und Liste wechseln
- Gesamtpreis immer sichtbar (in beiden Views)
- Bestellung abschließen mit Lade- und Erfolgsindikator
- „Senden →" ist weg

---

## ✅ Story 9 – Bestellstatus auf Übersichtskarten

**Datum:** 2026-06-04
**Status:** Fertig

### Ziel

Die Übersichtskarte (`TableCardComponent`) zeigt den aktuellen Bestellstatus als Symbol an. B erkennt auf einen Blick welche Tische noch offen, in Bearbeitung oder zahlungsbereit sind.

### Status-Symbole

| Status | Symbol | Farbe |
|---|---|---|
| `new` | *(kein Symbol)* | – |
| `in_progress` | `▶` | orange (`var(--warn)`) |
| `payment_pending` | `€` | gelb (`var(--warn-light)` / eigene Farbe) |
| `completed` | *(nicht in Übersicht)* | – |

### Änderungen

#### `TableCardComponent`

- Status-Chip unten auf der Karte (oder rechts neben dem Timer)
- Nur sichtbar wenn Status `in_progress` oder `payment_pending`
- Kein Symbol bei `new`

### Ergebnis

- Alle Status-Varianten aus den Mock-Daten werden korrekt angezeigt
- Keine neuen Models oder Services nötig

---

## ✅ Story 10 – Drucken-Flow (Küche & Bar)

**Datum:** 2026-06-04
**Status:** Fertig

### Ziel

Nach „Bestellung abschließen" kann B die neuen Gerichte an Küche und/oder Bar drucken. Kommen später Nachbestellungen dazu, erscheint „Bestellung abschließen" erneut – und nur die neuen, noch nicht gedruckten Positionen werden ans nächste Ticket weitergegeben. Kein separater Screen – der Flow läuft über ein Bottom Sheet direkt in der Bestellansicht.

---

### Drucken-Konzept (kein physischer Drucker vorhanden)

- Es existiert noch kein physischer Drucker
- Alle Druckaufträge werden **gemockt** (1 Sek. Verzögerung, immer Erfolg – optional: simulierter Fehler für Fehlerfall-Tests)
- Die Architektur muss aber so vorbereitet sein, dass die Drucker später per **WLAN** (ESC/POS oder ähnlich) angesteuert werden können
- Empfehlung: Drucklogik in einem eigenen `PrintService` kapseln, der aktuell nur mockt, später aber den echten HTTP-Call / WebSocket macht

---

### Wann erscheint „Bestellung abschließen"?

- Mindestens eine Position hat `printed: false`
- Nach vollständigem Druck aller Positionen: Button verschwindet
- Wenn B danach neue Gerichte erfasst: Button erscheint wieder

---

### „Bestellung abschließen" → Bottom Sheet

Tippen auf „Bestellung abschließen" öffnet ein **Bottom Sheet** (schiebt von unten hoch, kein Navigieren).

#### Inhalt des Sheets

Die Vorschau im Sheet soll **dem tatsächlichen Beleg ähneln** (→ `docs/requirements.md`, Abschnitt „Belegformat Küche"):

```
┌──────────────────────────────────┐
│ Drucken                        × │
├──────────────────────────────────┤
│ 🍳 Küche                        │
│   2× 33   Hühnerfilet + Kokos   │
│   1× HC2  Thai Basilikum Huhn   │
│   1× 11   Gemüse + Chop Suey    │
│                                  │
│ 🍹 Bar      Keine Getränke      │
├──────────────────────────────────┤
│ [An Küche]  [An Bar]            │
│ [An Bar + Küche]                │
└──────────────────────────────────┘
```

- Format pro Zeile: `Menge× Code  Name` – **kein Preis**
- Gleiche Gerichte werden gruppiert (2× statt zwei Zeilen)
- Nur **ungedruckte** Positionen werden angezeigt
- Bereits gedruckte Positionen erscheinen **nicht** im Sheet (B muss nicht filtern)
- „An Bar" ist disabled wenn keine Getränke ausstehen; „An Küche" entsprechend
- „An Bar + Küche" ist disabled wenn eine der beiden Seiten leer ist

#### Während des Druckens

- Kein Full-Screen-Overlay — zu dramatisch in Stresssituationen
- Der gedrückte Button zeigt einen **Inline-Spinner**, die anderen Buttons werden disabled
- Sheet bleibt offen

#### Erfolg

- Buttons wechseln kurz zu ✓
- Sheet schließt sich nach **1,5 Sekunden automatisch**
- Kleiner Toast am unteren Rand: `✓ An Küche gedruckt` (2 Sek.)
- Gedruckte Positionen → `printed: true`
- `OrderSession.status` → `in_progress`

#### Fehler

- Sheet bleibt offen (B verliert keinen Kontext)
- Rote Meldung im Sheet: `Drucker nicht erreichbar`
- Prominenter **„Erneut versuchen"** Button
- Anderen Buttons bleiben aktiv (B kann z.B. stattdessen nur an Küche drucken)

---

### Küche vs. Bar – Kategorisierung

- Jedes `MenuItem` in `menu.config.json` bekommt ein optionales Feld `destination: 'kitchen' | 'bar'`
- Default wenn nicht gesetzt: `'kitchen'`
- Aktuell sind keine Getränke definiert → Bar-Sektion zeigt immer „Keine Getränke"
- Vorbereitet für spätere Getränke-Ergänzung in der Config

---

### Neues Model-Feld

`SeatOrder` bekommt `printed: boolean` (default `false`):

```typescript
export type SeatOrder = {
  code: string;
  name: string;
  price: number;
  printed: boolean;
};
```

---

### `PrintService` (`src/app/services/print.service.ts`)

```typescript
printToKitchen(orders: SeatOrder[]): Observable<void>
printToBar(orders: SeatOrder[]): Observable<void>
```

- Aktuell: Mock mit `delay(1000)` und `of(void 0)`
- Später: HTTP-Request oder WebSocket an WLAN-Drucker
- Fehlerfall-Test: `MOCK_PRINT_FAIL = true` Flag im Service (für manuelle QA)

---

### Ergebnis

- B kann nach „Bestellung abschließen" mit einem Tap alles auf einmal oder getrennt drucken
- Nachbestellungen erzeugen einen neuen Druckvorgang – nur neue Positionen landen auf dem Ticket
- Stressgerechtes Feedback: kein Vollbild-Overlay, Fehler ohne Datenverlust behebbar
- Architektur ist bereit für echten WLAN-Drucker

---

## Offene Fragen / Backlog

- **Menü-Kategorie in Config:** `isMenu` im Session-Modell ist ein Platzhalter. Sobald Menü-Gerichte in `menu.config.json` erscheinen, muss das automatisch aus den bestellten Items abgeleitet werden.
- **Supabase-Projekt:** Wird angelegt, sobald Auth/Backend gebraucht wird.
