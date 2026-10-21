# RuView Map

Ein 3D-Grundriss deiner Wohnung, auf dem du live siehst, wo
[RuView](https://github.com/ruvnet/RuView) gerade Personen erkennt: wer in
welchem Raum ist, ob jemand geht, sitzt oder liegt, und wie schnell er atmet.

- **Demo** – simulierte Bewohner laufen durch einen Beispielgrundriss. Läuft
  ohne Sensor und ohne Server.
- **Live** – verbindet sich mit deinem RuView-Server (`/ws/sensing`) und
  zeichnet jede erkannte Person an die Stelle, die RuView meldet.

Umschalten unter **Quelle**. **3D** und **Plan** wechseln die Kamera; ziehen
dreht, Scrollen bzw. zwei Finger zoomen.

## Starten

Kein Build, nur statische Dateien:

```bash
cd ruview-map
python3 -m http.server 8000     # dann http://localhost:8000
```

Oder einfach [`../sites/ruview-map.html`](../sites/ruview-map.html)
doppelklicken – dieselbe Karte als eine Datei. Die musst du nach jeder
Änderung an `config.js` neu erzeugen:

```bash
node ruview-map/build-standalone.mjs
```

Three.js und die Schriften kommen vom CDN, der Browser braucht also Internet.

## Deine Wohnung eintragen

Alles steht in [`config.js`](config.js). Maße in Metern, Ursprung ist die
obere linke Ecke des Plans, x nach rechts, z nach unten. Pro Geschoss ein
Eintrag in `floors`:

```js
floors: [{
  id: 'eg', name: 'Erdgeschoss', short: 'EG',
  outline: [[0, 1.8], [4.7, 0], [13.7, 18.2], [9.8, 21], [0, 15]],  // Außenumriss, darf schräg sein
  rooms: [
    { id: 'eg-wohnen', name: 'Wohnzimmer', x: 0,   z: 0, w: 6.4, d: 8.2 },
    { id: 'eg-kueche', name: 'Küche',      x: 6.4, z: 0, w: 8,   d: 8.2 },
  ],
  doors: [
    { between: ['eg-wohnen', 'eg-kueche'], at: [6.4, 5.5], width: 1.6 },  // at = ungefähr die Türmitte
    { room: 'eg-wohnen', at: [0, 6], width: 1.0, label: 'Eingang' },
  ],
  nodes: [{ id: 1, name: 'ESP32 Wohnzimmer', x: 0.3, z: 4 }],             // id = node_id in RuView
}],
stairs: [{ between: ['eg-treppe', 'og-treppe'], at: [8.8, 12.6] }],
```

- Räume sind Rechtecke. Was über den `outline` hinausragt, wird
  abgeschnitten – so folgen Räume schrägen oder runden Außenwänden von selbst.
  Für Sonderformen geht auch `points: [[x, z], …]`.
- Wände zwischen zwei Räumen entstehen automatisch, Türen schneiden sie auf.
- `outdoor: true` macht aus einem Raum einen Balkon oder eine Loggia mit Geländer.
- `stairs` verbinden Geschosse; der Punkt `at` muss in beiden Räumen liegen.
  In der Demo laufen die Leute darüber hoch und runter.
- `scale` multipliziert alle Maße. Ist eine Wand in echt länger als im Plan,
  korrigierst du hier mit einer Zahl.
- Tippfehler (unbekannte Raum-ID, Tür in einer Wand, die es nicht gibt)
  zeigt die Karte oben in der Legende an.

Der mitgelieferte Grundriss ist aus einem Luftbild abgemessen (Maßstab
geschätzt, etwa ±20 %); die Räume darin sind erfunden.

**EG / OG / Alle** oben rechts wechselt das Geschoss; „Alle“ legt sie
nebeneinander, auf dem Handy untereinander.

## Live mit RuView

RuView misst über die ESP32-Boards und schickt jede Zehntelsekunde ein
`sensing_update` über WebSocket. Die Karte liest daraus `persons[].position`,
`motion_score`, `pose`, `vital_signs` und welche `nodes` gerade senden.

**Ohne Token.** Läuft der Sensing-Server ohne `RUVIEW_API_TOKEN`, reicht es,
unter **Quelle → Live** die Adresse einzutragen, zum Beispiel
`ws://localhost:3000/ws/sensing`. Greifst du über die IP des Rechners statt
über `localhost` zu, muss RuView diesen Host erlauben (`--allowed-host` bzw.
`SENSING_ALLOWED_HOSTS`), sonst antwortet er mit 421.

**Mit Token** (das Docker-Image verlangt einen): Ein Browser darf beim
WebSocket keinen Token mitschicken. Die Karte holt sich deshalb zuerst ein
Einmal-Ticket von `POST /api/v1/ws-ticket` – und das klappt nur, wenn die
Karte vom RuView-Server selbst kommt. Also den Ordner in RuViews UI-Verzeichnis
hängen:

```bash
export RUVIEW_API_TOKEN=$(openssl rand -hex 32)
docker run -p 127.0.0.1:3000:3000 -e RUVIEW_API_TOKEN \
  -v "$PWD/ruview-map:/app/ui/ruview-map:ro" \
  ruvnet/wifi-densepose:latest
```

Dann `http://localhost:3000/ui/ruview-map/` öffnen, **Quelle → Live**, das
Adressfeld leer lassen und den Token eintragen. Er bleibt nur in diesem
Browser gespeichert.

### Positionen ausrichten

RuView kennt keine Geschosse: alle Positionen landen im Geschoss aus
`live.floor`. RuView rechnet in seinem eigenen Koordinatensystem (Meter,
Mitte des Sensorfelds = 0/0). Im Live-Modus steht bei jeder Person in der Legende, was
RuView meldet („RuView x 1,3 · z −0,6“). Stell dich an zwei bekannte Stellen
deiner Wohnung, notier die Werte und pass in `config.js` unter
`live.transform` an:

| Wert | Wirkung |
|---|---|
| `origin` | Punkt im Plan, auf den RuViews 0/0 fällt (`null` = Mitte) |
| `rotationDeg` | dreht RuViews Achsen auf deinen Plan |
| `scale` | streckt oder staucht die Abstände |
| `flipX`, `flipZ` | spiegelt eine Achse |

Schickt RuView für eine Person keine Position, landet sie in dem Raum, den
`zoneToRoom` ihrer Zone zuordnet, sonst im `fallbackRoom` – die Legende
schreibt dann „Position unbekannt“ dazu.

## Was die Karte kann und was nicht

RuView selbst nennt eine Personenposition den „stärksten Signal-Peak“, keine
kalibrierte Ortung. Mit einem einzelnen ESP32 bekommst du realistisch nur „da
ist jemand“; mit mehreren Boards, am besten eins pro Raum, wird es raumgenau.
Rechne mit 1 bis 2 Metern Abweichung. Atmung und Puls misst RuView für den
ganzen Sensorbereich; die Karte hängt sie nur dann an eine Person, wenn genau
eine erkannt wird. Medizinisch geprüft ist davon nichts.

Den RuView-Server nicht ins Internet stellen: Er zeigt, wer wann zu Hause ist.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Seite, lädt Three.js per Import-Map |
| `config.js` | Grundriss, Türen, Sensoren, Live-Einstellungen |
| `app.js` | Szene, Demo-Simulation, RuView-Client, Legende |
| `style.css` | Gestaltung, helles und dunkles Theme |
| `build-standalone.mjs` | baut `sites/ruview-map.html` |
