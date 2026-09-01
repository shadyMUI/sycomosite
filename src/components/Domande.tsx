"use client";

const LASTRE = ["ml-fondo", "ml-ancora", "ml-quadro", "ml-tondo", "ml-scheggia"];

/**
 * Le domande che vi fanno sempre, prima dei contatti.
 *
 * Sta qui e non altrove perché è qui che vengono i dubbi: si è appena
 * visto cosa fate e quello che avete montato, e prima di scrivere restano
 * le tre o quattro cose che uno non osa chiedere. Toglierle di mezzo è ciò
 * che separa chi scrive da chi chiude la pagina.
 *
 * Restano `<details>` nativi — si aprono anche se lo script non parte, e
 * chi usa uno screen reader li conosce già — ma l'apertura è animata a
 * mano. La via in CSS (`interpolate-size` con `::details-content`) è
 * dichiarata supportata da questo browser e non funziona: misurata,
 * l'altezza salta da chiusa ad aperta in un fotogramma. Qui invece si
 * anima il corpo della risposta, e in chiusura si aspetta la fine prima
 * di richiudere l'elemento — altrimenti sparirebbe prima di potersi
 * ritirare.
 */

/* ⚠️ DA CONFERMARE una per una: sono le domande tipiche, con le risposte
   che darebbe una piccola assistenza. Una risposta sbagliata qui è peggio
   di una domanda mancante — se un tempo o una condizione non la potete
   mantenere, va cambiata o tolta. */
const DOMANDE = [
  {
    d: "Quanto ci vuole?",
    r: "Per una pulizia o un cambio di pasta termica, in giornata. Per un computer montato da zero il montaggio è questione di ore: quello che non dipende da noi è l'attesa dei pezzi, che a volte è di giorni e a volte di settimane. Vi diciamo i tempi quando ordiniamo, non dopo.",
  },
  {
    d: "Quanto costa sapere cos'ha?",
    r: "Niente. La diagnosi è gratuita e il preventivo arriva prima che tocchiamo qualcosa: sapete quanto spendete prima di decidere. Se non conviene ripararlo, ve lo diciamo.",
  },
  {
    d: "Posso portare pezzi miei?",
    r: "Sì. Se avete già una scheda video o un disco che vanno bene, si montano quelli e si spende meno. Vi diciamo noi se conviene tenerli o cambiarli.",
  },
  {
    d: "Perdo i miei dati?",
    r: "No. Niente formattazioni fatte per fare prima: se il disco va sostituito, i file passano sul nuovo. Se qualcosa è già andato perso, nella maggior parte dei casi si recupera.",
  },
  {
    d: "E se dopo qualcosa non va?",
    r: "Rispondiamo noi, senza numeri verdi e senza attese. Le componenti nuove hanno la garanzia del produttore, e il lavoro lo rifacciamo se il problema è nostro.",
  },
];

/* Aprire dura un filo più che chiudere: entrando si guarda, uscendo si è
   già passati oltre. La curva è quella del resto del sito. */
const APRE = 340;
const CHIUDE = 260;
const CURVA = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function Domande() {
  const scatta = (e: React.MouseEvent<HTMLElement>) => {
    const riga = e.currentTarget.closest("details");
    const corpo = riga?.querySelector<HTMLElement>(".faq-corpo");
    if (!riga || !corpo) return;

    /* Chi ha chiesto meno movimento apre e chiude e basta: qui
       l'animazione è proprio ciò che dà fastidio. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    e.preventDefault();

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
    <section className="faq" aria-labelledby="faq-t">
      {/* La massa di vetro nella sua copia chiara, come nella schermata
          dei servizi: FERMA nell'angolo dello schermo, esattamente sopra
          quella rossa che sta sotto il fondo. È la coincidenza fra le due
          a far leggere un oggetto solo che cambia colore dove passa il
          rosso.
          Il contenitore la ritaglia sui bordi della sezione: scorre con
          la pagina e porta con sé la finestra da cui la copia bianca si
          vede. */}
      <div className="faq-taglio" aria-hidden="true">
        <div className="faq-massa">
          {LASTRE.map((c) => (
            <span key={c} className={`ml sml ${c}`} />
          ))}
        </div>
      </div>

      <h2 id="faq-t" className="faq-titolo">
        Quello che ci chiedono
        {/* il punto del marchio: quadrato, non tondo */}
        <span className="faq-dot" aria-hidden="true" />
      </h2>

      <div className="faq-elenco">
        {DOMANDE.map((x) => (
          <details key={x.d} className="faq-voce">
            <summary onClick={scatta}>
              {x.d}
              <span className="faq-segno" aria-hidden="true" />
            </summary>
            {/* il corpo è quello che si anima: `details` da solo non ha
                un elemento su cui misurare l'altezza */}
            <div className="faq-corpo">
              <p>{x.r}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
