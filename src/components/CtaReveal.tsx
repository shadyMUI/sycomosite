/*
 * CtaReveal — secondo atto, guidato dallo scroll (--p2, 0 → 1).
 *
 * Angolo: ESPANSIONE ANCORATA ("iris-corner"). Un UNICO quadrato rosso è il
 * pannello. A --p2 = 0 è il puntino ~34px in coda a "sycomo" (destra, centro
 * verticale). Al crescere di --p2 la sua width/height aumentano e la posizione
 * (right) si riallinea, ancorata al lato destro e al centro verticale: cresce
 * verso sinistra/alto/basso come una goccia d'inchiostro che invade, finché a
 * --p2 = 1 è un pannello rosso con margine di 3cm su ogni bordo (inset:3cm) e
 * al centro "so, what do we do." in --paper, col suo punto quadrato finale
 * (anch'esso --paper, per risaltare sul rosso).
 *
 * Server component puro: niente "use client", niente hook, niente stato.
 * Tutta l'interpolazione è CSS in calc()/clamp() su var(--p2): il reveal è
 * "scrubby" — funzione continua di --p2, reversibile scrollando su/giù.
 * ScrollDirector si limita a scrivere il numero --p2 su :root.
 */
export default function CtaReveal() {
  return (
    <div
      className="cta-reveal cta-reveal--iris-corner"
      role="region"
      aria-label="so, what do we do."
    >
      {/* Il pannello È il punto: un solo quadrato rosso che cresce.
          right/width/height/border-radius derivano tutti da var(--p2). */}
      <div className="cr-panel">
        {/* Layer testo: dimensione piena del pannello, centrato. Il testo non
            è mai stirato (non eredita scale). Emerge nella seconda metà di
            --p2, quando il pannello ha abbastanza area. */}
        <div className="cr-textwrap">
          <p className="cr-text">
            so, what do we do
            <span className="cr-dot" aria-hidden="true" />
          </p>
        </div>
      </div>
    </div>
  );
}
