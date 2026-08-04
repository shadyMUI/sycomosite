import ModuloContatto from "./ModuloContatto";

/**
 * Parte 5 — contatti.
 *
 * Qui il rosso finisce e torna la carta: è il segnale che la parte di
 * racconto è chiusa e comincia quella in cui si fa qualcosa. Sta più in
 * alto di ogni altro strato, così copre sia il fondo rosso sia le lastre
 * bianche che restavano fisse sopra di esso.
 *
 * L'indirizzo è scritto grande e per esteso, non nascosto dietro un
 * "scrivici": chi vuole copiarlo lo vede, chi vuole cliccarlo lo clicca.
 */

/* ⚠️ DA SOSTITUIRE con l'indirizzo del dominio quando c'è: è l'unico
   punto da toccare, compare anche nel link qui sotto. */
const EMAIL = "shadymaarouf05@gmail.com";

const SOCIAL = [
  { nome: "Instagram", url: "https://www.instagram.com/sycomo.digital" },
  { nome: "TikTok", url: "https://www.tiktok.com/@sycomo.digital" },
];

export default function Contatti() {
  return (
    <section className="cnt" aria-labelledby="cnt-t">
      <h2 id="cnt-t" className="cnt-titolo">
        Raccontateci
        <br />
        cosa vi serve
        {/* il punto del marchio: quadrato, non tondo */}
        <span className="cnt-dot" aria-hidden="true" />
      </h2>

      {/* Il modulo a destra, i modi diretti a sinistra: chi vuole scrivere
          subito trova la frase da completare, chi preferisce la propria
          posta o i social ha tutto sull'altro lato senza scorrere. */}
      <div className="cnt-colonne">
        <div className="cnt-diretto">
          <div className="cnt-voce">
            <span className="cnt-etichetta">
              email<span className="cnt-duepunti">:</span>
            </span>
            <a className="cnt-mail" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
          </div>

          <div className="cnt-voce">
            <span className="cnt-etichetta">
              social<span className="cnt-duepunti">:</span>
            </span>
            <ul className="cnt-social">
              {SOCIAL.map((s) => (
                <li key={s.nome}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.nome}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ModuloContatto email={EMAIL} />
      </div>
    </section>
  );
}
