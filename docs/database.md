# Datenbankschema – Restaurant Bestellungs-App

Backend: **Supabase** (PostgreSQL)

---

## Tabellen

### `order_sessions`

Eine Session entspricht einem aktiven Tisch oder einer Mitnehmen-Bestellung.

| Spalte           | Typ                  | Constraints              | Beschreibung                                          |
|------------------|----------------------|--------------------------|-------------------------------------------------------|
| `id`             | `uuid`               | PK, DEFAULT gen_random_uuid() | —                                                |
| `table_number`   | `text`               | NULL                     | Tischkennung z.B. `"3"` (Innen), `"D5"` (Draußen); NULL bei Mitnehmen |
| `is_takeaway`    | `boolean`            | DEFAULT false            | True = Mitnehmen-Bestellung                           |
| `takeaway_slot`  | `smallint`           | NULL                     | Mitnehmen-Slot 1–5 (wird als M1–M5 angezeigt); nur bei Takeaway |
| `status`         | `text`               | DEFAULT 'open'           | `open` \| `completed`                                 |
| `total_net`      | `numeric(8,2)`       | NULL                     | Nettobetrag (ohne MwSt); wird beim Abschluss gesetzt  |
| `total_tax`      | `numeric(8,2)`       | NULL                     | MwSt-Betrag gesamt                                    |
| `total_gross`    | `numeric(8,2)`       | NULL                     | Bruttobetrag (= total_net + total_tax)                |
| `created_at`     | `timestamptz`        | DEFAULT now()            | Zeitpunkt der Bestellaufnahme (Basis für Wartezeit-Timer) |
| `completed_at`   | `timestamptz`        | NULL                     | Zeitpunkt, wenn Session abgeschlossen wurde           |
| `created_by`     | `uuid`               | FK → `auth.users(id)`    | Welche Bedienung die Session gestartet hat            |

---

### `order_items`

Einzelne Bestellpositionen, direkt einer Session zugeordnet.

| Spalte        | Typ            | Constraints                   | Beschreibung                                                             |
|---------------|----------------|-------------------------------|--------------------------------------------------------------------------|
| `id`          | `uuid`         | PK, DEFAULT gen_random_uuid() | —                                                                        |
| `session_id`  | `uuid`         | FK → `order_sessions(id)`     | Zugehörige Session                                                       |
| `bill_group`  | `smallint`     | NULL                          | Rechnungsgruppe für getrennte Zahlung (z.B. 1 oder 2); NULL = keine Aufteilung |
| `dish_code`   | `text`         | NOT NULL                      | Eingabe-Code (z.B. `"33"`, `"HC2"`, `"C07"`)                             |
| `dish_name`   | `text`         | NOT NULL                      | Gerichtname zum Zeitpunkt der Bestellung (Snapshot aus menu.config.json) |
| `price`       | `numeric(6,2)` | NOT NULL                      | Preis zum Zeitpunkt der Bestellung (Snapshot)                            |
| `category`    | `text`         | NOT NULL                      | `kombinieren` \| `hotcooked` \| `reis_nudel` \| `chef_special`           |
| `tax_rate`    | `numeric(4,2)` | NOT NULL                      | MwSt-Satz als Dezimalwert: `0.19` (Tisch) oder `0.07` (Mitnehmen)       |
| `status`      | `text`         | DEFAULT 'pending'             | `pending` \| `sent` \| `completed`                                       |
| `sent_at`     | `timestamptz`  | NULL                          | Zeitpunkt des Sendens an Küche/Theke                                       |
| `created_at`  | `timestamptz`  | DEFAULT now()                 | Zeitpunkt der Eingabe                                                    |

> **Hinweis zu `dish_name` und `price` als Snapshot:** Die Speisekarte kann sich ändern. Deshalb werden Name und Preis beim Speichern kopiert – nicht per Join aus der Karte gezogen.

---


## Beziehungen

```
auth.users
    └── order_sessions (created_by)
            ├── order_items (session_id)
```

---

## Offen / Noch zu klären

- `destination` bei `order_items`: Getränke sind aktuell nicht in `menu.config.json` – wie wird die Kategorie `bar` künftig bestimmt? Manuell pro Gericht oder eigene Kategorie in der Config?
- **MwSt-Satz bei Getränken:** Getränke sind immer 19%, auch bei Mitnehmen – sobald Getränke in die Speisekarte kommen, muss `tax_rate` pro Position individuell gesetzt werden (nicht pauschal aus `is_takeaway` ableiten)
- **TSE (Technische Sicherungseinrichtung):** Ab einem bestimmten Umsatz schreibt das Finanzamt eine zertifizierte Kassensicherung vor – prüfen, ob die App offiziell als Kasse gilt und ob das relevant ist
- Row Level Security (RLS): Alle eingeloggten Bedienungen sehen **alle Sessions** (nicht nur eigene) – `created_by` dient zur Anzeige der zuständigen B, nicht zur Datenzugangsbeschränkung
- Archivierung: Werden abgeschlossene Sessions dauerhaft gespeichert oder nach X Tagen gelöscht?
