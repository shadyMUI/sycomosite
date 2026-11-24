/**
 * Parte 3 — la sezione rossa, in due schermate.
 *
 * Prima il titolo da solo, poi i servizi: due blocchi alti quanto la
 * finestra, che arrivano scorrendo come su qualsiasi sito.
 *
 * Il titolo e le lastre bianche stanno DENTRO LO STESSO gruppo isolato
 * (`.rosso-blend`). Serve perché il titolo si fonde per differenza: dentro
 * quel gruppo lo sfondo è trasparente, quindi sul rosso resta bianco, e
 * dove incontra una lastra bianca la differenza fra bianco e bianco fa
 * nero. Il fondo rosso sta fuori dal gruppo apposta — se ci fosse dentro,
 * il titolo diventerebbe ciano invece che bianco.
 *
 * Il gruppo scorre con la sezione, le lastre dentro sono `sticky` e
 * restano ferme: è così che il titolo scorre sopra figure immobili senza
 * bisogno di animazioni — e senza animazioni la fusione continua a
 * funzionare, cosa che invece si rompe appena l'elemento viene promosso a
 * un livello composito a sé.
 */

const SERVIZI = [
  {
    n: "01",
    nome: "Parliamone",
    testo:
      "Prima di preventivi e schermate: una conversazione per capire cosa vi serve davvero. A volte è meno di quello che pensavate, e ve lo diciamo.",
  },
  {
    n: "02",
    nome: "Il sito",
    testo:
      "Progettato e realizzato partendo da zero, attorno alle vostre esigenze. Ottimizzato, curato nei dettagli, e fatto per durare.",
  },
  {
    n: "03",
    nome: "Farsi trovare",
    testo:
      "Un sito che nessuno trova non porta clienti. Ci occupiamo della SEO e lo mettiamo in condizione di apparire su Google.",
  },
  {
    n: "04",
    nome: "Restare online",
    testo:
      "Aggiornamenti, backup e assistenza. Quando qualcosa va storto rispondiamo noi, senza intermediari.",
  },
];

const LASTRE = ["ml-fondo", "ml-ancora", "ml-quadro", "ml-tondo", "ml-scheggia"];

type Voce = { n: string; nome: string; testo: string };
type Props = {
  /* Titolo e voci hanno un valore di partenza: sono quelli scritti per la
     pagina principale. L'assistenza passa i suoi e riusa tutta la
     macchina — il ritaglio delle lastre, il negativo del titolo, le due
     schermate — senza duplicarne una riga. */
  titolo?: string;
  voci?: Voce[];
};

export default function Servizi({
  titolo = "Cosa facciamo",
  voci = SERVIZI,
}: Props) {
  return (
    <div className="rosso" data-aggancio>
      {/* Sensore per il ritaglio delle lastre bianche: alto esattamente una
          schermata, quindi il suo ingresso nella finestra coincide al pixel
          con la salita del bordo rosso da 100vh a 0. Sulla sezione intera
          non funziona: essendo più alta della finestra, il suo "ingresso"
          finisce molto prima che il rosso arrivi in cima. */}
      <span className="rosso-sensore" aria-hidden="true" />

      {/* Gruppo isolato: lastre bianche + titolo, e nient'altro. */}
      <div className="rosso-blend">
        {/* Due ritagli annidati, uno per estremo: il primo scopre le lastre
            man mano che il rosso sale, il secondo le ricopre man mano che
            il rosso esce dal fondo. Servono due elementi perché una sola
            proprietà non può portare due animazioni diverse. */}
        <div className="taglio-alto">
          <div className="taglio-basso">
            {/* ferme mentre il titolo ci scorre sopra */}
            <div className="rosso-massa" aria-hidden="true">
              {LASTRE.map((c) => (
                <span key={c} className={`ml sml ${c}`} />
              ))}
            </div>
          </div>
        </div>

        {/* La lunghezza del titolo viaggia fino al CSS: è l'unico modo
            perché il corpo si adatti da sé a testi diversi. "che cosa
            facciamo" ci stava, "come lo costruiamo" mandava a capo il
            quadratino, e un valore fisso avrebbe rotto l'una o l'altra
            pagina a ogni cambio di parole. */}
        <h2
          className="srv-titolo"
          style={
            {
              "--srv-n": titolo.length,
              /* La parola più lunga: quando il titolo va a capo — sugli
                 schermi stretti — è lei a decidere quanto può essere
                 grande il testo. Se non ci sta, si spezza o spinge il
                 quadratino da solo su una riga sua. */
              "--srv-max": Math.max(...titolo.split(" ").map((w) => w.length)),
            } as React.CSSProperties
          }
        >
          {titolo}
          {/* il punto del marchio: quadrato, non tondo */}
          <span className="srv-dot" aria-hidden="true" />
        </h2>
      </div>

      {/* schermata 1: dà l'altezza al titolo, che è disegnato nel gruppo */}
      <section className="srv-apre" aria-label={titolo} />

      {/* Due schermate, due servizi ciascuna: a quattro per volta la
          pagina era una lista da scorrere, a due si leggono. */}
      {[voci.slice(0, 2), voci.slice(2)].map((gruppo, i) => (
        <section
          key={i}
          className="srv-voci"
          aria-label={`I nostri servizi, parte ${i + 1} di 2`}
        >
          <div className="srv-colonne">
            {gruppo.map((s) => (
              <article key={s.n} className="srv-voce">
                <h3 className="srv-nome">{s.nome}</h3>
                <p className="srv-testo">{s.testo}</p>
              </article>
            ))}
          </div>
        </section>
      ))}

      {/* Secondo sensore, in fondo: segna quando il rosso esce dal basso.
          Serve a ricoprire le lastre bianche, così sotto — dove il fondo
          torna carta — si rivedono quelle rosse. */}
      <span className="rosso-sensore rosso-sensore--fine" aria-hidden="true" />
    </div>
  );
}
