"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

/* From Uiverse.io by gharsh11032000 - https://uiverse.io/gharsh11032000/loud-chicken-53
   MIT License, Copyright (c) gharsh11032000 (Harsh Gupta) */
type HeroActionProps = {
  href: string;
  label: string;
  className?: string;
};

function HeroAction({ href, label, className = "" }: HeroActionProps) {
  const frame = useRef<number | null>(null);

  const scorriAllaSezione = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;

    const destinazione = document.getElementById(href.slice(1));
    if (!destinazione) return;

    event.preventDefault();
    if (frame.current !== null) cancelAnimationFrame(frame.current);

    window.history.pushState(null, "", href);
    const da = window.scrollY;
    const a = da + destinazione.getBoundingClientRect().top;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, a);
      return;
    }

    const inizio = performance.now();
    const durata = 950;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 5);

    const anima = (ora: number) => {
      const t = Math.min(1, (ora - inizio) / durata);
      window.scrollTo(0, da + (a - da) * easeOut(t));
      if (t < 1) frame.current = requestAnimationFrame(anima);
      else frame.current = null;
    };

    frame.current = requestAnimationFrame(anima);
  };

  const freccia = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
    </svg>
  );

  return (
    <a
      className={`hero-action ${className}`}
      href={href}
      onClick={scorriAllaSezione}
    >
      <span className="hero-action__arrow hero-action__arrow--enter">{freccia()}</span>
      <span className="hero-action__text">{label}</span>
      <span className="hero-action__circle" aria-hidden="true" />
      <span className="hero-action__arrow hero-action__arrow--exit">{freccia()}</span>
    </a>
  );
}

type Props = {
  titolo?: string;
  casi?: string[];
  chiusura?: string;
  accento?: string;
  className?: string;
  mostraAzioni?: boolean;
};

export default function CheComputer({
  titolo = "Un PC per ogni vostra esigenza",
  casi = ["gaming", "lavoro", "studio"],
  chiusura = "? Qualunque utilizzo! ",
  accento = "Al prezzo migliore",
  className = "",
  mostraAzioni = false,
}: Props) {
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      // Quando la prima sezione rossa (.rosso) sale e raggiunge il top dello schermo,
      // ha coperto completamente la hero: la nascondiamo per non interferire con le sezioni successive.
      const rosso = document.querySelector(".rosso");
      if (rosso) {
        const rect = rosso.getBoundingClientRect();
        setIsPastHero(rect.top <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className={`uso${className ? ` ${className}` : ""} ${isPastHero ? "invisible pointer-events-none" : ""}`}
      aria-labelledby="uso-t"
    >
      <div className="uso-riga uso-riga--titolo">
        <h1
          id="uso-t"
          className="uso-domanda pl-3 sm:pl-6 lg:pl-10"
          style={
            {
              "--dom-n": titolo.length,
              "--dom-max": Math.max(1, ...titolo.split(" ").map((w) => w.length)),
            } as React.CSSProperties
          }
        >
          {titolo}
          <span className="uso-dot" aria-hidden="true" />
        </h1>
      </div>

      <div className="uso-riga uso-riga--testo">
        <p className="uso-testo pl-3 sm:pl-6 lg:pl-10">
          {casi.map((c, i) => (
            <span key={c}>
              <strong>{c}</strong>
              {i < casi.length - 1 && <span className="uso-barra">/</span>}
            </span>
          ))}
          {chiusura}
          <em>{accento}</em>
        </p>
      </div>

      {mostraAzioni && (
        <div className="uso-azioni">
          <HeroAction href="#servizi" label="Servizi" />
          <HeroAction
            className="hero-action--lavori-desktop"
            href="#lavori-desktop"
            label="I nostri lavori"
          />
          <HeroAction
            className="hero-action--lavori-mobile"
            href="#lavori-mobile"
            label="I nostri lavori"
          />
        </div>
      )}
    </section>
  );
}
