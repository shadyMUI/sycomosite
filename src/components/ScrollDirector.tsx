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

export default function ScrollDirector() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let current = Math.min(window.scrollY / RANGE, 1);
    let raf = 0;

    const tick = () => {
      const target = Math.min(window.scrollY / RANGE, 1);
      current = reduced ? target : current + (target - current) * EASE;
      if (Math.abs(target - current) < 0.001) current = target;
      root.style.setProperty("--p", current.toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      root.style.removeProperty("--p");
    };
  }, []);

  return null;
}
