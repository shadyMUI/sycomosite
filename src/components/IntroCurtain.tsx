"use client";

import { useCallback } from "react";

/**
 * Sipario d'apertura: la schermata è piena del rosso del brand e cala verso
 * il basso come un liquido che defluisce, scoprendo il sito.
 *
 * All'uscita completa del liquido dallo schermo (evento CSS `animationend`),
 * notifica il sistema tramite l'evento `sycomo:intro-done` affinché l'animazione
 * del titolo inizi esattamente al termine della discesa.
 */
export default function IntroCurtain() {
  const handleAnimationEnd = useCallback(
    (e: React.AnimationEvent<HTMLDivElement>) => {
      if (
        e.animationName === "intro-fall" ||
        e.animationName === "intro-done"
      ) {
        window.dispatchEvent(new CustomEvent("sycomo:intro-done"));
      }
    },
    []
  );

  return (
    <div
      className="intro"
      aria-hidden="true"
      onAnimationEnd={handleAnimationEnd}
    >
      {/* la massa di liquido: cala e esce dal fondo dello schermo */}
      <div
        className="intro-sheet"
        onAnimationEnd={handleAnimationEnd}
      >
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
