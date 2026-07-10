"use client";

import { useEffect } from "react";

/**
 * Regista a PASSI: l'esperienza è una sequenza cinematografica. Lo scroll
 * nativo è disattivato; ogni gesto (wheel / touch / frecce) fa avanzare o
 * tornare di UN atto, e mentre l'animazione dell'atto è in corso l'input è
 * IGNORATO → lo scroll è di fatto bloccato finché l'animazione non finisce.
 *
 * Ogni atto guida a tempo un progresso (--p / --p2 / --p3 / --p4) e/o delle
 * classi (hero-landed, scene-live, bh-*). Tutte le animazioni restano le
 * stesse: qui cambia solo COME avanzano (tempo invece di posizione di scroll).
 *
 * Atti:  0 hero · 1 header+tagline · 2 pannello CTA · 3 affondo lettere ·
 *        4 scena invertita · 5 buco nero (finale). Il ritorno da 5 fa il
 *        flood d'acqua bianca e riporta alla scena invertita.
 */

// Durate (ms) di ciascuna animazione — lo scroll è bloccato per tutta la durata.
const D_P1 = 950; // logo che vola nella header
const D_TAGLINE_IN = 2300; // comparsa "WE ARE sycomo."
const D_TAGLINE_OUT = 1000; // smontaggio inverso della tagline
const D_P2 = 1500; // il punto cresce nel pannello CTA
// Atto unico "so what do we do → this is a demo": affondo + dissolvenza in
// una sola animazione, un po' più veloce di prima.
const D_P3 = 1150; // il pannello copre + lettere che affondano
const D_P4 = 1000; // dissolvenza pannello → scena invertita
const D_TITLE = 1550; // il titolo (24 lettere) sale dal portale
const FINALE_MS = 6300; // buco nero → cielo stellato
const FLOOD_SWAP_MS = 850; // pieno bianco → smonta finale
const FLOOD_TOTAL_MS = 2000; // fine flood
const MAX_STEP = 4; // 0 hero · 1 header+tagline · 2 CTA · 3 scena · 4 finale

type Key = "p" | "p2" | "p3" | "p4";

export default function ScrollDirector() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let step = 0; // atto completato (0..5)
    let busy = false; // animazione in corso → input bloccato
    let raf = 0;
    const prog: Record<Key, number> = { p: 0, p2: 0, p3: 0, p4: 0 };
    const put = (k: Key) => root.style.setProperty(`--${k}`, prog[k].toFixed(4));

    // Libreria di easing: curve diverse per non essere mai meccanici.
    type Ease = (t: number) => number;
    const E = {
      smooth: (t: number) => t * t * (3 - 2 * t), // ease-in-out morbido
      outCubic: (t: number) => 1 - Math.pow(1 - t, 3), // parte veloce, finisce piano
      outQuint: (t: number) => 1 - Math.pow(1 - t, 5), // decelera a lungo, atterra dolce
      inQuint: (t: number) => t * t * t * t * t, // specchio di outQuint (per il reverse)
      inCubic: (t: number) => t * t * t, // parte piano, accelera
      inOutCubic: (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      inOutQuart: (t: number) =>
        t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2, // curva drammatica
    };

    // tween a tempo di un progresso, con easing scelto
    const tween = (k: Key, to: number, ms: number, ease: Ease = E.smooth) =>
      new Promise<void>((res) => {
        const from = prog[k];
        if (reduced || ms <= 0 || from === to) {
          prog[k] = to;
          put(k);
          return res();
        }
        const t0 = performance.now();
        const loop = () => {
          const e = Math.min((performance.now() - t0) / ms, 1);
          prog[k] = from + (to - from) * ease(e);
          put(k);
          if (e < 1) raf = requestAnimationFrame(loop);
          else {
            prog[k] = to;
            put(k);
            res();
          }
        };
        raf = requestAnimationFrame(loop);
      });

    const wait = (ms: number) =>
      new Promise<void>((r) => window.setTimeout(r, reduced ? 0 : ms));

    // il pannello CTA cresce dal punto reale di "sycomo." (misurato dal vivo)
    const measureDot = () => {
      const d = document.querySelector(".tagline-dot");
      if (!d) return;
      const r = d.getBoundingClientRect();
      root.style.setProperty("--dot-cx", `${(r.left + r.width / 2).toFixed(1)}px`);
      root.style.setProperty("--dot-cy", `${(r.top + r.height / 2).toFixed(1)}px`);
      root.style.setProperty("--dot-size", `${Math.max(r.width, 8).toFixed(1)}px`);
    };

    // finale: misura i vettori di risucchio verso il centro, poi lascia
    // correre la sequenza CSS (buco nero) per FINALE_MS
    const runFinale = async () => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const d = document.querySelector(".is-title-dot");
      if (d) {
        const r = d.getBoundingClientRect();
        root.style.setProperty("--bh-dx0", `${(r.left + r.width / 2 - cx).toFixed(1)}px`);
        root.style.setProperty("--bh-dy0", `${(r.top + r.height / 2 - cy).toFixed(1)}px`);
        root.style.setProperty("--bh-s0", `${Math.max(r.width / 46, 0.15).toFixed(3)}`);
      }
      const aim = (el: Element, delay: number) => {
        const r = el.getBoundingClientRect();
        const e = el as HTMLElement;
        e.style.setProperty("--sdx", `${(cx - (r.left + r.width / 2)).toFixed(1)}px`);
        e.style.setProperty("--sdy", `${(cy - (r.top + r.height / 2)).toFixed(1)}px`);
        e.style.setProperty("--sd", `${delay.toFixed(2)}s`);
      };
      const cells = [...document.querySelectorAll(".is-cell")];
      cells.forEach((el, i) => aim(el, 0.9 + i * 0.1));
      const shapes = [...document.querySelectorAll(".inverted-scene .is-shape")];
      shapes.forEach((el, j) => aim(el, 2.0 + j * 0.15));
      root.classList.add("bh-live");
      await wait(FINALE_MS);
      root.classList.add("bh-done");
    };

    // ritorno dal finale: acqua bianca che riempie e si svuota; a metà
    // smonta il buco nero e ripristina la scena invertita
    const runRewind = async () => {
      root.classList.add("bh-rewind");
      await wait(FLOOD_SWAP_MS);
      root.classList.remove("bh-live", "bh-done");
      prog.p4 = 1;
      put("p4");
      root.classList.add("scene-live");
      await wait(FLOOD_TOTAL_MS - FLOOD_SWAP_MS);
      root.classList.remove("bh-rewind");
    };

    // ── Transizioni ──
    const forward = async () => {
      if (busy || step >= MAX_STEP) return;
      busy = true;
      const to = step + 1;
      if (to === 1) {
        // il logo si lancia e si posa dolce nell'angolo (decelera a lungo)
        await tween("p", 1, D_P1, E.outQuint);
        root.classList.remove("hero-leaving");
        root.classList.add("hero-landed"); // ora la tagline si compone
        await wait(D_TAGLINE_IN);
      } else if (to === 2) {
        measureDot();
        // il punto scatta fuori e rallenta aprendosi in pannello
        await tween("p2", 1, D_P2, E.outCubic);
      } else if (to === 3) {
        // ATTO UNICO "so what do we do → this is a demo": le lettere
        // affondano (affondo drammatico), poi il rosso si scioglie nella
        // scena invertita e le figure si posano; il titolo sale. Tutto di
        // fila, un po' più veloce.
        await tween("p3", 1, D_P3, E.inOutQuart);
        await tween("p4", 1, D_P4, E.outQuint);
        root.classList.add("scene-live"); // il titolo sale dal portale
        await wait(D_TITLE);
      } else if (to === 4) {
        await runFinale();
      }
      step = to;
      busy = false;
    };

    const backward = async () => {
      if (busy || step <= 0) return;
      busy = true;
      const from = step;
      const land = from - 1;
      if (from === 1) {
        root.classList.remove("hero-landed");
        root.classList.add("hero-leaving"); // la tagline si smonta (inverso)
        await wait(D_TAGLINE_OUT);
        await tween("p", 0, D_P1, E.inOutCubic); // il logo torna al centro
      } else if (from === 2) {
        await tween("p2", 0, D_P2, E.outCubic);
      } else if (from === 3) {
        // ANIMAZIONE OPPOSTA (esatta) a "so what do we do → this is a demo".
        // Forward: affondo (p3) → dissolvenza (p4, outQuint) → figure+titolo
        // entrano (scene-live). Reverse, in ordine inverso e con easing
        // specchiati: figure+titolo escono (transition inversa) → il rosso si
        // riforma (inQuint) → le lettere risalgono → si ferma appena riappare
        // "so, what do we do?".
        root.classList.remove("scene-live"); // figure e titolo escono
        await wait(D_TITLE); // simmetrico all'attesa della forward
        await tween("p4", 0, D_P4, E.inQuint); // il rosso si riforma
        await tween("p3", 0, D_P3, E.inOutQuart); // le lettere risalgono
      } else if (from === 4) {
        await runRewind();
      }
      step = land;
      busy = false;
    };

    // ── Input: scroll nativo spento, gesti che avanzano/tornano di un atto ──
    const DOWN_KEYS = new Set(["ArrowDown", "PageDown", " ", "Spacebar"]);
    const UP_KEYS = new Set(["ArrowUp", "PageUp"]);
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (busy) return;
      if (e.deltaY > 8) forward();
      else if (e.deltaY < -8) backward();
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (busy) return;
      const dy = touchY - e.touches[0].clientY;
      if (Math.abs(dy) < 28) return;
      touchY = e.touches[0].clientY;
      if (dy > 0) forward();
      else backward();
    };
    const onKey = (e: KeyboardEvent) => {
      if (DOWN_KEYS.has(e.key)) {
        e.preventDefault();
        if (!busy) forward();
      } else if (UP_KEYS.has(e.key)) {
        e.preventDefault();
        if (!busy) backward();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey, { passive: false });

    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    put("p");
    put("p2");
    put("p3");
    put("p4");

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      root.style.removeProperty("--p");
      root.style.removeProperty("--p2");
      root.style.removeProperty("--p3");
      root.style.removeProperty("--p4");
      root.classList.remove(
        "hero-landed",
        "hero-leaving",
        "scene-live",
        "bh-live",
        "bh-done",
        "bh-rewind"
      );
    };
  }, []);

  return null;
}
