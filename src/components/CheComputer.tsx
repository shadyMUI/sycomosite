"use client";

import { useEffect, useState } from "react";

type Props = {
  titolo?: string;
  casi?: string[];
  chiusura?: string;
  accento?: string;
};

export default function CheComputer({
  titolo = "un pc per ogni vostra esigenza",
  casi = ["gaming", "lavoro", "studio"],
  chiusura = "? qualunque utilizzo! ",
  accento = "al prezzo migliore",
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
      className={`uso ${isPastHero ? "invisible pointer-events-none" : ""}`}
      aria-labelledby="uso-t"
    >
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
    </section>
  );
}
