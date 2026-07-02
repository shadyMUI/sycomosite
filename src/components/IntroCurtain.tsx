"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sipario d'apertura: la pagina è interamente coperta di rosso e "cola"
 * verso il basso come un liquido, con la superficie superiore che ondeggia
 * e alcuni schizzi (gocce) che si staccano dalla cresta.
 * Si smonta a fine animazione per liberare l'interazione.
 *
 * Un timeout di sicurezza garantisce che il sipario si tolga comunque, anche
 * se `animationend` non scatta (es. tab in background, timeline congelata).
 */
const FALLBACK_MS = 2600;

// Schizzi: posizione orizzontale, dimensione e tempi variati per un effetto vivo.
const DROPS = [
  { left: "12%", size: 14, dur: "0.9s", delay: "0.15s" },
  { left: "27%", size: 9, dur: "1.1s", delay: "0.45s" },
  { left: "44%", size: 18, dur: "0.85s", delay: "0.05s" },
  { left: "58%", size: 11, dur: "1.05s", delay: "0.35s" },
  { left: "73%", size: 15, dur: "0.95s", delay: "0.2s" },
  { left: "88%", size: 8, dur: "1.15s", delay: "0.5s" },
];

export default function IntroCurtain() {
  const [done, setDone] = useState(false);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    document.body.style.overflow = "";
    setDone(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(finish, FALLBACK_MS);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [finish]);

  if (done) return null;

  return (
    <div className="intro-root" aria-hidden="true">
      <div className="intro-curtain" onAnimationEnd={finish}>
        {DROPS.map((d, i) => (
          <span
            key={i}
            className="intro-drop"
            style={{
              left: d.left,
              width: d.size,
              height: d.size,
              animationDuration: d.dur,
              animationDelay: d.delay,
            }}
          />
        ))}

        <svg
          className="intro-wave"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
        >
          <path d="M0,110 C120,40 240,40 360,110 C480,180 600,180 720,110 C840,40 960,40 1080,110 C1200,180 1320,180 1440,110 L1440,200 L0,200 Z">
            <animate
              attributeName="d"
              dur="0.9s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0;0.5;1"
              keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
              values="M0,110 C120,40 240,40 360,110 C480,180 600,180 720,110 C840,40 960,40 1080,110 C1200,180 1320,180 1440,110 L1440,200 L0,200 Z;
                      M0,110 C120,180 240,180 360,110 C480,40 600,40 720,110 C840,180 960,180 1080,110 C1200,40 1320,40 1440,110 L1440,200 L0,200 Z;
                      M0,110 C120,40 240,40 360,110 C480,180 600,180 720,110 C840,40 960,40 1080,110 C1200,180 1320,180 1440,110 L1440,200 L0,200 Z"
            />
          </path>
        </svg>
      </div>
    </div>
  );
}
