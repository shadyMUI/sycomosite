"use client";

import { useEffect, useRef } from "react";
import { BASE_PATH, WHATSAPP } from "@/lib/sito";

/**
 * I due modi per farsi sentire, sotto il marchio.
 *
 * Nella prima schermata il logo è solo in mezzo alla carta: qui sotto
 * trova due strade, quella lenta e quella immediata. "Contatti" porta al
 * modulo per chi vuole spiegare con calma; WhatsApp apre una chat per chi
 * ha una domanda sola e la vuole fare adesso — che per un'attività locale
 * è il caso più frequente.
 *
 * Non spariscono allo scroll: volano nella barra di vetro insieme al
 * logo, e da lì restano a disposizione per tutta la pagina. Sono l'unico
 * modo per farsi sentire che è sempre sullo schermo, quindi nascondendoli
 * si perderebbe chi si decide a metà lettura.
 *
 * Sotto il marchio stanno incolonnati, nella barra si affiancano: è la
 * stessa coppia che cambia forma col posto in cui si trova.
 *
 * Il passaggio fra le due forme NON si fa cambiando `flex-direction` —
 * non è una proprietà animabile, e le voci ci saltavano dentro di colpo.
 * Stanno invece sempre in riga, e in apertura "contatti" è spostato sotto
 * whatsapp con una traslazione: quella sì si interpola, quindi la voce
 * scivola in diagonale fino al suo posto invece di scattarci.
 *
 * Di quanto spostarla lo sa solo il browser — dipende da quanto è larga
 * "whatsapp", che cambia col carattere e con la lingua — quindi la misura
 * la prende il codice e la passa al CSS come variabile.
 *
 * WhatsApp si può togliere: sui siti il primo contatto è una cosa che si
 * spiega — che attività avete, cosa vi serve — e il modulo la raccoglie
 * meglio di una chat. Per i computer invece la domanda è spesso una sola
 * e urgente, e lì la chat è la strada giusta.
 *
 * Con una voce sola non c'è coppia da far viaggiare: la variante "barra"
 * la piazza direttamente in alto a destra e ce la lascia, nuda, senza
 * filetto — è quello che sta bene quando è l'unico richiamo della pagina.
 */

/* Il messaggio già scritto nella chat: chi apre trova la prima riga
   pronta e non deve inventarsi come cominciare, che è il momento in cui
   la maggior parte delle persone chiude e non scrive più. */
const PRIMO_MESSAGGIO = "Ciao! Vi scrivo dal sito, avrei bisogno di";

/* Quanto dura il viaggio verso i contatti. Fisso e non proporzionale alla
   distanza: la sezione è lontana, e una durata proporzionale la renderebbe
   eterna. */
const DURATA = 1100;

type Props = {
  /* Se mostrare anche WhatsApp accanto ai contatti. */
  whatsapp?: boolean;
  /* Dove vive il richiamo.
     "sottoLogo": incolonnato sotto il marchio, poi vola nella barra.
     "barra": già in alto a destra dall'inizio, e lì resta. */
  dove?: "sottoLogo" | "barra";
};

export default function SottoLogo({
  whatsapp = true,
  dove = "sottoLogo",
}: Props) {
  const blocco = useRef<HTMLDivElement>(null);
  const primaVoce = useRef<HTMLAnchorElement>(null);

  /* Misura quanto è larga la prima voce e quanto è alta una riga, e le
     scrive come variabili: il CSS le usa per sapere di quanto spostare
     "contatti" sotto di essa quando il blocco è in apertura.

     La misura è presa a riposo, col corpo grande. Durante il volo il testo
     si rimpicciolisce e la larghezza reale cala, ma lì serve solo che il
     movimento sia continuo: il punto di partenza e quello di arrivo
     restano esatti, ed è quello che si vede. */
  useEffect(() => {
    if (dove === "barra" || !whatsapp) return;

    const misura = () => {
      const el = primaVoce.current;
      const box = blocco.current;
      if (!el || !box) return;
      const r = el.getBoundingClientRect();
      box.style.setProperty("--wa-w", `${r.width}px`);
      box.style.setProperty("--voce-h", `${r.height}px`);
    };

    misura();
    /* Rimisura quando cambia la finestra — il corpo del testo è in vw — e
       quando i caratteri finiscono di caricarsi, perché fino a quel punto
       la riga è disegnata con un ripiego di sistema, più stretto. */
    window.addEventListener("resize", misura);
    document.fonts?.ready.then(misura);
    return () => window.removeEventListener("resize", misura);
  }, [dove, whatsapp]);
  const vaiAiContatti = (e: React.MouseEvent) => {
    e.preventDefault();

    const meta = document.getElementById("contatti");
    /* Fuori dalla pagina che ha la sezione, si lascia fare al browser:
       segue il collegamento e atterra sui contatti dell'altra. */
    if (!meta) {
      window.location.href = `${BASE_PATH}/#contatti`;
      return;
    }

    const menoMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const da = window.scrollY;
    const a = da + meta.getBoundingClientRect().top;

    if (menoMovimento) {
      window.scrollTo(0, a);
      return;
    }

    const inizio = performance.now();
    /* Parte veloce e si posa piano: la stessa sensazione della frenata
       della rotella, non un movimento a velocità costante. */
    const curva = (t: number) => 1 - Math.pow(1 - t, 3);

    const passo = (ora: number) => {
      const t = Math.min(1, (ora - inizio) / DURATA);
      window.scrollTo(0, da + (a - da) * curva(t));
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  return (
    <div
      ref={blocco}
      className={`sotto-logo${dove === "barra" ? " sotto-logo--barra" : ""}`}
    >
      {whatsapp && (
        <a
          ref={primaVoce}
          className="sotto-voce sotto-voce--wa"
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(PRIMO_MESSAGGIO)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
        {/* Il marchio WhatsApp, disegnato invece che caricato: un'immagine
            esterna sarebbe una richiesta in più e un cookie di terze parti
            nell'informativa, per una figura di due colori. */}
          <svg
            className="sotto-wa"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
          <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01c-1.52 0-3.02-.41-4.32-1.18l-.31-.18-3.21.84.86-3.13-.2-.32a8.22 8.22 0 0 1-1.26-4.39c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24z" />
          </svg>
          whatsapp
        </a>
      )}

      <a
        className={`sotto-voce${whatsapp && dove !== "barra" ? " sotto-voce--scivola" : ""}`}
        href="#contatti"
        onClick={vaiAiContatti}
      >
        contatti
      </a>
    </div>
  );
}
