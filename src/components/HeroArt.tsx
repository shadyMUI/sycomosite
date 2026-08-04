/**
 * La massa di vetro.
 *
 * Non forme sparse per il campo — quelle facevano slide aziendale — ma un
 * unico ammasso denso, spinto nell'angolo in basso a sinistra e tagliato
 * dai bordi dello schermo, così la scena sembra continuare oltre la
 * finestra invece di finire educatamente dentro di essa.
 *
 * Le lastre si SOVRAPPONGONO di proposito: è l'unico punto in cui il
 * liquid glass si vede davvero, perché una lastra sfoca quella sotto.
 * Isolate erano solo bolle colorate. Solo le tre superiori hanno la
 * sfocatura attiva: il vetro nasce dal contrasto fra chi smeriglia e chi
 * no, non dal metterlo ovunque.
 *
 * Ci sono DUE copie, rossa e bianca, nello stesso identico contenitore.
 * Devono stare qui insieme e non una per sezione: le lastre derivano e
 * respirano ognuna col proprio ritmo, e due gruppi montati in punti
 * diversi del documento partirebbero in momenti diversi, uscendo per
 * sempre fuori sincrono. Così invece condividono la stessa posizione e le
 * stesse animazioni, al fotogramma.
 *
 * La copia bianca è ritagliata sulla quota del bordo rosso: sopra non
 * esiste, sotto sì. L'occhio legge un oggetto solo, fermo, che cambia
 * colore mentre la schermata rossa sale.
 */

const LASTRE = ["ml-fondo", "ml-ancora", "ml-quadro", "ml-tondo", "ml-scheggia"];

export default function HeroArt() {
  return (
    <>
      {/* copia per il fondo di carta: sta dietro a tutto */}
      <div className="hero-art" aria-hidden="true">
        <div className="massa">
          {LASTRE.map((c) => (
            <span
              key={c}
              className={`ml ${c}${c === "ml-fondo" || c === "ml-ancora" ? "" : " ml-vetro"}`}
            />
          ))}
        </div>
      </div>

    </>
  );
}
