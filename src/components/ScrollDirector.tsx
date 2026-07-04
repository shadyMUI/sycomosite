"use client";

import { useEffect } from "react";

/**
 * Regista dello scroll: scrive su :root la variabile --p (0 → 1), il
 * progresso della transizione hero → header nei primi RANGE px di scroll.
 * Tutta la coreografia (logo che vola nella header, forme che viaggiano e
 * scalano) è CSS puro guidato da --p: qui c'è solo il numero.
 * Il lerp (inseguimento smorzato) dà il feel dinamico; con
 * prefers-reduced-motion il valore è diretto, senza inseguimento.
 */
const RANGE = 520;
const EASE = 0.14;
// Soglie con isteresi: si "atterra" a 0.86, si "riparte" sotto 0.8.
const LAND_IN = 0.86;
const LAND_OUT = 0.8;
// Fase 2 (--p2): il punto di sycomo cresce nel pannello CTA, DOPO la fase 1.
// Spazio di scroll ampio prima dell'avvio (dwell in cui si legge la tagline)
// e crescita più graduale.
const P2_START = 900;
const P2_RANGE = 620;
// Cancello temporale: la fase 2 non può iniziare finché la coreografia della
// tagline non ha avuto il tempo di completarsi dall'atterraggio (~2s). Così,
// anche scrollando velocemente, il quadrato non parte prima della scritta.
const TAGLINE_MS = 2000;
// Limite di velocità di --p2: per quanto in fretta lo scroll "richieda"
// avanzamento (es. quando il cancello si apre dopo uno scroll veloce), il
// pannello non può crescere più di MAX_STEP2 per frame → sempre graduale,
// mai a scatto. ~0.014 ⇒ apertura minima ~1.2s a 60fps.
const MAX_STEP2 = 0.014;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function ScrollDirector() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let current = Math.min(window.scrollY / RANGE, 1);
    let current2 = clamp01((window.scrollY - P2_START) / P2_RANGE);
    let landed = false;
    let landedAt = 0; // istante dell'ultimo atterraggio (per il cancello tempo)
    let raf = 0;
    // Punto di "sycomo." nella tagline: misurato dal vivo così il pannello
    // CTA cresce ESATTAMENTE da lì (posizione + dimensione reali).
    let dot: Element | null = null;

    const tick = () => {
      const target = Math.min(window.scrollY / RANGE, 1);
      current = reduced ? target : current + (target - current) * EASE;
      if (Math.abs(target - current) < 0.001) current = target;
      root.style.setProperty("--p", current.toFixed(4));

      // Cancello: p2 resta a 0 finché non sono passati TAGLINE_MS dall'ultimo
      // atterraggio (la tagline deve finire prima che il quadrato parta).
      const gateOpen =
        landed && landedAt > 0 && performance.now() - landedAt >= TAGLINE_MS;
      const target2 = gateOpen
        ? clamp01((window.scrollY - P2_START) / P2_RANGE)
        : 0;
      current2 = reduced ? target2 : current2 + (target2 - current2) * EASE;
      if (Math.abs(target2 - current2) < 0.001) current2 = target2;
      root.style.setProperty("--p2", current2.toFixed(4));

      // Aggancio del pannello CTA al punto reale (solo quando la fase 2 è
      // attiva: durante la fase 1 il punto sta ancora prendendo posizione).
      if (current2 > 0.0001) {
        if (!dot) dot = document.querySelector(".tagline-dot");
        if (dot) {
          const r = dot.getBoundingClientRect();
          root.style.setProperty("--dot-cx", `${(r.left + r.width / 2).toFixed(1)}px`);
          root.style.setProperty("--dot-cy", `${(r.top + r.height / 2).toFixed(1)}px`);
          root.style.setProperty("--dot-size", `${Math.max(r.width, 8).toFixed(1)}px`);
        }
      }

      // Atterraggio / ripartenza: cambia classe solo agli attraversamenti.
      // `hero-leaving` (animazione inversa) parte solo dopo un atterraggio.
      if (!landed && current >= LAND_IN) {
        landed = true;
        landedAt = performance.now();
        root.classList.add("hero-landed");
        root.classList.remove("hero-leaving");
      } else if (landed && current < LAND_OUT) {
        landed = false;
        root.classList.remove("hero-landed");
        root.classList.add("hero-leaving");
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      root.style.removeProperty("--p");
      root.style.removeProperty("--p2");
      root.style.removeProperty("--dot-cx");
      root.style.removeProperty("--dot-cy");
      root.style.removeProperty("--dot-size");
      root.classList.remove("hero-landed", "hero-leaving");
    };
  }, []);

  return null;
}
