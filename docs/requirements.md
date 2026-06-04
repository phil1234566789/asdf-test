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

