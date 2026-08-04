"use client";

import { useEffect } from "react";

/**
 * Regia dello scorrimento.
 *
 * Scrive due progressi come variabili CSS, e tutta la coreografia è scritta
 * in CSS in funzione di quei numeri — qui non si tocca mai lo stile.
 *
 *   --p  apertura: il logo vola nella header e le figure entrano in scena.
 *        È un INNESCO, non un inseguimento: basta un gesto e va da 0 a 1
 *        da sé (la transizione è nel CSS). Torna a 0 se si risale in cima.
 *
 *   --q  seconda sezione: quanto è salito il pannello rosso dei servizi.
 *        Questo invece SEGUE lo scorrimento di continuo, perché il
 *        pannello deve muoversi sotto il dito, non partire da solo.
 */
const APRE = 8;
const CHIUDE = 2;

export default function ScrollDirector() {
  useEffect(() => {
    const root = document.documentElement;
    let aperto = false;
    let inCoda = false;

    const applica = () => {
      inCoda = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      // senza questa guardia i calc() diventano NaN e la pagina collassa
      if (!vh) return;

      if (!aperto && y > APRE) {
        aperto = true;
        root.style.setProperty("--p", "1");
        root.classList.add("figs-on");
      } else if (aperto && y <= CHIUDE) {
        aperto = false;
        root.style.setProperty("--p", "0");
        root.classList.remove("figs-on");
      }

      /* Il taglio della massa bianca sul bordo della sezione rossa NON si
         fa da qui: aggiornarlo a ogni scroll restava sempre un fotogramma
         indietro e si vedeva. Lo fa il CSS con una view-timeline, che gira
         sul compositor ed è sincronizzata per costruzione. */
    };

    const onScroll = () => {
      if (inCoda) return;
      inCoda = true;
      requestAnimationFrame(applica);
    };

    applica(); // chi ricarica a pagina già scorsa trova la scena giusta
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
