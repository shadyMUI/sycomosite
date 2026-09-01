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
 * Alla fine del movimento c'è un aggancio: se ci si è fermati vicino
 * all'inizio di una sezione — gli elementi marcati `data-aggancio` — la
 * pagina ci si posa sopra. Un colpo di rotella un po' più deciso lasciava
 * altrimenti la schermata a metà, con mezzo titolo sopra e mezzo sotto, e
 * chi legge non capisce se ha già visto tutto o gli è sfuggito qualcosa.
 *
 * Non è una paginazione: se il gesto è lungo abbastanza da superare la
 * soglia, la pagina scorre dove volevate. L'aggancio raccoglie solo chi è
 * andato lungo di poco.
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

/* Quanto lontano può essere l'inizio di una sezione perché la pagina ci
   si agganci, in frazione di schermata. Le sezioni sono alte più o meno
   una schermata: con mezza schermata di raggio c'è quasi sempre un punto
   entro tiro, e ci si ferma su un bordo invece che a metà. */
const RAGGIO = 0.55;

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
    /* Serve a non far rimbalzare l'aggancio all'infinito: il movimento
       che porta al bordo finisce anch'esso, e senza questo cercherebbe
       subito il punto successivo. */
    let inAggancio = false;
    /* Da che parte si stava andando: +1 giù, -1 su. Senza, risalendo
       l'aggancio trovava il bordo appena lasciato e ci riportava sopra —
       la pagina rimbalzava e non si riusciva più a tornare in cima. */
    let verso = 1;

    const limite = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    /* Gli inizi delle sezioni, in coordinate di documento. Si rileggono a
       ogni aggancio e non una volta sola: le altezze cambiano quando le
       immagini finiscono di caricarsi o si ridimensiona la finestra.

       Si somma `offsetTop` lungo la catena dei contenitori invece di
       usare il riquadro sullo schermo: quello comprende le trasformazioni,
       e le sezioni entrano traslate di qualche decina di pixel finché il
       marchio non ha finito di volare. Il bersaglio sarebbe quindi un
       punto che si sposta mentre ci si va. */
    const quotaDi = (el: HTMLElement) => {
      let y = 0;
      let n: HTMLElement | null = el;
      while (n) {
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return y;
    };

    const punti = () =>
      [...document.querySelectorAll<HTMLElement>("[data-aggancio]")].map(quotaDi);

    const aggancia = () => {
      const raggio = window.innerHeight * RAGGIO;
      let meta: number | null = null;
      let minimo = Infinity;

      for (const p of punti()) {
        /* Solo i bordi davanti a sé, con una tolleranza di pochi pixel per
           quello su cui si è appena arrivati. Guardare anche indietro
           significherebbe tirare l'utente nella direzione da cui viene. */
        const avanti = verso > 0 ? p >= corrente - 4 : p <= corrente + 4;
        if (!avanti) continue;

        const d = Math.abs(p - corrente);
        if (d < minimo) {
          minimo = d;
          meta = p;
        }
      }

      /* Niente da fare se non c'è un bordo vicino, o se ci siamo già
         sopra: sotto i due pixel il movimento non si vedrebbe e servirebbe
         solo a tenere vivo un ciclo. */
      if (meta === null || minimo < 2 || minimo > raggio) return;

      inAggancio = true;
      arrivo = Math.min(limite(), Math.max(0, meta));
      avvia();
    };

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
        /* Se questo movimento ERA l'aggancio, ci si ferma qui. */
        if (inAggancio) {
          inAggancio = false;
          return;
        }
        aggancia();
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
      /* un gesto nuovo annulla l'aggancio in corso: comanda chi scorre */
      inAggancio = false;
      if (e.deltaY !== 0) verso = e.deltaY > 0 ? 1 : -1;
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
