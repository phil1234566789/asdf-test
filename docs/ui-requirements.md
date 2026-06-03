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

- Zielgruppe: 1–3 Bedienungen pro Tag (kein technisches Vorwissen erforderlich)
- Gerät: Smartphone (mobile only)
- Restaurantkapazität: ca. 60–80 Gäste gleichzeitig
- Workflow: Bedienung geht zum Tisch → nimmt Bestellung auf → App berechnet Preis automatisch

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

Auf Papier zeichnet die Bedienung in Sekunden eine freie Tischskizze, platziert Gäste darum und schreibt Bestellungen direkt daneben. Die App muss diesen Workflow mindestens genauso schnell und intuitiv abbilden.

### Alles in einer einzigen Tischskizzen-Ansicht

- Es gibt **keinen separaten Setup-Screen** – Zeichnen, Gäste platzieren und Bestellungen aufnehmen passiert alles in **einer Ansicht**, analog zum Papier
- Workflow: Tisch zeichnen → Gäste antippen zum Platzieren → Gast antippen → Numpad erscheint → Code eingeben → nächster Gast

### Freies Tisch-Zeichnen (kein Preset)

- Die Bedienung **zeichnet den Tisch per Finger** direkt auf dem Bildschirm – freie Form, kein vorgegebenes Rechteck oder Oval
- Dadurch werden alle realen Tischformen unterstützt: rechteckig, rund, **L-Form** (wenn zwei Tische zusammengestellt werden), U-Form etc.
- Das Zeichnen muss in wenigen Sekunden möglich sein – Ziel: schneller als Papier

### Tischnummer: sekundär

- Die Tischnummer ist **nicht der erste Schritt** – die Bedienung ist vor Ort, sie weiß welcher Tisch es ist
- Die Nummer wird als **kleines, optionales Feld** irgendwo am Rand eingeblendet und kann jederzeit nachgetragen werden
- Sie blockiert **nicht** den Start der Bestellaufnahme

### Gäste visuell am Tisch platzieren

- Nach dem Zeichnen tippt die Bedienung auf Stellen **rund um den gezeichneten Tisch**, um Gäste zu platzieren
- Die Gast-Positionen erscheinen als nummerierte Kreise direkt an der Tischkante – visuell wie auf dem Papier-Zettel
- Die Anordnung entspricht der realen Sitzordnung

### Referenzgast markieren

- Die Bedienung kann einen Gast als **Referenzpunkt** markieren (langer Druck oder ähnlich)
- Dieser Gast wird farbig hervorgehoben
- Alle anderen Gäste werden relativ zu dieser Referenz eingetragen – die Bedienung muss beim Servieren nicht nachfragen

### Bestellung pro Sitzplatz

- Gast antippen → Numpad öffnet sich → Code eingeben → Gericht erscheint als Label beim Gast in der Skizze
- Jedes Gericht ist einem konkreten Sitzplatz zugeordnet
- Beim Servieren und bei der Rechnung ist die Zuordnung sofort sichtbar

---

## Tisch- & Abholoptionen

- **Tischnummern Innen:** 1–14 (kein Präfix)
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
