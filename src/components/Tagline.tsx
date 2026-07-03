/*
 * Tagline "WE ARE sycomo." — appare sulla destra quando il cluster è
 * atterrato (html.hero-landed, gestita da ScrollDirector).
 * - "WE ARE": Manrope come la scritta DIGITAL, entra in dissolvenza.
 * - "sycomo": Geist come il logo; uno sciame di quadratini glass vola a
 *   comporre la parola e si dissolve mentre il testo emerge.
 * - punto quadrato: nasce da una bolla che si gonfia e scoppia (anello).
 * Server component: le posizioni dello sciame sono fisse e deterministiche.
 */

type Frag = {
  lx: string; // posizione finale nel riquadro parola
  ly: string;
  fs: string; // lato del quadratino (em → scala col font)
  fx: string; // offset di partenza del volo
  fy: string;
  fd: string; // ritardo
};

const FRAGS: Frag[] = [
  { lx: "0%", ly: "12%", fs: "0.36em", fx: "-2.4em", fy: "-1.2em", fd: "0s" },
  { lx: "8%", ly: "55%", fs: "0.30em", fx: "-1.6em", fy: "1.8em", fd: "0.12s" },
  { lx: "16%", ly: "6%", fs: "0.42em", fx: "-0.8em", fy: "-2.2em", fd: "0.05s" },
  { lx: "24%", ly: "48%", fs: "0.32em", fx: "1.2em", fy: "2.4em", fd: "0.18s" },
  { lx: "32%", ly: "14%", fs: "0.38em", fx: "-2em", fy: "0.9em", fd: "0.09s" },
  { lx: "40%", ly: "58%", fs: "0.28em", fx: "2.2em", fy: "-1.6em", fd: "0.22s" },
  { lx: "48%", ly: "8%", fs: "0.44em", fx: "0.6em", fy: "-2.6em", fd: "0.03s" },
  { lx: "56%", ly: "50%", fs: "0.34em", fx: "-1.4em", fy: "2em", fd: "0.15s" },
  { lx: "64%", ly: "16%", fs: "0.30em", fx: "2.6em", fy: "1.2em", fd: "0.2s" },
  { lx: "72%", ly: "55%", fs: "0.40em", fx: "1.8em", fy: "-2em", fd: "0.07s" },
  { lx: "80%", ly: "10%", fs: "0.32em", fx: "-0.9em", fy: "-1.8em", fd: "0.13s" },
  { lx: "88%", ly: "46%", fs: "0.36em", fx: "2.4em", fy: "2.2em", fd: "0.02s" },
  { lx: "95%", ly: "20%", fs: "0.28em", fx: "1.5em", fy: "-1em", fd: "0.17s" },
  { lx: "60%", ly: "30%", fs: "0.26em", fx: "-2.8em", fy: "0.4em", fd: "0.24s" },
];

export default function Tagline() {
  return (
    <div className="tagline">
      <span className="tagline-we">We are</span>
      <span className="tagline-word">
        <span className="tagline-sycomo">sycomo</span>
        <span className="tagline-frags" aria-hidden="true">
          {FRAGS.map((f, i) => (
            <span
              key={i}
              className="tagline-frag"
              style={
                {
                  left: f.lx,
                  top: f.ly,
                  width: f.fs,
                  "--fx": f.fx,
                  "--fy": f.fy,
                  "--fd": f.fd,
                } as React.CSSProperties
              }
            />
          ))}
        </span>
        <span className="tagline-dot" aria-hidden="true" />
      </span>
    </div>
  );
}
