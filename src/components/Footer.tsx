import Logo from "./Logo";

/**
 * Il piede della pagina, in inchiostro pieno.
 *
 * Chiude il sito con lo stesso nero delle scritte: dopo la carta e il
 * rosso è la terza e ultima superficie, e serve a dire "qui finisce".
 *
 * Sotto stanno i dati che per legge devono comparire su un sito di
 * un'attività con partita IVA: chi siete, dove, e il numero. Non sono
 * righe di contorno — se mancano, il sito è irregolare.
 */

/* ⚠️ DA COMPLETARE con i dati veri prima di pubblicare. */
const DATI = {
  ragioneSociale: "Sycomo Digital",
  partitaIva: "IT00000000000",
  sede: "Italia",
};

const EMAIL = "shadymaarouf05@gmail.com";

const SOCIAL = [
  { nome: "Instagram", url: "https://www.instagram.com/sycomo.digital" },
  { nome: "TikTok", url: "https://www.tiktok.com/@sycomo.digital" },
];

export default function Footer() {
  const anno = new Date().getFullYear();

  return (
    <footer className="pie">
      <div className="pie-alto">
        <div className="pie-marchio">
          <Logo />
          <p className="pie-claim">
            Siti su misura per le attività che meritano di essere trovate.
          </p>
        </div>

        <nav className="pie-nav" aria-label="Contatti e social">
          <a className="pie-mail" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <ul>
            {SOCIAL.map((s) => (
              <li key={s.nome}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.nome}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* I dati che devono comparire per legge, e le informative. */}
      <div className="pie-basso">
        <ul className="pie-dati">
          <li>{DATI.ragioneSociale}</li>
          <li>
            P. IVA <span>{DATI.partitaIva}</span>
          </li>
          <li>{DATI.sede}</li>
        </ul>

        <p className="pie-nota">
          © {anno} — <a href="/privacy">Privacy</a>
        </p>
      </div>
    </footer>
  );
}
