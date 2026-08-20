/** German copy that hangs off catalogue ids — keep the keys, translate the values. */
export const deContent = {
  finishes: {
    graphite: { name: "Graphit", note: "Gestrahlt eloxiert, im Schatten fast schwarz." },
    alabaster: { name: "Alabaster", note: "Glasperlgestrahlt, matt. Verschwindet vor heller Wand." },
    sand: { name: "Sand", note: "Warm champagnerfarben eloxiert, feine lineare Struktur." },
  },

  models: {
    arc: {
      tagline: "Für einen Schreibtisch, an dem man sitzt.",
      highlights: ["58 cm Lichtleiste", "1100 lm bei 4000 K", "Deckt einen Arbeitsplatz ab"],
      coverage: "120 × 60 cm",
    },
    "arc-max": {
      tagline: "Für einen Schreibtisch, an dem man lebt.",
      highlights: ["84 cm Lichtleiste", "1750 lm bei 4000 K", "Deckt zwei Monitore ab"],
      coverage: "180 × 75 cm",
    },
  },

  accessories: {
    clip: {
      title: "Monitorhalterung",
      tagline: "Für den Schreibtisch, auf dem kein Platz mehr ist.",
      summary:
        "Setzt die ARC auf die Oberkante Ihres Monitors, statt daneben. Der Fuß liegt auf dem Panel auf und wird von einem Gegengewicht gehalten — ohne Schrauben, ohne Kleben, auch auf gebogenen Displays.",
      bullets: [
        "Passt auf 99,9 % aller Monitore",
        "Panelstärke 6 – 42 mm, auch gebogen ab 1500R",
        "Neigung ±25°, reibungsgebremst",
      ],
      specs: [
        { label: "Passend für", value: "99,9 % aller Monitore, 24 – 49 Zoll" },
        { label: "Klemmbereich", value: "6 – 42 mm Panelstärke" },
        { label: "Neigung", value: "±25°, reibungsgebremst" },
        { label: "Gewicht", value: "340 g inkl. Gegengewicht" },
        { label: "Material", value: "Aluminium, Silikonauflage" },
      ],
    },
    arch: {
      title: "Überkopfstativ",
      tagline: "Steht auf dem Tisch, leuchtet von oben.",
      summary:
        "Ein Auslegerbogen mit beschwertem Fuß. Die Leiste hängt 62 cm über der Platte, mittig über Ihnen, und wirft das Licht senkrecht nach unten — kein Schatten von der eigenen Hand, und nichts im Blickfeld.",
      bullets: [
        "Auskragung bis 48 cm, Höhe bis 74 cm",
        "3,1 kg Stahlfuß, kippsicher",
        "Höhe und Auslage verstellbar",
      ],
      specs: [
        { label: "Höhe", value: "52 – 74 cm, verstellbar" },
        { label: "Auskragung", value: "34 – 48 cm" },
        { label: "Fuß", value: "3,1 kg Stahl, Filzauflage" },
        { label: "Standfläche", value: "22 cm Durchmesser" },
        { label: "Material", value: "Aluminium, Stahl" },
      ],
    },
  },

  features: [
    {
      kicker: "Sonnensynchron",
      title: "Sie weiß, welche Uhrzeit Ihr Körper vermutet",
      body: "Die ARC berechnet Sonnenauf- und -untergang lokal auf dem Gerät und bewegt das Spektrum mit ihnen. Kalt und hell, wenn Sie denken müssen. Bernsteinwarm, wenn der Abend anfängt. Passt der Standard nicht zu Ihrem Feierabend, verschieben Sie den Umschaltpunkt in der App — sonst müssen Sie nie etwas anfassen.",
      spec: [
        { label: "Übergang", value: "90 min Rampe" },
        { label: "Auflösung", value: "20-K-Schritte" },
      ],
    },
    {
      kicker: "Spektralmaschine",
      title: "Fünf Kanäle, weil zwei nicht die Wahrheit sagen können",
      body: "Die meisten dimmbaren Leuchten mischen ein warmes und ein kaltes Weiß und nennen das Tunable White. Deshalb wird Haut grau und Holz flach. Die ARC ergänzt Amber, Tiefrot und Cyan und löst die Mischung bei jedem Schritt neu — CRI 97 über den gesamten Bereich, nicht nur an den Enden.",
      spec: [
        { label: "CRI", value: "97 (R9 > 90)" },
        { label: "Kanäle", value: "5 unabhängige" },
      ],
    },
    {
      kicker: "Optik",
      title: "Licht auf dem Tisch, nicht in den Augen",
      body: "Eine 58 cm lange asymmetrische Linse wirft das Licht nach vorn und unten auf die Arbeitsfläche und schneidet es oberhalb von 65° hart ab. Der Schreibtisch ist gleichmäßig hell, auf dem Monitor spiegelt nichts, und wer Ihnen gegenübersitzt, sieht einen beleuchteten Tisch statt einer Lampe.",
      spec: [
        { label: "Abstrahlgrenze", value: "65°" },
        { label: "Gleichmäßigkeit", value: "0,8 min/avg" },
      ],
    },
    {
      kicker: "Das Rad",
      title: "Ein Bedienelement, und es tut das Naheliegende",
      body: "Drehen für Helligkeit. Drücken und drehen für Farbtemperatur. Kurz drücken, um den aktuellen Stand bis zum Morgen gegen den Zeitplan zu halten. Kein Menü, kein Moduswechsel, kein zweiter Druck mit anderer Bedeutung — das Rad ist aus einem Stück gefräst und so gewichtet, dass es sanft ausläuft.",
      spec: [
        { label: "Rastung", value: "Keine — stufenlos" },
        { label: "Weg", value: "270° nutzbar" },
      ],
    },
  ],

  reviews: [
    {
      role: "Architektin",
      location: "Rotterdam",
      title: "Der Wechsel um 21 Uhr ist der eigentliche Punkt",
      body: "Gekauft habe ich sie wegen der Lichtqualität, geblieben bin ich wegen des Zeitplans. Gegen neun fällt die Leiste in etwas, das Kerzenlicht ziemlich nahekommt, und ich merke, dass ich aufhöre zu blinzeln. Details zeichnen geht bei 2700 K trotzdem einwandfrei.",
      ownedFor: "7 Monaten",
    },
    {
      role: "Colorist",
      location: "Berlin",
      title: "Besteht den ColorChecker, womit ich nicht gerechnet hatte",
      body: "Ich messe alles gegen eine Farbkarte, bevor es in meine Suite darf. Hauttöne halten bei 5000 K, im Mittelton kippt nichts ins Grüne. Die erste Leuchte, die ich nicht filtern musste.",
      ownedFor: "einem Jahr",
    },
    {
      role: "Doktorandin",
      location: "Zürich",
      title: "Hervorragendes Licht, App nur solide",
      body: "Die Hardware ist wirklich schön, und der Automatikmodus hat meinem Schlaf mehr geholfen, als ich zugeben wollte. Die App brauchte zwei Updates, bis der Zeitplan-Editor fertig wirkte. Lohnt sich, ist aber nicht makellos.",
      ownedFor: "5 Monaten",
    },
    {
      role: "Softwareentwickler",
      location: "Oslo",
      title: "Kein Flimmern in der Kamera",
      body: "Ich bin den halben Tag in Calls, und jede vorherige Lampe hat im Bild gestreift. Diese ist auf jeder Helligkeitsstufe sauber, offenbar wegen der DC-Dimmung. Kleinigkeit, die ein tägliches Ärgernis beseitigt hat.",
      ownedFor: "4 Monaten",
    },
    {
      role: "Goldschmiedin",
      location: "Wien",
      title: "Endlich sehe ich das Metall richtig",
      body: "Werkbankarbeit braucht ehrliche Farbe, und zwar viel davon. Bei voller Leistung deckt die ARC MAX die ganze Bank ohne Hotspot ab, und dank des hohen CRI sieht ein Stein hier so aus wie draußen.",
      ownedFor: "9 Monaten",
    },
    {
      role: "Texter",
      location: "Malmö",
      title: "Schönes Objekt, überlegte Anschaffung",
      body: "Für eine Schreibtischleuchte ist das viel Geld, und ich habe gezögert. Ein halbes Jahr später benutze ich sie täglich und der Schreibtisch fühlt sich abends anders an. Ich würde wieder kaufen, aber ich würde nicht so tun, als wäre es günstig.",
      ownedFor: "6 Monaten",
    },
  ],

  faq: [
    {
      q: "Was kann die App?",
      a: "Ein- und ausschalten, ohne aufzustehen. Helligkeit und Farbtemperatur von Hand setzen. Und vor allem: festlegen, ab wann der Abendmodus greift — in 15-Minuten-Schritten zwischen 17 und 23 Uhr, für jeden Wochentag getrennt. Dazu Presets und Firmware-Updates. Verbunden wird direkt per Bluetooth, ohne Konto und ohne Cloud.",
    },
    {
      q: "Funktioniert sie auch ohne Handy?",
      a: "Vollständig. Ab Werk läuft die ARC ihren Sonnenverlauf über die eigene Uhr, und das Rad am Sockel überschreibt Helligkeit und Farbtemperatur jederzeit — drehen für Helligkeit, drücken und drehen für Farbtemperatur. Leeres Handy, kein WLAN, App nie installiert: die Leuchte macht trotzdem, was sie soll.",
    },
    {
      q: "Woher weiß sie, wo die Sonne steht?",
      a: "Bei der Einrichtung geben Sie einmal einen Standort an. Danach berechnet sie Sonnenauf- und -untergang aus einer Sonnenstandstabelle direkt auf dem Gerät — ohne Netzanfrage, ohne Standortverfolgung, und über die Zeitumstellung hinweg korrekt.",
    },
    {
      q: "Ist das wirklich besser als ein gutes Leuchtmittel?",
      a: "Für Raumlicht ist ein gutes Leuchtmittel völlig in Ordnung. Die ARC ist für den einen Meter Schreibtisch vor Ihnen gebaut: CRI 97, damit Farben ehrlich bleiben, eine Optik, die das Licht auf die Arbeit legt statt in die Augen, flimmerfreies Dimmen bis 0,1 % und ein Spektrum, das sich über den Tag verändert. Wenn Ihnen davon nichts wichtig ist, kaufen Sie das Leuchtmittel.",
    },
    {
      q: "Passt sie auf meinen Schreibtisch?",
      a: "Die ARC hat eine 58-cm-Leiste und beleuchtet rund 120 × 60 cm — ein Monitor plus Tastatur. Die ARC MAX hat 84 cm für 180 × 75 cm, also einen Dual-Monitor-Aufbau. Beide klemmen an Platten bis 62 mm; ein beschwerter Standfuß liegt bei. Mit dem CLIP hängt sie am Monitor, mit dem ARCH über dem Tisch.",
    },
    {
      q: "Was ist mit müden Augen am Abend?",
      a: "Genau dafür gibt es sie. Nach Sonnenuntergang geht die ARC auf 1800–2200 K und hält den melanopischen Anteil niedrig, damit das Licht Ihrem Körper nicht länger Mittag meldet. Feine Details bleiben lesbar — sie wird warm, nicht dunkel.",
    },
    {
      q: "Wie lange hält sie?",
      a: "Das LED-Array ist mit L90 bei 50.000 Stunden angegeben: nach etwa siebzehn Jahren zu acht Stunden täglich liefert es noch 90 % der ursprünglichen Leistung. Treiber, Diffusor und Rad sind einzeln tauschbar, Ersatzteile halten wir zehn Jahre vor.",
    },
    {
      q: "Wie läuft die Rückgabe?",
      a: "Sechzig Nächte. Nutzen Sie sie an Ihrem echten Schreibtisch über einen Jahreszeitenwechsel hinweg — wenn sie nicht passt, organisieren wir die Abholung und erstatten vollständig, inklusive Hinversand.",
    },
    {
      q: "Liefert ihr weltweit?",
      a: "Ja. Wir versenden in über 90 Länder, Versand ist im Preis enthalten. Innerhalb der EU, in die Schweiz, nach Großbritannien und Norwegen liefern wir in zwei bis vier Werktagen; in die USA, nach Kanada, Australien und Japan in vier bis sechs. Zoll und Einfuhrumsatzsteuer sind im angezeigten Preis bereits enthalten — es kommt bei der Zustellung nichts nach. Das Netzteil liegt mit dem passenden Steckertyp für Ihr Land bei.",
    },
  ],

  specs: [
    {
      group: "Licht",
      rows: [
        { label: "Farbtemperatur", value: "1800 – 6500 K, stufenlos" },
        { label: "Farbwiedergabe", value: "CRI 97, R9 > 90" },
        { label: "Lichtstrom", value: "1100 lm (ARC) · 1750 lm (ARC MAX)" },
        { label: "Dimmung", value: "DC, flimmerfrei, 100 % – 0,1 %" },
        { label: "Beleuchtungsstärke auf 40 cm", value: "820 lx (ARC) · 1150 lx (ARC MAX)" },
        { label: "Blendung", value: "UGR < 16" },
      ],
    },
    {
      group: "Körper",
      rows: [
        { label: "Leistenlänge", value: "58 cm (ARC) · 84 cm (ARC MAX)" },
        { label: "Höhenbereich", value: "38 – 54 cm" },
        { label: "Material", value: "Stranggepresstes Aluminium 6063, Messinggewicht" },
        { label: "Oberfläche", value: "Eloxiert Typ II, glasperlgestrahlt" },
        { label: "Gewicht", value: "2,4 kg (ARC) · 3,1 kg (ARC MAX)" },
        { label: "Montage", value: "Tischklemme bis 62 mm, Standfuß im Lieferumfang" },
      ],
    },
    {
      group: "Elektronik",
      rows: [
        { label: "LED-Array", value: "5 Kanäle: 2 × Weiß, Amber, Tiefrot, Cyan" },
        { label: "Sensorik", value: "Umgebungshelligkeit, Präsenz, Farbtemperatur" },
        { label: "Funk", value: "Bluetooth LE 5.3, Matter-ready" },
        { label: "Leistung", value: "24 V DC, 32 W Spitze, USB-C-PD-Eingang" },
        { label: "Lebensdauer", value: "L90 bei 50.000 Stunden" },
        { label: "Firmware", value: "Over-the-Air, signiert" },
      ],
    },
    {
      group: "Steuerung",
      rows: [
        { label: "App", value: "AUREL für iOS 16+ und Android 10+" },
        { label: "Funktionen", value: "Ein/Aus, Helligkeit, Farbtemperatur, Zeitplan, Presets" },
        { label: "Abendmodus", value: "Frei wählbar 17:00 – 23:00, 15-Minuten-Schritte, pro Wochentag" },
        { label: "Verbindung", value: "Bluetooth LE 5.3, direkt — kein Konto, keine Cloud" },
        { label: "Reichweite", value: "ca. 10 m, ein Raum" },
        { label: "Ohne Handy", value: "Rad am Sockel steuert Helligkeit und Farbtemperatur" },
      ],
    },
    {
      group: "Versand & Karton",
      rows: [
        { label: "Enthalten", value: "ARC, Tischklemme, Standfuß, 2 m USB-C-Kabel, 45-W-Netzteil" },
        { label: "Netzteil", value: "Steckertyp passend zum Lieferland" },
        { label: "Versand", value: "Über 90 Länder, im Preis enthalten" },
        { label: "Laufzeit", value: "2 – 4 Werktage EU/UK/CH · 4 – 6 weltweit" },
        { label: "Zoll", value: "Zoll und Einfuhrumsatzsteuer inklusive" },
        { label: "Garantie", value: "5 Jahre, Ersatzteile 10 Jahre" },
        { label: "Testphase", value: "60 Nächte, Rückversand bezahlt" },
        { label: "Zertifizierung", value: "CE, UKCA, FCC, RoHS, TÜV photobiologisch RG0" },
      ],
    },
  ],
} as const;
