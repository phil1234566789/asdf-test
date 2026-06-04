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

## Referenzen

- **UI-Anforderungen:** Ausführlich dokumentiert in `docs/ui-requirements.md`
- **Visuelles Mockup:** Grobe Vorschau in `design/mockup.html`
- **Speisekarte:** Vollständig definiert in `config/menu.config.json` – der Code muss diese Datei als einzige Quelle für alle Gerichte, Preise und Kategorien verwenden

---

## Technologie & Architektur

### Backend & Authentifizierung

- Backend und Authentifizierung werden vollständig über **Supabase** abgewickelt

### Frontend

- **Angular** (mobile-only Web-App)

### Deployment

- Frontend wird über **GitHub Pages** deployed
- Anforderung: zero Wartungsaufwand im laufenden Betrieb – keine Infrastruktur, kein Server-Management
- **Hinweis:** Angular-Routing erfordert eine `404.html` (identisch zur `index.html`) als einmaligen Workaround für direkte URL-Aufrufe

