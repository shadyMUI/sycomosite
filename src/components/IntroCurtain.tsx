/**
 * Sipario d'apertura: la schermata è piena del rosso del brand e cala verso
 * il basso come un liquido che defluisce, scoprendo il sito.
 *
 * È tutto CSS: nessun JavaScript, nessun "use client". Così l'animazione
 * parte al primo fotogramma dipinto invece di aspettare l'idratazione di
 * React — che è esattamente quando si vedrebbe lo sfarfallio.
 *
 * L'onda è un SVG largo il doppio che scorre in loop: il tracciato ha
 * periodo 200 su una viewBox di 1200 (sei creste), quindi traslandolo di
 * metà larghezza — tre periodi esatti — ricombacia con sé stesso e il
 * movimento non ha giunte visibili.
 *
 * Sei creste e non due: con periodi larghi, uno solo copriva l'intero
 * schermo e la superficie sembrava piatta invece che liquida.
 */
export default function IntroCurtain() {
  return (
    <div className="intro" aria-hidden="true">
      {/* la massa di liquido: cala e esce dal fondo dello schermo */}
      <div className="intro-sheet">
        {/* superficie: due onde a velocità diverse danno profondità */}
        {/* cresta lontana: più alta e più chiara, fa da schiuma */}
        <svg
          className="intro-wave intro-wave--back"
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
        >
          <path d="M0,32 C33,14 67,14 100,32 C133,50 167,50 200,32 C233,14 267,14 300,32 C333,50 367,50 400,32 C433,14 467,14 500,32 C533,50 567,50 600,32 C633,14 667,14 700,32 C733,50 767,50 800,32 C833,14 867,14 900,32 C933,50 967,50 1000,32 C1033,14 1067,14 1100,32 C1133,50 1167,50 1200,32 V60 H0 Z" />
        </svg>
        {/* superficie vera: stesso colore della massa, dà la sagoma al bordo */}
        <svg
          className="intro-wave intro-wave--front"
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
        >
          <path d="M0,38 C33,22 67,22 100,38 C133,54 167,54 200,38 C233,22 267,22 300,38 C333,54 367,54 400,38 C433,22 467,22 500,38 C533,54 567,54 600,38 C633,22 667,22 700,38 C733,54 767,54 800,38 C833,22 867,22 900,38 C933,54 967,54 1000,38 C1033,22 1067,22 1100,38 C1133,54 1167,54 1200,38 V60 H0 Z" />
        </svg>
      </div>
    </div>
  );
}
