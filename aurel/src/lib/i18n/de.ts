/**
 * German — the reference dictionary. `Dict` is derived from this object, so
 * every other locale is checked against it at compile time: a missing or
 * misspelled key is a build error, not a blank spot on the page.
 */
import { deContent } from "./de.content";

export const de = {
  ...deContent,
  meta: {
    title: "AUREL — Licht, das weiß, wie spät es ist",
    titleTemplate: "%s · AUREL",
    description:
      "Die AUREL ARC ist eine zirkadiane Schreibtischleuchte: 1800 bis 6500 Kelvin, CRI 97, flimmerfrei. Sie folgt der Sonne, damit Ihr Abend nicht auf Mittag beleuchtet ist.",
    productTitle: "ARC — zirkadiane Schreibtischleuchte",
    productDescription:
      "AUREL ARC konfigurieren: zwei Längen, drei Oberflächen. 1800–6500 K, CRI 97, flimmerfrei. 60 Nächte testen, weltweiter Versand inklusive.",
    checkoutTitle: "Kasse",
    checkoutDescription: "Bestellung abschließen — Versand inklusive, 60 Nächte testen.",
  },

  toast: { added: "{name} hinzugefügt" },

  common: {
    addToCart: "In den Warenkorb",
    added: "Hinzugefügt",
    soldOut: "Nicht verfügbar",
    buyNow: "Jetzt kaufen",
    from: "ab",
    trust: ["60 Nächte testen", "Versand weltweit inklusive", "5 Jahre Garantie"],
    inStock: "Versand in 48 Stunden",
    restock: "Wieder ab 12. März",
    finishLabel: "Oberfläche",
    skipToContent: "Zum Inhalt springen",
  },

  nav: {
    links: {
      produkt: "Produkt",
      features: "Features",
      technologie: "Technologie",
      zubehoer: "Zubehör",
      reviews: "Reviews",
      faq: "FAQ",
    },
    buy: "Jetzt kaufen",
    buyFrom: "Jetzt kaufen — ab {price}",
    home: "AUREL — Startseite",
    openCart: "Warenkorb öffnen, {count} Artikel",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    navigation: "Navigation",
    language: "Sprache",
    languageOpen: "Sprache wählen — aktuell {name}",
    shipsTo: "Versand in über 90 Länder",
  },

  hero: {
    badge: "ARC MAX ist da — 84 cm Lichtleiste",
    headline: ["Licht, das weiß,", "wie spät es ist."],
    lede: "Die ARC folgt der Sonne: kalt und hell zum Denken, bernsteinwarm am Abend. Wann genau umgeschaltet wird, bestimmen Sie am Handy.",
    ctaSecondary: "Produkt entdecken",
    floaters: [
      { label: "CRI 97", sub: "Farbwiedergabe" },
      { label: "1800—6500 K", sub: "stufenlos" },
      { label: "0,1 %", sub: "flimmerfrei dimmbar" },
      { label: "UGR < 16", sub: "blendfrei" },
    ],
    timeOfDay: "Tageszeit",
    now: "jetzt",
    colourTemp: "Farbtemperatur",
    sunrise: "06:00 · Sonnenaufgang",
    bedtime: "23:00 · Bettzeit",
    scrubHint: "Ziehen Sie den Regler durch den Tag — genau das macht die ARC von allein.",
    scrubAria: "Tageszeit wählen — die Leuchte folgt",
    scrubValue: "{clock} Uhr, {kelvin} Kelvin",
    lampAlt: "Die AUREL ARC MAX, deren Farbtemperatur dem gewählten Tageszeitpunkt folgt",
  },

  shop: {
    kicker: "Direkt mitnehmen",
    title: "Zubehör, direkt von hier.",
    lede: "Die beiden Halterungen können Sie sofort mitbestellen — die Leuchte konfigurieren Sie eine Sektion weiter unten.",
    seeAll: "Alle Varianten ansehen",
  },

  press: [
    { outlet: "MONOCLE", quote: "Die erste Schreibtischleuchte, die den Schreibtisch verdient" },
    { outlet: "DEZEEN", quote: "Zurückhaltung als Entwurfsstrategie" },
    { outlet: "WALLPAPER*", quote: "Das leise bestbeleuchtete Objekt des Jahres" },
    { outlet: "CORE77", quote: "Technik, die man im Rad spürt" },
    { outlet: "DISEGNO", quote: "Eine Leuchte, die für Langsamkeit argumentiert" },
    { outlet: "IF DESIGN", quote: "Gold Award 2026 — Workspace" },
  ],

  problem: {
    kicker: "Das Problem",
    title: "Ihr Abend ist auf Mittag beleuchtet.",
    body1:
      "Ihr Körper liest Licht als Uhrzeit. Kaltes, helles Licht heißt Mittag: wach bleiben, weiterarbeiten. Genau dieses Licht steht bei den meisten Menschen um elf Uhr abends noch an der Decke — und dann wundern wir uns, dass wir um eins noch wach liegen.",
    body2:
      "Das Gegenmittel ist nicht dunkler. Es ist wärmer — bei genug Licht, um noch etwas zu sehen. Nur kann das kaum eine Schreibtischleuchte, und keine tut es von allein.",
    evidence: [
      {
        label: "Deckenlicht um 23 Uhr",
        note: "Was eine übliche Bürodeckenleuchte abstrahlt — dieselbe Farbtemperatur wie der Mittagshimmel.",
      },
      {
        label: "arbeiten abends kaltweiß",
        note: "Von 2.417 Kund:innen, die wir vor dem Kauf befragt haben.",
      },
      {
        label: "bis zum Einschlafen",
        note: "Durchschnittlich berichtete Verzögerung nach zwei Stunden hellem Abendlicht.",
      },
    ],
    source: "Quelle: AUREL Kundenbefragung 2025, n = 2.417 · Werte gerundet",
  },

  solution: {
    kicker: "Die Lösung",
    title: "Also haben wir den Sonnenverlauf nachgebaut.",
    lede: "Die ARC kennt Ihren Standort und rechnet daraus jeden Tag neu aus, wann die Sonne auf- und untergeht. Dann fährt sie ihr Spektrum an diesem Verlauf entlang — über neunzig Minuten pro Übergang, in Schritten von zwanzig Kelvin. Langsam genug, dass Sie es nicht sehen. Deutlich genug, dass Sie es merken.",
    chartAlt: "Farbtemperatur im Tagesverlauf",
    stops: ["Aufwachen", "Konzentration", "Mittagshoch", "Übergang", "Herunterfahren"],
  },

  productReveal: {
    kicker: "Das Produkt",
    title: "Eine Leiste, ein Rad, kein Menü.",
    lede: "Aluminium in einem Strang gepresst, glasperlgestrahlt und eloxiert. Ein Messinggewicht im Sockel, damit nichts wandert, wenn Sie am Kabel ziehen. Sonst nichts.",
    currentFinish: "Aktuelle Oberfläche",
    configure: "Konfigurieren und kaufen",
    summary: "{finishes} Oberflächen · 2 Längen · Versand in 48 Stunden",
  },

  featuresSection: {
    kicker: "Features",
    title: "Vier Entscheidungen, die den Unterschied machen.",
    lede: "Nichts davon ist neu erfunden. Es ist nur selten jemand bereit, alle vier gleichzeitig zu bezahlen.",
  },

  smart: {
    kicker: "Steuerung",
    title: "Der Abend beginnt, wann Sie es sagen.",
    lede: "Ab Werk richtet sich die ARC nach dem Sonnenuntergang. Wenn Ihr Abend anders läuft, verschieben Sie den Umschaltpunkt am Handy — und schalten von dort auch einfach aus, wenn Sie schon liegen.",
    room: "Arbeitszimmer",
    on: "An",
    off: "Aus",
    tapToTurnOn: "Angetippt zum Einschalten",
    eveningFrom: "Abendmodus ab",
    earlier: "Abendmodus früher",
    later: "Abendmodus später",
    states: { off: "Aus", evening: "Abendmodus", shifting: "Wechselt", daylight: "Tageslicht" },
    deskAt: "Ihr Schreibtisch um {clock} Uhr",
    switchedOff: "Ausgeschaltet",
    points: [
      { t: "Ein und aus", d: "Vom Handy, ohne aufzustehen" },
      { t: "Eigener Zeitplan", d: "Umschaltpunkt in 15-Minuten-Schritten" },
      { t: "Ohne Konto", d: "Direkt per Bluetooth, keine Cloud" },
    ],
    tryIt:
      "Probieren Sie es aus: Schalten Sie oben aus, oder verschieben Sie den Umschaltpunkt — die Leuchte daneben zeigt, was um halb neun auf Ihrem Schreibtisch passiert.",
  },

  technology: {
    kicker: "Technologie",
    title: "Der schwierige Teil steckt im Gehäuse.",
    lede: "Ein Spektrum über den ganzen Bereich sauber zu halten ist ein Regelungsproblem, kein Designproblem. Hier ist, was dafür nötig war.",
    status: "Systemstatus · ARC MAX",
    firmware: "Firmware 4.2.1 · signiert",
    readouts: {
      colourTemp: "Farbtemperatur",
      illuminance: "Beleuchtungsstärke",
      duty: "Kanal-Duty",
      heatsink: "Kühlkörper",
    },
    spd: "Spektrale Verteilung bei {kelvin} K",
    cri: "CRI 97 · R9 92",
    pillars: [
      {
        title: "Sonnenstandstabelle an Bord",
        body: "Auf- und Untergang werden lokal gerechnet, aus Breitengrad und Datum. Kein Server, keine Standortübertragung, korrekt über die Zeitumstellung.",
      },
      {
        title: "Regelkreis mit 400 Hz",
        body: "Jeder der fünf Kanäle wird einzeln geregelt und gegen einen Referenzsensor nachgeführt — die Mischung bleibt über die Lebensdauer stabil, nicht nur am ersten Tag.",
      },
      {
        title: "Temperaturkompensation",
        body: "LEDs verschieben ihre Farbe, wenn sie warm werden. Ein Sensor im Kühlkörper korrigiert die Mischung mit, statt die Abweichung zu ignorieren.",
      },
      {
        title: "Bluetooth LE, Matter-ready",
        body: "Verbindung nur, wenn Sie sie brauchen. Die Leuchte funktioniert vollständig offline; die App ist ein Editor, kein Betriebssystem.",
      },
    ],
    stats: [
      { prefix: "", suffix: " h", label: "L90-Lebensdauer" },
      { prefix: "", suffix: " Jahre", label: "Garantie" },
      { prefix: "", suffix: " Jahre", label: "Ersatzteile" },
      { prefix: "CRI ", suffix: "", label: "über den ganzen Bereich" },
    ],
  },

  variants: {
    kicker: "Varianten & Preis",
    title: "Zwei Längen, drei Oberflächen.",
    lede: "Messen Sie Ihren Schreibtisch, dann ist die Entscheidung schnell getroffen. Die Elektronik ist in beiden identisch.",
    chooseModel: "Modell wählen",
  },

  accessoriesSection: {
    kicker: "Zubehör",
    title: "Dieselbe Leuchte, woanders aufgehängt.",
    lede: "Nicht jeder Schreibtisch hat Platz für einen Standfuß, und nicht jede Arbeit will Licht von vorn. Zwei Halterungen, beide passend zu ARC und ARC MAX.",
    upsellTitle: "Passendes Zubehör",
    upsellIn: "in {finish}",
    addAria: "AUREL {name} in den Warenkorb",
  },

  social: {
    kicker: "Kundenstimmen",
    title: "Zweitausend Schreibtische später.",
    outOf: "aus {count} Bewertungen",
    recommend: "würden sie empfehlen",
    ownedFor: "seit {duration}",
    trust: [
      { title: "60 Nächte testen", note: "Rückversand bezahlt" },
      { title: "5 Jahre Garantie", note: "Ersatzteile 10 Jahre" },
      { title: "Versand weltweit", note: "In 48 Stunden verschickt" },
      { title: "iF Gold Award 2026", note: "Kategorie Workspace" },
    ],
  },

  faqSection: {
    kicker: "Fragen",
    title: "Was Leute vor dem Kauf wissen wollen.",
    lede: "Steht Ihre Frage nicht dabei, schreiben Sie uns — es antwortet jemand, der die Leuchte selbst benutzt.",
    contact: "hallo@aurel.light · Mo–Fr, 9–17 Uhr",
  },

  finalCta: {
    stamp: "23:00 · 1800 K",
    title: "Der Rest des Tages regelt sich von allein.",
    lede: "Stellen Sie die ARC auf Ihren Schreibtisch, geben Sie ihr einmal einen Standort, und vergessen Sie sie. Läuft Ihr Abend anders, liegt der Rest am Handy. Sechzig Nächte, um es auszuprobieren.",
    secondary: "Offene Fragen?",
  },

  footer: {
    blurb:
      "Wir bauen Licht für den einen Meter Schreibtisch, an dem der Tag tatsächlich stattfindet. Entworfen in Kopenhagen, gefertigt in Portugal.",
    status: "Systemstatus · Alle Werke laufen",
    columns: {
      product: "Produkt",
      buy: "Kaufen",
      company: "Unternehmen",
    },
    links: {
      specs: "Technische Daten",
      accessories: "Zubehör",
      cart: "Warenkorb",
      shipping: "Versand & Lieferung",
      trial: "60 Nächte testen",
      warranty: "Garantie",
      about: "Über AUREL",
      press: "Presse",
      sustainability: "Nachhaltigkeit",
      contact: "Kontakt",
      imprint: "Impressum",
      privacy: "Datenschutz",
      terms: "AGB",
      cookies: "Cookies",
    },
    copyright: "© {year} AUREL Lighting ApS — Demonstrationsprojekt, keine echte Marke",
  },

  cart: {
    title: "Warenkorb",
    items: "{count} Artikel",
    close: "Warenkorb schließen",
    emptyTitle: "Noch nichts drin",
    emptyBody: "Die ARC gibt es in drei Oberflächen und zwei Längen.",
    emptyCta: "Produkt ansehen",
    decrease: "Menge verringern",
    increase: "Menge erhöhen",
    remove: "Entfernen",
    subtotal: "Zwischensumme",
    shipping: "Versand",
    shippingIncluded: "Inklusive",
    total: "Gesamt",
    vatIncluded: "inkl. {amount} MwSt.",
    checkout: "Zur Kasse",
    trial: "60 Nächte testen · Rückversand bezahlt",
  },

  checkout: {
    back: "Weiter einkaufen",
    title: "Kasse",
    contact: "Kontakt",
    email: "E-Mail",
    address: "Lieferadresse",
    firstName: "Vorname",
    lastName: "Nachname",
    street: "Straße und Hausnummer",
    postalCode: "PLZ",
    city: "Ort",
    country: "Land",
    payment: "Zahlung",
    demoTitle: "Demo-Zahlung",
    demoBody:
      "Dies ist ein Demonstrationsprojekt — es werden keine Zahlungsdaten erfasst und keine Zahlung ausgelöst. Die Anbindung ist hinter einer Provider-Schnittstelle gekapselt, sodass Stripe ohne Änderung an der Oberfläche eingesetzt werden kann.",
    failed: "Die Zahlung konnte nicht abgeschlossen werden. Bitte erneut versuchen.",
    processing: "Wird verarbeitet…",
    placeOrder: "{amount} verbindlich bestellen",
    summary: "Ihre Bestellung",
    vatLine: "enthaltene MwSt. ({rate} %)",
    emptyTitle: "Ihr Warenkorb ist leer.",
    emptyBody: "Legen Sie eine ARC hinein, dann geht es hier weiter.",
    emptyCta: "Zum Produkt",
    errors: {
      email: "Bitte eine gültige E-Mail-Adresse.",
      required: "Bitte ausfüllen.",
      street: "Straße und Hausnummer angeben.",
      postalCode: "Bitte eine gültige Postleitzahl.",
    },
    duties: "Zoll und Einfuhrumsatzsteuer sind im Preis enthalten.",
    regions: { eu: "Europäische Union", europe: "Übriges Europa", world: "Weltweit" },
  },

  success: {
    title: "Bestellung bestätigt.",
    lede: "Wir haben Ihnen eine Bestätigung an {email} geschickt. Die Leuchte verlässt unser Lager innerhalb von 48 Stunden.",
    orderNumber: "Bestellnummer",
    delivery: "Voraussichtliche Lieferung",
    overview: "Bestellübersicht",
    totalPaid: "Gesamt bezahlt",
    home: "Zurück zur Startseite",
    demoNote: "Demo-Bestellung · es wurde keine Zahlung ausgelöst",
  },

  product: {
    subtitle:
      "Zirkadiane Schreibtischleuchte. {tagline} {coverage} ausgeleuchtet, {lumens} Lumen bei 4000 K.",
    reviewsShort: "{rating} · {count} Bewertungen",
    priceNote: "inkl. MwSt. · Versand weltweit inklusive · {sku}",
    length: "Länge",
    finishWith: "Oberfläche — {finish}",
    outOfStock: "{finish} in {model} ist derzeit nicht am Lager — {leadTime}.",
    addWithPrice: "In den Warenkorb — {price}",
    buyNow: "Sofort kaufen",
    delivery: [
      { title: "Versand weltweit inklusive", note: "In 48 Stunden verschickt, Zustellung in 2–6 Werktagen" },
      { title: "60 Nächte testen", note: "Passt sie nicht, holen wir sie ab — Rückversand bezahlt" },
      { title: "5 Jahre Garantie", note: "Ersatzteile halten wir zehn Jahre vor" },
    ],
    descriptionKicker: "Produktbeschreibung",
    descriptionTitle: "Gebaut, um zwanzig Jahre auf demselben Tisch zu stehen.",
    description: [
      "Der Körper ist ein einziges stranggepresstes Aluminiumprofil, an beiden Enden verschraubt statt verklebt. Der Diffusor lässt sich herausnehmen; sollte er in zehn Jahren stumpf sein, tauschen Sie ihn, nicht die Leuchte.",
      "Im Sockel sitzt ein Messinggewicht von 900 Gramm. Das ist der Grund, warum die ARC stehen bleibt, wenn Sie am Kabel hängen bleiben, und warum sie sich schwerer anfühlt, als sie aussieht.",
      "Der Rest ist Zurückhaltung: keine Statusleuchte, die nachts blinkt, kein Logo auf der Vorderseite, kein Lüfter. Die Leuchte soll den Schreibtisch beleuchten, nicht um Aufmerksamkeit bitten.",
    ],
    specsTitle: "Technische Daten",
  },

  viewer: {
    view: "Ansicht",
    views: { gesamt: "Gesamt", leiste: "Lichtleiste", sockel: "Sockel" },
    notes: {
      gesamt: "Vollansicht · {cm} cm",
      leiste: "Diffusor · asymmetrische Optik",
      sockel: "Rad · gefräst aus einem Billet",
    },
    day: "Tag · 5400 K",
    night: "Nacht · 1900 K",
    coverage: "{coverage} Ausleuchtung",
    hotspotHint: "Punkte antippen für Details",
    hotspotClose: "Erneut tippen zum Schließen",
    hotspots: [
      {
        title: "Asymmetrischer Diffusor",
        body: "Mikrostruktur im Acryl, die das Licht nach vorn kippt und oberhalb von 65° abschneidet.",
      },
      {
        title: "Gefrästes Gelenk",
        body: "Reibungsgebremst, hält jede Neigung ohne Feder und ohne Nachjustieren.",
      },
      {
        title: "Das Rad",
        body: "Aus einem Billet gefräst, mit Messing beschwert. Drehen für Helligkeit, drücken für Farbtemperatur.",
      },
      {
        title: "Endkappe",
        body: "Verschraubt statt geklebt — der Diffusor ist entnehmbar, falls er in zehn Jahren stumpf wird.",
      },
    ],
  },
} as const;

export type Dict = typeof de;
