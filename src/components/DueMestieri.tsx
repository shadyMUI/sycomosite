"use client";

import { useId, useState } from "react";

/**
 * I due mestieri, nella schermata rossa.
 *
 * Assemblare e mantenere non sono due elenchi dello stesso servizio: sono
 * due persone diverse. Chi vuole una macchina nuova e chi ne ha già una
 * che non va più come prima — e quest'ultimo, senza una porta sua, non
 * capirebbe di poterci portare il suo computer senza averlo comprato qui.
 *
 * Su schermo largo stanno affiancati: si vedono entrambi in un colpo
 * d'occhio, e il confronto dice da solo che facciamo tutte e due le cose.
 * Su telefono due colonne diventerebbero due colonne di due parole, quindi
 * se ne mostra una alla volta e in cima c'è un commutatore di vetro per
 * passare all'altra.
 *
 * Entrambe le colonne restano SEMPRE nel documento, anche quando una non
 * si vede: è il CSS a nasconderne una sul telefono. Così i motori di
 * ricerca leggono tutti i servizi — "pulizia pc", "pasta termica" sono le
 * ricerche che portano gente — e chi usa uno screen reader non perde metà
 * della pagina.
 */

/* ⚠️ DA CONFERMARE: le voci sono quelle che avete elencato, con una riga
   di spiegazione ciascuna scritta come la direste al banco. Se un
   servizio non lo fate va tolto — prometterlo costa più di quanto renda. */
const MESTIERI = [
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

const LASTRE = ["ml-fondo", "ml-ancora", "ml-quadro", "ml-tondo", "ml-scheggia"];

const TITOLO = "cosa facciamo";

export default function DueMestieri() {
  /* Quale colonna si vede sul telefono. Su schermo largo non serve a
     niente — si vedono entrambe — ma resta impostato lo stesso, così
     rimpicciolendo la finestra non ci si trova davanti a una schermata
     vuota in attesa di un clic. */
  const [attivo, setAttivo] = useState(MESTIERI[0].id);
  const gruppo = useId();

  return (
    <div className="rosso" data-attivo={attivo} data-aggancio>
      {/* Sensore per il ritaglio delle lastre bianche: alto esattamente una
          schermata, quindi il suo ingresso coincide al pixel con la salita
          del bordo rosso. */}
      <span className="rosso-sensore" aria-hidden="true" />

      {/* Gruppo isolato: lastre bianche + titolo, e nient'altro. */}
      <div className="rosso-blend">
        <div className="taglio-alto">
          <div className="taglio-basso">
            <div className="rosso-massa" aria-hidden="true">
              {LASTRE.map((c) => (
                <span key={c} className={`ml sml ${c}`} />
              ))}
            </div>
          </div>
        </div>

        <h2
          className="srv-titolo"
          style={
            {
              "--srv-n": TITOLO.length,
              "--srv-max": Math.max(...TITOLO.split(" ").map((w) => w.length)),
            } as React.CSSProperties
          }
        >
          {TITOLO}
          {/* il punto del marchio: quadrato, non tondo */}
          <span className="srv-dot" aria-hidden="true" />
        </h2>
      </div>

      {/* schermata 1: dà l'altezza al titolo, che è disegnato nel gruppo */}
      <section className="srv-apre" aria-label={TITOLO} />

      <section className="duo" aria-label="I nostri servizi">
        {/* Il commutatore esiste solo sul telefono: su schermo largo le
            colonne si vedono entrambe e un comando per sceglierne una
            sarebbe un clic in più per niente. `aria-hidden` no: quando è
            visibile serve, e nasconderlo è compito del CSS. */}
        <div className="duo-scelta" role="tablist" aria-label="Cosa vi serve">
          <span className="duo-cursore" aria-hidden="true" />
          {MESTIERI.map((m) => (
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
          {MESTIERI.map((m) => (
            <div
              key={m.id}
              className="duo-col"
              data-col={m.id}
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
      </section>

      {/* Secondo sensore, in fondo: segna quando il rosso esce dal basso. */}
      <span className="rosso-sensore rosso-sensore--fine" aria-hidden="true" />
    </div>
  );
}
