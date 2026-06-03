# UI Anforderungen – Restaurant Bestellungs-App

> **Anweisung an die KI:**
> Qualität hat Vorrang vor Geschwindigkeit. Lieber gründlich nachdenken als schnell ein schlechtes Konzept produzieren.
> Bei Unklarheiten oder Designentscheidungen mit mehreren sinnvollen Optionen: **nachfragen**, nicht raten.
> Das Ziel ist ein durchdachtes, praxistaugliches UI – kein generisches Template.

## Kontext

Erstelle eine **mobile-only Web-App** (Angular) für 1–2 Bedienungen in einem asiatischen Restaurant.
Die App ersetzt den bisherigen Papier-Notizblock beim Aufnehmen von Gästebestellungen.
Die Speisekarte ist in `menu.config.json` definiert.

---

## Benutzer & Nutzungsszenario

- Zielgruppe: 1–3 Bedienungen pro Tag
- Gerät: Smartphone (mobile only)
- Restaurantkapazität: ca. 60–80 Gäste gleichzeitig
- Workflow: Bedienung geht zum Tisch → nimmt Bestellung auf → App berechnet Preis automatisch

### Power User – zentrales UI/UX-Prinzip

Die Bedienungen sind **täglich wiederkehrende Nutzer**, die die App vielfach pro Schicht einsetzen. Daraus folgen konkrete Designentscheidungen:

- **Effizienz vor Erlernbarkeit** – eine höhere Lernkurve ist akzeptabel, wenn sie dauerhaft schnelleres Arbeiten ermöglicht
- **Keine Händchenhaltung** – keine Onboarding-Texte, keine Tooltips, keine erklärenden Labels für offensichtliche Aktionen
- **Kompaktes, dichtes Layout** – Platzverschwendung für „Anfänger-Komfort" (große Buttons, viel Weißraum, redundante Beschriftungen) ist abzulehnen
- **Keine unnötigen Bestätigungsdialoge** für häufige Aktionen – Unterbrechungen kosten im Stress wertvolle Sekunden
- **Gesten und Shortcuts** sind willkommen – Power User lernen und nutzen sie aktiv

---

## Bestelleingabe

- Gerichte werden per **Kurzcode** eingegeben (z.B. `33` = Hühnerfilet + Kokos Curry), analog zum bisherigen Notizblock
- Codes basieren auf `menu.config.json`:
  - **Kombinieren:** Hauptgericht-Nr. + Sauce-Nr. (z.B. `33` = Hauptgericht 3 + Sauce 3)
  - **Hotcooked:** Code `HC1`–`HC4`
  - **Reis/Nudeln:** Code `RN1`–`RN5`
  - **Chef Specials:** Code `C01`–`C20`
- Die App löst den Code automatisch auf und zeigt Gerichtname + Preis an

## Eingabe-Interface

- **Keine native Handy-Tastatur** – die System-Tastatur wird niemals geöffnet
- Stattdessen: **eigenes In-App-Tastenfeld** mit großen, gut tippbaren Buttons
- Das Tastenfeld enthält:
  - Ziffern `0`–`9` (großflächig, wie ein Nummernpad)
  - Kategorie-Präfix-Buttons: `HC`, `RN`, `C` (für die jeweiligen Gerichtgruppen)
  - `⌫` Löschen (letztes Zeichen)
  - `✓` Bestätigen (Gericht zur Bestellung hinzufügen)
- Eingabe wird live in einem Display-Feld oben angezeigt und sofort aufgelöst (z.B. Eingabe `33` → zeigt „Hühnerfilet + Kokos Curry – 10,90 €")
- Fehlhafte Codes werden klar als ungültig markiert (kein stilles Ignorieren)

---

## Preisberechnung

- Preise werden **automatisch summiert** (kein Kopfrechnen für die Bedienung)
- Unterstützung für **getrennte Rechnungen**:
  - Mehrere Gäste an einem Tisch können in Gruppen zusammengefasst werden
  - Beispiel: 4 Gäste → 2 Pärchen → 2 getrennte Rechnungen
  - Bedienung wählt, welche Gäste gemeinsam zahlen

---

## Tischplan & Sitzplatzzuordnung

### Kernprinzip: Die UI darf nicht gegen Papier + Stift verlieren

Die App zeigt den Tisch als vordefinierten Grundriss an – die Bedienung muss nichts zeichnen. Der Grundriss entspricht der realen Tischform und ist sofort nutzbar.

### Alles in einer einzigen Tischansicht

- Es gibt **keinen separaten Setup-Screen** – Tischansicht öffnen, Gäste antippen und Bestellungen aufnehmen passiert alles in **einer Ansicht**
- Workflow: Tisch auswählen → Tischansicht öffnet sich sofort → Sitzplatz antippen → Numpad erscheint → Code eingeben → nächster Sitzplatz

### Tischform aus Config (kein freies Zeichnen)

- Tischformen sind in `config/tables.config.json` vordefiniert – kein Zeichnen durch die Bedienung
- Unterstützte Formen: **rechteckig** (Standard) und **rund**
- Innen: Tische 1–50, davon 8, 9, 11, 12 rund – alle anderen rechteckig
- Draußen: alle Tische rechteckig, kein Präfix-Präfix nötig
- Sitzplätze pro Tisch ebenfalls aus Config (`defaultSeats`); Standard: 4 Plätze

### Tischnummer: primär

- Die Tischnummer wird beim Öffnen der Bestellansicht als Heading angezeigt
- Sie kommt aus der Auswahl in der Übersicht – die Bedienung muss sie nicht nochmals eingeben

### Gäste / Sitzplätze

- Die Sitzplätze erscheinen als nummerierte Kreise rund um den Tischgrundriss – entspricht der realen Sitzordnung
- Die Anzahl der angezeigten Sitzplätze entspricht `defaultSeats` aus der Config
- B kann zusätzliche Sitzplätze hinzufügen (z. B. wenn mehr Gäste kommen als Standardplätze vorhanden) – noch zu definieren

### Referenzgast markieren

- Die Bedienung kann einen Gast als **Referenzpunkt** markieren (langer Druck oder ähnlich)
- Dieser Gast wird farbig hervorgehoben
- Alle anderen Gäste werden relativ zu dieser Referenz eingetragen – die Bedienung muss beim Servieren nicht nachfragen

### Bestellung pro Sitzplatz

- Sitzplatz antippen → Numpad öffnet sich → Code eingeben → Gericht erscheint als Label beim Sitzplatz
- Jedes Gericht ist einem konkreten Sitzplatz zugeordnet
- Beim Servieren und bei der Rechnung ist die Zuordnung sofort sichtbar

---

## Tisch- & Abholoptionen

- **Tischnummern Innen:** 1–50 (kein Präfix)
- **Tischnummern Draußen:** D1–D10 (Präfix `D`)
- **Mitnehmen:** M1–M5 (Präfix `M`, max. 5 gleichzeitig, keine Tischnummer)
- **Lieferung:** nicht vorhanden

Diese Zonen und Grenzen sind in `config/tables.config.json` definiert und können je Restaurant angepasst werden. Die App liest alle Zonen, Präfixe und Limits ausschließlich aus dieser Datei.

---

## Gemeinsame Übersicht & B-Zuweisung

- Alle eingeloggten Bedienungen sehen **dieselbe Übersicht** aller offenen Tische und Mitnahme-Bestellungen – unabhängig davon, wer sie angelegt hat
- Jede Session ist einer **zuständigen B** zugewiesen (die B, die den Tisch angelegt hat)
- **Eigene Tische** (Tische der aktuell eingeloggten B) werden visuell hervorgehoben (z.B. farbiger Akzent-Rand)
- Die aktuell eingeloggte B ist jederzeit in der Übersicht sichtbar (z.B. als kleines Label im Header)

### Inhalt einer Übersichtskarte

Jede Karte zeigt genau diese vier Informationen – nicht mehr:

| Element | Beschreibung |
|---|---|
| **Tischkennung** | Nummer bzw. Kürzel (z.B. `3`, `D5`, `M2`) |
| **B-Name** | Name der zuständigen Bedienung |
| **Timer** | Wartezeit in ganzen Minuten |
| **Bestellstatus** | Aktueller Status der Bestellung (noch zu definieren) |

### Nachspeisen-Indikator

- Enthält ein Tisch mindestens eine **Menü-Bestellung**, erscheint auf der Übersichtskarte ein **Nachspeisen-Hinweis**
- Zweck: B weiß auf einen Blick, dass sie bei diesem Tisch wegen der Nachspeise nachfragen muss
- Der Hinweis muss auch im Stress gut erkennbar sein (kein dezentes Icon, das übersehen wird)
- Konkrete Umsetzung (Icon, Badge, Farbe, Position auf der Karte) noch zu definieren

---

## Wartezeit-Anzeige

- Jede Bestellung zeigt einen **laufenden Timer** an, der ab dem Zeitpunkt der Aufnahme zählt
- Anzeige in **ganzen Minuten** – Sekunden werden nicht angezeigt (z.B. „9 min", „24 min")
- Die Übersicht aller offenen Tische/Bestellungen zeigt die Wartezeit auf einen Blick, damit B priorisieren kann
- Visuelle Eskalation empfohlen: z.B. grün → gelb → rot je nach Wartezeit (konkrete Schwellenwerte folgen)
- Timer läuft weiter, auch wenn B die App kurz schließt oder das Display sperrt

---

## Bestellungsübermittlung (Aktionen)

- Die Bedienung entscheidet **manuell und bewusst**, wann eine Bestellung abgeschickt wird – kein automatisches Senden
- Es gibt zwei separate Sendeziele:
  - **Küche** – für alle Speisen (wird ausgedruckt)
  - **Bar** – für alle Getränke (wird separat ausgedruckt)
- Begründung: B nimmt ggf. mehrere Bestellungen hintereinander auf und kennt die gewünschte Reihenfolge selbst (z.B. Mitnehmen-Bestellung soll erst später in die Küche, damit das Essen nicht zu früh fertig ist)
- Die App zeigt klar an, welche Positionen/Gerichte bereits gesendet wurden und welche noch ausstehen
- Bereits gesendete Positionen können nicht versehentlich nochmals gesendet werden

---

## Rechnungsanzeige & Druck

- Auf Wunsch der Gäste kann B eine **Rechnung direkt auf dem Handy anzeigen** – übersichtlich, gut lesbar, ohne Kleingedrucktes
- Die Rechnungsanzeige ist eng verzahnt mit der **Sitzplatzzuordnung und den getrennten Rechnungen**:
  - B wählt aus, für welche Gäste/Positionen die Rechnung angezeigt werden soll
  - Beispiel: 4 Gäste, 2 Pärchen → B zeigt Pärchen 1 ihre Rechnung, danach Pärchen 2 ihre Rechnung
- Die Rechnung zeigt: alle bestellten Gerichte der jeweiligen Gäste, Einzelpreise, Gesamtsumme
- Nach der Anzeige kann B die Rechnung **optional ausdrucken**
- Eine bereits angezeigte oder gedruckte Rechnung markiert die entsprechende Bestellung als abgeschlossen

---

## Verbindung, Ladeindikator & Fehlerbehandlung

- Die App muss für **langsame oder instabile Internetverbindungen** ausgelegt sein
- Jede Netzwerkaktion (Senden an Küche/Bar, Laden von Daten) zeigt einen **klaren Ladeindikator** – der Nutzer weiß immer, ob die App noch arbeitet
- **Fehlerzustände müssen explizit kommuniziert werden**, z.B.:
  - „Verbindung unterbrochen – bitte erneut versuchen"
  - „Senden fehlgeschlagen – Bestellung wurde nicht übermittelt"
- Fehlermeldungen sind so platziert, dass sie nicht stören, aber unmissverständlich sichtbar sind (kein leises Scheitern im Hintergrund)
- Das UI-Konzept muss von Anfang an **Platz und Struktur für diese Zustände** einplanen (Loading-State, Error-State, Success-State) – kein nachträgliches Hinzufügen
- Kritische Aktionen (Senden an Küche/Bar) benötigen eine **Bestätigung nach erfolgreichem Senden**

---

## Offen / Folgt noch

- Weitere Gerichte/Kategorien werden nachgereicht und in `menu.config.json` ergänzt
- Schwellenwerte für Wartezeit-Eskalation (grün/gelb/rot) noch festzulegen
- Druckeranbindung (Küche & Bar) technisch noch zu klären
