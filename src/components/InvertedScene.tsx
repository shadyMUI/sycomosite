/*
 * InvertedScene — ultimo atto: la scena a colori INVERTITI.
 *
 * Quando il pannello CTA rosso (z 60) si dissolve col salire di --p4, dietro
 * appare questa scena: l'inverso di tutto ciò che è venuto prima.
 *   · prima  → fondo CREMA, figure ROSSE "liquid glass", massa in basso-SINISTRA.
 *   · adesso → fondo ROSSO, figure PANNA "liquid glass", baricentro RIBALTATO.
 *
 * Angolo: CONTRAPPESO OPPOSTO. Dove prima il peso stava in basso-sinistra, ora
 * la massa migra in ALTO-DESTRA: un grande cerchio panna che sanguina
 * dall'angolo alto-destro, quadrati che lo intersecano; le figure piccole si
 * ridistribuiscono in basso-SINISTRA e al centro. Non uno specchio banale —
 * una composizione nuova, altri equilibri.
 *
 * Stesso vocabolario del cluster iniziale — SOLO cerchi e quadrati — ma il
 * materiale è ribaltato: panna su rosso invece di rosso su crema. Il vetro
 * nasce nelle sovrapposizioni: le lastre .is-glass, col backdrop-filter,
 * sfocano i bordi di quelle sotto (3 sovrapposizioni deliberate nella massa).
 *
 * Server component puro: niente "use client", niente hook. Tutto è funzione
 * continua di --p4 via CSS calc()/clamp() → scrubby e reversibile su/giù:
 *   · lo SFONDO rosso è solido appena la fase inizia (opacity ×16 sul root),
 *     così le fasi precedenti restano intatte a --p4≈0 ma il rosso è già pieno
 *     sotto il pannello che sfuma;
 *   · le FIGURE emergono in dissolvenza, ciascuna con la sua soglia (stagger),
 *     mentre il rosso del pannello si scioglie.
 * Le derive/respiri (8–18s) e i delay vivono nel CSS; qui c'è solo il markup.
 */
export default function InvertedScene() {
  return (
    <div
      className="inverted-scene inverted-scene--mass-right-top"
      aria-hidden="true"
    >
      {/*
        Massa principale — ALTO-DESTRA, sanguina oltre l'angolo alto-destro.
        L'ordine nel DOM è l'ordine di impilamento: le lastre .is-glass più in
        alto sfocano col backdrop-filter i bordi di quelle sotto → è lì che il
        vetro panna su rosso diventa credibile (3 sovrapposizioni deliberate).
        Le lastre sono in % DENTRO .is-mass, così la massa trasla come un blocco.
      */}
      <div className="is-mass">
        {/* 1 · cerchio-eroe: l'ancora, la panna più grande, taglia l'angolo */}
        <span className="is-shape is-circle-hero" />
        {/* 2 · quadrato maggiore: interseca il cerchio dal basso — glass */}
        <span className="is-shape is-glass is-square-major" />
        {/* 3 · quadrato minore: tocca il bordo alto-sinistra del cerchio — glass */}
        <span className="is-shape is-glass is-square-minor" />
        {/* 4 · cerchio-perno: piccolo e denso, aggancia la base della massa — glass */}
        <span className="is-shape is-glass is-circle-pin" />
      </div>

      {/* Contrappesi ridistribuiti — basso-SINISTRA e centro: ribaltano il
          baricentro rispetto alle fasi precedenti. Vetro più leggero (eco). */}
      {/* 5 · quadrato basso-sinistra: il contrappeso maggiore alla massa */}
      <span className="is-shape is-echo is-echo-sw" />
      {/* 6 · cerchio medio-sinistra, sale il canale sinistro */}
      <span className="is-shape is-echo is-echo-w" />
      {/* 7 · cerchio al centro, fluttuante: cuce massa e vuoto */}
      <span className="is-shape is-echo is-echo-c" />
      {/* 8 · quadratino basso-centro: sanguina oltre il bordo inferiore */}
      <span className="is-shape is-echo is-echo-s" />

      {/* Headline demo: quando la scena è rivelata (html.scene-live) ogni
          lettera sale "dal portale" sotto i suoi piedi con un'animazione a
          tempo, in sequenza da sinistra. Chiude il punto quadrato bianco
          che nasce da una bolla che scoppia. */}
      <p className="is-title" aria-hidden="false">
        {TITLE.map((word, wi) => (
          <span key={wi}>
            {wi > 0 && " "}
            <span className="is-word">
              {word.map(([ch, gd], li) => (
                <span key={li} className="is-cell">
                  <span
                    className="is-glyph"
                    style={{ "--gd": gd } as React.CSSProperties}
                  >
                    {ch}
                  </span>
                </span>
              ))}
              {wi === TITLE.length - 1 && (
                <span className="is-title-dot" aria-hidden="true" />
              )}
            </span>
          </span>
        ))}
      </p>
    </div>
  );
}

/* "we make your dreams come true" — ogni lettera sale dal proprio portale,
   scaglionata da sinistra (ritardo crescente, 40ms a lettera). Chiude il
   punto quadrato bianco. */
const TITLE_WORDS = ["we", "make", "your", "dreams", "come", "true"];
const STAGGER = 0.04;
const TITLE: [string, string][][] = (() => {
  let i = 0;
  return TITLE_WORDS.map((w) =>
    [...w].map(
      (ch) => [ch, `${(i++ * STAGGER).toFixed(2)}s`] as [string, string]
    )
  );
})();