/*
 * BlackHoleFx — il gran finale, A TEMPO e a scroll BLOCCATO.
 *
 * Sequenza (~8.5s, regia in ScrollDirector via html.bh-live):
 *   0.0–0.9  il punto bianco del titolo vola al CENTRO della pagina
 *   0.8–2.2  risucchia le LETTERE, una a una
 *   2.1–4.0  risucchia le FIGURE di sfondo
 *   3.9–4.5  risucchia il COLORE di sfondo → resta tutto bianco, e SOLO ora
 *            il quadrato diventa rosso (prima resterebbe invisibile sul rosso)
 *   4.5–5.5  fermo al centro per 1 secondo
 *   5.5–6.2  ESPLODE: anello d'urto e… niente cielo nero: torna il BIANCO
 *            dell'inizio (paper) con la SCENA FINALE:
 *              · ruota rossa frastagliata che sanguina da sinistra (come da
 *                riferimento), col titolo "got an idea for a site?"
 *              · testo di risposta sulla destra
 *              · figure glass di forme NUOVE (pillola, blob, anello, goccia —
 *                bordi sempre tondeggianti), palette e liquid glass di sempre
 *            Titolo e testo compaiono in TYPEWRITING, lettera per lettera.
 *
 * Server component puro: geometrie e ritardi deterministici (SSR-safe).
 * L'unica isola client è ProjectArchive (l'archivio interattivo).
 */

import Logo from "./Logo";
import ProjectArchive from "./ProjectArchive";
import SpaceScene from "./SpaceScene";

// Ruota frastagliata: stella REGOLARE (denti uniformi) attorno al mozzo —
// così la rotazione legge come una ruota, senza wobble. Punte ammorbidite
// da stroke-linejoin: round.
const BLOB_PATH = (() => {
  const cx = 260;
  const cy = 600;
  const N = 18;
  const RO = 570;
  const RI = 510;
  const pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 0.5) / N) * Math.PI * 2;
    pts.push(
      `${(cx + Math.cos(a0) * RO).toFixed(1)},${(cy + Math.sin(a0) * RO).toFixed(1)}`
    );
    pts.push(
      `${(cx + Math.cos(a1) * RI).toFixed(1)},${(cy + Math.sin(a1) * RI).toFixed(1)}`
    );
  }
  return `M${pts.join("L")}Z`;
})();

const TITLE_TEXT = "got an idea for a site?";
const COPY_TEXT =
  "we'd love to hear it. tell us your vision and we'll turn it into a living, breathing website — from the first sketch to launch";

// typewriting: ogni carattere appare al proprio istante (steps → scatto secco)
const typeSpans = (text: string, startS: number, stepS: number) =>
  [...text].map((ch, i) => (
    <span
      key={i}
      className="fs-ch"
      style={{ "--td": `${(startS + i * stepS).toFixed(2)}s` } as React.CSSProperties}
    >
      {ch}
    </span>
  ));

// il testo a destra parte quando il titolo ha quasi finito
const TITLE_START = 5.9;
const TITLE_STEP = 0.045;
const COPY_START = TITLE_START + TITLE_TEXT.length * TITLE_STEP + 0.25;
const COPY_STEP = 0.014;

export default function BlackHoleFx() {
  return (
    <>
      <div className="bh" aria-hidden="true">
        {/* il bianco che resta quando il buco nero ha mangiato il colore */}
        <span className="bh-white" />

        {/* SCENA FINALE (post-esplosione): paper, blob rosso, testi, figure */}
        <div className="bh-finale">
          {/* la header torna, identica a quella d'inizio sito: la scena vive
              sopra tutto (z 70), quindi la barra vera resta sotto e va
              ricreata qui dentro */}
          <div className="fs-header" />
          <Logo className="fs-logo" />
          <svg
            className="fs-blob"
            viewBox="-350 -20 1240 1240"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            {/* Un solo path, niente doppio bordo. Il riempimento è un
                gradiente RADIALE OPACO centrato sul mozzo (userSpaceOnUse):
                ruotarlo è invisibile → gira solo la dentatura, come una
                ruota. Colori mixati su paper (niente alpha → niente fasce).
                NIENTE layer di luce sopra: era un elemento circolare e il
                suo bordo si vedeva DENTRO la ruota → sembrava un sole. Il
                liquid glass sta tutto qui, nel gradiente. */}
            <defs>
              <radialGradient
                id="fs-glass"
                gradientUnits="userSpaceOnUse"
                cx="260"
                cy="600"
                r="580"
              >
                <stop
                  offset="0"
                  stopColor="color-mix(in srgb, var(--red) 68%, var(--paper))"
                />
                <stop
                  offset="0.62"
                  stopColor="color-mix(in srgb, var(--red) 78%, var(--paper))"
                />
                <stop
                  offset="1"
                  stopColor="color-mix(in srgb, var(--red-deep) 66%, var(--paper))"
                />
              </radialGradient>
            </defs>
            <path
              d={BLOB_PATH}
              fill="url(#fs-glass)"
              stroke="url(#fs-glass)"
              strokeWidth="24"
              strokeLinejoin="round"
            />
          </svg>

          {/* figure glass di forme nuove, bordi tondeggianti */}
          <span className="fs-fig fs-pill" />
          <span className="fs-fig fs-blobby" />
          <span className="fs-fig fs-ring" />
          <span className="fs-fig fs-drop" />

          <h2 className="fs-title">{typeSpans(TITLE_TEXT, TITLE_START, TITLE_STEP)}</h2>
          <p className="fs-copy">
            {typeSpans(COPY_TEXT, COPY_START, COPY_STEP)}
          </p>

          {/* caret: la stanghetta arancione che lampeggia e segue la battitura
              del testo di destra; a fine testo sparisce e compare il punto
              quadrato (fs-dot). Entrambi posizionati da ScrollDirector. */}
          <span className="fs-caret" aria-hidden="true" />
          <span className="fs-dot" aria-hidden="true" />

          {/* Atto dell'ARCHIVIO (html.arch-live): la ruota migra a destra e
              la scena diventa l'archivio dei progetti. Interattivo (client):
              cassetto con le cartelle cliccabili, dossier che si apre come
              un libro, foto esaminabile in modalità detective. */}
          <ProjectArchive />

          {/* Atto dello SPAZIO (html.space-live): il cassetto parte come un
              razzo, il cielo si fa nero e appare il sistema solare dei
              social. Sta sopra tutto tranne il razzo che lo attraversa. */}
          <SpaceScene />
        </div>

        {/* anello d'urto dell'esplosione */}
        <span className="bh-ring" />

        {/* IL punto: quadrato che vola al centro, mangia tutto e arrossisce */}
        <span className="bh-square" />
      </div>

      {/* Rewind: tornando su, l'acqua bianca riempie e si svuota (onda
          liquida come l'intro), coprendo lo smontaggio del finale. */}
      <div className="bh-flood" aria-hidden="true">
        <div className="bh-flood-body">
          <svg
            className="bh-flood-wave"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path d="M0,70 C240,20 480,20 720,70 C960,120 1200,120 1440,70 L1440,120 L0,120 Z">
              <animate
                attributeName="d"
                dur="1.1s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;0.5;1"
                keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                values="M0,70 C240,20 480,20 720,70 C960,120 1200,120 1440,70 L1440,120 L0,120 Z;
                        M0,70 C240,120 480,120 720,70 C960,20 1200,20 1440,70 L1440,120 L0,120 Z;
                        M0,70 C240,20 480,20 720,70 C960,120 1200,120 1440,70 L1440,120 L0,120 Z"
              />
            </path>
          </svg>
        </div>
      </div>
    </>
  );
}
