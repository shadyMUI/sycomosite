/*
 * SpaceScene — l'atto dello SPAZIO (html.space-live), l'ultimo del sito.
 *
 * Regia (tutta a delay CSS sulla classe, quindi reversibile risalendo):
 *   0.0s  il cassetto mette naso e alette: è un razzo (vedi ProjectArchive)
 *   0.6s  accende il motore e vibra sulla rampa
 *   1.3s  PARTE — accelera verso l'alto ed esce dallo schermo
 *   1.0s  il cielo si fa nero
 *   2.2s  si accendono le stelle
 *   2.8s  compare il SISTEMA SOLARE: sole neutro al centro e quattro
 *         pianeti-social in orbita (tiktok, instagram, facebook, email)
 *   4.4s  arriva il razzetto: sale in arco e si tuffa nel sole, bruciando
 *
 * Server component puro: geometrie deterministiche (niente Math.random a
 * runtime → nessun mismatch di idratazione).
 */

// pseudo-random deterministico e stabile SSR↔client
const seeded = (n: number) => {
  const x = Math.sin(n * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// campo stellare: posizioni in %, diametro in px (così restano cerchi veri a
// qualunque proporzione dello schermo). Tutto deterministico → SSR-safe.
const STARS = Array.from({ length: 110 }, (_, i) => ({
  x: (seeded(i + 1) * 100).toFixed(2),
  y: (seeded(i + 61) * 100).toFixed(2),
  s: (0.8 + seeded(i + 17) * 2.2).toFixed(2),
  o: (0.25 + seeded(i + 29) * 0.62).toFixed(2),
  dur: (2.2 + seeded(i + 41) * 4).toFixed(2),
  delay: (seeded(i + 53) * 6).toFixed(2),
}));

/* I quattro pianeti-social. `d` è il diametro dell'orbita in vmin, `t` il
   periodo: più lontano = più lento, come nel vero sistema solare.
   TikTok e Instagram puntano ai profili veri; Facebook ed Email sono ancora
   segnaposto (#) in attesa dell'indirizzo. */
const PLANETS = [
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@sycomo.digital",
    d: 40,
    t: 18,
    size: 5.6,
    phase: 0,
    moon: false,
    rings: false,
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/sycomo.digital",
    d: 64,
    t: 27,
    size: 7,
    phase: 0.57,
    moon: true, // ha una luna che gli gira intorno
    rings: false,
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "#",
    d: 88,
    t: 38,
    size: 6.4,
    phase: 0.27,
    moon: false,
    rings: false,
  },
  {
    id: "email",
    label: "Email",
    href: "#",
    d: 112,
    t: 52,
    size: 7.4,
    phase: 0.83,
    moon: false,
    rings: true, // il "Saturno" del sistema
  },
] as const;

// comete: ogni tanto ne attraversa una il cielo, ognuna con la sua rotta
const COMETS = [
  { top: "12%", left: "-16%", len: 16, rot: 26, dur: 17, delay: 3 },
  { top: "-6%", left: "22%", len: 12, rot: 38, dur: 23, delay: 11 },
  { top: "44%", left: "-12%", len: 20, rot: 14, dur: 31, delay: 19 },
] as const;

// il glifo dentro ogni pianeta (marchi semplificati, disegnati a mano)
function PlanetGlyph({ id }: { id: (typeof PLANETS)[number]["id"] }) {
  if (id === "tiktok") {
    // nota musicale
    return (
      <svg viewBox="0 0 24 24" className="sp-glyph" aria-hidden="true">
        <path
          d="M14 3.5v10.2a3.3 3.3 0 1 1-2.2-3.1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M14 4.2c.9 2.1 2.6 3.2 4.8 3.3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (id === "instagram") {
    // fotocamera
    return (
      <svg viewBox="0 0 24 24" className="sp-glyph" aria-hidden="true">
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="4.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="12"
          cy="12"
          r="3.7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="17" cy="7" r="1.2" fill="currentColor" />
      </svg>
    );
  }
  if (id === "facebook") {
    // la "f"
    return (
      <svg viewBox="0 0 24 24" className="sp-glyph" aria-hidden="true">
        <path
          d="M14.6 7.4h2.2V4.3c-.4-.05-1.7-.18-3.2-.18-3.2 0-5.3 1.9-5.3 5.5v2.3H6v3.5h2.3V21h3.7v-5.6h2.7l.4-3.5h-3.1V9.9c0-1.7.5-2.5 2.6-2.5z"
          fill="currentColor"
        />
      </svg>
    );
  }
  // email — la busta
  return (
    <svg viewBox="0 0 24 24" className="sp-glyph" aria-hidden="true">
      <rect
        x="3"
        y="5.5"
        width="18"
        height="13"
        rx="2.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 7.6l8 5.4 8-5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Il giro della luna, identico a quello dei pianeti attorno al sole: un piano
   inclinato (rotateX) che contiene un'orbita in rotazione continua; la luna
   sta sul bordo e una controrotazione la raddrizza verso la camera. Rotazione
   lineare = movimento perfettamente fluido, senza scatti. */
function MoonOrbit() {
  return (
    <span className="sp-moon-plane">
      <span className="sp-moon-orbit">
        <span className="sp-moon">
          <span className="sp-moon-fix" />
        </span>
      </span>
    </span>
  );
}

export default function SpaceScene() {
  return (
    <div className="sp-scene">
      {/* cielo nero + campo stellare */}
      <div className="sp-sky" />
      <div className="sp-stars" aria-hidden="true">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="sp-star"
            style={
              {
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.s}px`,
                height: `${s.s}px`,
                "--so": s.o,
                animationDuration: `${s.dur}s`,
                animationDelay: `-${s.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* ── il sistema solare: sole NEUTRO e i pianeti-social ── */}
      <div className="sp-system">
        <span className="sp-sun-glow" aria-hidden="true" />
        <span className="sp-sun" aria-hidden="true" />

        {PLANETS.map((p) => (
          // il piano dell'orbita è INCLINATO (rotateX): in prospettiva
          // diventa un'ellisse e il pianeta passa davanti e dietro al sole
          <span
            key={p.id}
            className="sp-orbit-tilt"
            style={
              {
                "--d": `${p.d}vmin`,
                "--t": `${p.t}s`,
                "--phase": p.phase,
              } as React.CSSProperties
            }
          >
            <span className="sp-ring" aria-hidden="true" />
            <span className="sp-orbit">
              <a
                className={`sp-planet sp-p-${p.id}${
                  p.moon ? " sp-has-moon" : ""
                }`}
                href={p.href}
                {...(p.href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                style={{ "--ps": `${p.size}vmin` } as React.CSSProperties}
                aria-label={p.label}
              >
                {/* controruota: il glifo resta dritto e in faccia alla
                    camera mentre il pianeta percorre l'orbita inclinata */}
                <span className="sp-planet-spin">
                  {/* anelli: metà dietro al corpo… */}
                  {p.rings && (
                    <span className="sp-rings sp-rings-back">
                      <span className="sp-rings-tex" />
                    </span>
                  )}
                  <span className="sp-planet-body">
                    <PlanetGlyph id={p.id} />
                  </span>
                  {/* …e metà davanti, così il pianeta ci sta in mezzo */}
                  {p.rings && (
                    <span className="sp-rings sp-rings-front">
                      <span className="sp-rings-tex" />
                    </span>
                  )}
                  {/* la luna gira come i pianeti attorno al sole: piano
                      inclinato + rotazione continua (quindi fluida). È UNA
                      sola, intera: sta dietro o davanti al pianeta per vero
                      ordinamento 3D, senza ritagli che la spezzino. */}
                  {p.moon && <MoonOrbit />}
                  <span className="sp-planet-name">{p.label}</span>
                </span>
              </a>
            </span>
          </span>
        ))}
      </div>

      {/* ── comete: ogni tanto una attraversa il cielo ── */}
      {COMETS.map((c, i) => (
        <span
          key={i}
          className="sp-comet"
          aria-hidden="true"
          style={
            {
              top: c.top,
              left: c.left,
              width: `${c.len}vmin`,
              "--rot": `${c.rot}deg`,
              animationDuration: `${c.dur}s`,
              animationDelay: `${c.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
