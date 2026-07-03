/*
 * HeroArt — "Massa di Vetro" · cluster + contrappeso
 * Cerchi e quadrati statici in liquid glass opaco stile HyperOS, sui due rossi brand.
 * Server component: nessun "use client", nessun hook — solo markup + classi.
 * Il root copre l'intera hero (absolute inset-0) e sta dietro al logo (z-10).
 * Ogni forma compare con cl-enter, in cascata dall'alto verso il basso,
 * inseguendo il sipario liquido che scende (delay --in per forma).
 */
export default function HeroArt() {
  return (
    <div className="hero-art hero-art--cluster" aria-hidden="true">
      {/*
        Massa principale — destra-centro, sanguina oltre il bordo destro.
        L'ordine nel DOM è l'ordine di impilamento: ogni lastra successiva
        sta sopra; le lastre .cl-glass col backdrop-filter sfocano ciò che
        hanno sotto — è lì che il vetro diventa credibile.
      */}
      <div className="cl-mass">
        <span className="cl-shape cl-circle-hero" />
        <span className="cl-shape cl-glass cl-square-major" />
        <span className="cl-shape cl-glass cl-square-minor" />
        <span className="cl-shape cl-glass cl-circle-pin" />
      </div>

      {/* Contrappesi ed eco: riempiono il vuoto senza rubare scena */}
      <span className="cl-shape cl-echo cl-echo-nw" />
      <span className="cl-shape cl-echo cl-echo-n" />
      <span className="cl-shape cl-echo cl-echo-mid" />
      <span className="cl-shape cl-echo cl-echo-w" />
      <span className="cl-shape cl-echo cl-echo-se" />
      <span className="cl-shape cl-echo cl-echo-s" />
    </div>
  );
}
