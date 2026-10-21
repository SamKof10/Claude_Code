/*
 * RuView Map — Grundriss und Verbindung.
 *
 * Das ist die einzige Datei, die du für deine eigene Wohnung anpassen musst.
 * Alle Maße in Metern. Ursprung (0, 0) ist die obere linke Ecke des Plans:
 * x wächst nach rechts, z nach unten.
 *
 *   scale    Multipliziert alle Koordinaten. Ist die lange linke Wand in
 *            Wirklichkeit 15 statt 13,3 m lang, setz scale auf 15 / 13.3.
 *   floors   Ein Eintrag pro Geschoss:
 *     outline  Außenumriss als Punktliste, darf schräg oder rund sein.
 *     rooms    Rechtecke { x, z, w, d }. Alles, was über den Umriss hinausragt,
 *              wird abgeschnitten, so folgen Räume schrägen Außenwänden von
 *              selbst. Statt eines Rechtecks geht auch points: [[x, z], …].
 *              outdoor: true zeichnet ein Geländer statt Wänden (Loggia, Balkon).
 *     doors    Zwischen zwei Räumen mit gemeinsamer Wand
 *                { between: ['eg-flur', 'eg-bad'], at: [1.8, 10.2], width: 0.8 }
 *              oder in einer Außenwand
 *                { room: 'eg-eingang', at: [11.8, 19.6], width: 1.1 }
 *              `at` ist ein Punkt ungefähr in der Türmitte.
 *     nodes    Wo deine ESP32-Boards hängen. `id` = node_id aus RuView.
 *   stairs   Verbindet Räume in verschiedenen Geschossen; `at` liegt in beiden.
 *   live     Verbindung zum RuView-Server, siehe README.
 */
window.RUVIEW_MAP = {
  name: 'Zuhause',
  note: 'Umriss aus dem Luftbild abgeschätzt (Maßstab etwa ±20 %), die Räume sind erfunden.',
  scale: 1,
  wallHeight: 0.9, // Schnitthöhe der Wände in der 3D-Ansicht, damit man hineinsieht

  floors: [
    {
      id: 'eg',
      name: 'Erdgeschoss',
      short: 'EG',
      outline: OUTLINE(),
      rooms: [
        { id: 'eg-wohnen', name: 'Wohnzimmer', x: 0, z: 0, w: 6.4, d: 8.2 },
        { id: 'eg-kueche', name: 'Küche & Essen', x: 6.4, z: 0, w: 8, d: 8.2 },
        { id: 'eg-flur', name: 'Flur', x: 0, z: 8.2, w: 14, d: 2 },
        { id: 'eg-bad', name: 'Bad', x: 0, z: 10.2, w: 3.4, d: 4.8 },
        { id: 'eg-buero', name: 'Büro', x: 3.4, z: 10.2, w: 4.2, d: 4.8 },
        { id: 'eg-treppe', name: 'Treppe', x: 7.6, z: 10.2, w: 2.4, d: 4.8 },
        { id: 'eg-technik', name: 'Technik', x: 10, z: 10.2, w: 4, d: 4.8 },
        { id: 'eg-gast', name: 'Gästezimmer', x: 0, z: 15, w: 7.6, d: 7 },
        { id: 'eg-eingang', name: 'Eingang', x: 7.6, z: 15, w: 6.4, d: 7 },
      ],
      doors: [
        { between: ['eg-wohnen', 'eg-kueche'], at: [6.4, 5.5], width: 1.6 },
        { between: ['eg-wohnen', 'eg-flur'], at: [4.8, 8.2], width: 1.0 },
        { between: ['eg-kueche', 'eg-flur'], at: [8.6, 8.2], width: 0.9 },
        { between: ['eg-flur', 'eg-bad'], at: [1.8, 10.2], width: 0.8 },
        { between: ['eg-flur', 'eg-buero'], at: [5.6, 10.2], width: 0.9 },
        { between: ['eg-flur', 'eg-treppe'], at: [8.8, 10.2], width: 1.2 },
        { between: ['eg-flur', 'eg-technik'], at: [10.9, 10.2], width: 0.8 },
        { between: ['eg-treppe', 'eg-eingang'], at: [8.8, 15], width: 1.1 },
        { between: ['eg-eingang', 'eg-gast'], at: [7.6, 16.4], width: 0.9 },
        { room: 'eg-eingang', at: [11.8, 19.6], width: 1.1, label: 'Eingang' },
      ],
      nodes: [
        { id: 1, name: 'ESP32 Wohnzimmer', x: 0.3, z: 4.0 },
        { id: 2, name: 'ESP32 Flur EG', x: 6.0, z: 8.45 },
      ],
    },
    {
      id: 'og',
      name: '1. Obergeschoss',
      short: 'OG',
      outline: OUTLINE(),
      rooms: [
        { id: 'og-schlafen', name: 'Schlafzimmer', x: 0, z: 0, w: 6.4, d: 8.2 },
        { id: 'og-badeltern', name: 'Bad', x: 6.4, z: 0, w: 8, d: 4.5 },
        { id: 'og-zimmer1', name: 'Zimmer 1', x: 6.4, z: 4.5, w: 8, d: 3.7 },
        { id: 'og-flur', name: 'Flur', x: 0, z: 8.2, w: 14, d: 2 },
        { id: 'og-zimmer2', name: 'Zimmer 2', x: 0, z: 10.2, w: 4.4, d: 12 },
        { id: 'og-bad', name: 'Bad', x: 4.4, z: 10.2, w: 3.2, d: 3.8 },
        { id: 'og-hobby', name: 'Hobbyraum', x: 4.4, z: 14, w: 3.2, d: 8 },
        { id: 'og-treppe', name: 'Treppe', x: 7.6, z: 10.2, w: 2.4, d: 6.3 },
        { id: 'og-waesche', name: 'Wäsche', x: 10, z: 10.2, w: 4, d: 6.3 },
        { id: 'og-loggia', name: 'Loggia', x: 7.6, z: 16.5, w: 6.4, d: 5.5, outdoor: true },
      ],
      doors: [
        { between: ['og-schlafen', 'og-flur'], at: [4.8, 8.2], width: 0.9 },
        { between: ['og-schlafen', 'og-badeltern'], at: [6.4, 3.0], width: 0.8 },
        { between: ['og-zimmer1', 'og-flur'], at: [8.8, 8.2], width: 0.9 },
        { between: ['og-zimmer2', 'og-flur'], at: [2.2, 10.2], width: 0.9 },
        { between: ['og-bad', 'og-flur'], at: [6.0, 10.2], width: 0.8 },
        { between: ['og-treppe', 'og-flur'], at: [8.8, 10.2], width: 1.2 },
        { between: ['og-waesche', 'og-flur'], at: [10.9, 10.2], width: 0.8 },
        { between: ['og-hobby', 'og-treppe'], at: [7.6, 15.2], width: 0.9 },
        { between: ['og-loggia', 'og-treppe'], at: [8.8, 16.5], width: 1.0 },
      ],
      nodes: [
        { id: 3, name: 'ESP32 Flur OG', x: 6.0, z: 8.45 },
        { id: 4, name: 'ESP32 Schlafzimmer', x: 0.3, z: 4.0 },
      ],
    },
  ],

  stairs: [
    { between: ['eg-treppe', 'og-treppe'], at: [8.8, 12.6], size: [1.1, 3.4] },
  ],

  // Wie im Demo-Modus die Leute leben: Raum-ID → Gewicht und Haltung.
  // Nicht aufgeführte Räume bekommen Gewicht 1 und stehen.
  demo: {
    people: 3,
    rooms: {
      'eg-wohnen': { weight: 5, pose: 'sitting' },
      'eg-kueche': { weight: 4, pose: 'standing' },
      'eg-buero': { weight: 2, pose: 'sitting' },
      'eg-bad': { weight: 1, pose: 'standing' },
      'eg-gast': { weight: 0.5, pose: 'sitting' },
      'eg-eingang': { weight: 0.4, pose: 'standing' },
      'eg-technik': { weight: 0.3, pose: 'standing' },
      'eg-flur': { weight: 0.2, pose: 'standing' },
      'eg-treppe': { weight: 0, pose: 'standing' },
      'og-schlafen': { weight: 2, pose: 'lying' },
      'og-zimmer1': { weight: 3, pose: 'sitting' },
      'og-zimmer2': { weight: 3, pose: 'lying' },
      'og-hobby': { weight: 1.5, pose: 'standing' },
      'og-bad': { weight: 1, pose: 'standing' },
      'og-badeltern': { weight: 0.8, pose: 'standing' },
      'og-loggia': { weight: 1, pose: 'standing' },
      'og-waesche': { weight: 0.5, pose: 'standing' },
      'og-flur': { weight: 0.2, pose: 'standing' },
      'og-treppe': { weight: 0, pose: 'standing' },
    },
  },

  live: {
    // Leer lassen = automatisch: läuft die Seite auf dem RuView-Server selbst
    // (http://…:3000/ui/ruview-map/), wird derselbe Host genommen, sonst
    // ws://localhost:3000/ws/sensing.
    url: '',

    // In welchem Geschoss die RuView-Positionen liegen.
    floor: 'eg',

    // RuView liefert Positionen in seinem eigenen Koordinatensystem (Meter,
    // Mitte des Sensorfelds = 0/0). So landen sie auf deinem Plan:
    //   plan = origin + rotate(rotationDeg) · (scale · ruview)
    // origin: null = Mitte des Geschosses. Kalibrieren: siehe README.
    transform: { origin: null, scale: 1, rotationDeg: 0, flipX: false, flipZ: false },

    // Optional: RuView-Zonennamen auf Räume abbilden, z. B. { zone_1: 'eg-wohnen' }.
    // Wird benutzt, wenn RuView für eine Person keine Position mitschickt.
    zoneToRoom: {},

    // Raum für Personen ohne Position und ohne Zone.
    fallbackRoom: 'eg-wohnen',
  },
};

// Außenumriss beider Geschosse, aus dem Luftbild abgemessen (32 px ≈ 1 m),
// so gedreht, dass die lange Westwand senkrecht steht. Die Ostseite ist rund.
function OUTLINE() {
  return [
    [0, 1.77], [4.7, 0], [6.2, 0.95], [8.0, 2.6], [9.25, 4.3], [10.15, 6.05],
    [10.95, 7.85], [11.6, 9.65], [12.15, 11.5], [12.65, 13.3], [13.15, 15.15],
    [13.5, 16.95], [13.72, 18.15], [9.8, 21.05], [0, 15.05],
  ];
}
