"use client";

import { useEffect } from "react";

/**
 * La massa di vetro rossa (HeroArt).
 *
 * Vive dietro la hero, l'album e i contatti. Le sezioni rosse hanno le loro
 * copie bianche isolate (DueMestieri per i servizi, Domande per le FAQ), così
 * ogni gruppo viene ritagliato e composto nel proprio contesto senza doppioni.
 */

interface LastraSpec {
  id: string;
  isVetro: boolean;
}

const LASTRE_CONFIG: LastraSpec[] = [
  { id: "ml-fondo", isVetro: false },
  { id: "ml-ancora", isVetro: false },
  { id: "ml-quadro", isVetro: true },
  { id: "ml-tondo", isVetro: true },
  { id: "ml-scheggia", isVetro: true },
];

export function MassaVetro({ bianca = false }: { bianca?: boolean }) {
  return (
    <div className="massa" aria-hidden="true">
      {LASTRE_CONFIG.map(({ id, isVetro }) => (
        <span key={id} className={`ml ${id}${isVetro ? " ml-vetro" : ""}${bianca ? " sml" : ""}`} />
      ))}
    </div>
  );
}

export default function HeroArt() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let massaObserver: ResizeObserver | null = null;

    // Calcola la massa in base allo spazio libero sotto la frase della hero:
    // quando il testo occupa più altezza, la figura si riduce per fermarsi
    // esattamente al suo bordo inferiore.
    const updateMassaSize = () => {
      const claim = document.querySelector<HTMLElement>(".uso-testo");
      const section = claim?.closest<HTMLElement>(".uso");
      if (!claim || !section) return;

      let claimBottom = 0;
      let current: HTMLElement | null = claim;
      while (current && current !== section) {
        claimBottom += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }

      // Fallback per browser in cui la catena degli offset salta la sezione.
      if (current !== section) {
        claimBottom = claim.getBoundingClientRect().bottom - section.getBoundingClientRect().top;
      } else {
        claimBottom += claim.offsetHeight;
      }

      const freeHeight = Math.max(0, section.clientHeight - claimBottom);
      const massHeight = freeHeight * 1.2;
      const massWidth = massHeight / 0.82; // aspect-ratio 100 / 82
      const overflowBelowViewport = massHeight - freeHeight;
      document.documentElement.style.setProperty("--massa-w", `${massWidth}px`);
      document.documentElement.style.setProperty("--massa-bottom", `${-overflowBelowViewport}px`);
    };

    const claim = document.querySelector<HTMLElement>(".uso-testo");
    const claimSection = claim?.closest<HTMLElement>(".uso");
    if (claim && claimSection && typeof ResizeObserver !== "undefined") {
      massaObserver = new ResizeObserver(updateMassaSize);
      massaObserver.observe(claim);
      massaObserver.observe(claimSection);
    }
    updateMassaSize();
    window.addEventListener("resize", updateMassaSize, { passive: true });

    return () => {
      massaObserver?.disconnect();
      document.documentElement.style.removeProperty("--massa-w");
      document.documentElement.style.removeProperty("--massa-bottom");
      window.removeEventListener("resize", updateMassaSize);
    };
  }, []);

  return (
    <div className="hero-art hero-art--red" aria-hidden="true">
      <MassaVetro />
    </div>
  );
}
