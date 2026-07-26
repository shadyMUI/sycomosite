"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

/*
 * ProjectArchive — l'archivio INTERATTIVO del finale (vive dentro
 * .bh-finale, entra in scena con html.arch-live).
 *
 * · SINISTRA — il cassetto: sale dal basso; dentro ha le cartelle dei
 *   progetti impilate una sopra l'altra (gradiente chiaro in alto → scuro
 *   in basso: è l'ombra della pila), ognuna con la sua linguetta e un
 *   titolo (segnaposto, per ora). Sono bottoni veri.
 *
 * · DESTRA — il dossier: compare SOLO cliccando una cartella, con questa
 *   regia: (1) sale dal basso CHIUSO, (2) la copertina si apre da
 *   sinistra come un libro, (3) dentro c'è una pila di fogli che si
 *   muove appena (respira: c'è più di un foglio) e una foto-polaroid
 *   cliccabile sopra.
 *
 * · MODALITÀ DETECTIVE — click sulla foto: vola al centro e si avvicina,
 *   il resto diventa scuro e sfocato; la foto segue il cursore (tilt 3D)
 *   con una luce che le scorre sopra, come esaminare un reperto in un
 *   gioco investigativo. Click fuori dalla foto (o Esc) e tutto torna.
 *
 * · Cliccando un'ALTRA cartella mentre un dossier è aperto: quello si
 *   richiude in fretta e se ne va, il nuovo entra con la stessa regia
 *   (il key di React rimonta il dossier → le animazioni ripartono).
 */

// Le cartelle non sono clienti (non ne abbiamo ancora): sono i PILASTRI di
// ciò che facciamo. L'archivio racconta i servizi come fascicoli. Testo demo,
// da rifinire con la voce definitiva del brand.
const PROJECTS = [
  {
    id: "strategy",
    name: "STRATEGY",
    tone: "light",
    side: "left",
    sub: "brand & positioning",
    body: [
      "Before a single pixel: who you are, who you're for, and why anyone should care. We dig into your market, sharpen the message, and set the direction the whole project follows.",
      "You walk away with clear positioning, a voice that actually sounds like you, and a plan — not just a moodboard and good intentions.",
    ],
  },
  {
    id: "design",
    name: "DESIGN",
    tone: "red",
    side: "right",
    sub: "interface & identity",
    body: [
      "Every screen drawn from scratch around your brand — layout, type, colour, the small details that make it feel expensive. A design system, not a one-off mockup.",
      "Pixel-perfect and responsive, ready to hand to development without anything getting lost between the two.",
    ],
  },
  {
    id: "build",
    name: "BUILD",
    tone: "light",
    side: "left",
    sub: "development & CMS",
    body: [
      "We turn the design into a fast, modern website: clean code, top performance scores, and a CMS your team actually enjoys updating.",
      "Next.js, headless, deployed and ready to scale. It loads quick, ranks well, and doesn't break when you touch it.",
    ],
  },
  {
    id: "motion",
    name: "MOTION",
    tone: "red",
    side: "right",
    sub: "motion & interaction",
    body: [
      "The part most sites skip: scroll that tells a story, transitions with weight, moments that make people stop. Animation that guides, never distracts.",
      "The same care you're looking at right now — cinematic, smooth, tuned frame by frame. This whole site is the demo.",
    ],
  },
] as const;

type Project = (typeof PROJECTS)[number];
type Id = Project["id"];

const byId = (id: Id) => PROJECTS.find((p) => p.id === id)!;
const ALL_IDS: Id[] = PROJECTS.map((p) => p.id);

// I posti si contano dal BASSO: le cartelle "cadono" nel buco sotto di loro e
// lo spazio vuoto resta in cima. Con n cartelle dentro, la prima della fila
// sta nello scomparto (totale − n) — quindi togliendone una, tutte quelle
// sopra scendono di un posto e quelle sotto non si muovono.
const slotOf = (d: Id[], id: Id) => {
  const i = d.indexOf(id);
  return i < 0 ? 0 : ALL_IDS.length - d.length + i;
};

// quanto dura l'uscita di un dossier (pa-shut + pa-drop, vedi globals.css):
// finché non è finita, il dossier successivo NON entra in scena
const EXIT_MS = 520;

// ── Reperto animato di MOTION: scena cinematica a livelli (MotionReperto) ──
// Tutto SVG (nitido a ogni zoom). I dati deterministici qui sotto evitano
// il mismatch di idratazione (niente Math.random a runtime lato render).

// pseudo-random deterministico e stabile SSR↔client
const seeded = (n: number) => {
  const x = Math.sin(n * 99.137) * 43758.5453;
  return x - Math.floor(x);
};

// campiona un'ellisse (ruotata) come polilinea → binario per animateMotion
const ellipsePath = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotDeg: number,
  n = 72
) => {
  const rot = (rotDeg * Math.PI) / 180;
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  let d = "";
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const ex = Math.cos(a) * rx;
    const ey = Math.sin(a) * ry;
    const x = cx + ex * c - ey * s;
    const y = cy + ex * s + ey * c;
    d += (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
  }
  return d + "Z";
};

// tre orbite inclinate (effetto giroscopio 3D), ognuna con la sua scia
const ORBITS = [
  { rx: 68, ry: 22, rot: 0, dur: 4.6, dots: 13, dir: 1 },
  { rx: 26, ry: 70, rot: 22, dur: 5.8, dots: 13, dir: -1 },
  { rx: 60, ry: 54, rot: -34, dur: 7.2, dots: 15, dir: 1 },
];

// polvere luminosa che deriva e scintilla (posizioni deterministiche)
const DUST = Array.from({ length: 28 }, (_, i) => ({
  cx: (10 + seeded(i + 1) * 180).toFixed(1),
  cy: (10 + seeded(i + 41) * 180).toFixed(1),
  r: (0.4 + seeded(i + 7) * 1.4).toFixed(2),
  dur: (2.4 + seeded(i + 13) * 3.4).toFixed(2),
  begin: `-${(seeded(i + 23) * 5).toFixed(2)}s`,
  drift: (seeded(i + 31) * 6 - 3).toFixed(2),
}));

// orologio globale condiviso da TUTTE le istanze del reperto: agganciandovi
// SMIL (setCurrentTime) e animazioni CSS (animation-delay) al montaggio, una
// nuova istanza riprende esattamente dove sarebbe una continua — così quando
// la foto rientra nella cartella (ri-montaggio) l'animazione non si resetta.
const MOTION_CLOCK = typeof performance !== "undefined" ? performance.now() : 0;

// aggancia un SVG-reperto all'orologio globale: SMIL via setCurrentTime, CSS
// via animation-delay negativo. Riusato da MOTION e DESIGN.
const phaseLock = (svg: SVGSVGElement | null, cssSelector: string) => {
  if (!svg) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const t = (performance.now() - MOTION_CLOCK) / 1000;
  try {
    svg.setCurrentTime(t);
  } catch {
    /* setCurrentTime non disponibile: ignora */
  }
  const delay = `-${t.toFixed(3)}s`;
  svg
    .querySelectorAll<SVGElement>(cssSelector)
    .forEach((el) => {
      el.style.animationDelay = delay;
    });
};

// ── Reperto DESIGN: la penna vettoriale che traccia una curva Bézier ──────
// Il simbolo per eccellenza del design: una curva rossa che si disegna, con
// i punti d'ancoraggio (quadratini bianchi col bordo) e le maniglie di
// controllo. Fondo crema (canvas). Si disegna, tiene, si cancella → loop.
const DESIGN_PATH = "M40,150 C58,92 88,86 108,116 C126,144 150,148 166,78";
const DESIGN_ANCHORS = [
  { x: 40, y: 150 },
  { x: 108, y: 116 },
  { x: 166, y: 78 },
];
const DESIGN_HANDLES = [
  { a: [40, 150], h: [58, 92] },
  { a: [108, 116], h: [88, 86] },
  { a: [108, 116], h: [126, 144] },
  { a: [166, 78], h: [150, 148] },
];

// ── Reperto STRATEGY: radar di posizionamento ─────────────────────────────
// Anelli concentrici, il fascio che ruota, i blip che si accendono quando il
// fascio ci passa sopra e un mirino che si aggancia: "trovare la posizione".
const STRAT_RINGS = [30, 55, 80];
// angolo (in gradi, 0 = ore 12, orario) → il blip si accende quando il fascio
// lo attraversa, quindi il ritardo è l'angolo espresso come frazione del giro
const STRAT_BLIPS = [
  { x: 138, y: 62, r: 3.2, deg: 42 },
  { x: 72, y: 128, r: 2.6, deg: 218 },
  { x: 148, y: 126, r: 2.4, deg: 130 },
  { x: 74, y: 70, r: 2.8, deg: 312 },
];

// ── Reperto BUILD: l'editor che scrive codice ─────────────────────────────
// Righe di codice che compaiono una a una con la loro indentazione (rosso =
// parole chiave, neutro = testo), cursore che lampeggia. Loop: scrive, tiene,
// cancella, riscrive.
const BUILD_LINES = [
  { indent: 0, w: 52, tone: "key" },
  { indent: 1, w: 66, tone: "txt" },
  { indent: 1, w: 44, tone: "dim" },
  { indent: 2, w: 58, tone: "key" },
  { indent: 2, w: 48, tone: "txt" },
  { indent: 1, w: 34, tone: "dim" },
  { indent: 0, w: 18, tone: "key" },
];

export default function ProjectArchive() {
  const [current, setCurrent] = useState<Id | null>(null);
  const [exiting, setExiting] = useState<Id | null>(null);
  // ordine REALE dei posti nel cassetto: chi c'è dentro e in che scomparto.
  // Prendendo una cartella esce dalla lista (i posti si compattano); quando
  // rientra si accoda in FONDO — il posto libero. Così l'ordine si mescola,
  // come in un cassetto vero.
  const [drawer, setDrawer] = useState<Id[]>(ALL_IDS);
  // da quale scomparto è stata sfilata: così scende da LÌ, non dall'alto
  const [takenSlot, setTakenSlot] = useState(0);
  const timer = useRef(0);
  const queued = useRef<Id | null>(null); // chi entra quando la scena è libera

  // fine dell'uscita: la scena è libera, entra l'eventuale dossier in coda
  const flush = useCallback(() => {
    setExiting(null);
    if (queued.current) {
      setCurrent(queued.current);
      queued.current = null;
    }
  }, []);

  const select = (id: Id) => {
    // Il cassetto si riordina: chi era fuori rientra IN FONDO (il posto
    // libero, non il suo di prima) e la scelta esce dalla fila. Gli altri
    // restano dove sono → col tempo l'ordine si mescola.
    // Chi è fuori lo deduco da `drawer` stesso: così l'aggiornamento non
    // dipende da `current`, che la regia del dossier azzera a metà strada.
    // la cartella scelta sfila dal posto in cui si trova ADESSO
    if (drawer.includes(id)) setTakenSlot(slotOf(drawer, id));

    // chi rientra si mette nel posto libero, che ora sta in CIMA (le altre
    // sono cadute in basso): entra in testa alla fila, senza spostare nessuno
    setDrawer((d) => {
      if (!d.includes(id)) return [id, ...d]; // ri-click sulla presa: rientra
      const out = ALL_IDS.filter((x) => !d.includes(x)); // chi era fuori
      return [...out, ...d].filter((x) => x !== id); // rientra lei, esce questa
    });

    // Un dossier per volta: chi è in scena esce SEMPRE per primo e il
    // prossimo si accoda — mai due sovrapposti.
    if (current) {
      const exitMs = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? 0
        : EXIT_MS;
      setExiting(current);
      setCurrent(null);
      queued.current = current === id ? null : id; // ri-click = solo chiudi
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, exitMs);
      return;
    }

    // uscita già in corso: cambio solo la destinazione. Il timer originale
    // è ancora in volo e la servirà appena l'altro ha liberato la scena.
    if (exiting) {
      queued.current = id;
      return;
    }

    setCurrent(id);
  };

  // il timer deve sopravvivere ai re-render: si azzera solo allo smontaggio
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // L'atto esce di scena (scroll su): l'archivio si congeda. Il dossier
  // aperto NON viene cancellato di scatto — se ne va con la sua uscita, la
  // stessa di quando si cambia cartella: la copertina si richiude e cade
  // giù, in tempo per il cassetto che intanto ridiscende.
  useEffect(() => {
    const root = document.documentElement;
    const mo = new MutationObserver(() => {
      if (root.classList.contains("arch-live")) return;
      queued.current = null;
      setDrawer(ALL_IDS); // cassetto riordinato per la prossima volta
      setTakenSlot(0);
      if (!current) return;
      setExiting(current);
      setCurrent(null);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, EXIT_MS);
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [current, flush]);

  return (
    <div className="fs-arch">
      {/* ── cassetto: sale dal basso, le cartelle sono dentro ── */}
      <div className="fa-cabinet">
        {/* pezzi da RAZZO: dormono finché non parte l'atto dello spazio
            (html.space-live), poi il cassetto mette naso, alette e motore */}
        <span className="fa-nose" aria-hidden="true" />
        <span className="fa-fin fa-fin-l" aria-hidden="true" />
        <span className="fa-fin fa-fin-r" aria-hidden="true" />
        <span className="fa-flame" aria-hidden="true">
          <span className="fa-flame-core" />
        </span>
        <span className="fa-knob" />
        <span className="fa-lid" />
        <span className="fa-body" />
        <div className="pa-drawer">
          {PROJECTS.map((p) => {
            // dove sta ORA nel cassetto (posti contati dal basso); se è stata
            // presa resta sul suo ultimo posto e da lì sfila verso il basso
            const taken = !drawer.includes(p.id);
            const slot = taken ? takenSlot : slotOf(drawer, p.id);
            return (
              <button
                key={p.id}
                type="button"
                className={`pa-folder pa-tone-${p.tone} pa-side-${p.side}${
                  taken ? " is-taken" : ""
                }${current === p.id ? " is-sel" : ""}`}
                style={{ "--slot": Math.max(slot, 0) } as React.CSSProperties}
                onClick={() => select(p.id)}
                aria-hidden={taken}
              >
                {/* la "pelle" separa l'ingresso (sul bottone) dal lift
                    dell'hover (qui): niente conflitti di transizione */}
                <span className="pa-skin">
                  <span className="pa-tab">{p.name}</span>
                </span>
              </button>
            );
          })}
          <span className="pa-drawer-front" />
        </div>
      </div>

      {/* ── dossier: prima l'eventuale uscente (rapido), poi l'attivo ──
          L'esame della foto (il "detective") vive DENTRO il dossier: è la
          foto stessa — un unico oggetto — che si stacca e vola al centro. */}
      {exiting && <Dossier key={`x-${exiting}`} project={byId(exiting)} leaving />}
      {current && <Dossier key={current} project={byId(current)} />}
    </div>
  );
}

function Dossier({
  project,
  leaving = false,
}: {
  project: Project;
  leaving?: boolean;
}) {
  // ESAME "detective": è la FOTO STESSA — un unico oggetto — che si stacca
  // dalla cartella e vola al centro. Quando è esaminata viene spostata via
  // portal su un palco fisso in cima (fuori dal contesto 3D e dal clip della
  // cartella), sopra uno sfondo che scurisce la scena. Una FLIP anima la
  // posizione: cartella → centro (apertura) e centro → cartella (chiusura,
  // fase `closing`, così lo sfondo resta finché la foto non è rientrata).
  // Niente clone, niente sorgente nascosta: una sola foto, sempre.
  const [exam, setExam] = useState(false); // sul palco (aperta o in chiusura)
  const [closing, setClosing] = useState(false);
  const photoRef = useRef<HTMLButtonElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null); // il posto nella cartella
  const stageRef = useRef<HTMLDivElement>(null);
  const fromRect = useRef<DOMRect | null>(null); // partenza della FLIP
  const closeTimer = useRef(0);

  const FLIGHT = 540;
  const SLOT_ROT = "3deg"; // inclinazione della foto nella cartella
  // Ombra della foto in cartella, CONTRO-SCALATA per la scala del volo.
  // In volo l'elemento è rimpicciolito (scale s) e il `scale` rimpicciolisce
  // anche l'ombra: se le impostassi l'ombra "a riposo" così com'è, atterrerebbe
  // più piccola della foto ferma. Dividendo le lunghezze per s, una volta
  // scalata dall'elemento (×s) renderizza ESATTAMENTE come l'ombra a riposo.
  const folderShadow = (scale: number) => {
    const k = 1 / scale;
    return `0 ${(14 * k).toFixed(1)}px ${(30 * k).toFixed(1)}px ${(
      -12 * k
    ).toFixed(1)}px color-mix(in srgb, var(--ink) 45%, transparent)`;
  };
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // APERTURA: la foto (ora sul palco, al centro) parte da dov'era nella
  // cartella e vola all'identità
  useLayoutEffect(() => {
    if (!exam || closing) return;
    const el = photoRef.current;
    const from = fromRect.current;
    if (!el || !from || reducedMotion()) return;
    const to = el.getBoundingClientRect();
    if (!to.width) return;
    const s = from.width / to.width;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    el.style.transition = "none";
    el.style.translate = `${dx}px ${dy}px`;
    el.style.scale = `${s}`;
    el.style.boxShadow = folderShadow(s); // parte con l'ombra della cartella…
    el.getBoundingClientRect(); // reflow: fissa la partenza
    requestAnimationFrame(() => {
      el.style.transition = ""; // curva del volo dal CSS (.pa-photo.is-exam)
      el.style.translate = "0px 0px";
      el.style.scale = "1";
      el.style.boxShadow = ""; // …e cresce fino all'ombra in esame (dal CSS)
    });
  }, [exam, closing]);

  const open = () => {
    const el = photoRef.current;
    if (el) fromRect.current = el.getBoundingClientRect(); // posto in cartella
    setExam(true);
  };

  const close = useCallback(() => {
    if (closing) return;
    const el = photoRef.current;
    const slot = slotRef.current;
    if (!el || !slot || reducedMotion()) {
      setExam(false);
      return;
    }
    // la foto rivola verso il suo posto nella cartella; lo sfondo sfuma.
    // Oltre a posizione e scala riprende l'inclinazione dello slot (3°),
    // perde il tilt 3D del cursore e l'ombra si restringe a quella della
    // cartella: a fine volo combacia esattamente — niente scatto né schiocco.

    // 1) appiattisci il tilt SUBITO (senza transizione) e misura DA PIATTO:
    //    così il centro-bersaglio è quello reale d'atterraggio, non quello
    //    sfalsato dalla prospettiva del tilt → niente micro-scatto finale.
    el.style.transition = "none";
    stageRef.current?.style.setProperty("--mx", "0");
    stageRef.current?.style.setProperty("--my", "0");
    el.getBoundingClientRect(); // reflow: applica il transform piatto
    const now = el.getBoundingClientRect();
    const to = slot.getBoundingClientRect();
    // scala dalle larghezze REALI (offsetWidth): il getBoundingClientRect di
    // un elemento ruotato di 3° è il rettangolo gonfiato → darebbe una scala
    // un filo troppo grande e un balzetto all'atterraggio
    const ew = el.offsetWidth || now.width;
    const sw = slot.offsetWidth || to.width;
    const s = sw / ew;
    const dx = to.left + to.width / 2 - (now.left + now.width / 2);
    const dy = to.top + to.height / 2 - (now.top + now.height / 2);

    // 2) parti il volo (ripristina la transizione, imposta il bersaglio)
    el.style.transition = "";
    el.style.translate = `${dx}px ${dy}px`;
    el.style.scale = `${s}`;
    el.style.rotate = SLOT_ROT; // combacia con lo slot (parcheggiato a 3°)
    // ombra contro-scalata: all'atterraggio (scala s) renderizza come quella
    // a riposo → nessun cambio d'ombra quando la foto si posa
    el.style.boxShadow = folderShadow(s);
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setExam(false); // rientra nella cartella (è già lì, visivamente)
      setClosing(false);
    }, FLIGHT);
  }, [closing]);

  // Esc chiude (col volo di ritorno)
  useEffect(() => {
    if (!exam) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exam, close]);

  // la foto esaminata segue il cursore (tilt 3D + luce): solo CSS vars
  const onMove = (e: React.MouseEvent) => {
    const stage = stageRef.current;
    if (!stage || reducedMotion()) return;
    stage.style.setProperty(
      "--mx",
      ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3)
    );
    stage.style.setProperty(
      "--my",
      ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3)
    );
  };

  const photo = (
    <button
      ref={photoRef}
      type="button"
      className={`pa-photo${exam ? " is-exam" : ""}`}
      onClick={(e) => {
        e.stopPropagation(); // sulla foto non si chiude: solo lo sfondo chiude
        if (!exam) open();
      }}
      aria-label={exam ? "foto in esame" : "esamina la foto"}
    >
      {project.id === "motion" ? (
        <MotionReperto />
      ) : project.id === "design" ? (
        <DesignReperto />
      ) : project.id === "strategy" ? (
        <StrategyReperto />
      ) : (
        <BuildReperto />
      )}
      {exam && <span className="pa-photo-glass" />}
    </button>
  );

  return (
    <div
      className={`pa-dossier pa-tone-${project.tone}${
        leaving ? " is-leaving" : ""
      }`}
    >
      {/* linguetta col titolo che sporge dal bordo alto, come una cartella
          d'archivio vera */}
      <span className="pa-doss-tab">{project.name}</span>
      {/* retro della cartella (resta fermo, tiene i fogli) */}
      <span className="pa-doss-back" />
      {/* pila di fogli: respirano appena, ognuno col suo ritmo */}
      <span className="pa-sheet pa-sheet-3" />
      <span className="pa-sheet pa-sheet-2" />
      {/* il foglio in cima: il pilastro di servizio (testo demo per ora) */}
      <div className="pa-sheet pa-sheet-1">
        <h3 className="pa-title">{project.name}</h3>
        <p className="pa-sub">{project.sub}</p>
        {project.body.map((par, i) => (
          <p key={i} className="pa-p">
            {par}
          </p>
        ))}
      </div>

      {/* il POSTO della foto: resta sempre a riservare lo spazio (e a farsi
          misurare per il volo di ritorno). Quando la foto non è in esame,
          vive qui dentro. Durante l'esame è "parcheggiato" a 3° fisso (stop
          all'ondeggìo): così il bersaglio del rientro è stabile. */}
      <span
        ref={slotRef}
        className={`pa-photo-slot${exam ? " is-parked" : ""}`}
      >
        {!exam && photo}
      </span>

      {/* copertina: parte chiusa, si apre da sinistra come un libro */}
      <span className="pa-cover" />

      {/* Esame: la STESSA foto, sul palco in cima. Lo sfondo scurisce la
          scena e sfuma durante il rientro (is-closing). Il portal parte solo
          dopo un click (lato client), quindi document esiste di sicuro. */}
      {exam &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={stageRef}
            className={`pa-stage${closing ? " is-closing" : ""}`}
            onMouseMove={closing ? undefined : onMove}
            onClick={close}
          >
            {photo}
          </div>,
          document.body
        )}
    </div>
  );
}

/*
 * MotionReperto — il reperto animato del pilastro MOTION: una scena
 * cinematica a livelli, tutta in SVG (nitida a qualsiasi ingrandimento —
 * viene esaminata con la lente in modalità detective).
 *
 * Livelli, dal fondo alla luce:
 *   1. GROUND   fondo ink con cuore rosso-deep
 *   2. AURORA   tre masse di luce liquida, sfocate, che derivano e pulsano
 *   3. ORBITE   tre anelli inclinati (giroscopio 3D): su ognuno corre un
 *               treno di punti sfasati nel tempo = scia cometa in sincrono
 *   4. NUCLEO   una sfera di vetro che respira, con riflesso speculare mobile
 *   5. POLVERE  particelle che derivano e scintillano
 *   6. SWEEP    una lama di luce che spazza il vetro
 * Reduced-motion: si mostra solo un fotogramma fermo (nucleo + aurora).
 */
function MotionReperto() {
  const orbitPaths = ORBITS.map((o) =>
    ellipsePath(100, 100, o.rx, o.ry, o.rot)
  );
  const svgRef = useRef<SVGSVGElement>(null);

  // aggancia questa istanza all'orologio globale: due istanze allo stesso
  // istante hanno la STESSA fase → il ri-montaggio (rientro della foto) è
  // impercettibile, l'animazione non si resetta.
  useLayoutEffect(() => {
    phaseLock(
      svgRef.current,
      ".pm-blob-a,.pm-blob-b,.pm-blob-c,.pm-core,.pm-core-glow,.pm-core-spec,.pm-sweep,.pm-live circle[style]"
    );
  }, []);

  return (
    <span className="pa-photo-img pa-motion">
      <svg
        ref={svgRef}
        className="pm-svg"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* fondo */}
          <radialGradient id="pm-ground" cx="50%" cy="44%" r="72%">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--red-deep) 60%, var(--ink))" />
            <stop offset="58%" stopColor="color-mix(in srgb, var(--ink) 88%, var(--red-deep))" />
            <stop offset="100%" stopColor="var(--ink)" />
          </radialGradient>
          {/* masse d'aurora */}
          <radialGradient id="pm-aur-a" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--red) 85%, transparent)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--red) 0%, transparent)" />
          </radialGradient>
          <radialGradient id="pm-aur-b" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--red-deep) 90%, transparent)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--red-deep) 0%, transparent)" />
          </radialGradient>
          <radialGradient id="pm-aur-c" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--lift) 60%, transparent)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--lift) 0%, transparent)" />
          </radialGradient>
          {/* nucleo sferico */}
          <radialGradient id="pm-core" cx="40%" cy="36%" r="68%">
            <stop offset="0%" stopColor="var(--lift)" />
            <stop offset="34%" stopColor="color-mix(in srgb, var(--red) 78%, var(--lift))" />
            <stop offset="78%" stopColor="var(--red)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--red-deep) 88%, var(--ink))" />
          </radialGradient>
          <radialGradient id="pm-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--red) 70%, transparent)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--red) 0%, transparent)" />
          </radialGradient>
          <linearGradient id="pm-sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--lift) 0%, transparent)" />
            <stop offset="50%" stopColor="color-mix(in srgb, var(--lift) 26%, transparent)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--lift) 0%, transparent)" />
          </linearGradient>
          <filter id="pm-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="pm-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1 · fondo */}
        <rect x="0" y="0" width="200" height="200" fill="url(#pm-ground)" />

        {/* 2 · aurora: masse sfocate che derivano e respirano */}
        <g filter="url(#pm-soft)" className="pm-aurora">
          <circle className="pm-blob pm-blob-a" cx="70" cy="70" r="52" fill="url(#pm-aur-a)" />
          <circle className="pm-blob pm-blob-b" cx="132" cy="128" r="46" fill="url(#pm-aur-b)" />
          <circle className="pm-blob pm-blob-c" cx="104" cy="96" r="30" fill="url(#pm-aur-c)" />
        </g>

        {/* animazioni: tutto ciò che si muove sta in .pm-live */}
        <g className="pm-live">
          {/* 3 · orbite giroscopiche con scia */}
          <defs>
            {orbitPaths.map((d, i) => (
              <path key={i} id={`pm-orbit-${i}`} d={d} fill="none" />
            ))}
          </defs>
          {ORBITS.map((o, oi) => (
            <g key={oi} filter="url(#pm-glow)">
              {Array.from({ length: o.dots }, (_, di) => {
                const t = di / (o.dots - 1); // 0 testa · 1 coda
                const r = (2.9 - t * 2.3).toFixed(2);
                const begin = `-${((o.dots - 1 - di) * 0.045 * o.dur).toFixed(3)}s`;
                const fill = `color-mix(in srgb, var(--lift) ${Math.round(
                  (1 - t) * 100
                )}%, var(--red))`;
                return (
                  <circle key={di} r={r} fill={fill} opacity={(1 - t * 0.88).toFixed(3)}>
                    <animateMotion
                      dur={`${o.dur}s`}
                      begin={begin}
                      repeatCount="indefinite"
                      keyPoints={o.dir === 1 ? "0;1" : "1;0"}
                      keyTimes="0;1"
                      calcMode="linear"
                    >
                      <mpath href={`#pm-orbit-${oi}`} />
                    </animateMotion>
                  </circle>
                );
              })}
            </g>
          ))}

          {/* 4 · nucleo: alone + sfera che respira + riflesso mobile */}
          <circle className="pm-core-glow" cx="100" cy="100" r="34" fill="url(#pm-core-glow)" />
          <circle className="pm-core" cx="100" cy="100" r="15" fill="url(#pm-core)" />
          <ellipse className="pm-core-spec" cx="94" cy="93" rx="4.4" ry="3" fill="var(--lift)" opacity="0.85" />

          {/* 5 · polvere che deriva e scintilla */}
          <g fill="var(--lift)">
            {DUST.map((p, i) => (
              <circle
                key={i}
                cx={p.cx}
                cy={p.cy}
                r={p.r}
                opacity="0"
                style={{ ["--pm-drift" as string]: `${p.drift}px` }}
              >
                <animate
                  attributeName="opacity"
                  values="0;0.9;0"
                  dur={`${p.dur}s`}
                  begin={p.begin}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keyTimes="0;0.5;1"
                  keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                />
              </circle>
            ))}
          </g>

          {/* 6 · lama di luce che spazza il vetro */}
          <rect className="pm-sweep" x="-60" y="0" width="60" height="200" fill="url(#pm-sweep)" />
        </g>

        {/* fallback fermo (reduced-motion) */}
        <g className="pm-static">
          <circle cx="100" cy="100" r="34" fill="url(#pm-core-glow)" />
          <circle cx="100" cy="100" r="15" fill="url(#pm-core)" />
        </g>
      </svg>
    </span>
  );
}

/*
 * DesignReperto — il reperto animato del pilastro DESIGN: la penna vettoriale
 * che disegna una curva Bézier su un canvas crema. La curva rossa si traccia,
 * spuntano i punti d'ancoraggio (quadratini bianchi col bordo ink, l'icona
 * vera del pen-tool) e le maniglie di controllo, poi tutto si cancella e
 * ridisegna — loop continuo. Tutto SVG (nitido a ogni zoom), phase-locked.
 */
function DesignReperto() {
  const svgRef = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    phaseLock(
      svgRef.current,
      ".pd-curve,.pd-pen,.pd-a0,.pd-a1,.pd-a2,.pd-handles"
    );
  }, []);

  return (
    <span className="pa-photo-img pa-design">
      <svg
        ref={svgRef}
        className="pd-svg"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="pd-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M20 0 H0 V20"
              fill="none"
              stroke="color-mix(in srgb, var(--ink) 7%, transparent)"
              strokeWidth="0.6"
            />
          </pattern>
          <filter id="pd-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* binario per la punta che disegna */}
          <path id="pd-path" d={DESIGN_PATH} fill="none" />
        </defs>

        {/* canvas crema + griglia da tavolo da disegno */}
        <rect x="0" y="0" width="200" height="200" fill="var(--paper)" />
        <rect x="0" y="0" width="200" height="200" fill="url(#pd-grid)" />

        <g className="pd-live">
          {/* maniglie di controllo: linee ink sottili + pallini a cerchio */}
          <g className="pd-handles">
            {DESIGN_HANDLES.map((d, i) => (
              <g key={i}>
                <line
                  x1={d.a[0]}
                  y1={d.a[1]}
                  x2={d.h[0]}
                  y2={d.h[1]}
                  stroke="color-mix(in srgb, var(--ink) 55%, transparent)"
                  strokeWidth="1.2"
                />
                <circle
                  cx={d.h[0]}
                  cy={d.h[1]}
                  r="3"
                  fill="var(--lift)"
                  stroke="var(--red)"
                  strokeWidth="1.6"
                />
              </g>
            ))}
          </g>

          {/* la curva Bézier che si disegna */}
          <path
            className="pd-curve"
            d={DESIGN_PATH}
            pathLength={100}
            fill="none"
            stroke="var(--red)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#pd-glow)"
          />

          {/* punti d'ancoraggio: quadratini bianchi col bordo ink */}
          {DESIGN_ANCHORS.map((a, i) => (
            <rect
              key={i}
              className={`pd-anchor pd-a${i}`}
              x={a.x - 4}
              y={a.y - 4}
              width="8"
              height="8"
              rx="1.4"
              fill="var(--lift)"
              stroke="var(--ink)"
              strokeWidth="2"
            />
          ))}

          {/* la punta che disegna: percorre la curva mentre si traccia */}
          <circle
            className="pd-pen"
            r="3.6"
            fill="var(--red)"
            filter="url(#pd-glow)"
          >
            <animateMotion
              dur="6s"
              repeatCount="indefinite"
              keyPoints="0;1;1"
              keyTimes="0;0.42;1"
              calcMode="spline"
              keySplines="0.5 0 0.5 1;0 0 1 1"
            >
              <mpath href="#pd-path" />
            </animateMotion>
          </circle>
        </g>

        {/* fallback fermo (reduced-motion): curva finita + ancoraggi */}
        <g className="pd-static">
          <path
            d={DESIGN_PATH}
            fill="none"
            stroke="var(--red)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {DESIGN_ANCHORS.map((a, i) => (
            <rect
              key={i}
              x={a.x - 4}
              y={a.y - 4}
              width="8"
              height="8"
              rx="1.4"
              fill="var(--lift)"
              stroke="var(--ink)"
              strokeWidth="2"
            />
          ))}
        </g>
      </svg>
    </span>
  );
}

/*
 * StrategyReperto — il reperto del pilastro STRATEGY: un radar di
 * posizionamento. Anelli concentrici e mirino su carta, il fascio rosso che
 * gira, i blip che si accendono al suo passaggio e il punto quadrato del
 * brand al centro: l'idea di scandagliare il mercato e trovare la posizione.
 */
function StrategyReperto() {
  const svgRef = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    phaseLock(svgRef.current, ".ps-sweep,.ps-blip,.ps-lock,.ps-center");
  }, []);

  return (
    <span className="pa-photo-img pa-strategy">
      <svg
        ref={svgRef}
        className="ps-svg"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* scia del fascio: rossa al bordo d'attacco, svanisce all'indietro */}
          <linearGradient id="ps-trail" x1="0" y1="1" x2="0" y2="0">
            <stop
              offset="0%"
              stopColor="color-mix(in srgb, var(--red) 0%, transparent)"
            />
            <stop
              offset="100%"
              stopColor="color-mix(in srgb, var(--red) 34%, transparent)"
            />
          </linearGradient>
          <filter id="ps-glow" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="0" y="0" width="200" height="200" fill="var(--paper)" />

        {/* anelli e mirino: la griglia del posizionamento */}
        <g
          fill="none"
          stroke="color-mix(in srgb, var(--ink) 14%, transparent)"
          strokeWidth="1"
        >
          {STRAT_RINGS.map((r) => (
            <circle key={r} cx="100" cy="100" r={r} />
          ))}
          <line x1="100" y1="16" x2="100" y2="184" />
          <line x1="16" y1="100" x2="184" y2="100" />
        </g>

        <g className="ps-live">
          {/* il fascio che gira: settore in scia + bordo d'attacco luminoso */}
          <g className="ps-sweep">
            <path
              d="M100,100 L100,20 A80,80 0 0 0 43.4,43.4 Z"
              fill="url(#ps-trail)"
            />
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="20"
              stroke="var(--red)"
              strokeWidth="1.6"
              strokeLinecap="round"
              filter="url(#ps-glow)"
            />
          </g>

          {/* blip: si accendono quando il fascio ci passa sopra */}
          {STRAT_BLIPS.map((b, i) => (
            <circle
              key={i}
              className={`ps-blip ps-blip-${i}`}
              cx={b.x}
              cy={b.y}
              r={b.r}
              fill="var(--red)"
              filter="url(#ps-glow)"
            />
          ))}

          {/* mirino agganciato al blip principale: la posizione scelta */}
          <g
            className="ps-lock"
            fill="none"
            stroke="var(--red)"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M128,52 h-6 v6 M148,52 h6 v6 M128,72 h-6 v-6 M148,72 h6 v-6" />
          </g>

          {/* il punto quadrato del brand: il centro da cui si guarda */}
          <rect
            className="ps-center"
            x="96"
            y="96"
            width="8"
            height="8"
            fill="var(--red)"
          />
        </g>

        {/* fallback fermo (reduced-motion) */}
        <g className="ps-static">
          {STRAT_BLIPS.map((b, i) => (
            <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="var(--red)" />
          ))}
          <rect x="96" y="96" width="8" height="8" fill="var(--red)" />
        </g>
      </svg>
    </span>
  );
}

/*
 * BuildReperto — il reperto del pilastro BUILD: l'editor che scrive codice.
 * Pannello scuro con barra finestra e numeri di riga; le righe compaiono una
 * a una con la loro indentazione (rosso = parole chiave, neutro = testo) e il
 * cursore lampeggia. Poi si cancella e riscrive: loop.
 */
function BuildReperto() {
  const svgRef = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    phaseLock(
      svgRef.current,
      ".pb-line-0,.pb-line-1,.pb-line-2,.pb-line-3,.pb-line-4,.pb-line-5,.pb-line-6,.pb-caret"
    );
  }, []);

  const TOP = 56; // prima riga di codice
  const STEP = 17; // passo verticale fra le righe
  const GUTTER = 40; // colonna dei numeri di riga

  return (
    <span className="pa-photo-img pa-build">
      <svg
        ref={svgRef}
        className="pb-svg"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* pannello dell'editor */}
        <rect
          x="0"
          y="0"
          width="200"
          height="200"
          fill="color-mix(in srgb, var(--ink) 94%, var(--red-deep))"
        />
        {/* barra della finestra */}
        <rect
          x="0"
          y="0"
          width="200"
          height="28"
          fill="color-mix(in srgb, var(--ink) 78%, var(--lift))"
        />
        <circle cx="16" cy="14" r="3.2" fill="var(--red)" />
        <circle
          cx="28"
          cy="14"
          r="3.2"
          fill="color-mix(in srgb, var(--muted) 70%, var(--ink))"
        />
        <circle
          cx="40"
          cy="14"
          r="3.2"
          fill="color-mix(in srgb, var(--muted) 40%, var(--ink))"
        />

        {/* colonna dei numeri di riga */}
        <line
          x1={GUTTER - 10}
          y1="28"
          x2={GUTTER - 10}
          y2="200"
          stroke="color-mix(in srgb, var(--lift) 12%, transparent)"
          strokeWidth="1"
        />
        {BUILD_LINES.map((_, i) => (
          <rect
            key={i}
            x={GUTTER - 22}
            y={TOP + i * STEP - 2}
            width="6"
            height="3"
            rx="1.5"
            fill="color-mix(in srgb, var(--lift) 22%, transparent)"
          />
        ))}

        <g className="pb-live">
          {/* le righe di codice: si scrivono da sinistra, una dopo l'altra */}
          {BUILD_LINES.map((l, i) => (
            <rect
              key={i}
              className={`pb-line pb-line-${i} pb-${l.tone}`}
              x={GUTTER + l.indent * 12}
              y={TOP + i * STEP - 4}
              width={l.w * 1.1}
              height="7"
              rx="3.5"
            />
          ))}
          {/* cursore che lampeggia a fine blocco */}
          <rect
            className="pb-caret"
            x={GUTTER + 22}
            y={TOP + BUILD_LINES.length * STEP - 4}
            width="3"
            height="9"
            rx="1.5"
            fill="var(--red)"
          />
        </g>

        {/* fallback fermo (reduced-motion): codice già scritto */}
        <g className="pb-static">
          {BUILD_LINES.map((l, i) => (
            <rect
              key={i}
              className={`pb-${l.tone}`}
              x={GUTTER + l.indent * 12}
              y={TOP + i * STEP - 4}
              width={l.w * 1.1}
              height="7"
              rx="3.5"
            />
          ))}
        </g>
      </svg>
    </span>
  );
}
