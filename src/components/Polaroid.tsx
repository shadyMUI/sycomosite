"use client";

import { useEffect, useState } from "react";
import PolaroidScena from "./PolaroidScena";

type PolaroidProps = {
  /** percorso di un'immagine ferma */
  src?: string;
  /** percorso di un video (H.264). Ha la precedenza sull'immagine. */
  video?: string;
  /** descrizione per chi non vede: obbligatoria se c'è src o video */
  alt?: string;
  /** la riga scritta sul bordo basso della cornice */
  didascalia?: string;
};

/**
 * La polaroid in alto a destra.
 *
 * Formato 16:9 invece del quadrato classico, ma con la cornice vera: bordo
 * sottile sui tre lati e spesso in basso, dove va la didascalia. Appena
 * storta, come una stampa appoggiata sul tavolo.
 *
 * Dentro può esserci un video, un'immagine o — se non c'è nulla — la scena
 * animata in codice.
 *
 * Il video viene agganciato SOLO dopo il primo scroll, non al caricamento:
 * la polaroid si vede solo da lì in poi, e `autoplay` scavalca qualsiasi
 * `preload="none"` (verificato: quasi 1 MB scaricato prima ancora che la
 * polaroid comparisse). Finché non arriva, e anche mentre carica, sotto
 * resta la scena in codice — così il riquadro non è mai vuoto e chi ha il
 * video bloccato vede comunque qualcosa.
 */
export default function Polaroid({
  src,
  video,
  alt,
  didascalia,
}: PolaroidProps) {
  const [carica, setCarica] = useState(false);

  useEffect(() => {
    if (!video) return;
    if (window.scrollY > 0) {
      setCarica(true);
      return;
    }
    const avvia = () => setCarica(true);
    window.addEventListener("scroll", avvia, { passive: true, once: true });
    return () => window.removeEventListener("scroll", avvia);
  }, [video]);

  return (
    <figure className="pol">
      <div className="pol-scatto">
        {video ? (
          <>
            <span className="pol-sotto" aria-hidden="true">
              <PolaroidScena />
            </span>
            {carica && (
              <video
                className="pol-video"
                autoPlay
                loop
                muted
                playsInline
                aria-label={alt}
              >
                {/* il WebM pesa la metà: lo prende chi può, gli altri
                    scendono al secondo senza accorgersene */}
                <source src={video.replace(/\.mp4$/, ".webm")} type="video/webm" />
                <source src={video} type="video/mp4" />
              </video>
            )}
          </>
        ) : src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt ?? ""} />
        ) : (
          <PolaroidScena />
        )}
      </div>
      {didascalia && <figcaption className="pol-dida">{didascalia}</figcaption>}
    </figure>
  );
}
