"use client";

import { useEffect } from "react";

/**
 * Regia dell'ingresso e dello scorrimento.
 *
 * All'avvio della pagina (sia desktop che mobile), orchestra l'animazione
 * d'ingresso che porta automaticamente il logo nella testata (--p da 0 a 1),
 * accende la barra di vetro (.site-header) e svela il testo introduttivo (<CheComputer>).
 *
 * Una volta completata l'apertura, il logo rimane ancorato nella testata e non
 * viene più resettato dal rimbalzo elastico (rubber-banding y <= 4) su mobile,
 * garantendo uno scorrimento fluido, naturale e privo di blocchi.
 *
 * Se l'utente richiede "prefers-reduced-motion", l'apertura è istantanea senza attesa.
 */
const APRE_SCROLL = 10;
// Coordinato con il sipario d'apertura (.intro nel CSS dura 1100ms = 120ms pausa + 980ms discesa fluida):
// l'animazione del titolo parte solo DOPO che la schermata arancione/rossa ha finito di scendere.
const DELAY_INGRESSO_MS = 1180;

export default function ScrollDirector() {
  useEffect(() => {
    const root = document.documentElement;

    // Se il sito è già aperto (ad es. navigazione interna client-side tra pagine), manteniamo --p = 1
    if (
      root.classList.contains("figs-on") ||
      root.style.getPropertyValue("--p") === "1"
    ) {
      root.style.setProperty("--p", "1");
      root.classList.add("figs-on");
      return;
    }

    const mediaReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let aperto = false;
    let timer: NodeJS.Timeout | null = null;
    let onIntroDoneRef: (() => void) | null = null;
    let onScrollRef: (() => void) | null = null;

    const apri = (immediato = false) => {
      if (aperto) return;
      aperto = true;

      if (immediato || mediaReducedMotion.matches) {
        root.style.setProperty("transition", "none");
        root.style.setProperty("--p", "1");
        root.classList.add("figs-on");
        void root.offsetHeight;
        root.style.removeProperty("transition");
      } else {
        root.style.setProperty("--p", "1");
        root.classList.add("figs-on");
      }
    };

    const avvia = () => {
      // 1. Se l'utente preferisce meno movimento, apertura immediata
      if (mediaReducedMotion.matches) {
        apri(true);
        return;
      }

      // 2. Se la pagina è già scorsa (es. ripristino posizione browser o refresh), apertura immediata
      if (window.scrollY > APRE_SCROLL) {
        apri(true);
        return;
      }

      // 3. Ascolta l'evento 'sycomo:intro-done' emesso da IntroCurtain quando il liquido è sceso del tutto
      const onIntroDone = () => {
        if (timer) clearTimeout(timer);
        apri(false);
      };
      onIntroDoneRef = onIntroDone;
      window.addEventListener("sycomo:intro-done", onIntroDone, { once: true });

      // 4. Timer di fallback garantito sincronizzato col termine dell'intro (1450ms)
      timer = setTimeout(() => {
        apri(false);
      }, DELAY_INGRESSO_MS);

      // 5. Solo un vero scorrimento intenzionale dell'utente (scroll / wheel) sblocca prima dell'intro
      const onScroll = () => {
        if (window.scrollY > APRE_SCROLL) {
          if (timer) clearTimeout(timer);
          window.removeEventListener("sycomo:intro-done", onIntroDone);
          apri(false);
        }
      };
      onScrollRef = onScroll;
      window.addEventListener("scroll", onScroll, { passive: true });
    };

    // Attendiamo che tutti gli asset (immagini, stili, font, layout) siano caricati
    // prima di dare il via alle animazioni sincronizzate: in questo modo tutte le copie
    // delle lastre partono rigorosamente dallo stesso fotogramma.
    const fontsPromise = typeof document !== "undefined" && document.fonts ? document.fonts.ready : Promise.resolve();
    if (typeof document !== "undefined" && document.readyState === "complete") {
      fontsPromise.then(avvia);
    } else if (typeof window !== "undefined") {
      window.addEventListener(
        "load",
        () => {
          fontsPromise.then(avvia);
        },
        { once: true }
      );
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (onIntroDoneRef) window.removeEventListener("sycomo:intro-done", onIntroDoneRef);
      if (onScrollRef) window.removeEventListener("scroll", onScrollRef);
    };
  }, []);

  return null;
}

