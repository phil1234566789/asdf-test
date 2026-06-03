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

### Live Code-Auflösung
- Eingegebener Code wird sofort in Gerichtname + Preis übersetzt (z.B. `33` → „Hühnerfilet + Kokos Curry – 10,90 €")
- Ungültige Codes werden explizit als fehlerhaft markiert – kein stilles Ignorieren

---

## Gemeinsame Übersicht & B-Zuweisung

### Geteilte Echtzeit-Übersicht
- Alle eingeloggten Bedienungen sehen dieselbe Übersicht (alle offenen Tische und Mitnahmen, egal von wem angelegt)

### Zuständige B pro Tisch
- Jede Session ist der B zugewiesen, die sie angelegt hat
- Jede Übersichtskarte zeigt den Namen der zuständigen B

### Eigene Tische hervorheben
- Tische der aktuell eingeloggten B sind visuell hervorgehoben (z.B. Akzent-Rand)
- Die eingeloggte B ist jederzeit in der Übersicht sichtbar

### Übersichtskarte (Inhalt)
- Tischkennung (Nummer / Kürzel)
- B-Name
- Wartezeit-Timer (Minuten)
- Bestellstatus (noch zu definieren)

---

## Tischplan & Sitzplatzzuordnung

### Freies Tisch-Zeichnen
- Bedienung zeichnet Tischform per Finger direkt auf dem Bildschirm
- Keine vorgegebenen Formen – unterstützt rechteckig, rund, L-Form, U-Form etc.
- Muss in wenigen Sekunden erledigt sein

### Gäste visuell platzieren
- Nach dem Zeichnen: Tippen auf Stellen rund um den Tisch platziert einen Gast
- Gäste erscheinen als nummerierte Kreise an der Tischkante – entspricht realer Sitzordnung

### Referenzgast
- Einen Gast per langem Druck als Referenzpunkt markieren
- Referenzgast wird farbig hervorgehoben; alle anderen Gäste werden relativ dazu zugeordnet

### Bestellung pro Sitzplatz
- Gast antippen → Numpad öffnet sich → Code eingeben → Gericht erscheint als Label beim Gast
- Zuordnung Gericht ↔ Sitzplatz ist beim Servieren und auf der Rechnung jederzeit sichtbar

### Alles in einer Ansicht
- Kein separater Setup-Screen – Tisch zeichnen, Gäste platzieren und Bestellungen aufnehmen in einer einzigen Ansicht

### Tischnummer (optional)
- Kleines, optionales Feld am Rand – kann jederzeit nachgetragen werden
- Blockiert nicht den Start der Bestellaufnahme

---

## Tisch- & Abholoptionen

### Tisch Innen
- Tischnummern 1–14 (kein Präfix)

### Tisch Draußen
- D1–D10 (Präfix `D`)

### Mitnehmen
- M1–M5 (Präfix `M`, max. 5 gleichzeitig)

### Config-getrieben
- Zonen, Präfixe und Limits sind in `config/tables.config.json` definiert
- Die App liest diese Datei als einzige Quelle – keine hardgecodeten Bereichsgrenzen

---

## Preisberechnung & Rechnung

### Automatische Preisberechnung
- Alle Positionen werden automatisch summiert – kein Kopfrechnen

### Getrennte Rechnungen
- Gäste eines Tisches können in Zahlgruppen eingeteilt werden (z.B. 4 Gäste → 2 Pärchen → 2 Rechnungen)

### Rechnungsanzeige auf dem Handy
- Rechnung für ausgewählte Gäste/Positionen direkt auf dem Bildschirm anzeigen
- Zeigt: Gerichte, Einzelpreise, Gesamtsumme – übersichtlich und gut lesbar

### Rechnungsdruck (optional)
- Nach der Anzeige kann die Rechnung optional ausgedruckt werden
- Eine angezeigte oder gedruckte Rechnung markiert die Bestellung als abgeschlossen

---

## Bestellungsübermittlung

### Manuelles Senden
- Bedienung entscheidet selbst, wann gesendet wird – kein automatisches Abschicken

### Getrennte Sendeziele
- **Küche** – für alle Speisen
- **Bar** – für alle Getränke

### Gesendet/Ausstehend-Status
- App zeigt pro Position klar an, ob sie bereits gesendet wurde oder noch aussteht
- Bereits gesendete Positionen können nicht versehentlich erneut gesendet werden

### Sendebestätigung
- Nach erfolgreichem Senden an Küche oder Bar erscheint eine explizite Bestätigung

---

## Wartezeit & Übersicht

### Wartezeit-Timer
- Jede Bestellung zeigt einen laufenden Timer ab Zeitpunkt der Aufnahme
- Anzeige in ganzen Minuten (z.B. „9 min") – keine Sekundenanzeige
- Timer läuft weiter, auch wenn die App kurz geschlossen oder das Display gesperrt wird

### Visuelle Eskalation
- Übersicht aller offenen Tische/Bestellungen zeigt Wartezeiten auf einen Blick
- Farbliche Eskalation: grün → gelb → rot (Schwellenwerte folgen noch)

---

## Erscheinungsbild

### Hell-/Dunkelmodus
- **Dark Mode:** Standard – spart Akku
- **Light Mode:** Für Einsatz bei Sonneneinstrahlung
- Umschaltung jederzeit schnell erreichbar

---

## Verbindung & Fehlerbehandlung

### Ladeindikator
- Jede Netzwerkaktion zeigt einen klaren Ladeindikator – Nutzer weiß immer, ob die App noch arbeitet

### Fehlerbehandlung
- Fehlerzustände werden explizit kommuniziert (z.B. „Verbindung unterbrochen", „Senden fehlgeschlagen")
- Fehlermeldungen sind sichtbar, aber nicht störend platziert
- UI-Struktur plant von Anfang an Loading-, Error- und Success-States ein
