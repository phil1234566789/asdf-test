# Features – Restaurant Bestellungs-App

---

## Verkaufsanalyse *(für den Restaurantinhaber)*

### Bestellhistorie
- Alle abgeschlossenen Bestellpositionen bleiben dauerhaft in der Datenbank gespeichert
- Jede Position enthält: Gerichtcode, Gerichtname, Kategorie, Preis, Zeitstempel
- Ermöglicht Auswertungen wie: meistverkaufte Gerichte, Umsatz pro Zeitraum, Nachfrage nach Tageszeit

---

## Bestelleingabe

### Kurzcode-Eingabe
- Gerichte werden per Kurzcode eingegeben (z.B. `33` = Hühnerfilet + Kokos Curry)
- Codes aus `config/menu.config.json`: Kombinieren (`11`–`77`), Hotcooked (`HC1`–`HC4`), Reis/Nudeln (`RN1`–`RN5`), Chef Specials (`C01`–`C20`)

### In-App Numpad
- Kein Öffnen der System-Tastatur – ausschließlich eigenes In-App-Tastenfeld
- Ziffern `0`–`9`, Kategorie-Präfixe `HC` / `RN` / `C`, `⌫` Löschen, `✓` Bestätigen

### Gericht entfernen

- In der **Listenansicht** hat jede Bestellposition einen `×`-Button – immer sichtbar, unabhängig vom Session-Status
- Tap → Confirmation-Popup mit Code + Name des Gerichts; „Entfernen" bestätigen → Gericht weg, Gesamtpreis aktualisiert sich
- War das Gericht bereits gedruckt (`printed: true`): Popup zeigt Hinweis `„Bereits gedruckt – ggf. Küche informieren"` (muss aktiv weggeklickt werden)

### Live Code-Auflösung
- Eingegebener Code wird sofort aufgelöst:
  - **Gültiger Code** → Gerichtname + Preis in Grün
  - **Präfix-Eingabe** (`HC`, `RN`, `C`, einzelne Ziffer) → Hinweis auf folgende Codes
  - **Unbekannter Code** → Fehlermeldung in Rot
- `✓` ist disabled solange kein gültiger Code eingegeben ist
- Nach Bestätigung: kurzes Grün-Flash, dann Reset – Numpad bleibt offen für nächste Eingabe

---

## Gemeinsame Übersicht & B-Zuweisung

### Geteilte Echtzeit-Übersicht
- Alle eingeloggten Bedienungen sehen dieselbe Übersicht (alle offenen Tische und Mitnahmen, egal von wem angelegt)

### Zuständige B pro Tisch
- Jede Session ist der B zugewiesen, die sie angelegt hat
- Jede Übersichtskarte zeigt den Namen der zuständigen B

### Eigene Tische hervorheben
- Tische der aktuell eingeloggten B sind visuell hervorgehoben (Akzent-Rand in Zonenfarbe)
- Die eingeloggte B ist jederzeit im Header der Übersicht sichtbar

### Übersichtskarte (Inhalt)
- Tischkennung (Nummer / Kürzel) – groß links
- B-Name – klein, darunter
- Wartezeit-Timer – farbiger Chip rechts (nur Zahl, kein „min"-Suffix)
- Bestellstatus – Symbol bei relevantem Status (siehe unten)

### Bestellstatus

| Wert | Bedeutung | Anzeige auf Karte |
|---|---|---|
| `new` | Bestellung aufgenommen, noch nicht gesendet | *(kein Symbol)* |
| `in_progress` | An Küche/Theke gesendet und ausgedruckt | `▶` (orange) |
| `payment_pending` | Essen serviert, Bezahlung ausstehend | `€` (gelb) |
| `completed` | Bezahlt, Session geschlossen | *(nicht in Übersicht)* |

### Nachspeisen-Indikator
- In der Übersichtskarte erscheint ein **gelbes „N"-Badge** oben rechts auf der Karte, sobald ein Tisch mindestens eine Menü-Bestellung enthält
- Zweck: B wird daran erinnert, beim Tisch nach der Nachspeise zu fragen

---

## Tischauswahl

### Tischauswahl-Seite
- FAB → „Tisch" öffnet eine eigene Seite mit allen Tischen (Innen + Draußen) als 5-spaltiges Grid
- **Freie Tische**: Zonenfarbe (blau = Innen, grün = Draußen)
- **Belegte Tische**: Grau, nicht anklickbar
- **Runde Tische** (8, 9, 11): Kreisform im Grid
- Alle Tische werden aus `config/tables.config.json` geladen – kein Hardcoding

---

## Tischplan & Sitzplatzzuordnung

### Tischform aus Config
- Tischformen sind in `config/tables.config.json` vordefiniert – kein Zeichnen durch die Bedienung
- Unterstützte Formen: rechteckig (Standard) und rund
- Innen: Tische 1–40, davon 8, 9, 11 rund / 12 rechteckig mit 6 Plätzen – alle anderen rechteckig mit 4 Plätzen
- Draußen: alle Tische rechteckig
- Sitzplätze pro Tisch aus Config (`defaultSeats`); Standard: 4 Plätze

### Tischnummer in der Mitte
- Die Tischnummer wird dezent in der Mitte des Tischgrundrisses angezeigt – Verwechslungssicherheit

### Sitzplätze anzeigen
- Sitzplätze erscheinen als nummerierte Kreise rund um den Tischgrundriss – entspricht realer Sitzordnung
- Anzahl der Sitzplätze entspricht `defaultSeats` aus der Config

### Tisch erweitern
- Rechteckige Tische zeigen `+`-Buttons oben/unten
- Tippen → neuer Tischabschnitt wird angehängt, neue Sitzplätze erscheinen
- Erweiterungsbuttons sind ausgeblendet wenn das Numpad offen ist

### Referenzgast
- Einen Sitzplatz per **Long Press** (500 ms) als Referenzpunkt markieren
- Referenzgast bekommt gelben Rand; alle anderen werden relativ dazu zugeordnet
- Kurze Vibration bei Aktivierung (falls Gerät unterstützt)

### Bestellung pro Sitzplatz
- Sitzplatz antippen → Numpad öffnet sich → Code eingeben → Gericht erscheint als Label beim Sitzplatz
- Bestellcodes werden radial nach außen gestapelt (runde Tische) bzw. links/rechts neben dem Dot (eckige Tische)
- Tags außerhalb des sichtbaren Bereichs werden nicht gerendert

### Alles in einer Ansicht
- Kein separater Setup-Screen – Tischansicht öffnet sich sofort, Bestellungen direkt aufnehmen

---

## Tisch- & Abholoptionen

### Tisch Innen
- Tischnummern 1–40 (kein Präfix)

### Tisch Draußen
- D1–D10 (Präfix `D`)

### Mitnehmen
- M1–M5 (Präfix `M`, max. 5 gleichzeitig)
- **Kein Tischauswahl-Screen** – FAB weist automatisch den nächsten freien Slot zu (M1 → M2 → ... → M5)
- Alle 5 Slots belegt → Fehlermeldung
- **Eigene Ansicht**: keine Tischvisualisierung – stattdessen Bestellliste mit Gruppierung gleicher Gerichte und Gesamtpreis

### Config-getrieben
- Zonen, Präfixe und Limits sind in `config/tables.config.json` definiert
- Die App liest diese Datei als einzige Quelle – keine hardgecodeten Bereichsgrenzen

---

## Preisberechnung & Rechnung

### Automatische Preisberechnung
- Alle Positionen werden automatisch summiert – kein Kopfrechnen
- Bei Mitnehmen: gleiche Gerichte werden gruppiert, Gesamtpreis pro Gruppe und Gesamtsumme werden angezeigt

### Getrennte Rechnungen
- Gäste eines Tisches können in Zahlgruppen eingeteilt werden (z.B. 4 Gäste → 2 Pärchen → 2 Rechnungen)

### Rechnungsanzeige auf dem Handy
- 🧾-Button im Header öffnet vollbildige Belegvorschau (Story 12)
- Zeigt: Restaurantdaten, Tisch-Nr., alle Gerichte mit Preisen, Gesamt + MwSt
- Gedacht um dem Gast die Rechnung direkt zu zeigen

### Rechnungsdruck (geplant)
- Druck des Kassenbelegs über Thekendrucker – noch nicht implementiert
- Voraussetzung: Druckerintegration (ESC/POS, Epson ePOS SDK)

---

## Bestellungsübermittlung (Drucken)

### Manuelles Drucken
- Bedienung entscheidet selbst, wann gedruckt wird – kein automatisches Abschicken
- Auslösung über „Bestellung abschließen" → Bottom Sheet mit Druckoptionen

### Getrennte Druckziele
- **Küche** – für alle Speisen
- **Theke** – für alle Getränke
- Simultan möglich: „An Theke + Küche" druckt beide mit einem Tap

### Gedruckt/Ausstehend-Status
- Jede Position hat `printed: boolean` – gedruckte Positionen werden visuell gedimmt
- Bereits gedruckte Positionen können nicht versehentlich erneut gedruckt werden
- Nachbestellungen erscheinen als neue ungedruckte Positionen → „Bestellung abschließen" Button erscheint erneut

### Druckbestätigung
- Nach erfolgreichem Druck erscheint eine Bestätigung im Bottom Sheet (✓ Gedruckt)
- Bei Fehler: Meldung bleibt sichtbar mit Retry-Option

---

## Wartezeit & Übersicht

### Wartezeit-Timer
- Jede Bestellung zeigt einen laufenden Timer ab Zeitpunkt der Aufnahme
- Anzeige in ganzen Minuten als reine Zahl – keine Sekundenanzeige, kein „min"-Suffix
- Timer läuft weiter, auch wenn die App kurz geschlossen oder das Display gesperrt wird

### Visuelle Eskalation
- Farbliche Eskalation auf Übersichtskarte und Tischansicht:
  - **Grün**: < 15 Minuten
  - **Gelb**: 15–29 Minuten
  - **Rot**: ≥ 30 Minuten

---

## Erscheinungsbild

### Hell-/Dunkelmodus
- **Light Mode:** Standard – bessere Lesbarkeit im Alltag
- **Dark Mode:** Optionaler Modus zum Akkusparen
- Umschaltung jederzeit über Icon-Button im Header erreichbar
- Einstellung wird in `localStorage` gespeichert

---

## Verbindung & Fehlerbehandlung

### Ladeindikator
- Jede Netzwerkaktion zeigt einen klaren Ladeindikator – Nutzer weiß immer, ob die App noch arbeitet

### Fehlerbehandlung
- Fehlerzustände werden explizit kommuniziert (z.B. „Verbindung unterbrochen", „Senden fehlgeschlagen")
- Fehlermeldungen sind sichtbar, aber nicht störend platziert
- UI-Struktur plant von Anfang an Loading-, Error- und Success-States ein
