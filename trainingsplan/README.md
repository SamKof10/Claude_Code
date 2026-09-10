# Mesocycle

Trainings-Webapp für einen 8-Wochen-Mesozyklus: Push/Pull-Split über fünf Tage,
Satz-für-Satz-Logging und ein Gewichtsvorschlag, der aus der eigenen Historie
gerechnet wird. Mobile-first, als PWA installierbar.

Umgesetzt nach `trainingsplanspec.md`: Periodisierung, Progressionsregel,
Dropsatz-Regel und das 10-kg-Limit des Kurzhantel-Racks stecken in der Logik,
nicht nur im Text.

## Was die App tut

| Feature | Wo |
|---|---|
| Heutiges Workout aus Wochentag + Phase | `/` — Tag ist umschaltbar, falls du eine Einheit nachholst |
| Satz-für-Satz-Logging mit Steppern | `/uebung/[id]` |
| Gewichtsvorschlag mit Begründung | ebenda, oben in der Karte |
| Verlaufsdiagramm pro Übung | `/verlauf` — Deload-Wochen sind hinterlegt |
| Wochenübersicht absolviert vs. geplant | `/woche` — plus Mesozyklus-Leiste über alle acht Wochen |
| Deload automatisch markiert | Woche 6, überall wo die Phase auftaucht |
| Hinweis am Kurzhantel-Maximum | sobald der Vorschlag 10 kg erreicht |
| Konto, Export, Zurücksetzen | `/profil` |

## Die Logik dahinter

**Periodisierung** (`src/lib/phase.ts`) — die Woche ergibt sich aus dem
Startdatum des Zyklus:

| Wochen | Phase | Sätze | Wdh |
|---|---|---|---|
| 1–2 | Anpassung | 3 | 10–12 |
| 3–5 | Aufbau | 4 | 8–12 |
| 6 | Deload | 3 | 12–15, −30 % Gewicht |
| 7–8 | Intensivierung | 4 | 6–10 |

**Progression** (`src/lib/progression.ts`) — wenn in *allen* Arbeitssätzen der
letzten Session die obere Wdh-Grenze erreicht wurde, geht das Gewicht eine
Stufe hoch (Kabel 2,5 kg, Kurzhantel 0,5 kg). Sonst bleibt es. Drei Details,
die in der Praxis zählen:

- **Dropsätze zählen nicht** als Arbeitssatz — sonst würde ein Satz bis zum
  Versagen jede Steigerung blockieren.
- **Deload-Sessions sind keine Referenz.** Woche 7 rechnet mit dem Gewicht aus
  Woche 5 weiter, nicht mit den reduzierten 70 % aus Woche 6.
- **Beim Wechsel in die Intensivierung** sinkt der Wdh-Bereich von 8–12 auf
  6–10; dafür kommt eine zusätzliche Stufe drauf.

Bei Körpergewichtsübungen läuft die Progression über Wiederholungen, bei
Kurzhanteln ab 10 kg ebenfalls — dort weist die App auf 20–25 Wdh oder
langsameres Tempo hin.

**Dropsätze** — ab Woche 3, ein Satz am Ende der letzten *Isolations*übung
einer Session, 25 % weniger Gewicht. Nicht bei Compound-Übungen, nicht im
Deload. An Pull A gibt es deshalb keinen: der Tag besteht nur aus
Verbundübungen.

## Lokal starten

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 41 Prüfungen der Progressions- und Phasenlogik
```

Ohne `DATABASE_URL` läuft die App gegen einen Speicher im Prozess: alles
funktioniert, aber Konto und Sätze sind beim Neustart weg. Die App sagt das
selbst — auf dem Anmeldebildschirm, auf „Heute" und im Profil.

## Datenbank verbinden

Nötig für dauerhafte, geräteübergreifende Daten. Jeder Postgres tut es
(Neon, Supabase, Vercel Postgres, eigener Server):

```bash
echo 'DATABASE_URL=postgres://user:pass@host/db?sslmode=require' > .env.local
```

Die Tabellen legt die App beim ersten Zugriff selbst an — `users`,
`auth_tokens`, `workout_sessions`, `set_logs`. Kein Migrationslauf nötig.

**Auf Vercel:** im Projekt unter *Storage* eine Postgres-Datenbank anlegen und
verbinden — Vercel setzt `DATABASE_URL` und `POSTGRES_URL` automatisch. Beim
Import des Repos muss **Root Directory** auf `trainingsplan` stehen, sonst
baut Vercel das Repo-Root und liefert eine 404.

Optional: `APP_TIMEZONE` (Standard `Europe/Vienna`) bestimmt, wann ein neuer
Trainingstag beginnt. Der Server läuft in UTC — ohne feste Zone würde zwischen
Mitternacht und 2 Uhr noch der Vortag angezeigt.

## Konten und Sicherheit

Passwörter liegen als scrypt-Hash mit eigenem Salt. Die Anmeldung setzt ein
httpOnly-Cookie mit einem Zufallstoken, 90 Tage gültig; in Produktion nur über
HTTPS. Jede Abfrage ist an den eingeloggten Nutzer gebunden — auch das Löschen
einzelner Sätze prüft, ob die Session dem Konto gehört.

Für eine Trainings-App reicht das. Es ist keine Zwei-Faktor-Authentifizierung,
kein Passwort-Zurücksetzen und keine Rate-Begrenzung bei Login-Versuchen —
wenn das Ding über den privaten Gebrauch hinauswächst, gehört das nachgerüstet.

## Aufbau

```
src/
  lib/
    plan.ts         Übungen, Trainingstage, Gewichtsstufen — der Plan ist Code, keine Daten
    phase.ts        Woche → Phase, Sätze, Wdh-Bereich
    progression.ts  Gewichtsvorschlag, Dropsatz-Regel, Volumen
    db.ts           Postgres, mit Fallback auf einen Speicher im Prozess
    auth.ts         scrypt-Hashing, Session-Cookie
    data.ts         lädt und aggregiert alles für die Seiten
  app/              Routen (Server Components) und Server Actions
  components/       Tab-Bar, Icons, Bestätigungsdialog
design/             die Screens als Design-Canvas, aus dem die App gebaut wurde
scripts/            Logiktests
```

Der Trainingsplan steht bewusst im Code: er ändert sich pro Mesozyklus, nicht
pro Nutzer. Gespeichert wird nur, was tatsächlich trainiert wurde.

## Design

Dunkle Oberfläche mit drei Textstufen, die alle über 4,5:1 Kontrast liegen, und
zwei Akzentfarben mit gleicher Helligkeit und Sättigung — Grün für Progression,
Amber für Deload und Hinweise. Rot ist ausschließlich für zerstörende Aktionen
reserviert, damit eine Farbe nicht drei Dinge gleichzeitig bedeutet.
Touch-Targets ab 44 px, Typo nach der HIG-Skala (34/28/22/17/15/13/12).

Die Entwürfe liegen unter `design/` als Design-Canvas-Artboards.
