# CLAUDE.md – Restaurant Bestellungs-App

## Abkürzungen & Begriffe

- **B** = Bedienung (die Person, die die App benutzt)

## Projektübersicht

Mobile-only Web-App für 1–2 Bedienungen in einem asiatischen Restaurant. Ersetzt den Papier-Notizblock bei der Bestellaufnahme.

## Ziele & Stakeholder

- **B (Bedienung):** Bestellungen schnell und fehlerfrei aufnehmen, Rechnungen stellen – mindestens so flott wie Papier + Stift
- **Restaurantinhaber:** Verkaufsanalyse – welche Gerichte verkaufen sich wann am besten, um Einkäufe gezielt zu planen

## Wichtige Dateien

- `docs/requirements.md` – allgemeine Anforderungen
- `docs/ui-requirements.md` – UI-Anforderungen (ausführlich)
- `docs/features.md` – Feature-Liste
- `docs/database.md` – Datenbankschema
- `docs/printer.md` – Drucker-Anbindung (CloudPRNT-Protokoll, Hardware-Eigenheiten) – vor jeder Änderung an Bon-Layout oder Edge Function lesen
- `design/mockup.html` – visuelles Mockup (grobe Idee)
- `config/menu.config.json` – Speisekarte (einzige Quelle für Gerichte, Preise, Kategorien)

## Technologie

- **Backend & Auth:** Supabase
- **Frontend:** Angular (mobile-only Web-App)
