import Polaroid from "./Polaroid";

/**
 * Le macchine che abbiamo montato, dopo la schermata rossa.
 *
 * Torna la carta: dopo il rosso, che è la parte in cui si racconta come si
 * lavora, questa è la parte in cui lo si dimostra. È l'unica cosa della
 * pagina che nessun concorrente può copiare — le altre sono parole, queste
 * sono macchine vere uscite dalle vostre mani.
 *
 * Stampe appoggiate sul tavolo, non una griglia di immagini: la cornice
 * polaroid è la stessa dell'altra pagina, e la leggera rotazione alternata
 * fa sì che sembrino posate lì invece che allineate da un programma.
 */

/* ⚠️ DA COMPLETARE con le foto vere. Finché `src` resta vuoto si vede un
   riquadro tratteggiato con scritto cosa fotografare.

   Come farle: col telefono, luce naturale, la macchina di tre quarti col
   pannello aperto. Niente foto d'archivio — si riconoscono a colpo
   d'occhio e fanno l'effetto contrario di quello che serve.

   La didascalia conta quanto la foto: dice per chi era e cosa ci fa, ed è
   lì che chi legge si riconosce. */
const SCATTI = [
  {
    src: null,
    didascalia: "Per Marco, che ci gioca",
    alt: "Computer da gioco montato per un cliente",
    daFare: "la macchina di tre quarti, pannello aperto",
  },
  {
    src: null,
    didascalia: "Per uno studio di montaggio",
    alt: "Postazione da montaggio video montata per uno studio",
    daFare: "la postazione accesa sulla scrivania",
  },
  {
    src: null,
    didascalia: "Il primo computer di Sara",
    alt: "Computer da studio montato per una studentessa",
    daFare: "il computer consegnato, pronto all'uso",
  },
  {
    src: null,
    didascalia: "Rimesso a nuovo, non ricomprato",
    alt: "Computer di qualche anno dopo pulizia e sostituzione componenti",
    daFare: "prima e dopo: la ventola piena di polvere e pulita",
  },
];

export default function Album() {
  return (
    <section className="alb" aria-labelledby="alb-t">
      <h2 id="alb-t" className="alb-titolo">
        Qualche macchina
        <br />
        che abbiamo montato
        {/* il punto del marchio: quadrato, non tondo */}
        <span className="alb-dot" aria-hidden="true" />
      </h2>

      {/* `data-scorre-da-solo` dice allo scorrimento fluido di lasciar
          stare i gesti fatti qui dentro: sul telefono è un carosello, e
          su un portatile col trackpad il gesto laterale deve muovere le
          stampe, non la pagina. */}
      <div className="alb-tavolo" data-scorre-da-solo>
        {SCATTI.map((s) => (
          <Polaroid
            key={s.didascalia}
            className="pol--album"
            src={s.src ?? undefined}
            alt={s.alt}
            didascalia={s.didascalia}
            daFare={s.src ? undefined : s.daFare}
          />
        ))}
      </div>
    </section>
  );
}
