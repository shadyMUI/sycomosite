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
 * ESATTAMENTE 9 linee in totale (3 terzine: Large, Medium, Small).
 * - 3 Large: text-[#e12c1a] full color, text-lg lg:text-xl, height h-10 lg:h-12
 * - 3 Medium: text-[#eb6b5e] (mid-tone), text-sm, height h-8
 * - 3 Small: text-[#f4a69e] (lightest tone), text-xs, height h-6
 * Velocità molto lente da banner pubblicitario (200s - 280s) per uno scorrimento calmo e rilassato.
 */
const BASE_TRACK_TEMPLATES: TrackTemplate[] = [
  { level: "large",  colorClass: "text-[#e12c1a]", sizeClass: "text-lg lg:text-xl", heightClass: "h-10 lg:h-12", direction: "forward", speedDuration: "210s", kaomojiOffset: 0 },
  { level: "medium", colorClass: "text-[#eb6b5e]", sizeClass: "text-sm",           heightClass: "h-8",          direction: "reverse", speedDuration: "240s", kaomojiOffset: 3 },
  { level: "small",  colorClass: "text-[#f4a69e]", sizeClass: "text-xs",           heightClass: "h-6",          direction: "forward", speedDuration: "270s", kaomojiOffset: 6 },
  { level: "large",  colorClass: "text-[#e12c1a]", sizeClass: "text-lg lg:text-xl", heightClass: "h-10 lg:h-12", direction: "reverse", speedDuration: "200s", kaomojiOffset: 1 },
  { level: "medium", colorClass: "text-[#eb6b5e]", sizeClass: "text-sm",           heightClass: "h-8",          direction: "forward", speedDuration: "230s", kaomojiOffset: 4 },
  { level: "small",  colorClass: "text-[#f4a69e]", sizeClass: "text-xs",           heightClass: "h-6",          direction: "reverse", speedDuration: "260s", kaomojiOffset: 7 },
  { level: "large",  colorClass: "text-[#e12c1a]", sizeClass: "text-lg lg:text-xl", heightClass: "h-10 lg:h-12", direction: "forward", speedDuration: "220s", kaomojiOffset: 2 },
  { level: "medium", colorClass: "text-[#eb6b5e]", sizeClass: "text-sm",           heightClass: "h-8",          direction: "reverse", speedDuration: "250s", kaomojiOffset: 5 },
  { level: "small",  colorClass: "text-[#f4a69e]", sizeClass: "text-xs",           heightClass: "h-6",          direction: "forward", speedDuration: "280s", kaomojiOffset: 8 },
];

/**
 * Builds repeated kaomoji sequence strings with offset for variety across tracks.
 * Repeated 18 times with bullet separators for continuous span in monospace.
 */
function buildTrackKaomojiString(offset: number): string {
  const shifted: string[] = [];
  const len = BASE_KAOMOJI_LIST.length;
  for (let i = 0; i < len; i++) {
    shifted.push(BASE_KAOMOJI_LIST[(i + offset) % len]);
  }
  const block = shifted.join("  •  ") + "  •  ";
  return block.repeat(18);
}

// Pre-computed deterministic track strings for exact SSR parity
const TRACK_STRINGS = Array.from({ length: BASE_KAOMOJI_LIST.length }, (_, i) =>
  buildTrackKaomojiString(i)
);

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

  // SSR initial baseline: exact deterministic defaults
  const [geometry, setGeometry] = useState<GeometryState>(() => {
    const initW = 1920;
    const initH = 6000;
    const initWinH = 950;
    const initL = Math.sqrt(initW * initW + initH * initH);
    return {
      viewWidth: initW,
      viewHeight: initH,
      winHeight: initWinH,
      trackWidth: Math.max(initL * 2.5, 35000),
      spacing: 60,
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
      const spacing = winWidth < 768 ? 44 : 60;

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

  // Calcolo dell'orientamento:
  // - In alto (inizio pagina): la striscia entra da destra leggermente rientrata (0.80 * viewWidth)
  // - In basso (footer): la striscia arriva dritta all'angolo in basso a sinistra (0.08 * viewWidth)
  const xTop = viewWidth * 0.80;
  const xBottom = viewWidth * 0.08;
  const deltaX = xTop - xBottom;
  const effectiveH = Math.max(1000, viewHeight - 2 * winHeight);

  const midX = (xTop + xBottom) / 2;
  const midY = effectiveH / 2;

  // Angolazione diagonale calibrata:
  const angleRad = Math.atan2(-effectiveH, deltaX);
  const angleDeg = angleRad * (180 / Math.PI);

  // Vettore normale unitario perpendicolare alla diagonale (ruotato di +90deg: [ -sin(a), cos(a) ])
  // Spazia le 9 tracce in modo perfettamente parallelo ed equidistante
  const nx = -Math.sin(angleRad);
  const ny = Math.cos(angleRad);

  /**
   * ESATTAMENTE 9 linee in totale (indices 0..8, i - 4 da -4 a +4).
   * Disposte a fascia diagonale sull'intera altezza della pagina fisica.
   */
  const tracks = useMemo(() => {
    return templates.map((template, i) => {
      const d = (i - 4) * spacing;
      const localCenterX = midX + d * nx;
      const localCenterY = midY + d * ny;

      const trackString = TRACK_STRINGS[template.kaomojiOffset % TRACK_STRINGS.length];
      const animationClass =
        template.direction === "forward"
          ? "animate-marquee-forward"
          : "animate-marquee-reverse";

      return {
        id: i,
        localCenterX,
        localCenterY,
        template,
        trackString,
        animationClass,
      };
    });
  }, [midX, midY, nx, ny, spacing, templates]);

  return (
    <div
      ref={containerRef}
      className={className || "absolute inset-x-0 top-0 z-0 overflow-hidden pointer-events-none select-none"}
      style={{ height: `${viewHeight}px` }}
      aria-hidden="true"
    >
      <div ref={tracksLayerRef} className="absolute inset-0">
        {tracks.map((track) => (
          <div
            key={track.id}
            className={`absolute pointer-events-none select-none flex items-center font-mono whitespace-nowrap overflow-visible ${track.template.heightClass} ${track.template.sizeClass} ${track.template.colorClass}`}
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
              <span className="inline-block shrink-0 px-4">{track.trackString}</span>
              {/* Set B */}
              <span className="inline-block shrink-0 px-4">{track.trackString}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
