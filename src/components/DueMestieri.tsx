"use client";

import { useEffect, useId, useRef, useState } from "react";

export type VoceMestiere = {
  nome: string;
  testo: string;
};

export type Mestiere = {
  id: string;
  nome: string;
  guida: string;
  prezzo?: string;
  voci: VoceMestiere[];
};

const MESTIERI_HARDWARE: Mestiere[] = [
  {
    id: "assemblaggio",
    nome: "Assemblaggio",
    guida: "Non ce l'avete ancora, o quello che avete non basta più.",
    voci: [
      {
        nome: "Scelta delle componenti",
        testo:
          "Ci dite cosa dovete farci e quanto volete spendere. Scegliamo i pezzi che rendono di più per quella cifra, non i più costosi.",
      },
      {
        nome: "Montaggio",
        testo:
          "Assemblaggio, cavi in ordine, sistema installato e programmi pronti. Si accende e funziona.",
      },
      {
        nome: "Messa a punto",
        testo:
          "Temperature, avvio, prestazioni reali: tarato perché dia tutto quello per cui l'avete pagato.",
      },
      {
        nome: "Upgrade delle componenti",
        testo:
          "Un pezzo nuovo al posto di quello che frena tutto il resto. Spesso basta quello, e costa una frazione di una macchina nuova.",
      },
    ],
  },
  {
    id: "manutenzione",
    nome: "Manutenzione",
    guida: "Ce l'avete già. Scalda, fa rumore, ci mette un minuto ad accendersi.",
    voci: [
      {
        nome: "Pulizia",
        testo:
          "La polvere è il motivo per cui la ventola urla e le prestazioni calano. Si apre, si pulisce, torna silenzioso.",
      },
      {
        nome: "Cambio pasta termica",
        testo:
          "Con gli anni si secca e il calore non passa più. È l'intervento che abbassa di più le temperature, e costa poco.",
      },
      {
        nome: "Ottimizzazione",
        testo:
          "Programmi che partono da soli, avvio lento, sistema appesantito. Torna come il giorno che l'avete acceso.",
      },
      {
        nome: "Pulizia del disco",
        testo:
          "Spazio recuperato e file rimessi in ordine, senza perdere niente di quello che vi serve.",
      },
      {
        nome: "Overclock e undervolt",
        testo:
          "Più prestazioni da quello che avete già, oppure meno calore e più batteria. Sempre con le temperature sotto controllo.",
      },
    ],
  },
];

export const MESTIERI_DIGITAL: Mestiere[] = [
  {
    id: "presenza",
    nome: "Presenza & velocità",
    prezzo: "290 €",
    guida:
      "Un sito personalizzato da 1–3 pagine, progettato prima di tutto per il telefono, con contatto WhatsApp diretto e profilo Google Maps. Ideale per studi medici, professionisti e attività locali.",
    voci: [],
  },
  {
    id: "prenotazioni",
    nome: "Sito, prenotazioni e menù",
    prezzo: "550 €",
    guida:
      "Prenotazioni sul sito senza commissioni, menù QR o preventivatore. Per ristoranti, centri estetici, dentisti e serramentisti.",
    voci: [],
  },
  {
    id: "gestionale",
    nome: "Gestionale su misura",
    prezzo: "950 €",
    guida:
      "Un pannello privato per anagrafiche, scadenze e commesse, con esportazione PDF e notifiche automatiche. Per agenzie, cantine, officine e studi tecnici.",
    voci: [],
  },
];


interface LastraSpec {
  id: string;
  isVetro: boolean;
}

const LASTRE_CONFIG: LastraSpec[] = [
  { id: "ml-fondo", isVetro: false },
  { id: "ml-ancora", isVetro: false },
  { id: "ml-quadro", isVetro: true },
  { id: "ml-tondo", isVetro: true },
  { id: "ml-scheggia", isVetro: true },
];

type Props = {
  titolo?: string;
  mestieri?: Mestiere[];
};

export default function DueMestieri({
  titolo = "Cosa facciamo",
  mestieri = [MESTIERI_HARDWARE[0], MESTIERI_HARDWARE[1]],
}: Props) {
  const [attivo, setAttivo] = useState(mestieri[0].id);
  const gruppo = useId();
  const secondoAttivo = attivo === mestieri[1].id;
  const alternaServizi = mestieri.length > 2;
  const taglioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;
    const updateClip = () => {
      rafId = null;
      const rosso = document.querySelector(".rosso");
      if (rosso && taglioRef.current) {
        const r = rosso.getBoundingClientRect();
        const winH = window.innerHeight;
        if (r.bottom > 0 && r.top < winH) {
          const top = Math.max(0, r.top);
          const bottom = Math.max(0, winH - r.bottom);
          taglioRef.current.style.clipPath = `inset(${Math.round(top)}px 0px ${Math.round(bottom)}px 0px)`;
        } else {
          taglioRef.current.style.clipPath = "inset(100% 0 0 0)";
        }
      }
    };

    const onScrollOrResize = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateClip);
      }
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    updateClip();

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      id="servizi"
      className="rosso"
      data-attivo={attivo}
      data-pos={secondoAttivo ? "secondo" : "primo"}
      data-aggancio
    >
      <span className="rosso-sensore" aria-hidden="true" />

      {/* Gruppo isolato: lastre bianche + titolo.
          L'isolamento fa sì che mix-blend-mode: difference del titolo operi
          esclusivamente contro le lastre bianche (fondendo in nero) e contro
          il fondo trasparente (restando bianco puro), senza MAI toccare lo
          sfondo rosso esterno (che altrimenti causerebbe la tinta ciano/azzurro). */}
      <div className="rosso-blend rosso-blend--servizi">
        <div
          ref={taglioRef}
          className="taglio-fissato hero-art"
          style={{ clipPath: "inset(100% 0 0 0)" }}
        >
          <div className="massa" aria-hidden="true">
            {LASTRE_CONFIG.map(({ id, isVetro }) => (
              <span
                key={id}
                className={`ml sml ${id}${isVetro ? " ml-vetro" : ""}`}
              />
            ))}
          </div>
        </div>

        <h2
          className="srv-titolo"
          style={
            {
              "--srv-n": titolo.length,
              "--srv-max": Math.max(1, ...titolo.split(" ").map((w) => w.length)),
            } as React.CSSProperties
          }
        >
          {titolo}
          <span className="srv-dot" aria-hidden="true" />
        </h2>
      <section className="srv-apre" aria-label={titolo} />

      <section
        className={`duo${alternaServizi ? " duo--alternato" : ""}`}
        aria-label="I nostri servizi"
      >
        {alternaServizi ? (
          <div className="duo-servizi">
            {mestieri.map((servizio) => (
              <article className="duo-servizio" key={servizio.id}>
                <div className="duo-servizio__contenuto">
                  <div className="duo-servizio__testo">
                    <h3>{servizio.nome}</h3>
                    <p>{servizio.guida}</p>
                  </div>
                  {servizio.prezzo && (
                    <p className="duo-servizio__prezzo">
                      <span className="sr-only">Prezzo: </span>
                      <span className="duo-servizio__prezzo-da" aria-hidden="true">da</span>
                      <span className="duo-servizio__prezzo-valore">{servizio.prezzo}</span>
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <>
            <div className="duo-scelta" role="tablist" aria-label="Cosa vi serve">
              <span className="duo-cursore" aria-hidden="true" />
              {mestieri.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  id={`${gruppo}-${m.id}`}
                  aria-selected={attivo === m.id}
                  aria-controls={`${gruppo}-${m.id}-pannello`}
                  className="duo-tasto"
                  onClick={() => setAttivo(m.id)}
                >
                  {m.nome}
                </button>
              ))}
            </div>

            <div className="duo-griglia">
              {mestieri.map((m, idx) => (
                <div
                  key={m.id}
                  className="duo-col"
                  data-col={m.id}
                  data-idx={idx}
                  id={`${gruppo}-${m.id}-pannello`}
                  role="tabpanel"
                  aria-labelledby={`${gruppo}-${m.id}`}
                >
                  <h3 className="duo-nome">{m.nome}</h3>
                  <p className="duo-guida">{m.guida}</p>

                  <ul className="duo-voci">
                    {m.voci.map((v) => (
                      <li key={v.nome} className="duo-voce">
                        <h4>{v.nome}</h4>
                        <p>{v.testo}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      </div>

      <span className="rosso-sensore rosso-sensore--fine" aria-hidden="true" />
    </div>
  );
}
