/*
 * BlackHoleFx — il gran finale, A TEMPO e a scroll BLOCCATO.
 *
 * Quando l'utente prova a scorrere oltre la scena invertita, ScrollDirector
 * blocca lo scroll e accende html.bh-live: da lì la sequenza corre da sola
 * (~6.5s), qualunque cosa faccia l'utente:
 *   0.0–0.9  il punto bianco del titolo vola al CENTRO della pagina
 *   0.8–2.2  risucchia le LETTERE, una a una (spirale accelerata)
 *   2.1–4.0  risucchia le FIGURE di sfondo
 *   3.9–4.5  risucchia anche il COLORE di sfondo → resta tutto bianco
 *            (e intanto, pasto dopo pasto, diventa sempre più ROSSO)
 *   4.5–5.5  fermo al centro, immobile, per 1 secondo
 *   5.5–6.2  ESPLODE: flash, sfondo nero, cielo stellato
 *
 * Questo componente è solo il palcoscenico (layer bianchi/neri, stelle,
 * quadrato-buco-nero, anello d'esplosione). La regia (misura del punto,
 * vettori di risucchio, lock dello scroll, classi) vive in ScrollDirector.
 * Le stelle sono generate con un LCG a seme fisso: deterministiche, quindi
 * identiche tra server e client (niente mismatch di idratazione).
 */

type Star = {
  x: number; // %
  y: number; // %
  sz: number; // px
  tw: string; // durata twinkle
  twd: string; // delay twinkle
  o: number; // opacità di base
};

const STARS: Star[] = (() => {
  const out: Star[] = [];
  let s = 20260705; // seme fisso
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < 90; i++) {
    out.push({
      x: Math.round(rnd() * 1000) / 10,
      y: Math.round(rnd() * 1000) / 10,
      sz: 1 + Math.round(rnd() * 20) / 10, // 1–3px
      tw: (2.4 + Math.round(rnd() * 36) / 10).toFixed(1) + "s", // 2.4–6s
      twd: "-" + (Math.round(rnd() * 60) / 10).toFixed(1) + "s",
      o: 0.35 + Math.round(rnd() * 60) / 100, // 0.35–0.95
    });
  }
  return out;
})();

export default function BlackHoleFx() {
  return (
    <>
      <div className="bh" aria-hidden="true">
        {/* il bianco che resta quando il buco nero ha mangiato il colore */}
        <span className="bh-white" />

        {/* il cielo stellato post-esplosione */}
        <span className="bh-space">
          {STARS.map((st, i) => (
            <span
              key={i}
              className="bh-star"
              style={
                {
                  left: st.x + "%",
                  top: st.y + "%",
                  width: st.sz + "px",
                  height: st.sz + "px",
                  "--o": st.o,
                  "--tw": st.tw,
                  "--twd": st.twd,
                } as React.CSSProperties
              }
            />
          ))}
        </span>

        {/* anello d'urto dell'esplosione */}
        <span className="bh-ring" />

        {/* IL punto: quadrato che vola al centro, mangia tutto e arrossisce */}
        <span className="bh-square" />
      </div>

      {/* Wipe diagonale: tornando indietro da "this is a demo", un rettangolo
          bianco inclinato sfreccia da destra a sinistra e riporta alla
          schermata arancione (il pannello CTA). */}
      <div className="wipe" aria-hidden="true">
        <div className="wipe-bar" />
      </div>

      {/* Rewind: tornando su, l'acqua bianca riempie e si svuota (onda
          liquida come l'intro), coprendo lo smontaggio del finale. */}
      <div className="bh-flood" aria-hidden="true">
        <div className="bh-flood-body">
          <svg
            className="bh-flood-wave"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path d="M0,70 C240,20 480,20 720,70 C960,120 1200,120 1440,70 L1440,120 L0,120 Z">
              <animate
                attributeName="d"
                dur="1.1s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;0.5;1"
                keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                values="M0,70 C240,20 480,20 720,70 C960,120 1200,120 1440,70 L1440,120 L0,120 Z;
                        M0,70 C240,120 480,120 720,70 C960,20 1200,20 1440,70 L1440,120 L0,120 Z;
                        M0,70 C240,20 480,20 720,70 C960,120 1200,120 1440,70 L1440,120 L0,120 Z"
              />
            </path>
          </svg>
        </div>
      </div>
    </>
  );
}
