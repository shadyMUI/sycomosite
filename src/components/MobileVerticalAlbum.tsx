"use client";

import type { Scatto } from "./Album";

type Props = {
  titolo: [string, string];
  scatti: Scatto[];
  onSelectProject: (project: Scatto) => void;
};

export default function MobileVerticalAlbum({
  titolo,
  scatti,
  onSelectProject,
}: Props) {
  const isDigital = titolo[0].toLowerCase().includes("progetto");
  const eyebrowLabel = isDigital
    ? "ARCHIVIO DIGITALE · SYCOMO STUDIO"
    : "OFFICINA HARDWARE · SYCOMO LAB";

  return (
    <section
      id="lavori"
      className="alb-mobile-view mobile-portfolio alb-vertical-list"
      data-mobile-carousel="true"
      aria-label="Galleria progetti"
    >
      {/* Testata della sezione per viewport mobile */}
      <header className="alb-m-header">
        <div className="alb-m-eyebrow">
          <span className="alb-m-eyebrow-dot" aria-hidden="true" />
          <span>{eyebrowLabel}</span>
        </div>
        <h2 className="alb-m-title">
          {titolo[0]}
          <br />
          <span className="alb-m-title-sub">{titolo[1]}</span>
          <span className="alb-dot" aria-hidden="true" />
        </h2>
        <div className="alb-m-counter-pill">
          <span>{scatti.length} PROGETTI SELEZIONATI</span>
        </div>
      </header>

      {/* Lista verticale naturale di schede rettangolari (zero sticky pinning, zero trappole di scroll) */}
      <div className="alb-m-card-list">
        {scatti.map((s, idx) => {
          const cardIsDigital =
            isDigital ||
            Boolean(
              s.categoria?.toLowerCase().includes("web") ||
                s.categoria?.toLowerCase().includes("app") ||
                s.categoria?.toLowerCase().includes("piattaforma")
            );

          const primaryMetric = s.metriche?.[0] || "";
          const metricShort = primaryMetric.split(" ")[0] || "";

          return (
            <article
              key={s.didascalia}
              role="button"
              tabIndex={0}
              className="alb-mobile-card mobile-card alb-card"
              data-mobile-card="true"
              onClick={() => onSelectProject(s)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectProject(s);
                }
              }}
              aria-label={`Dettagli del progetto: ${s.didascalia}`}
            >
              {/* Colonna Sinistra (~105-115px): Anteprima visuale / Mockup Liquid-Glass */}
              <div
                className="card-preview card-thumb alb-card-preview alb-thumb"
                data-thumb="true"
              >
                {s.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.src}
                    alt={s.alt}
                    className="alb-m-thumb-img"
                    loading="lazy"
                  />
                ) : cardIsDigital ? (
                  <div className="alb-m-mockup alb-m-mockup--digital">
                    <div className="alb-m-mockup-bar">
                      <div className="alb-m-mockup-dots" aria-hidden="true">
                        <span className="alb-m-dot alb-m-dot--red" />
                        <span className="alb-m-dot alb-m-dot--yellow" />
                        <span className="alb-m-dot alb-m-dot--green" />
                      </div>
                      <div className="alb-m-mockup-url">sycomo.it</div>
                    </div>
                    <div className="alb-m-mockup-canvas">
                      <span className="alb-m-mockup-tag">
                        {s.categoria?.split("·")[0]?.trim() || "WEB"}
                      </span>
                      <div className="alb-m-mockup-glyph" aria-hidden="true">
                        {idx === 0 ? "⚡" : idx === 1 ? "📱" : idx === 2 ? "🍷" : "✨"}
                      </div>
                      <span className="alb-m-mockup-badge">
                        {metricShort || "LIVE"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="alb-m-mockup alb-m-mockup--hardware">
                    <div className="alb-m-mockup-bar alb-m-mockup-bar--hw">
                      <div className="alb-m-mockup-dots" aria-hidden="true">
                        <span className="alb-m-dot alb-m-dot--hw" />
                      </div>
                      <div className="alb-m-mockup-url">HW LAB</div>
                    </div>
                    <div className="alb-m-mockup-canvas alb-m-mockup-canvas--hw">
                      <span className="alb-m-mockup-tag">
                        {s.categoria?.split("·")[0]?.trim() || "RIG"}
                      </span>
                      <div className="alb-m-mockup-glyph" aria-hidden="true">
                        {idx === 0 ? "🏎️" : idx === 1 ? "🎬" : idx === 2 ? "📐" : "🔧"}
                      </div>
                      <span className="alb-m-mockup-badge alb-m-mockup-badge--hw">
                        {metricShort || "64°C"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Colonna Destra: Informazioni sul progetto e invito all'azione */}
              <div
                className="card-details card-info alb-card-info alb-dettagli"
                data-info="true"
              >
                <div className="alb-m-card-kicker">
                  <span className="alb-m-card-cat">
                    {s.categoria?.split("·")[0]?.trim() ||
                      (cardIsDigital ? "DIGITALE" : "HARDWARE")}
                  </span>
                  {s.cliente && (
                    <span className="alb-m-card-client">
                      {" · "}
                      {s.cliente.split("·")[0].trim()}
                    </span>
                  )}
                </div>

                <h3 className="card-title alb-card-titolo" data-title="true">
                  {s.didascalia}
                </h3>

                <p className="alb-m-card-desc">{s.descrizione || s.alt}</p>

                <div className="alb-m-card-footer">
                  {primaryMetric ? (
                    <span className="alb-m-card-metric">{primaryMetric}</span>
                  ) : (
                    <span />
                  )}
                  <span className="alb-m-card-affordance">
                    Dettagli <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
