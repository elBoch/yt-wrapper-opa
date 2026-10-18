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
    title: "Blasmusik 1",
    link:  "https://www.youtube.com/watch?v=oFvE5rRE98I&list=PLTwR7pbPsGeubJ8QCgHszUnm_aUI3AlVo",
    image: "beethoven.jpg"
  },
  {
    // Liste aus 3 Videos – zum Testen von "Nächstes"
    title: "Blasmusik 2",
    link: "https://www.youtube.com/watch?v=c1690voBTDM&list=PLN_2_Y03IVl27jinxbx8Ru9V8Gg3SYoG5",
    image: "mozart.jpg"
  },
  {
    // Wiener Philharmoniker, Zubin Mehta – An der schönen blauen Donau
    title: "Blasmusik 3",
    link:  "https://www.youtube.com/watch?v=RBOcQKipA8k&list=PLDEkYbkDjWbWZ8waLWPdkzh2nOjfTjdl1",
    image: "philharmoniker.jpg"
  },
  {
    // YouTube-Playlist – Netherlands Bach Society, Brandenburgische Konzerte
    title: "Blasmusik 4",
    link:  "https://www.youtube.com/watch?v=JC1C2MGjo3o&list=PLuMJAuLnGW7rwzUGXJAO15_IxNmYZD3ho",
    image: "bach.jpg"
  },
  {
    // Wiener Johann Strauss Orchester – An der schönen blauen Donau
    title: "Klassik 1",
    link:  "https://www.youtube.com/watch?v=r94mhIQI6Q4&list=PL70QeIM3H_23lwXMefpoTZz0Iim_q-anK",
    image: "strauss.jpg"
  },
  {
    // hr-Sinfonieorchester – Streicherserenade
    title: "Klassik 2",
    link:  "https://www.youtube.com/watch?v=uEiczVQnvE8&list=PL70QeIM3H_23iWqz0ZS5rH6uGm_fGu0R9",
    image: "tschaikowsky.jpg"
  }
];
