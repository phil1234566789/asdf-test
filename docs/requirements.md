# App Requirements – Restaurant Bestellungs-App

## Ziele & Stakeholder

### B (Bedienung)
- 1–3 Bedienungen pro Tag
- Bestellungen schnell und fehlerfrei aufnehmen
- Rechnungen einfach stellen, auch bei getrennter Zahlung
- App muss mindestens so schnell sein wie Papier + Stift – sonst wird sie nicht genutzt

### Restaurantinhaber
- Verkaufsanalyse: welche Gerichte verkaufen sich wie oft und zu welchen Zeiten
- Grundlage für Einkaufsplanung (was muss wann eingekauft werden)
- Keine eigene Admin-Oberfläche geplant – Auswertung läuft direkt über die Datenbank

---

## Erscheinungsbild

### Hell-/Dunkelmodus

- Die App unterstützt einen **Dark Mode** und einen **Light Mode**
- **Light Mode:** Standard-Modus – bessere Lesbarkeit im Alltag
- **Dark Mode:** Optionaler Modus zum Akkusparen
- Umschaltung muss schnell und jederzeit erreichbar sein (die Bedienung wechselt situationsbedingt)

---

## Drucken & Drucker-Integration

### Aktueller Stand
- Kein physischer Drucker vorhanden
- Alle Druckaufträge werden **gemockt** (simulierte Verzögerung + Erfolg/Fehler)

### Zielarchitektur
- Zwei separate Drucker: **Küche** und **Theke**, angesteuert per **WLAN** (ESC/POS-Protokoll oder HTTP)
- Die Drucklogik ist in einem eigenen `PrintService` gekapselt – aktuell Mocks, später echter Netzwerkaufruf
- B kann wählen: An Küche / An Theke / An Theke + Küche (simultan, ein Tap)

### Druckauslösung
- Drucken wird immer durch „Bestellung abschließen" angestoßen
- Nur **ungedruckte** Positionen landen auf dem nächsten Ticket
- Kommen nach dem ersten Druck neue Gerichte dazu, erscheint „Bestellung abschließen" erneut – nur die Nachbestellung wird gedruckt

### Belegformat Küche (Referenz: `docs/beispiel_beleg_fuer_kueche_aber_geht_besser.jpg`)

Was der Beleg zeigen soll:
- **Tischnummer + Zone** – oben, kleine Schrift (z.B. „Tisch 3" / „Außer Haus"); Zone **nicht** pro Position wiederholen
- **Gerichte** – pro Position: Menge × Code + Name (z.B. `2× 33  Hühnerfilet + Kokos`)
- Gerichte **ohne** Preis – interessiert die Küche nicht
- **Kein** Bediener-Name, **keine** Uhrzeit auf dem Beleg

Was wegfällt (im Vergleich zum Beispielbild):
- Preis pro Position → raus
- Wiederholtes Zonen-Label pro Gericht → raus
- Bediener + Timestamp in der Fußzeile → raus

### Vorschau im Bottom Sheet (Story 10)
- Die Positionsliste im „Drucken"-Bottom Sheet soll **optisch dem Beleg ähneln**: Menge × Code + Name, kein Preis, Zone einmalig oben
- Was B auf dem Handy sieht = was aus dem Drucker kommt – keine Überraschungen

---

## Kassenbeleg (Gästebeleg)

*Hinweis: Detailanforderungen werden noch gesammelt. Dieser Abschnitt wird laufend ergänzt.*

### Abgrenzung zum Küchenbon

| | Küchenbon | Kassenbeleg |
|---|---|---|
| Empfänger | Küche / Theke | Gast |
| Preise | Nein | Ja |
| Gesamtsumme | Nein | Ja |
| Restaurantinfo | Nein | Ja (TBD) |
| Gedruckt von | Küchendrucker | Kassendrucker (oder selber?) |

### Vorschau in der App

- B soll vor dem Druck eine **Vorschauansicht des Kassenbelegs** sehen können
- Die Vorschau soll **gut aussehen und dem gedruckten Beleg ähneln** (kein rohes Listenformat)
- HTML-Vorschau und tatsächlicher Druckinhalt dürfen **doppelt gepflegt** werden – kein Problem

### Inhalte (wird ergänzt)

- [ ] Restaurantname / Logo / Adresse
- [ ] Tischnummer
- [ ] Datum & Uhrzeit
- [ ] Positionen mit Einzelpreisen
- [ ] Gesamtsumme
- [ ] MwSt.-Ausweisung (falls nötig)
- [ ] *(weitere TBD)*

### Getrennte Rechnungen

- Gäste eines Tisches können in **Zahlgruppen** aufgeteilt werden (z.B. 4 Gäste → 2 Pärchen → 2 separate Belege)
- Details zur Gruppenbildung: TBD

---

## Referenzen

- **UI-Anforderungen:** Ausführlich dokumentiert in `docs/ui-requirements.md`
- **Visuelles Mockup:** Grobe Vorschau in `design/mockup.html`
- **Speisekarte:** Vollständig definiert in `config/menu.config.json` – der Code muss diese Datei als einzige Quelle für alle Gerichte, Preise und Kategorien verwenden

---

## Technologie & Architektur

### Repository-Struktur

- **Monorepo** – Frontend und Backend-Konfiguration leben im selben Repository
- Struktur:
  ```
  /
  ├── restaurant-app/     ← Angular Frontend (ng new)
  ├── supabase/           ← Supabase CLI (wird automatisch angelegt)
  │   ├── config.toml     ← Projekt-Konfiguration
  │   ├── migrations/     ← SQL-Dateien für Schema-Änderungen
  │   └── functions/      ← Edge Functions (falls nötig)
  ├── config/             ← Speisekarte & Tisch-Configs (JSON)
  └── docs/
  ```

### Backend & Authentifizierung

- Backend und Authentifizierung werden vollständig über **Supabase** abgewickelt
- Supabase stellt Datenbank (PostgreSQL), Auth und Realtime bereit – kein eigener Server
- Das Angular-Frontend spricht Supabase direkt über die `@supabase/supabase-js` Client-Bibliothek an
- Backend-Code im Repo = SQL-Migrationen und ggf. Edge Functions (TypeScript/Deno) – kein klassischer API-Server

### Frontend

- **Angular** (mobile-only Web-App)
- Liegt im Unterordner `restaurant-app/`

### Deployment

- Frontend wird über **GitHub Pages** deployed
- Anforderung: zero Wartungsaufwand im laufenden Betrieb – keine Infrastruktur, kein Server-Management
- Angular-Routing nutzt `HashLocationStrategy` – keine serverseitige Konfiguration nötig

