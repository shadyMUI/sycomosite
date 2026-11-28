"use client";

import { useEffect, useRef, useState, useCallback, useTransition, useSyncExternalStore } from "react";
import type { Scatto } from "./Album";

type Props = {
  titolo: [string, string];
  scatti: Scatto[];
  onSelectCard?: (project: Scatto) => void;
};

type CardMetric = {
  offsetLeft: number;
  width: number;
  centerInStrip: number;
  idealTargetX: number;
  targetFraction: number;
};

// Sottoscrizione conforme React 19 a prefers-reduced-motion tramite useSyncExternalStore
function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerReducedMotionSnapshot() {
  return false;
}

export default function HorizontalPinAlbum({ titolo, scatti, onSelectCard }: Props) {
  const trackRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const railFillRef = useRef<HTMLDivElement | null>(null);

  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const watermarkRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLElement | null)[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [, startTransition] = useTransition();

  // Breakpoint guard: attivo solo su schermi desktop (>= 860px)
  const [isDesktop, setIsDesktop] = useState(false);
  const [isPastAlbum, setIsPastAlbum] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkPast = () => {
      // Quando la seconda sezione rossa (.faq) sale e raggiunge il top dello schermo,
      // ha coperto completamente l'album: lo nascondiamo per non interferire con le sezioni successive.
      const faq = document.querySelector(".faq");
      if (faq) {
        const rect = faq.getBoundingClientRect();
        setIsPastAlbum(rect.top <= 0);
      }
    };

    window.addEventListener("scroll", checkPast, { passive: true });
    checkPast();
    return () => window.removeEventListener("scroll", checkPast);
  }, []);

  const total = scatti.length;

  // Cache metrica per evitare forzature sincrone di layout (layout thrashing) nel ciclo RAF
  const metricsRef = useRef<{
    viewportWidth: number;
    scrollDistance: number;
    maxScrollX: number;
    cardMetrics: CardMetric[];
  }>({
    viewportWidth: 0,
    scrollDistance: 0,
    maxScrollX: 0,
    cardMetrics: [],
  });

  // Animazione lerp hardware-accelerated senza re-render React per singolo fotogramma
  const animStateRef = useRef({
    currentX: 0,
    targetX: 0,
    rafId: 0,
    isAnimating: false,
  });

  // Tracciamento distanza di trascinamento per evitare click spuri durante lo swipe
  const dragDistRef = useRef(0);

  // Gesto di trascinamento / swipe touch diretto
  const dragRef = useRef<{
    isDown: boolean;
    startX: number;
    startY: number;
    lastX: number;
    isDraggingHorizontal: boolean;
    pointerId: number | null;
  }>({
    isDown: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    isDraggingHorizontal: false,
    pointerId: null,
  });

  // Rileva preferenza movimento ridotto
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot
  );

  // Aggiornamento metriche geometriche (eseguito solo su resize, mount o cambi di dimensioni)
  const updateMetrics = useCallback(() => {
    const strip = stripRef.current;
    const viewport = viewportRef.current;
    if (!strip || !viewport) return;

    const viewportWidth = viewport.clientWidth;
    const stripWidth = strip.scrollWidth;
    const maxScrollX = Math.max(0, stripWidth - viewportWidth);

    const cardMetrics: CardMetric[] = cardRefs.current.map((cardEl, idx) => {
      if (!cardEl) {
        return {
          offsetLeft: 0,
          width: 0,
          centerInStrip: 0,
          idealTargetX: 0,
          targetFraction: total > 1 ? idx / (total - 1) : 0,
        };
      }
      const offsetLeft = cardEl.offsetLeft;
      const width = cardEl.offsetWidth;
      const centerInStrip = offsetLeft + width / 2;
      // Posizione target affinché la scheda sia esattamente centrata nello schermo
      const idealTargetX = Math.max(0, Math.min(maxScrollX, centerInStrip - viewportWidth / 2));
      const targetFraction =
        maxScrollX > 0
          ? idealTargetX / maxScrollX
          : total > 1
          ? idx / (total - 1)
          : 0;

      return {
        offsetLeft,
        width,
        centerInStrip,
        idealTargetX,
        targetFraction,
      };
    });

    metricsRef.current = {
      viewportWidth,
      scrollDistance: 1,
      maxScrollX,
      cardMetrics,
    };
  }, [total]);

  // Ciclo di animazione RAF ad altissima efficienza (Zero forced reflow, Zero React state spam)
  const startRaf = useCallback(() => {
    const tick = () => {
      const state = animStateRef.current;
      const metrics = metricsRef.current;
      const lerp = prefersReducedMotion ? 1 : 0.18;

      state.currentX += (state.targetX - state.currentX) * lerp;

      if (Math.abs(state.targetX - state.currentX) < 0.1) {
        state.currentX = state.targetX;
      }

      // 1. Traslazione nastro principale su GPU
      if (stripRef.current) {
        stripRef.current.style.transform = `translate3d(-${state.currentX}px, 0, 0)`;
      }

      // 2. Aggiornamento barra di avanzamento (dock rail) direttamente via ref
      const curP = metrics.maxScrollX > 0 ? state.currentX / metrics.maxScrollX : 0;
      const safeP = Math.max(0, Math.min(1, curP));
      if (railFillRef.current) {
        railFillRef.current.style.transform = `scaleX(${safeP})`;
      }

      // 3. Parallasse interna calcolata con aritmetica pura (ZERO getBoundingClientRect)
      const vCenter = metrics.viewportWidth / 2;
      for (let i = 0; i < total; i++) {
        const cMetric = metrics.cardMetrics[i];
        if (!cMetric) continue;
        const cardCenter = cMetric.offsetLeft + cMetric.width / 2 - state.currentX;
        const normalizedDist = vCenter > 0 ? (cardCenter - vCenter) / vCenter : 0;
        const clampedDist = Math.max(-1.4, Math.min(1.4, normalizedDist));

        const wm = watermarkRefs.current[i];
        if (wm && !prefersReducedMotion) {
          wm.style.transform = `translate3d(${clampedDist * -32}px, 0, 0)`;
        }
        const media = mediaRefs.current[i];
        if (media && !prefersReducedMotion) {
          media.style.transform = `translate3d(${clampedDist * 18}px, 0, 0)`;
        }
      }

      // 4. Calcola la scheda attiva dalla posizione del nastro, non dal
      // centro del viewport: su schermi molto larghi due schede stanno
      // entrambe vicine al centro e la prima veniva scavalcata dalla
      // seconda pur essendo il nastro ancora a zero.
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < total; i++) {
        const cMetric = metrics.cardMetrics[i];
        if (!cMetric) continue;
        const diff = Math.abs(cMetric.idealTargetX - state.currentX);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }

      // 5. Notifica React SOLO quando l'indice attivo cambia effettivamente
      if (closestIdx !== activeIndexRef.current) {
        activeIndexRef.current = closestIdx;
        startTransition(() => {
          setActiveIndex(closestIdx);
        });
      }

      // Continua loop finché non raggiunge l'obiettivo
      if (Math.abs(state.targetX - state.currentX) >= 0.1) {
        state.rafId = requestAnimationFrame(tick);
      } else {
        state.isAnimating = false;
      }
    };

    animStateRef.current.rafId = requestAnimationFrame(tick);
  }, [total, prefersReducedMotion]);

  // Salta alla scheda desiderata centrando la card nello schermo (senza scrollare la pagina)
  const goToCard = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(total - 1, index));
      activeIndexRef.current = clamped;
      startTransition(() => {
        setActiveIndex(clamped);
      });

      const metrics = metricsRef.current;
      const cardMetric = metrics.cardMetrics[clamped];
      const targetX = cardMetric ? cardMetric.idealTargetX : 0;

      animStateRef.current.targetX = targetX;
      if (!animStateRef.current.isAnimating) {
        animStateRef.current.isAnimating = true;
        startRaf();
      }
    },
    [total, startRaf]
  );

  // Monitoraggio breakpoint 860px: sospende RAF e azzera trasformazioni su mobile (< 860px)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(min-width: 860px)");
    const handleBreakpoint = (e: MediaQueryListEvent | MediaQueryList) => {
      const desktop = e.matches;
      setIsDesktop(desktop);

      if (desktop) {
        updateMetrics();
        goToCard(activeIndexRef.current);
      } else {
        if (animStateRef.current.rafId) {
          cancelAnimationFrame(animStateRef.current.rafId);
          animStateRef.current.rafId = 0;
          animStateRef.current.isAnimating = false;
        }
        if (stripRef.current) {
          stripRef.current.style.transform = "";
        }
      }
    };

    handleBreakpoint(mql);
    mql.addEventListener("change", handleBreakpoint);

    return () => {
      mql.removeEventListener("change", handleBreakpoint);
    };
  }, [goToCard, updateMetrics]);

  // Ridimensionamento e caricamento caratteri (attivo SOLO su desktop >= 860px)
  useEffect(() => {
    if (!isDesktop) return;

    const animState = animStateRef.current;
    updateMetrics();

    const handleResize = () => {
      if (window.innerWidth < 860) return;
      updateMetrics();
      goToCard(activeIndexRef.current);
    };

    window.addEventListener("resize", handleResize);

    // Se i font terminano il rendering asincrono, ricalcola metriche corrette
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (window.innerWidth >= 860) {
          updateMetrics();
          goToCard(activeIndexRef.current);
        }
      });
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animState.rafId) {
        cancelAnimationFrame(animState.rafId);
        animState.rafId = 0;
        animState.isAnimating = false;
      }
    };
  }, [isDesktop, goToCard, updateMetrics]);

  // Intercettazione due-dita orizzontale su trackpad / rotella orizzontale (solo desktop)
  useEffect(() => {
    if (!isDesktop) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onWheelCapture = (e: WheelEvent) => {
      if (window.innerWidth < 860) return;
      if (e.ctrlKey) return;
      // Solo se il gesto è orizzontale (es. swipe a due dita sinistra/destra o Shift+rotella)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 3) {
        e.preventDefault();
        const metrics = metricsRef.current;
        animStateRef.current.targetX = Math.max(
          0,
          Math.min(metrics.maxScrollX, animStateRef.current.targetX + e.deltaX)
        );
        if (!animStateRef.current.isAnimating) {
          animStateRef.current.isAnimating = true;
          startRaf();
        }
      }
      // Se il gesto è verticale (deltaY), NON si tocca nulla: la pagina scorre naturalmente!
    };

    viewport.addEventListener("wheel", onWheelCapture, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", onWheelCapture);
    };
  }, [isDesktop, startRaf]);

  const handlePrev = () => {
    if (activeIndex > 0) {
      goToCard(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < total - 1) {
      goToCard(activeIndex + 1);
    }
  };

  // Navigazione tastiera (frecce sinistra / destra, Home, End)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    } else if (e.key === "Home") {
      e.preventDefault();
      goToCard(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goToCard(total - 1);
    }
  };

  // Gesto di trascinamento mouse / swipe touch con rapporto 1:1 dinamico
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.innerWidth < 860) return;
    if ((e.target as HTMLElement).closest("button, a, input")) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;

    dragDistRef.current = 0;
    dragRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      isDraggingHorizontal: false,
      pointerId: e.pointerId,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.innerWidth < 860) return;
    const drag = dragRef.current;
    if (!drag.isDown) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    dragDistRef.current = Math.max(
      dragDistRef.current,
      Math.sqrt(dx * dx + dy * dy)
    );

    // Se non ancora agganciato come orizzontale, valuta l'intenzione del gesto
    if (!drag.isDraggingHorizontal) {
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        drag.isDraggingHorizontal = true;
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {}
      } else if (Math.abs(dy) > 8) {
        // Gesto prevalentemente verticale: delega allo scroll naturale del browser
        drag.isDown = false;
        return;
      }
    }

    if (drag.isDraggingHorizontal) {
      const stepX = e.clientX - drag.lastX;
      drag.lastX = e.clientX;

      const metrics = metricsRef.current;
      animStateRef.current.targetX = Math.max(
        0,
        Math.min(metrics.maxScrollX, animStateRef.current.targetX - stepX)
      );
      if (!animStateRef.current.isAnimating) {
        animStateRef.current.isAnimating = true;
        startRaf();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.isDown && drag.pointerId !== null) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(drag.pointerId);
      } catch {}
    }

    const wasDragging = drag.isDraggingHorizontal;
    drag.isDown = false;
    drag.isDraggingHorizontal = false;
    drag.pointerId = null;

    if (wasDragging) {
      // Snap magnetico alla scheda più vicina
      const metrics = metricsRef.current;
      const vCenter = metrics.viewportWidth / 2;
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < total; i++) {
        const cMetric = metrics.cardMetrics[i];
        if (!cMetric) continue;
        const cardCenter = cMetric.offsetLeft + cMetric.width / 2 - animStateRef.current.targetX;
        const diff = Math.abs(cardCenter - vCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      goToCard(closestIdx);
    }
  };

  // Micro-interazione 3D Tilt su hover (zero re-render React, pilotato via proprietà CSS native)
  const handleCardMouseMove = (e: React.MouseEvent<HTMLElement>, idx: number) => {
    if (prefersReducedMotion) return;
    const card = cardRefs.current[idx];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;

    card.style.setProperty("--tilt-rx", `${-py * 5.5}deg`);
    card.style.setProperty("--tilt-ry", `${px * 5.5}deg`);
    card.style.setProperty("--card-scale", "1.012");
    card.style.setProperty("--sheen-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--sheen-y", `${(y / rect.height) * 100}%`);
    card.style.setProperty("--sheen-op", "0.28");
  };

  const handleCardMouseLeave = (idx: number) => {
    const card = cardRefs.current[idx];
    if (!card) return;
    card.style.setProperty("--tilt-rx", "0deg");
    card.style.setProperty("--tilt-ry", "0deg");
    card.style.setProperty("--card-scale", "1");
    card.style.setProperty("--sheen-op", "0");
  };

  // Determina etichetta del contesto (Digital vs Hardware)
  const isDigital = titolo[0].toLowerCase().includes("progett");
  const eyebrowLabel = isDigital
    ? "ARCHIVIO DIGITALE · SYCOMO STUDIO"
    : "OFFICINA HARDWARE · SYCOMO LAB";

  return (
    <section
      id="lavori-desktop"
      ref={trackRef}
      className={`alb-pin-track alb-desktop-view ${isPastAlbum ? "invisible pointer-events-none" : ""}`}
      data-desktop-carousel="true"
      aria-label="Galleria progetti in scorrimento orizzontale"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Viewport fisso (Sticky 100vh / 100dvh) */}
      <div ref={viewportRef} className="alb-pin-viewport">
        {/* Top Header Bar con tipografia monumentale Sycomo */}
        <header className="alb-pin-header">
          <div className="alb-pin-header-left">
            {!isDigital && (
              <div className="alb-pin-eyebrow">
                <span className="alb-pin-eyebrow-dot" aria-hidden="true" />
                <span>{eyebrowLabel}</span>
              </div>
            )}
            <h2 className="alb-pin-title" id="alb-t">
              {titolo[0]}
              <br />
              <span className="alb-pin-title-sub">{titolo[1]}</span>
              <span className="alb-dot" aria-hidden="true" />
            </h2>
          </div>

        </header>

        {/* Palcoscenico del nastro orizzontale con touch & mouse direct drag */}
        <div
          className="alb-pin-stage"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div ref={stripRef} className="alb-pin-strip">
            {scatti.map((s, idx) => {
              const isActive = idx === activeIndex;

              // Generazione dinamica e contestuale dei metadati di preview
              const digitalCta =
                idx === 0
                  ? "Prenota Visita"
                  : idx === 1
                  ? "Scarica App"
                  : idx === 2
                  ? "Consulta Menù"
                  : "Prenota Trattamento";

              const hwGaugeVal = s.metriche?.[0]?.split(" ")[0] || "64°C";
              const hwGaugeLbl = s.metriche?.[0]
                ? s.metriche[0].replace(hwGaugeVal, "").trim().toUpperCase()
                : "BENCHMARK";

              return (
                <article
                  key={s.didascalia}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  role="button"
                  tabIndex={0}
                  data-desktop-card="true"
                  aria-label={`Dettagli del progetto: ${s.didascalia}`}
                  className={`alb-card ${isActive ? "alb-card--active" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (dragDistRef.current > 10) return;
                    onSelectCard?.(s);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectCard?.(s);
                    }
                  }}
                  onMouseMove={(e) => handleCardMouseMove(e, idx)}
                  onMouseLeave={() => handleCardMouseLeave(idx)}
                >
                  {/* Sheen speculare reattivo al cursore via CSS variables */}
                  <div className="alb-card-sheen" aria-hidden="true" />

                  {/* Monumental Watermark Numeral con parallasse */}
                  <div
                    ref={(el) => {
                      watermarkRefs.current[idx] = el;
                    }}
                    className="alb-card-watermark"
                    aria-hidden="true"
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </div>

                  {/* Header interno della card */}
                  <div className="alb-card-head">
                    <div className="alb-card-badges">
                      {!isDigital && (
                        <span className="alb-card-cat-badge">
                          <span className="alb-card-live-dot" />
                          {s.categoria || "CUSTOM RIG"}
                        </span>
                      )}
                      <span className="alb-card-client-badge">
                        {s.cliente || "SYCOMO LAB"}
                      </span>
                    </div>

                    {!isDigital && (
                      <div className="alb-card-status-badge">
                        <span>{s.stato || "ONLINE DAL VIVO"}</span>
                      </div>
                    )}
                  </div>

                  {/* Corpo principale della card: Layout editoriale e mockup visivo */}
                  <div className="alb-card-body">
                    {/* Colonna sinistra: Contenuto e Metriche */}
                    <div className="alb-card-info">
                      <h3 className="alb-card-title">{s.didascalia}</h3>

                      <p className="alb-card-desc">
                        {s.descrizione || s.alt}
                      </p>

                      {!isDigital && s.ruolo && (
                        <div className="alb-card-role">
                          <span className="alb-card-role-kicker">RUOLO SYCOMO:</span>
                          <span className="alb-card-role-val">{s.ruolo}</span>
                        </div>
                      )}

                      {/* Metriche chiave in rilievo */}
                      {!isDigital && s.metriche && s.metriche.length > 0 && (
                        <div className="alb-card-metrics">
                          {s.metriche.map((m) => (
                            <div key={m} className="alb-card-metric-item">
                              <span className="alb-card-metric-gem" aria-hidden="true" />
                              <span className="alb-card-metric-text">{m}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Specifiche tecniche / Chip */}
                      {!isDigital && s.specifiche && s.specifiche.length > 0 && (
                        <div className="alb-card-specs">
                          {s.specifiche.map((spec) => (
                            <span key={spec} className="alb-card-spec-pill">
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Colonna destra: Case Preview Device Chassis (con parallasse hardware) */}
                    <div className="alb-card-media-wrapper">
                      <div
                        ref={(el) => {
                          mediaRefs.current[idx] = el;
                        }}
                        className="alb-card-media-inner"
                      >
                        {isDigital ? (
                          /* Digital Browser / App Mockup */
                          <div className="alb-preview-device alb-preview-device--digital">
                            <div className="alb-preview-browser-bar">
                              <div className="alb-preview-dots">
                                <span className="alb-dot-r" />
                                <span className="alb-dot-y" />
                                <span className="alb-dot-g" />
                              </div>
                              <div className="alb-preview-url-pill">
                                <svg
                                  className="alb-lock-icon"
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7z" />
                                </svg>
                                <span>
                                  sycomo.it/portfolio/
                                  {s.cliente
                                    ? s.cliente.toLowerCase().replace(/[^a-z0-9]/g, "-")
                                    : `case-${idx + 1}`}
                                </span>
                              </div>
                              <div className="alb-preview-ping">
                                <span className="alb-ping-pulse" />
                                <span className="alb-ping-label">LIVE</span>
                              </div>
                            </div>

                            <div className="alb-preview-canvas">
                              <div className="alb-preview-hero-art">
                                <h4 className="alb-preview-mini-title">
                                  {s.didascalia.split("·")[0]}
                                </h4>
                                <p className="alb-preview-mini-subtitle">
                                  Architettura rapida, design liquid-glass e zero compromessi.
                                </p>
                                <div className="alb-preview-mock-cta">
                                  <span>{digitalCta}</span>
                                  <span className="alb-cta-arrow">→</span>
                                </div>
                              </div>

                            </div>
                          </div>
                        ) : (
                          /* Hardware Blueprint / Workstation Chassis */
                          <div className="alb-preview-device alb-preview-device--hardware">
                            <div className="alb-preview-hw-bar">
                              <span className="alb-hw-lab-tag">SYCOMO HARDWARE LAB</span>
                              <span className="alb-hw-build-no">BENCHMARK #0{idx + 1}</span>
                            </div>

                            <div className="alb-preview-hw-blueprint">
                              <div className="alb-hw-grid-lines" aria-hidden="true" />
                              <div className="alb-hw-telemetry">
                                <div className="alb-hw-gauge">
                                  <span className="alb-hw-gauge-val">{hwGaugeVal}</span>
                                  <span className="alb-hw-gauge-lbl">{hwGaugeLbl}</span>
                                </div>
                                <div className="alb-hw-badge-tested">
                                  <span className="alb-hw-tested-dot" />
                                  <span>COLLAUDO 24H: PASS</span>
                                </div>
                              </div>

                              <div className="alb-hw-specs-board">
                                <div className="alb-hw-spec-row">
                                  <span className="alb-hw-spec-name">DISSIPAZIONE:</span>
                                  <span className="alb-hw-spec-item">
                                    {s.specifiche?.[1] || "Pasta Kryonaut + Curve Personalizzate"}
                                  </span>
                                </div>
                                <div className="alb-hw-spec-row">
                                  <span className="alb-hw-spec-name">CABLAGGIO:</span>
                                  <span className="alb-hw-spec-item">Instradamento Invisibile Posteriore</span>
                                </div>
                                <div className="alb-hw-spec-row">
                                  <span className="alb-hw-spec-name">STABILITÀ:</span>
                                  <span className="alb-hw-spec-item">
                                    {s.specifiche?.[3] || "Stress Test Stabilità Memorie OK"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Sleek Liquid-Glass Progress Rail Dock */}
        <footer className="alb-pin-dock-wrapper">
          <nav className="alb-pin-dock" aria-label="Controlli carosello progetti">
            {/* Tasto Precedente */}
            <button
              type="button"
              className="alb-dock-nav-btn alb-dock-nav-btn--prev"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              aria-label="Scheda precedente"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Scrubber centrale con barra e indicatori di sezione */}
            <div className="alb-dock-center">
              <div className="alb-dock-rail-track" aria-hidden="true">
                <div ref={railFillRef} className="alb-dock-rail-fill" />
              </div>

              <div className="alb-dock-segments" role="tablist" aria-label="Selettore progetti">
                {scatti.map((s, idx) => {
                  const isCurrent = idx === activeIndex;
                  const label = s.cliente
                    ? s.cliente.split("·")[0].trim()
                    : s.didascalia.split("·")[0].trim();

                  return (
                    <button
                      key={s.didascalia}
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      aria-label={`Vai al progetto ${idx + 1}: ${s.didascalia}`}
                      className={`alb-dock-pill ${isCurrent ? "alb-dock-pill--active" : ""}`}
                      onClick={() => goToCard(idx)}
                    >
                      <span className="alb-dock-pill-num">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="alb-dock-pill-title">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tasto Successivo */}
            <button
              type="button"
              className="alb-dock-nav-btn alb-dock-nav-btn--next"
              onClick={handleNext}
              disabled={activeIndex === total - 1}
              aria-label="Scheda successiva"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </nav>

          {/* Hint per utente su interazione */}
          <div className="alb-pin-hint" aria-hidden="true">
            <span>Usa le frecce o trascina per sfogliare i progetti</span>
          </div>
        </footer>
      </div>
    </section>
  );
}
