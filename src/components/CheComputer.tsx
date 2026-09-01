/**
 * La promessa, fra il marchio e i quattro passi.
 *
 * Dove nella pagina dei siti ci sono le due frasi diagonali, qui c'è la
 * riga che dice in che mestiere siamo: un computer costruito attorno a
 * quello che ci si deve fare, e non uno preso dallo scaffale.
 *
 * Non c'è niente da cliccare di proposito: la schermata dichiara, e chi
 * si convince ha i due richiami sempre in alto e il modulo poco più
 * sotto. Un elenco di scelte c'era, ed è stato tolto — riempiva lo spazio
 * di riquadri che nel resto del sito non esistono.
 */

/* ⚠️ Il sito dà del voi ovunque — "cosa vi serve", "Raccontateci" — e
   questa riga dà del tu. Se il tu è voluto va cambiato tutto il resto,
   altrimenti la frase va portata al voi: "un computer per ogni vostra
   esigenza". Due registri nella stessa pagina si notano. */
const TITOLO = "un pc per ogni tua esigenza";

/* Le tre parole stanno separate dal resto perché vanno in inchiostro
   pieno: sono i casi in cui il lettore si riconosce, e devono arrivare
   prima della frase che le contiene. Le barre che le dividono restano
   invece tenui — separano, non si leggono. */
const CASI = ["gaming", "lavoro", "studio"];

export default function CheComputer() {
  return (
    <section className="uso" aria-labelledby="uso-t" data-aggancio>
      <h1
        id="uso-t"
        className="uso-domanda"
        /* La lunghezza del titolo e della sua parola più lunga arrivano
           fino al CSS: servono a tenere il corpo entro la riga e a non
           lasciare il quadratino da solo a capo, che con un testo di
           questa lunghezza succede a occhi chiusi. */
        style={
          {
            "--dom-n": TITOLO.length,
            "--dom-max": Math.max(...TITOLO.split(" ").map((w) => w.length)),
          } as React.CSSProperties
        }
      >
        {TITOLO}
        {/* il punto del marchio: quadrato, non tondo */}
        <span className="uso-dot" aria-hidden="true" />
      </h1>

      <p className="uso-testo">
        {CASI.map((c, i) => (
          <span key={c}>
            <strong>{c}</strong>
            {i < CASI.length - 1 && <span className="uso-barra">/</span>}
          </span>
        ))}
        ? qualunque utilizzo! <em>al prezzo migliore</em>
      </p>
    </section>
  );
}
