"use client";

import { useEffect } from "react";

/**
 * Scorrimento con inerzia.
 *
 * La rotella del mouse manda scatti secchi: la pagina salta di cento pixel
 * e si ferma di colpo. Qui gli scatti vengono raccolti in una posizione di
 * arrivo, e a ogni fotogramma la pagina ci si avvicina di una frazione —
 * quindi parte subito, accelera e rallenta arrivando. È la stessa curva
 * di un oggetto pesante che si ferma per attrito.
 *
 * La pagina viene mossa DAVVERO (window.scrollTo), non traslata con una
 * trasformazione: così le animazioni agganciate allo scorrimento — il
 * ritaglio delle figure, il negativo del titolo — continuano a funzionare
 * senza sapere che c'è di mezzo qualcosa.
 *
 * Resta fuori:
 * – il touch, che ha già la sua inerzia e ne uscirebbe raddoppiata;
 * – chi ha chiesto meno movimento, per cui è proprio ciò che dà fastidio.
 */

/* Quanta parte della distanza si copre a ogni fotogramma. Più è basso,
   più lungo è il rallentamento: 0.5 è quasi secco, 0.05 è melassa.
   0.075 fa durare la frenata circa mezzo secondo — abbastanza da vederla
   senza che la pagina sembri inseguire il gesto in ritardo. */
const AVVICINAMENTO = 0.075;

export default function ScorrimentoFluido() {
  useEffect(() => {
    const menoMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    // il puntatore grossolano è il dito: lì l'inerzia la mette il sistema
    const tocco = window.matchMedia("(pointer: coarse)");
    if (menoMovimento.matches || tocco.matches) return;

    let arrivo = window.scrollY;
    /* La posizione viene tenuta QUI, con i decimali, e non riletta da
       window.scrollY: il browser la arrotonda al pixel, e sul finale —
       quando l'avanzamento per fotogramma scende sotto l'unità — la
       lettura tornerebbe sempre uguale, il movimento si pianterebbe a
       qualche decina di pixel dalla meta e il ciclo girerebbe a vuoto. */
    let corrente = arrivo;
    let inCorsa = false;
    let nostro = false;
    let frame = 0;

    const limite = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const passo = () => {
      corrente += (arrivo - corrente) * AVVICINAMENTO;

      /* Sotto il mezzo pixel si chiude: continuare significherebbe tenere
         vivo un ciclo per fotogramma per un movimento che nessuno vede,
         con la ventola che gira per niente. */
      const finita = Math.abs(arrivo - corrente) < 0.5;
      if (finita) corrente = arrivo;

      nostro = true;
      window.scrollTo(0, corrente);
      nostro = false;

      if (finita) {
        inCorsa = false;
        return;
      }
      frame = requestAnimationFrame(passo);
    };

    const avvia = () => {
      if (inCorsa) return;
      inCorsa = true;
      frame = requestAnimationFrame(passo);
    };

    const onWheel = (e: WheelEvent) => {
      // chi tiene premuto ctrl sta ingrandendo la pagina, non scorrendo
      if (e.ctrlKey) return;
      /* dentro un riquadro che scorre per conto suo (un testo lungo, una
         mappa) non si deve interferire */
      const dentro = (e.target as Element | null)?.closest?.(
        "[data-scorre-da-solo]"
      );
      if (dentro) return;

      e.preventDefault();
      arrivo = Math.min(limite(), Math.max(0, arrivo + e.deltaY));
      avvia();
    };

    /* Se la pagina si muove per altre vie — barra di scorrimento, frecce,
       Home/Fine, un'ancora — la posizione di arrivo va riallineata, o al
       gesto successivo la pagina tornerebbe indietro di scatto. */
    const onScroll = () => {
      if (!nostro && !inCorsa) {
        arrivo = window.scrollY;
        corrente = arrivo;
      }
    };

    const onResize = () => {
      arrivo = Math.min(limite(), arrivo);
      corrente = Math.min(limite(), corrente);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
