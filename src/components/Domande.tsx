"use client";

import { useEffect, useState } from "react";

export type VoceFaq = {
  domanda: string;
  risposta: string;
};

/**
 * Le domande tipiche per l'assistenza e l'assemblaggio hardware.
 */
const FAQ_HARDWARE: VoceFaq[] = [
  {
    domanda: "Quanto ci vuole?",
    risposta:
      "Per una pulizia o un cambio di pasta termica, in giornata. Per un computer montato da zero il montaggio è questione di ore: quello che non dipende da noi è l'attesa dei pezzi, che a volte è di giorni e a volte di settimane. Vi diciamo i tempi quando ordiniamo, non dopo.",
  },
  {
    domanda: "Quanto costa sapere cos'ha?",
    risposta:
      "Niente. La diagnosi è gratuita e il preventivo arriva prima che tocchiamo qualcosa: sapete quanto spendete prima di decidere. Se non conviene ripararlo, ve lo diciamo.",
  },
  {
    domanda: "Posso portare pezzi miei?",
    risposta:
      "Sì. Se avete già una scheda video o un disco che vanno bene, si montano quelli e si spende meno. Vi diciamo noi se conviene tenerli o cambiarli.",
  },
  {
    domanda: "Perdo i miei dati?",
    risposta:
      "No. Niente formattazioni fatte per fare prima: se il disco va sostituito, i file passano sul nuovo. Se qualcosa è già andato perso, nella maggior parte dei casi si recupera.",
  },
  {
    domanda: "E se dopo qualcosa non va?",
    risposta:
      "Rispondiamo noi, senza numeri verdi e senza attese. Le componenti nuove hanno la garanzia del produttore, e il lavoro lo rifacciamo se il problema è nostro.",
  },
];

/**
 * Le domande tipiche per lo sviluppo di siti web, web app e app mobile.
 */
export const FAQ_DIGITAL: VoceFaq[] = [
  {
    domanda: "Quanto costa realizzare un sito web o un'app?",
    risposta:
      "Un sito vetrina veloce e scritto su misura parte da 390€ una tantum (oppure 0€ di avvio se inserito nel nostro piano mensile). Una Web App interattiva parte da 950€, mentre un'app mobile completa per iOS e Android pubblicata sugli store parte da 1.800€. Prima di iniziare avete sempre un preventivo fisso, senza sorprese a metà lavoro.",
  },
  {
    domanda: "Come funziona il piano mensile 'Zero Pensieri'?",
    risposta:
      "Invece di pagare tutto il sito subito e poi restare da soli, con un canone da 149€/mese avete: creazione del sito inclusa, modifiche illimitate (cambi menù, listini, orari), gestione della scheda Google Maps e assistenza prioritaria sui vostri computer.",
  },
  {
    domanda: "Che differenza c'è tra un sito normale, una Web App e un'App Mobile?",
    risposta:
      "Il sito presenta la vostra attività e porta il cliente a contattarvi. Una Web App gira nel browser senza installazione e gestisce funzioni avanzate (es. prenotazioni o ordini). L'app mobile si scarica da App Store e Google Play e permette di inviare notifiche push direttamente sul telefono dei vostri clienti.",
  },
  {
    domanda: "Perché scrivete il codice da zero invece di usare WordPress?",
    risposta:
      "Perché i temi pronti sono pesanti, lenti sul telefono e richiedono decine di plugin che col tempo si bloccano o creano problemi di sicurezza. Un sito scritto a mano da noi si apre all'istante, piace di più a Google e dura anni senza invecchiare.",
  },
  {
    domanda: "Quanto tempo serve per andare online?",
    risposta:
      "Per un sito vetrina o una landing page bastano dai 7 ai 14 giorni. Veniamo direttamente noi nella vostra sede ad Asti per raccogliere le informazioni e scattare foto o video se vi mancano, così non dovete perdere ore di lavoro.",
  },
];

const LASTRE = ["ml-fondo", "ml-ancora", "ml-quadro", "ml-tondo", "ml-scheggia"];

/* Aprire dura un filo più che chiudere: entrando si guarda, uscendo si è
   già passati oltre. La curva è quella del resto del sito. */
const APRE = 340;
const CHIUDE = 260;
const CURVA = "cubic-bezier(0.22, 1, 0.36, 1)";

type Props = {
  titolo?: string;
  domande?: VoceFaq[];
};

export default function Domande({
  titolo = "Quello che ci chiedono",
  domande = FAQ_HARDWARE,
}: Props) {
  const scatta = (e: React.MouseEvent<HTMLElement>) => {
    const riga = e.currentTarget.closest("details");
    const corpo = riga?.querySelector<HTMLElement>(".faq-corpo");
    if (!riga || !corpo) return;

    /* Chi ha chiesto meno movimento apre e chiude e basta: qui
       l'animazione è proprio ciò che dà fastidio. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    e.preventDefault();
    corpo.getAnimations().forEach((anim) => anim.cancel());

    if (riga.open) {
      const parte = corpo.scrollHeight;
      const a = corpo.animate(
        [
          { height: `${parte}px`, opacity: 1 },
          { height: "0px", opacity: 0 },
        ],
        /* `forwards` tiene il corpo a zero dopo l'ultimo fotogramma:
           senza, fra la fine della corsa e la chiusura vera c'è un
           fotogramma in cui torna alto com'era, e si vede lampeggiare. */
        { duration: CHIUDE, easing: CURVA, fill: "forwards" }
      );
      /* la riga si chiude solo a fine corsa, o il corpo sparirebbe prima
         di potersi ritirare */
      a.onfinish = () => {
        riga.open = false;
        a.cancel();
      };
    } else {
      riga.open = true;
      const meta = corpo.scrollHeight;
      corpo.animate(
        [
          { height: "0px", opacity: 0 },
          { height: `${meta}px`, opacity: 1 },
        ],
        { duration: APRE, easing: CURVA }
      );
    }
  };

  return (
    <section className="faq relative overflow-hidden" aria-labelledby="faq-t" data-aggancio>
      <h2 id="faq-t" className="faq-titolo">
        {titolo}
        {/* il punto del marchio: quadrato, non tondo */}
        <span className="faq-dot" aria-hidden="true" />
      </h2>

      <div className="faq-elenco">
        {domande.map((f) => (
          <details key={f.domanda} className="faq-voce">
            <summary onClick={scatta}>
              <span>{f.domanda}</span>
              <span className="faq-segno" aria-hidden="true" />
            </summary>
            {/* il corpo è quello che si anima: `details` da solo non ha
                un elemento su cui misurare l'altezza */}
            <div className="faq-corpo">
              <p>{f.risposta}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
