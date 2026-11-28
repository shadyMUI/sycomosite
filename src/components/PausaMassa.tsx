"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Le lastre di vetro (.ml) hanno due animazioni infinite ciascuna. Quando la
 * loro scena è fuori schermo continuano comunque a essere calcolate: tenerle
 * ferme non cambia nulla di visibile e toglie lavoro al main thread.
 *
 * La copia rossa vive dietro la hero; la copia bianca serve alle sezioni
 * rosse. Un unico osservatore sulle scene evita di far girare le copie
 * mentre sono ritagliate fuori schermo (e viceversa).
 */
export default function PausaMassa() {
  const pathname = usePathname();

  useEffect(() => {
    const gruppi = Array.from(document.querySelectorAll<HTMLElement>(".massa"));
    if (!gruppi.length) return;

    const hero = document.querySelector<HTMLElement>(".uso");
    const rosso = document.querySelector<HTMLElement>(".rosso");
    const faq = document.querySelector<HTMLElement>(".faq");

    const rossi = gruppi.filter((g) => g.closest(".hero-art--red"));
    const bianchi = gruppi.filter((g) => g.closest(".hero-art--white"));
    const servizi = gruppi.filter((g) => !g.closest(".hero-art") && g.closest(".rosso"));
    const domande = gruppi.filter((g) => g.closest(".faq"));

    const visibili = new Set<Element>();
    const ferma = (lista: HTMLElement[], ferme: boolean) => {
      for (const g of lista) g.classList.toggle("massa--ferma", ferme);
    };

    for (const g of gruppi) g.classList.add("massa--ferma");

    const observer = new IntersectionObserver(
      (voci) => {
        for (const voce of voci) {
          if (voce.isIntersecting) visibili.add(voce.target);
          else visibili.delete(voce.target);
        }
        ferma(rossi, !(hero && visibili.has(hero)));
        ferma(bianchi, !((rosso && visibili.has(rosso)) || (faq && visibili.has(faq))));
        ferma(servizi, !(rosso && visibili.has(rosso)));
        ferma(domande, !(faq && visibili.has(faq)));
      },
      { rootMargin: "200px 0px" }
    );

    for (const scena of [hero, rosso, faq]) {
      if (scena) observer.observe(scena);
    }

    /* Il vetro si muove all'ingresso e mentre si scorre; fermo a riposo.
       `sycomo-muove` è la finestra in cui l'animazione può girare. */
    const root = document.documentElement;
    let timer = 0;
    const risveglia = (durata: number) => {
      root.classList.add("sycomo-muove");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => root.classList.remove("sycomo-muove"), durata);
    };
    risveglia(3000);
    const alGesto = () => risveglia(1500);
    window.addEventListener("scroll", alGesto, { passive: true });
    window.addEventListener("wheel", alGesto, { passive: true });
    window.addEventListener("touchmove", alGesto, { passive: true });

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener("scroll", alGesto);
      window.removeEventListener("wheel", alGesto);
      window.removeEventListener("touchmove", alGesto);
      root.classList.remove("sycomo-muove");
      for (const g of gruppi) g.classList.remove("massa--ferma");
    };
  }, [pathname]);

  return null;
}
