/*
 * CtaReveal — secondo e terzo atto, guidati dallo scroll.
 *
 * Fase --p2 (0→1): il punto quadrato rosso di "sycomo." cresce, ancorato al
 * punto reale (misurato da ScrollDirector), fino a un pannello rosso con
 * margine 3cm; al centro emerge "so, what do we do?" in --paper, col
 * quadratino che fa da puntino del punto di domanda.
 *
 * Fase --p3 (0→1): il pannello si mangia anche i 3cm fino a coprire tutto lo
 * schermo MENTRE le lettere affondano — ognuna col suo profilo pseudo-casuale
 * (partenza --st, deriva --sx/--sy, rotazione --sr): scendono, rimpiccioliscono
 * e si sfocano come viste dall'alto mentre vanno a fondo nell'acqua.
 *
 * Server component puro: tutte le interpolazioni sono CSS calc() su --p2/--p3
 * → scrubby e reversibile. I profili delle lettere sono costanti (SSR-safe).
 */

type Sink = {
  ch: string;
  st: string; // partenza dell'affondo (frazione di --p3, 0–0.45)
  sx: string; // deriva orizzontale
  sy: string; // discesa
  sr: string; // rotazione
};

const LETTERS: (Sink | " ")[] = [
  { ch: "s", st: "0.08", sx: "-0.12em", sy: "0.30em", sr: "-6deg" },
  { ch: "o", st: "0.30", sx: "0.10em", sy: "0.38em", sr: "5deg" },
  { ch: ",", st: "0.18", sx: "-0.05em", sy: "0.26em", sr: "-9deg" },
  " ",
  { ch: "w", st: "0.02", sx: "0.14em", sy: "0.34em", sr: "7deg" },
  { ch: "h", st: "0.36", sx: "-0.16em", sy: "0.30em", sr: "-4deg" },
  { ch: "a", st: "0.12", sx: "0.06em", sy: "0.42em", sr: "8deg" },
  { ch: "t", st: "0.26", sx: "-0.10em", sy: "0.28em", sr: "-7deg" },
  " ",
  { ch: "d", st: "0.40", sx: "0.12em", sy: "0.36em", sr: "5deg" },
  { ch: "o", st: "0.06", sx: "-0.08em", sy: "0.30em", sr: "-5deg" },
  " ",
  { ch: "w", st: "0.22", sx: "0.10em", sy: "0.40em", sr: "6deg" },
  { ch: "e", st: "0.34", sx: "-0.13em", sy: "0.27em", sr: "-8deg" },
  " ",
  { ch: "d", st: "0.16", sx: "0.07em", sy: "0.33em", sr: "4deg" },
  { ch: "o", st: "0.44", sx: "-0.09em", sy: "0.29em", sr: "-6deg" },
];

const sinkVars = (l: Sink) =>
  ({
    "--st": l.st,
    "--sx": l.sx,
    "--sy": l.sy,
    "--sr": l.sr,
  }) as React.CSSProperties;

export default function CtaReveal() {
  return (
    <div
      className="cta-reveal cta-reveal--iris-corner"
      role="region"
      aria-label="so, what do we do?"
    >
      {/* Il pannello È il punto: cresce da esso (fase 2) e poi copre tutto
          lo schermo (fase 3). Ogni misura deriva da --p2/--p3. */}
      <div className="cr-panel">
        <div className="cr-textwrap">
          <p className="cr-text">
            <span className="cr-sink">
              {LETTERS.map((l, i) =>
                l === " " ? (
                  " "
                ) : (
                  <span key={i} className="cr-letter" style={sinkVars(l)}>
                    {l.ch}
                  </span>
                )
              )}
              {/* "?" normale: affonda come le altre lettere. */}
              <span
                className="cr-letter"
                style={sinkVars({
                  ch: "?",
                  st: "0.28",
                  sx: "0.11em",
                  sy: "0.37em",
                  sr: "6deg",
                })}
              >
                ?
              </span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
