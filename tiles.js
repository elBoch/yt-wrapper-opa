// ============================================================
//  KONZERT – die 6 Kacheln
//  Das ist die einzige Datei, die du normalerweise änderst.
//
//  Pro Kachel:
//    title: der Name auf der Kachel (kurz halten!)
//    link:  ein YouTube-Link – Playlist ODER einzelnes Video.
//           Einfach aus YouTube kopieren (Teilen → Link kopieren).
//           Oder mehrere Videos als Liste in eckigen Klammern:
//           link: [ "https://youtu.be/…", "https://youtu.be/…" ]
//    image: Dateiname des Bildes im Ordner "images/"
//           (ungefähr quadratisch, z. B. 800 × 800 Pixel, .jpg)
//           Ohne Bild zeigt die Kachel einfach die braune Fläche.
//
//  Nach dem Speichern auf GitHub dauert es ein paar Minuten,
//  bis Opas Tablet die Änderung sieht.
//
//  Die Links unten sind Beispiele zum Testen – tausch sie gegen
//  Opas Lieblingsmusik aus.
// ============================================================

window.TILES = [
  {
    // einzelnes Video – hr-Sinfonieorchester, Beethoven 7. Sinfonie
    title: "Beethoven",
    link:  "https://www.youtube.com/watch?v=OeGRbhHPBoM",
    image: "beethoven.jpg"
  },
  {
    // Liste aus 3 Videos – zum Testen von "Nächstes"
    title: "Mozart",
    link: [
      "https://www.youtube.com/watch?v=QyQ-POuTNn8",   // Sinfonie Nr. 40
      "https://www.youtube.com/watch?v=fAiF1PNlQ50",   // Sinfonie Nr. 39
      "https://www.youtube.com/watch?v=1t18CpBuJJM"    // Sinfonie Nr. 38 »Prager«
    ],
    image: "mozart.jpg"
  },
  {
    // Wiener Philharmoniker, Zubin Mehta – An der schönen blauen Donau
    title: "Wiener Philharmoniker",
    link:  "https://www.youtube.com/watch?v=fHzhDKwYP2s",
    image: "philharmoniker.jpg"
  },
  {
    // YouTube-Playlist – Netherlands Bach Society, Brandenburgische Konzerte
    title: "Bach",
    link:  "https://www.youtube.com/playlist?list=PLecKPCyj4yRPXmmt0yFK3pF2HY8kux3RH",
    image: "bach.jpg"
  },
  {
    // Wiener Johann Strauss Orchester – An der schönen blauen Donau
    title: "Strauss",
    link:  "https://www.youtube.com/watch?v=gVp6Ilod3kM",
    image: "strauss.jpg"
  },
  {
    // hr-Sinfonieorchester – Streicherserenade
    title: "Tschaikowsky",
    link:  "https://www.youtube.com/watch?v=CSu86-1BruE",
    image: "tschaikowsky.jpg"
  }
];
