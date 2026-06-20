# Drucker – Star Micronics TSP143IV X4

Referenz-Doku für den Küchen-/Theken-Drucker. Bei jeder Änderung an `supabase/functions/cloudprnt/index.ts` oder am Bon-Layout zuerst hier lesen.

---

## Architektur

```
App → INSERT print_jobs (Supabase) → Edge Function cloudprnt → Drucker pollt & druckt
```

- `PrintService` (Angular) schreibt nur einen Job in die Tabelle `print_jobs` (`target: 'kitchen' | 'theke'`, `payload: {tableLabel, orders, timestamp}`). Kein direkter Netzwerkzugriff auf den Drucker aus der App.
- Edge Function `supabase/functions/cloudprnt/index.ts` bedient den Drucker, deployed mit `supabase functions deploy cloudprnt --no-verify-jwt` (Drucker schickt keine Auth-Header).

---

## Tatsächliches CloudPRNT-Protokoll dieses Druckers

Firmware meldet sich als `CloudPRNT/5.1`, `TSP100IV/3.3`. **Weicht vom Standard-Beispiel ab**, das man online findet – Details unten wurden per Edge-Function-Logs (Dashboard → Functions → cloudprnt → Invocations/Logs) reverse-engineered, nicht aus offizieller Doku übernommen.

| Aktion | Request | Antwort |
|---|---|---|
| Polling | `GET /cloudprnt` (kein `type`-Param) **oder** `POST` mit JSON-Body (`clientAction: null` + Statusfeldern wie `printerMAC`, `printingInProgress`) | `{jobReady, mediaTypes}` |
| Job abholen | `GET /cloudprnt?mac=...&type=text/plain` | Antwort-Body = rohe Bon-Bytes (kein `POST clientAction=GET_JOB`!) |
| Ergebnis melden | `DELETE /cloudprnt?mac=...&code=200%20OK` (oder Fehlercode) | leeres JSON (kein `POST clientAction=SET_JOB_DONE`!) |

Einziger angebotener `mediaType`: `text/plain` (matcht den `Accept`-Header des Druckers; StarPRNT-XML war nicht nötig).

Bei `code` beginnend mit `200` → Job-Status `done`, sonst zurück auf `pending` (Retry).

---

## Hardware-Eigenheit: Druckkopf breiter als Papier

Der Druckkopf ist breiter als die eingelegte 58mm-Rolle. Die Rolle sitzt **fix** (per Plastik-Trennstück, nicht justierbar) im **rechten** Teil des Druckkopf-Bereichs.

**Folge:** Die ersten **12 Zeichen** jeder gedruckten Zeile landen im papierlosen linken Bereich (unsichtbar). Danach sind genau **36 Zeichen** sichtbar bedruckbar.

Diese Werte wurden per einmaligem Kalibrierungs-Bon ermittelt (eine Zeile mit 50 eindeutigen Zeichen `0123456789ABCDEFG...`, dann abgelesen welches Zeichen als erstes/letztes sichtbar ist) – nicht durch Schätzen.

**Umsetzung in `index.ts`:**
```ts
const LEFT_PAD = 12; // unsichtbarer Bereich links
const W = 36;         // sichtbare Zeichenbreite
function emit(line: string) { return ' '.repeat(LEFT_PAD) + line; }
```
Jede Zeile läuft durch `emit()`. **Falls Papierrolle, Drucker oder Halterung sich ändern: Kalibrierung wiederholen, nicht blind übernehmen.**

---

## Umlaute

Der Drucker dekodiert `text/plain` nicht als UTF-8 – ü/ö/ä/ß werden zu Mojibake. Lösung: `transliterate()` wandelt sie vor dem Druck in ae/oe/ue/ss um (keine Codepage-Konfiguration nötig).

---

## Drucker-Webinterface

- URL: `http://<drucker-ip>/` (IP per Selbsttest-Ausdruck oder Router-Admin-Oberfläche ermitteln)
- Login: `root` / Passwort (im Restaurant hinterlegt, nicht hier dokumentiert)
- CloudPRNT-Settings (Network Configuration → CloudPRNT): Server-URL = Edge-Function-URL (`https://<project>.supabase.co/functions/v1/cloudprnt`), Polling-Intervall 5s
- Nach jeder Einstellungsänderung: **Save → Restart device** nötig, damit sie greift

---

## Diagnose-Workflow

1. Supabase Dashboard → Edge Functions → `cloudprnt` → **Invocations**-Tab zeigt Methode + Status pro Request (am schnellsten um zu sehen, ob/wie der Drucker überhaupt anfragt)
2. **Logs**-Tab zeigt `console.log`-Ausgaben aus der Function
3. `supabase functions logs` existiert in dieser CLI-Version **nicht** – nur über das Dashboard einsehbar
4. Test-Jobs lassen sich am einfachsten direkt über die App auslösen (echter End-to-End-Test), nicht über curl mit dem anon key (RLS blockt unauthentifizierte Inserts in `print_jobs` – das ist beabsichtigt, siehe Auth-Guard)
