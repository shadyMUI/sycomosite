"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Curated list of minimalist, clean ASCII / Unicode kaomojis.
 * Rendered in monospace font with bullet separator.
 */
const BASE_KAOMOJI_LIST: string[] = [
  "( •_• )",
  "( ◡‿◡ )",
  "( ≧◡≦ )",
  "( ˘⌣˘ )",
  "( ¬‿¬ )",
  "( ^‿^ )",
  "( •̀ ω •́ )",
  "( ◕‿◕ )",
  "( ˙꒳​˙ )",
  "( ´ ▽ ` )",
];

interface TrackTemplate {
  level: "large" | "medium" | "small";
  colorClass: string;
  sizeClass: string;
  heightClass: string;
  direction: "forward" | "reverse";
  speedDuration: string;
  kaomojiOffset: number;
}

/**
 * Visual hierarchy for standard light paper background:
 * ESATTAMENTE 3 linee grandi, in tre tonalità del marchio.
 * Tutte usano text-6xl lg:text-8xl e mantengono l'inclinazione comune.
 * Scorrimento molto lento (720s - 880s), a direzione alternata, con crescita graduale.
 */
const BASE_TRACK_TEMPLATES: TrackTemplate[] = [
  { level: "large", colorClass: "text-[#e12c1a]", sizeClass: "text-6xl lg:text-8xl", heightClass: "h-28 lg:h-36", direction: "forward", speedDuration: "720s", kaomojiOffset: 0 },
  { level: "large", colorClass: "text-[#e12c1a]", sizeClass: "text-6xl lg:text-8xl", heightClass: "h-28 lg:h-36", direction: "reverse", speedDuration: "760s", kaomojiOffset: 3 },
  { level: "large", colorClass: "text-[#e12c1a]", sizeClass: "text-6xl lg:text-8xl", heightClass: "h-28 lg:h-36", direction: "forward", speedDuration: "800s", kaomojiOffset: 6 },
];

function buildTrackKaomojis(offset: number): string[] {
  const shifted = Array.from({ length: BASE_KAOMOJI_LIST.length }, (_, i) =>
    BASE_KAOMOJI_LIST[(i + offset) % BASE_KAOMOJI_LIST.length],
  );
  return Array.from({ length: 18 }, () => shifted).flat();
}

export interface DiagonalKaomojiBackgroundProps {
  theme?: "default" | "negative";
  scoped?: boolean;
  className?: string;
}

interface GeometryState {
  viewWidth: number;
  viewHeight: number;
  winHeight: number;
  trackWidth: number;
  spacing: number;
}

export default function DiagonalKaomojiBackground({
  className,
}: DiagonalKaomojiBackgroundProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const tracksLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /* Chi ha chiesto meno movimento non deve subire nessun effetto:
       l'intervallo sparirebbe del tutto, non solo la marcia del CSS. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layer = tracksLayerRef.current;
    if (!layer) return;

    /* La sfocatura può interessare solo glifi entro 100px dal viewport.
       IntersectionObserver tiene questo insieme aggiornato mentre le
       tracce scorrono via CSS: evitiamo di interrogare il layout di tutti
       i glifi fuori schermo a ogni aggiornamento. */
    const glifiVisibili = new Set<HTMLElement>();
    const glifiObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const glyph = entry.target as HTMLElement;
          if (entry.isIntersecting) glifiVisibili.add(glyph);
          else glifiVisibili.delete(glyph);
        }
        schedule();
      },
      { rootMargin: "100px" },
    );
    layer.querySelectorAll<HTMLElement>("[data-kaomoji]").forEach((glyph) => {
      glifiObserver.observe(glyph);
    });

    const stiliApplicati = new WeakMap<HTMLElement, { filter: string; color: string }>();

    const updateBlur = () => {
      const textRects = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".uso-domanda, .uso-testo, .cnt-titolo, .cnt-etichetta, .cnt-mail, .cnt-altra-domanda, .cnt-altra-vai, .mod-frase, .mod-etichetta",
        ),
      )
        .filter((element) => {
          const style = getComputedStyle(element);
          return style.visibility !== "hidden" && Number(style.opacity) > 0.01;
        })
        .flatMap((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return Array.from(range.getClientRects());
        });
      if (!textRects.length) return;

      // Misura la distanza dal glifo reale, non dal centro della sequenza:
      // con kaomoji grandi il centro poteva trovarsi centinaia di pixel
      // più avanti del simbolo che stava già passando sopra al testo.
      const reach = 100;
      glifiVisibili.forEach((glyph) => {
        const rect = glyph.getBoundingClientRect();

        /* Evita hypot per i riquadri sicuramente fuori dal raggio. Se un
           glifo tocca il testo la distanza minima è zero: ulteriori
           confronti non possono cambiare il risultato. */
        let distance = reach;
        for (const text of textRects) {
          const dx = Math.max(text.left - rect.right, 0, rect.left - text.right);
          if (dx >= distance) continue;
          const dy = Math.max(text.top - rect.bottom, 0, rect.top - text.bottom);
          if (dy >= distance) continue;
          const candidate = Math.hypot(dx, dy);
          if (candidate < distance) {
            distance = candidate;
            if (distance === 0) break;
          }
        }
        const proximity = Math.max(0, 1 - distance / reach);
        // Una curva percettiva rende il blur visibile già in avvicinamento,
        // invece di concentrare quasi tutto l'effetto sull'ultimo tratto.
        const easedProximity = Math.pow(proximity, 0.68);
        const blur = easedProximity * 32;
        const filter = blur > 0.15 ? `blur(${blur.toFixed(1)}px)` : "none";
        const color = easedProximity > 0.01
          ? `color-mix(in srgb, #e12c1a ${Math.round((1 - easedProximity * 0.5) * 100)}%, #f7f4ed)`
          : "#e12c1a";
        const previous = stiliApplicati.get(glyph);
        if (!previous || previous.filter !== filter) glyph.style.filter = filter;
        if (!previous || previous.color !== color) glyph.style.color = color;
        stiliApplicati.set(glyph, { filter, color });
      });
    };

    let timer: number | undefined;
    const schedule = () => {
      if (timer !== undefined) return;
      timer = window.setTimeout(() => {
        timer = undefined;
        updateBlur();
      }, 32);
    };
    updateBlur();
    const observer = new ResizeObserver(schedule);
    observer.observe(document.documentElement);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    /* Intervallo rado: il blur serve solo per far sembrare il testo
       leggibile davanti al flusso, una correzione ogni ~120ms è
       indistinguibile e costa un terzo di prima. La scheda nascosta
       fa fermare tutto il ciclo. */
    let animation: number | null = window.setInterval(schedule, 120);
    const onVisibility = () => {
      if (document.hidden) {
        if (animation !== null) window.clearInterval(animation);
        animation = null;
      } else if (animation === null) {
        animation = window.setInterval(schedule, 120);
      }
    };
    window.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      glifiObserver.disconnect();
      glifiVisibili.clear();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("visibilitychange", onVisibility);
      if (animation !== null) window.clearInterval(animation);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  // SSR initial baseline: exact deterministic defaults
  const [geometry, setGeometry] = useState<GeometryState>(() => {
    const initW = 1920;
    const initH = 7000;
    const initWinH = 950;
    const initL = Math.sqrt(initW * initW + initH * initH);
    return {
      viewWidth: initW,
      viewHeight: initH,
      winHeight: initWinH,
      trackWidth: Math.max(initL * 2.5, 35000),
      spacing: 180,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const measureAndAdjust = () => {
      const winWidth = document.documentElement.clientWidth || window.innerWidth;
      const winH = window.innerHeight || 950;
      const totalPageHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        containerRef.current?.parentElement?.scrollHeight || 0,
        winH
      );
      const L = Math.sqrt(winWidth * winWidth + totalPageHeight * totalPageHeight);
      const trackWidth = Math.max(L * 2.5, 35000);
      /* Distanza perpendicolare fra le tre diagonali: 200px lascia aria
         anche quando i glifi crescono sul desktop. Il livello è nascosto
         sui telefoni, ma manteniamo una misura più contenuta in fallback. */
      const spacing = winWidth < 768 ? 140 : 180;

      setGeometry((prev) => {
        if (
          Math.abs(prev.viewWidth - winWidth) < 1 &&
          Math.abs(prev.viewHeight - totalPageHeight) < 2 &&
          Math.abs(prev.winHeight - winH) < 2 &&
          Math.abs(prev.spacing - spacing) < 1
        ) {
          return prev;
        }
        return {
          viewWidth: winWidth,
          viewHeight: totalPageHeight,
          winHeight: winH,
          trackWidth,
          spacing,
        };
      });
    };

    measureAndAdjust();

    const ro = new ResizeObserver(measureAndAdjust);
    if (document.body) ro.observe(document.body);
    if (containerRef.current?.parentElement) ro.observe(containerRef.current.parentElement);

    window.addEventListener("resize", measureAndAdjust, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureAndAdjust);
    };
  }, []);

  /**
   * Sincronizzazione:
   * Nei momenti in cui le sezioni rosse (.rosso e .faq) salgono dal basso dello schermo,
   * compensiamo lo scorrimento affinché le 9 linee rimangano rigorosamente ferme a schermo.
   * Negli altri momenti (hero, navigazione interna ai contenuti, discesa verso il footer),
   * le linee scorrono fluidamente terminando esattamente nell'angolo in basso a sinistra.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;

    const updatePin = () => {
      rafId = null;
      const winH = window.innerHeight;
      const rosso = document.querySelector(".rosso");
      const faq = document.querySelector(".faq");

      const rossoRect = rosso ? rosso.getBoundingClientRect() : null;
      const faqRect = faq ? faq.getBoundingClientRect() : null;

      let compensateY = 0;

      // 1. Prima zona rossa (.rosso):
      // Si blocca solo durante l'ascesa del rosso sullo schermo (da rossoRect.top = winH a rossoRect.top = 0)
      if (rossoRect) {
        if (rossoRect.top < winH && rossoRect.top > 0) {
          compensateY += (winH - rossoRect.top);
        } else if (rossoRect.top <= 0) {
          compensateY += winH;
        }
      }

      // 2. Seconda zona rossa (.faq):
      // Si blocca solo durante l'ascesa delle FAQ sullo schermo (da faqRect.top = winH a faqRect.top = 0)
      if (faqRect) {
        if (faqRect.top < winH && faqRect.top > 0) {
          compensateY += (winH - faqRect.top);
        } else if (faqRect.top <= 0) {
          compensateY += winH;
        }
      }

      if (tracksLayerRef.current) {
        tracksLayerRef.current.style.transform = `translate3d(0, ${compensateY}px, 0)`;
      }
    };

    const onScrollOrResize = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updatePin);
      }
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    updatePin();

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const { viewWidth, viewHeight, winHeight, trackWidth, spacing } = geometry;

  const templates = BASE_TRACK_TEMPLATES;

  // La diagonale centrale attraversa l'intera pagina: dal bordo alto
  // quasi all'angolo destro a quello basso quasi all'angolo sinistro.
  const xTop = viewWidth * 0.98;
  const xBottom = viewWidth * 0.02;
  const deltaX = xTop - xBottom;
  const effectiveH = Math.max(1000, viewHeight);

  const midX = (xTop + xBottom) / 2;
  const midY = effectiveH / 2;

  // Angolazione diagonale calibrata:
  const angleRad = Math.atan2(-effectiveH, deltaX);
  const angleDeg = angleRad * (180 / Math.PI);

  // Vettore normale unitario perpendicolare alla diagonale (ruotato di +90deg: [ -sin(a), cos(a) ])
  // Spazia le 3 tracce in modo perfettamente parallelo ed equidistante
  const nx = -Math.sin(angleRad);
  const ny = Math.cos(angleRad);

  /**
   * ESATTAMENTE 3 linee, centrate attorno al tracciato principale.
   */
  const tracks = useMemo(() => {
    return templates.map((template, i) => {
      // Ogni linea è traslata solo lungo la normale: così restano
      // parallele e davvero distanziate, senza slittare una sull'altra.
      const d = (i - 1) * spacing;
      const localCenterX = midX + d * nx;
      const localCenterY = midY + d * ny;

      const trackKaomojis = buildTrackKaomojis(template.kaomojiOffset);
      const animationClass =
        template.direction === "forward"
          ? "animate-marquee-forward"
          : "animate-marquee-reverse";

      return {
        id: i,
        localCenterX,
        localCenterY,
        template,
        trackKaomojis,
        animationClass,
      };
    });
  }, [midX, midY, nx, ny, spacing, templates]);

  return (
    <div
      ref={containerRef}
      className={`${className || "absolute inset-x-0 top-0 z-0 overflow-hidden pointer-events-none select-none"} kaomoji-background`}
      style={{ height: `${viewHeight}px` }}
      aria-hidden="true"
    >
      <div ref={tracksLayerRef} className="absolute inset-0">
        {tracks.map((track) => (
          <div
            key={track.id}
            className={`absolute pointer-events-none select-none flex items-center font-mono font-bold whitespace-nowrap overflow-visible ${track.template.heightClass} ${track.template.sizeClass} ${track.template.colorClass}`}
            style={{
              left: `${track.localCenterX}px`,
              top: `${track.localCenterY}px`,
              width: `${trackWidth}px`,
              transform: `translate(-50%, -50%) rotate(${angleDeg}deg)`,
              transformOrigin: "center center",
            }}
          >
            {/*
              Continuous Marquee Runner:
              Runs GPU-accelerated CSS keyframe animation at 60/120fps.
              Duplicated twice side-by-side (Set A + Set B) for a gapless, infinite marquee loop.
            */}
            <div
              className={`flex w-max shrink-0 items-center whitespace-nowrap will-change-transform ${track.animationClass}`}
              style={{ animationDuration: track.template.speedDuration }}
            >
              {/* Set A */}
              <span className="inline-flex shrink-0 items-center px-4">
                {track.trackKaomojis.map((kaomoji, index) => (
                  <span key={`a-${index}`} className="kaomoji-glyph">
                    <span data-kaomoji className="kaomoji-face">{kaomoji}</span><span data-kaomoji className="kaomoji-separator">•</span>
                  </span>
                ))}
              </span>
              {/* Set B */}
              <span className="inline-flex shrink-0 items-center px-4">
                {track.trackKaomojis.map((kaomoji, index) => (
                  <span key={`b-${index}`} className="kaomoji-glyph">
                    <span data-kaomoji className="kaomoji-face">{kaomoji}</span><span data-kaomoji className="kaomoji-separator">•</span>
                  </span>
                ))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
