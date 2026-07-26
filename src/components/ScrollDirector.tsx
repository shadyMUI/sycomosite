"use client";

import { useEffect } from "react";

/**
 * Regista SCROLL-DRIVEN: l'esperienza è ancora cinematografica, ma ora
 * guidata dalla posizione di scroll NATIVA — niente più blocco dell'input.
 *
 * Lo scroll è libero: l'utente controlla il ritmo. I progressi (--p, --p2,
 * --p3, --p4) sono funzione continua della posizione di scroll.
 * Le classi (hero-landed, scene-live, bh-live, arch-live) si attivano a
 * soglie fisse.
 *
 * Il nero (black hole) e l'archivio restano a tempo: si attivano una volta
 * quando lo scroll supera la soglia, ma NON bloccano lo scroll.
 *
 * La pagina ha bisogno di altezza reale per scrollare: page.tsx aggiunge
 * un contenitore alto ~700vh con sezioni-spaziatore.
 */

const FINALE_MS = 9600;
const FLOOD_SWAP_MS = 850;
const FLOOD_TOTAL_MS = 2000;
// "we make your dreams come true": le lettere salgono (ultima a 0.92s + 0.72s
// di corsa), poi il punto quadrato scoppia (fino a 2.33s). Il buco nero NON
// parte prima che questa animazione sia finita, anche se si scorre di fretta.
const SCENE_MS = 2400;
// L'archivio: il cassetto sale (1s di attesa + 1.1s di corsa) e le cartelle
// si assestano (fino a 1.6s + 0.65s). Il lancio del razzo aspetta che tutto
// sia a posto, così scorrendo veloce non si salta la scena del cassetto.
const ARCH_MS = 2400;

export default function ScrollDirector() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const wait = (ms: number) =>
      new Promise<void>((r) => window.setTimeout(r, reduced ? 0 : ms));

    // ── Stato ──
    let taglineOn = false;
    let dotMeasured = false;
    let sinkOn = false; // le lettere di "so, what do we do?" stanno affondando
    let sceneOn = false;
    let sceneAt = 0; // quando è partita la salita del titolo
    let finaleTimer = 0; // buco nero in attesa che il titolo finisca
    let bhTriggered = false;
    let bhDone = false;
    let rewinding = false;
    let archOn = false;
    let archAt = 0; // quando è partita la salita del cassetto
    let spaceTimer = 0; // lancio in attesa che l'archivio sia montato
    let spaceOn = false; // il razzo è partito: cielo nero e sistema solare

    // ── Utilità ──
    const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
    const lerp = (scroll: number, start: number, end: number) =>
      clamp01((scroll - start) / (end - start));

    const put = (k: string, v: number) =>
      root.style.setProperty(`--${k}`, v.toFixed(4));

    // il pannello CTA cresce dal punto reale di "sycomo."
    const measureDot = () => {
      if (dotMeasured) return;
      const d = document.querySelector(".tagline-dot");
      if (!d) return;
      const r = d.getBoundingClientRect();
      root.style.setProperty("--dot-cx", `${(r.left + r.width / 2).toFixed(1)}px`);
      root.style.setProperty("--dot-cy", `${(r.top + r.height / 2).toFixed(1)}px`);
      root.style.setProperty("--dot-size", `${Math.max(r.width, 8).toFixed(1)}px`);
      dotMeasured = true;
    };

    // ── Finale (black hole): una volta, a tempo, NON blocca scroll ──
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

      // Typewriter pilotato in JS
      const typed = [
        ...document.querySelectorAll<HTMLElement>(".fs-ch"),
      ].map((el) => ({
        el,
        at: (parseFloat(el.style.getPropertyValue("--td")) || 0) * 1000,
      }));
      const copyChars = [
        ...document.querySelectorAll<HTMLElement>(".fs-copy .fs-ch"),
      ];
      const caret = document.querySelector<HTMLElement>(".fs-caret");
      const dot = document.querySelector<HTMLElement>(".fs-dot");

      const lastOnCopy = (): HTMLElement | null => {
        for (let i = copyChars.length - 1; i >= 0; i--) {
          if (copyChars[i].classList.contains("is-on")) return copyChars[i];
        }
        return null;
      };
      const placeCaret = (last: HTMLElement) => {
        if (!caret) return;
        const r = last.getBoundingClientRect();
        const h = r.height * 0.74;
        const w = Math.max(r.height * 0.085, 2);
        caret.style.width = `${w.toFixed(1)}px`;
        caret.style.height = `${h.toFixed(1)}px`;
        caret.style.left = `${(r.right + w * 1.4).toFixed(1)}px`;
        caret.style.top = `${(r.bottom - h - r.height * 0.06).toFixed(1)}px`;
        caret.classList.add("on");
      };
      const placeDot = (last: HTMLElement) => {
        if (!dot) return;
        const r = last.getBoundingClientRect();
        const size = Math.max(r.height * 0.32, 6);
        dot.style.width = `${size.toFixed(1)}px`;
        dot.style.height = `${size.toFixed(1)}px`;
        dot.style.left = `${(r.right + size * 0.5).toFixed(1)}px`;
        dot.style.top = `${(r.bottom - size - r.height * 0.04).toFixed(1)}px`;
        dot.classList.add("on");
      };

      typed.forEach((c) => c.el.classList.remove("is-on"));
      caret?.classList.remove("on");
      if (caret) caret.style.opacity = "0";
      dot?.classList.remove("on");
      if (dot) dot.style.opacity = "0";

      if (reduced) {
        typed.forEach((c) => c.el.classList.add("is-on"));
        const last = lastOnCopy();
        if (last) placeDot(last);
      } else {
        const t0 = performance.now();
        const type = () => {
          const t = performance.now() - t0;
          let pending = false;
          for (const c of typed) {
            if (t >= c.at) c.el.classList.add("is-on");
            else pending = true;
          }
          const last = lastOnCopy();
          if (last) {
            if (pending) {
              placeCaret(last);
            } else {
              caret?.classList.remove("on");
              if (caret) caret.style.opacity = "0";
              placeDot(last);
            }
          }
          if (pending) requestAnimationFrame(type);
        };
        requestAnimationFrame(type);
      }

      await wait(FINALE_MS);
      root.classList.add("bh-done");
      bhDone = true;
      // Il finale dura ~10s A TEMPO: nel frattempo lo scroll può essere già
      // finito oltre la soglia dell'archivio — o proprio in fondo alla
      // pagina, dove non arrivano più eventi. Senza rivalutare qui, la
      // scena resterebbe congelata su "got an idea for a site?" e
      // l'archivio spunterebbe solo al primo movimento (anche all'insù).
      onScroll();
    };

    const runRewind = async () => {
      if (rewinding) return; // onScroll martella: un rewind per volta
      rewinding = true;
      root.classList.add("bh-rewind");
      await wait(FLOOD_SWAP_MS);
      root.classList.remove("bh-live", "bh-done");
      put("p4", 1);
      root.classList.add("scene-live");
      sceneOn = true;
      await wait(FLOOD_TOTAL_MS - FLOOD_SWAP_MS);
      root.classList.remove("bh-rewind");
      bhTriggered = false;
      bhDone = false;
      rewinding = false;
      onScroll(); // idem: rivaluto dov'è finito lo scroll nel frattempo
    };

    // ── Mappa scroll → sezioni (in unità viewport) ──
    // La pagina ha 7 viewport di altezza (spacer in page.tsx).
    // Sezione 0: 0–1vh    → hero statica
    // Sezione 1: 1–2vh    → logo vola (--p: 0→1)
    // Sezione 2: 2–2.5vh  → tagline zone (hero-landed)
    // Sezione 3: 2.5–3.5vh → CTA cresce (--p2: 0→1)
    // Sezione 4: 3.5–4.2vh → lettere affondano (--p3: 0→1)
    // Sezione 5: 4.2–5vh  → scena invertita (--p4: 0→1)
    // Sezione 6: 5–5.5vh  → scene-live (titolo sale)
    // Sezione 7: 5.5–6vh  → finale (buco nero trigger & archivio)
    const onScroll = () => {
      const vh = window.innerHeight;
      const y = window.scrollY;

      // Viewport non ancora dimensionato (succede in inizializzazione e in
      // certe tab in background): con vh=0 ogni lerp fa 0/0 = NaN, e le vars
      // finirebbero a "NaN" — il logo collasserebbe a font-size 0. Meglio
      // saltare del tutto: al primo scroll utile si ricalcola.
      if (!vh) return;

      // --p: logo vola nell'header
      const p = lerp(y, 1 * vh, 2 * vh);
      put("p", p);

      // Tagline: appare quando il logo è atterrato
      const taglineThreshold = 2 * vh;
      if (y >= taglineThreshold && !taglineOn) {
        taglineOn = true;
        dotMeasured = false; // rimisurerà
        root.classList.remove("hero-leaving");
        root.classList.add("hero-landed");
      } else if (y < taglineThreshold && taglineOn) {
        taglineOn = false;
        root.classList.remove("hero-landed");
        root.classList.add("hero-leaving");
        setTimeout(() => {
          if (!taglineOn) root.classList.remove("hero-leaving");
        }, 1000);
      }

      // Misura il punto della tagline prima che il CTA inizi a crescere
      if (taglineOn && !dotMeasured && y >= 2.3 * vh) {
        measureDot();
      }

      // --p2: CTA cresce dal punto
      const p2 = lerp(y, 2.5 * vh, 3.5 * vh);
      put("p2", p2);

      // --p3: il PANNELLO si mangia il margine (resta legato allo scroll)
      const p3 = lerp(y, 3.5 * vh, 4.2 * vh);
      put("p3", p3);

      // Le LETTERE invece no: superata la soglia affondano con la loro corsa,
      // a tempo, indipendente da quanto in fretta si scorre. Risalendo, la
      // classe si toglie e l'affondo si riavvolge (transizioni reversibili).
      const sinkThreshold = 3.5 * vh;
      if (y >= sinkThreshold && !sinkOn) {
        sinkOn = true;
        root.classList.add("sink-live");
      } else if (y < sinkThreshold && sinkOn) {
        sinkOn = false;
        root.classList.remove("sink-live");
      }

      // --p4: scena invertita rivelata
      const p4 = lerp(y, 4.2 * vh, 5 * vh);
      put("p4", p4);

      // scene-live: titolo sale dal portale
      const sceneThreshold = 5 * vh;
      if (p4 >= 1 && y >= sceneThreshold && !sceneOn && !bhTriggered) {
        sceneOn = true;
        sceneAt = performance.now(); // da qui parte la salita delle lettere
        root.classList.add("scene-live");
      } else if ((p4 < 1 || y < sceneThreshold) && sceneOn && !bhTriggered) {
        sceneOn = false;
        sceneAt = 0;
        root.classList.remove("scene-live");
      }

      // Black hole: trigger una volta — ma solo DOPO che "we make your dreams
      // come true" ha finito di comporsi. Se si scorre di fretta, il finale
      // aspetta il tempo che manca invece di tagliare il titolo a metà.
      const bhThreshold = 5.4 * vh;
      if (y >= bhThreshold && !bhTriggered) {
        bhTriggered = true;
        const rest =
          reduced || !sceneAt
            ? 0
            : Math.max(0, SCENE_MS - (performance.now() - sceneAt));
        if (rest === 0) {
          runFinale();
        } else {
          window.clearTimeout(finaleTimer);
          finaleTimer = window.setTimeout(() => {
            // se nel frattempo si è risaliti, il finale non parte
            if (window.scrollY < bhThreshold) {
              bhTriggered = false;
              return;
            }
            runFinale();
          }, rest);
        }
      }
      // Rewind: torna su dal finale
      if (y < bhThreshold && bhDone) {
        runRewind();
      }

      // Archivio: la ruota migra a destra, entrano schedario e cartellina
      const archThreshold = 5.8 * vh;
      if (y >= archThreshold && bhDone && !archOn) {
        archOn = true;
        archAt = performance.now(); // da qui il cassetto comincia a salire
        root.classList.add("arch-live");
      } else if (y < archThreshold && archOn) {
        archOn = false;
        archAt = 0;
        root.classList.remove("arch-live");
      }

      // SPAZIO: il cassetto diventa un razzo e parte, il cielo si fa nero e
      // appare il sistema solare dei social. Tutta la regia è a delay CSS
      // sulla classe → risalendo si riavvolge da sola.
      // Come per il titolo prima del buco nero: se si scorre di fretta il
      // lancio ASPETTA che il cassetto sia salito e le cartelle siano a
      // posto, invece di partire subito saltando tutta la scena.
      const spaceThreshold = 6.7 * vh;
      if (y >= spaceThreshold && archOn && !spaceOn) {
        spaceOn = true;
        const rest =
          reduced || !archAt
            ? 0
            : Math.max(0, ARCH_MS - (performance.now() - archAt));
        if (rest === 0) {
          root.classList.add("space-live");
        } else {
          window.clearTimeout(spaceTimer);
          spaceTimer = window.setTimeout(() => {
            // se nel frattempo si è risaliti, il lancio non parte
            if (window.scrollY < spaceThreshold) {
              spaceOn = false;
              return;
            }
            root.classList.add("space-live");
          }, rest);
        }
      } else if (y < spaceThreshold && spaceOn) {
        spaceOn = false;
        window.clearTimeout(spaceTimer);
        root.classList.remove("space-live");
      }
    };

    // Inizializza i progressi a 0
    put("p", 0);
    put("p2", 0);
    put("p3", 0);
    put("p4", 0);

    // Scroll NATIVO: non blocchiamo nulla
    window.scrollTo(0, 0);
    window.addEventListener("scroll", onScroll, { passive: true });

    // Chiama subito per sincronizzare se la pagina è già scrollata
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(finaleTimer);
      window.clearTimeout(spaceTimer);
      root.style.removeProperty("--p");
      root.style.removeProperty("--p2");
      root.style.removeProperty("--p3");
      root.style.removeProperty("--p4");
      root.classList.remove(
        "hero-landed",
        "hero-leaving",
        "sink-live",
        "scene-live",
        "bh-live",
        "bh-done",
        "bh-rewind",
        "arch-live",
        "space-live"
      );
    };
  }, []);

  return null;
}
