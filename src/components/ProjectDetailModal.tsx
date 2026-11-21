"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Scatto } from "./Album";

type Props = {
  project: Scatto | null;
  onClose: () => void;
};

export default function ProjectDetailModal({ project, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Gestione tastiera: Escape per chiudere e Focus Trap accessibile
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onClose]
  );

  // Blocco dello scorrimento del corpo (body scroll lock) e aggancio eventi tastiera
  useEffect(() => {
    if (!project) return;

    // WCAG 2.4.3: Memorizza l'elemento che ha aperto il modale per ripristinare il focus alla chiusura
    triggerRef.current =
      typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    // Focus iniziale sul tasto di chiusura per conformità WCAG AA
    const timer = setTimeout(() => {
      if (closeBtnRef.current) {
        closeBtnRef.current.focus();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      // WCAG 2.4.3: Ripristina il focus sull'elemento attivatore
      if (triggerRef.current && typeof triggerRef.current.focus === "function") {
        triggerRef.current.focus();
      }
    };
  }, [project, handleKeyDown]);

  if (!project) return null;

  const isDigital =
    project.categoria?.toLowerCase().includes("web") ||
    project.categoria?.toLowerCase().includes("app") ||
    project.categoria?.toLowerCase().includes("piattaforma") ||
    project.categoria?.toLowerCase().includes("digitale") ||
    project.didascalia.toLowerCase().includes("sito") ||
    project.didascalia.toLowerCase().includes("app");

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    triggerRef.current = null;
    onClose();
    const contattiEl = document.querySelector("#contatti");
    if (contattiEl) {
      e.preventDefault();
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      contattiEl.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    }
  };

  return (
    <>
      {/* Sfondo sfumato Liquid-Glass ad alta densità */}
      <div
        className="alb-modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Finestra di dialogo / Foglio inferiore (Bottom Sheet < 860px / Dialog >= 860px) */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-project-title"
        className="project-modal alb-modal bottom-sheet"
        data-modal="true"
        tabIndex={-1}
      >
        {/* Maniglia di trascinamento touch su mobile */}
        <div
          className="alb-modal-drag-handle"
          aria-hidden="true"
          onClick={onClose}
          title="Tocca o trascina per chiudere"
        />

        {/* Intestazione del modale */}
        <div className="alb-modal-header">
          <div className="alb-modal-header-meta">
            <span className="alb-modal-kicker-cat">
              {project.categoria || (isDigital ? "PIATTAFORMA DIGITALE" : "CUSTOM RIG")}
            </span>
            {project.cliente && (
              <span className="alb-modal-kicker-client">
                {" · "}
                {project.cliente}
              </span>
            )}
            {project.anno && (
              <span className="alb-modal-kicker-year">
                {" · "}
                {project.anno}
              </span>
            )}
          </div>

          <div className="alb-modal-header-actions">
            <span className="alb-modal-status-badge">
              <span className="alb-modal-live-dot" aria-hidden="true" />
              <span>{project.stato || "ONLINE DAL VIVO"}</span>
            </span>

            <button
              ref={closeBtnRef}
              type="button"
              className="modal-close alb-modal-close"
              onClick={onClose}
              aria-label="Chiudi dettaglio progetto"
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Titolo e descrizione completa */}
        <div className="alb-modal-content">
          <h2 id="modal-project-title" className="alb-modal-title">
            {project.didascalia}
          </h2>

          <p className="alb-modal-desc">
            {project.descrizione || project.alt}
          </p>

          {/* Vetrina visiva Liquid-Glass (mockup contestuale o immagine reale) */}
          <div className="alb-modal-showcase" aria-hidden="true">
            {project.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.src}
                alt={project.alt}
                className="alb-modal-img"
              />
            ) : isDigital ? (
              <div className="alb-modal-device alb-modal-device--digital">
                <div className="alb-modal-device-bar">
                  <div className="alb-modal-dots">
                    <span className="alb-m-dot alb-m-dot--red" />
                    <span className="alb-m-dot alb-m-dot--yellow" />
                    <span className="alb-m-dot alb-m-dot--green" />
                  </div>
                  <div className="alb-modal-device-url">
                    https://sycomo.it/portfolio/
                    {project.didascalia.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 24)}
                  </div>
                  <span className="alb-modal-device-tag">PRODUZIONE</span>
                </div>
                <div className="alb-modal-device-canvas">
                  <div className="alb-modal-canvas-top">
                    <span className="alb-modal-pill">SYCOMO ENGINE</span>
                    <span className="alb-modal-pill alb-modal-pill--accent">
                      {project.metriche?.[0] || "100/100 LIGHTHOUSE"}
                    </span>
                  </div>
                  <div className="alb-modal-canvas-center">
                    <span className="alb-modal-brand-badge">SYCOMO · ARCHIVIO</span>
                    <span className="alb-modal-canvas-title">{project.didascalia}</span>
                  </div>
                  <div className="alb-modal-canvas-foot">
                    <span>{project.specifiche?.[0] || "Next.js & React 19"}</span>
                    <span>{project.metriche?.[1] || "60 FPS"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alb-modal-device alb-modal-device--hardware">
                <div className="alb-modal-device-bar alb-modal-device-bar--hw">
                  <div className="alb-modal-dots">
                    <span className="alb-m-dot alb-m-dot--hw" />
                  </div>
                  <div className="alb-modal-device-url">
                    TELEMETRIA COLLAUDO · BANCO SYCOMO LAB
                  </div>
                  <span className="alb-modal-device-tag alb-modal-device-tag--hw">24H PASS</span>
                </div>
                <div className="alb-modal-device-canvas alb-modal-device-canvas--hw">
                  <div className="alb-modal-canvas-top">
                    <span className="alb-modal-pill alb-modal-pill--hw">ARCHITETTURA TERMICA</span>
                    <span className="alb-modal-pill alb-modal-pill--hw-accent">
                      {project.metriche?.[0] || "64°C MASSIMA"}
                    </span>
                  </div>
                  <div className="alb-modal-canvas-center">
                    <span className="alb-modal-brand-badge">SYCOMO WORKBENCH</span>
                    <span className="alb-modal-canvas-title">{project.didascalia}</span>
                  </div>
                  <div className="alb-modal-canvas-foot">
                    <span>{project.specifiche?.[0] || "High-End Architecture"}</span>
                    <span>{project.metriche?.[1] || "0 dB SILENCE"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ruolo ed estensione dell'intervento */}
          {project.ruolo && (
            <div className="alb-modal-section">
              <h3 className="alb-modal-section-title">RUOLO & INTERVENTO SYCOMO</h3>
              <p className="alb-modal-role-text">{project.ruolo}</p>
            </div>
          )}

          {/* Griglia delle metriche verificate */}
          {project.metriche && project.metriche.length > 0 && (
            <div className="alb-modal-section">
              <h3 className="alb-modal-section-title">METRICHE CHIAVE MISURATE</h3>
              <div className="alb-modal-metrics-grid">
                {project.metriche.map((metric, idx) => (
                  <div key={idx} className="alb-modal-metric-card">
                    <span className="alb-modal-metric-dot" aria-hidden="true" />
                    <span className="alb-modal-metric-text">{metric}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifiche tecniche e componentistica */}
          {project.specifiche && project.specifiche.length > 0 && (
            <div className="alb-modal-section">
              <h3 className="alb-modal-section-title">SPECIFICHE TECNICHE</h3>
              <div className="alb-modal-specs-list">
                {project.specifiche.map((spec, idx) => (
                  <div key={idx} className="alb-modal-spec-chip">
                    <span className="alb-modal-spec-symbol" aria-hidden="true">
                      ✓
                    </span>
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottone di contatto contestuale */}
          <div className="alb-modal-footer">
            <a
              href="#contatti"
              onClick={handleContactClick}
              className="alb-modal-cta-btn"
            >
              <span>Contattaci per questo progetto</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
