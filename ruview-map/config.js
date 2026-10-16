/*
 * RuView Map — Grundriss und Verbindung.
 *
 * Diese Datei ist das Einzige, was du anpassen musst, um deine eigene Wohnung
 * zu zeigen. Alle Maße in Metern. Der Ursprung (0, 0) ist die obere linke Ecke
 * des Plans: x wächst nach rechts (Osten), z nach unten (Süden).
 *
 *   rooms  Rechtecke. x/z = obere linke Ecke, w = Breite (x), d = Tiefe (z).
 *          outdoor: true zeichnet ein Geländer statt Wänden (Balkon, Terrasse).
 *   doors  Entweder zwischen zwei Räumen, die sich eine Wand teilen
 *            { between: ['flur', 'bad'], width: 0.8, at: 0.6 }
 *          oder in einer Außenwand
 *            { room: 'flur', side: 'east', width: 1.0, at: 0.7 }
 *          `at` ist die Türmitte, gemessen vom Anfang der Wand (oben bzw.
 *          links). Ohne `at` sitzt die Tür in der Mitte.
 *   nodes  Wo deine ESP32-Boards hängen. `id` = node_id aus RuView.
 *   live   Verbindung zum RuView-Server, siehe README.
 */
window.RUVIEW_MAP = {
  name: 'Beispielwohnung',
  wallHeight: 0.9, // Schnitthöhe der Wände in der 3D-Ansicht, damit man hineinsieht

  rooms: [
    { id: 'balkon', name: 'Balkon', x: 0.8, z: 0, w: 4.2, d: 1.6, outdoor: true },
    { id: 'wohnen', name: 'Wohnzimmer', x: 0, z: 1.6, w: 5.8, d: 4.2 },
    { id: 'kueche', name: 'Küche', x: 5.8, z: 1.6, w: 2.8, d: 4.2 },
    { id: 'bad', name: 'Bad', x: 8.6, z: 1.6, w: 2.0, d: 4.2 },
    { id: 'abstell', name: 'Abstellraum', x: 0, z: 5.8, w: 1.8, d: 1.4 },
    { id: 'flur', name: 'Flur', x: 1.8, z: 5.8, w: 8.8, d: 1.4 },
    { id: 'schlafen', name: 'Schlafzimmer', x: 0, z: 7.2, w: 4.4, d: 3.8 },
    { id: 'arbeit', name: 'Arbeitszimmer', x: 4.4, z: 7.2, w: 3.2, d: 3.8 },
    { id: 'gast', name: 'Gästezimmer', x: 7.6, z: 7.2, w: 3.0, d: 3.8 },
  ],

  doors: [
    { between: ['wohnen', 'balkon'], width: 1.0 },
    { between: ['wohnen', 'kueche'], width: 1.0, at: 1.2 },
    { between: ['wohnen', 'flur'], width: 1.0, at: 3.0 },
    { between: ['kueche', 'flur'], width: 0.9 },
    { between: ['bad', 'flur'], width: 0.8 },
    { between: ['abstell', 'flur'], width: 0.7 },
    { between: ['schlafen', 'flur'], width: 0.9, at: 1.6 },
    { between: ['arbeit', 'flur'], width: 0.9 },
    { between: ['gast', 'flur'], width: 0.9 },
    { room: 'flur', side: 'east', width: 1.0, label: 'Eingang' },
  ],

  nodes: [
    { id: 1, name: 'ESP32 Wohnzimmer', x: 0.25, z: 1.85 },
    { id: 2, name: 'ESP32 Flur', x: 6.2, z: 6.05 },
    { id: 3, name: 'ESP32 Schlafzimmer', x: 4.15, z: 10.75 },
  ],

  // Wie im Demo-Modus die Leute leben: Raum-ID → Gewicht und Haltung.
  demo: {
    people: 3,
    rooms: {
      wohnen: { weight: 5, pose: 'sitting' },
      kueche: { weight: 4, pose: 'standing' },
      arbeit: { weight: 3, pose: 'sitting' },
      schlafen: { weight: 2, pose: 'lying' },
      bad: { weight: 2, pose: 'standing' },
      balkon: { weight: 1, pose: 'standing' },
      gast: { weight: 1, pose: 'sitting' },
      abstell: { weight: 0.5, pose: 'standing' },
      flur: { weight: 0.3, pose: 'standing' },
    },
  },

  live: {
    // Leer lassen = automatisch: läuft die Seite auf dem RuView-Server selbst
    // (http://…:3000/ui/ruview-map/), wird derselbe Host genommen, sonst
    // ws://localhost:3000/ws/sensing.
    url: '',

    // RuView liefert Positionen in seinem eigenen Koordinatensystem (Meter,
    // Mitte des Sensorfelds = 0/0). So landen sie auf deinem Plan:
    //   plan = origin + rotate(rotationDeg) · (scale · ruview)
    // origin: null = Mitte des Grundrisses. Kalibrieren: siehe README.
    transform: { origin: null, scale: 1, rotationDeg: 0, flipX: false, flipZ: false },

    // Optional: RuView-Zonennamen auf Räume abbilden, z. B. { zone_1: 'wohnen' }.
    // Wird benutzt, wenn RuView für eine Person keine Position mitschickt.
    zoneToRoom: {},

    // Raum für Personen ohne Position und ohne Zone.
    fallbackRoom: 'wohnen',
  },
};
