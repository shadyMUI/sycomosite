import Logo from "./Logo";

/**
 * Il piede della pagina, in inchiostro pieno.
 *
 * Chiude il sito con lo stesso nero delle scritte: dopo la carta e il
 * rosso è la terza e ultima superficie, e serve a dire "qui finisce".
 *
 * ⚠️ Quando ci sarà la partita IVA va rimessa qui sotto, accanto alla
 * ragione sociale: su un sito di un'attività che ne ha una è un dato
 * obbligatorio, non una riga di contorno.
 */

const DATI = {
  ragioneSociale: "Sycomo Digital",
  sede: "Italia",
};

const EMAIL = "sycomodigital@gmail.com";

const SOCIAL = [
  { nome: "Instagram", url: "https://www.instagram.com/sycomo.digital" },
  { nome: "TikTok", url: "https://www.tiktok.com/@sycomo.digital" },
];

type Props = {
  /* la riga sotto il nome nel marchio, e la frase che chiude */
  sub?: string;
  claim?: string;
};

export default function Footer({
  sub = "Digital",
  claim = "le piccole attività meritano grandi progetti.",
}: Props) {
  const anno = new Date().getFullYear();

  return (
    <footer className="pie">
      <div className="pie-alto">
        <div className="pie-marchio">
          <Logo sub={sub} />
          {/* La stessa frase delle due righe diagonali in apertura: qui
              chiude il sito dicendo ciò con cui si era aperto. Minuscola
              come i titoli, che nel sito non gridano mai. */}
          <p className="pie-claim">{claim}</p>
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

      <div className="pie-basso">
        <ul className="pie-dati">
          <li>{DATI.ragioneSociale}</li>
          <li>{DATI.sede}</li>
        </ul>

        <p className="pie-nota">
          © {anno} — <a href="/privacy">Privacy</a>
        </p>
      </div>
    </footer>
  );
}
