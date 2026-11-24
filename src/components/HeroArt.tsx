"use client";

import { useEffect, useRef } from "react";

/**
 * La massa di vetro (HeroArt).
 *
 * Contiene DUE copie sincronizzate al fotogramma:
 * 1. Copia ROSSA classica (dietro, visibile su sfondo carta: Hero, Album, Contatti).
 * 2. Copia BIANCA (.sml, visibile sulle sezioni rosse .rosso e .faq).
 *
 * Il ritaglio (clip-path) della copia bianca segue esattamente la quota
 * delle sezioni rosse in tempo reale:
 * se metà figura è sul rosso e metà sul bianco, sul rosso le forme sono bianche
 * e sul bianco sono rosse, con taglio netto a filo senza animazioni di dissolvenza.
 */

interface LastraSpec {
  id: string;
  counterRotate: number;
  isVetro: boolean;
}

const LASTRE_CONFIG: LastraSpec[] = [
  { id: "ml-fondo", counterRotate: 0, isVetro: false },
  { id: "ml-ancora", counterRotate: 0, isVetro: false },
  { id: "ml-quadro", counterRotate: 12, isVetro: true },
  { id: "ml-tondo", counterRotate: 0, isVetro: true },
  { id: "ml-scheggia", counterRotate: -14, isVetro: true },
];

export default function HeroArt() {
  const whiteLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Usa le dimensioni dello schermo, non il viewport: lo zoom e il
    // ridimensionamento della finestra non devono alterare la scala delle figure.
    const updateMassaSize = () => {
      const screenWidth = window.screen.width || window.innerWidth;
      const screenHeight = window.screen.height || window.innerHeight;
      const screenScale = Math.min(screenWidth / 1920, screenHeight / 1080);
      const massaWidth = Math.min(780, 780 * screenScale);
      document.documentElement.style.setProperty("--massa-w", `${massaWidth}px`);
    };

    updateMassaSize();
    window.addEventListener("resize", updateMassaSize, { passive: true });

    let rafId: number | null = null;

    const updateClip = () => {
      rafId = null;
      const winH = window.innerHeight;
      const rosso = document.querySelector(".rosso");
      const faq = document.querySelector(".faq");

      let activeSlice: { top: number; bottom: number } | null = null;

      // La prima sezione rossa (.rosso) gestisce la propria copia bianca isolata (.rosso-blend)
      // per la fusione perfetta del titolo.
      // Qui la copia bianca si attiva con taglio al millimetro sulla seconda sezione rossa (.faq).
      if (faq) {
        const f = faq.getBoundingClientRect();
        if (f.bottom > 0 && f.top < winH) {
          activeSlice = {
            top: Math.max(0, f.top),
            bottom: Math.max(0, winH - f.bottom),
          };
        }
      }

      if (whiteLayerRef.current) {
        if (activeSlice) {
          whiteLayerRef.current.style.clipPath = `inset(${Math.round(activeSlice.top)}px 0px ${Math.round(activeSlice.bottom)}px 0px)`;
        } else {
          whiteLayerRef.current.style.clipPath = "inset(100% 0 0 0)";
        }
      }
    };

    const onScrollOrResize = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateClip);
      }
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    updateClip();

    return () => {
      window.removeEventListener("resize", updateMassaSize);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* 1. Copia ROSSA classica: sta su fondo carta (Hero, Album, Contatti) */}
      <div className="hero-art hero-art--red" aria-hidden="true">
        <div className="massa">
          {LASTRE_CONFIG.map(({ id, isVetro }) => (
            <span
              key={id}
              className={`ml ${id}${isVetro ? " ml-vetro" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Copia BIANCA: ritagliata al millimetro sul bordo delle sezioni rosse (effetto negativo) */}
      <div
        ref={whiteLayerRef}
        className="hero-art hero-art--white"
        aria-hidden="true"
        style={{
          clipPath: "inset(100% 0 0 0)",
        }}
      >
        <div className="massa">
          {LASTRE_CONFIG.map(({ id, isVetro }) => (
            <span
              key={id}
              className={`ml sml ${id}${isVetro ? " ml-vetro" : ""}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
