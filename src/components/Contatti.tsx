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

/* ⚠️ Da sostituire con l'indirizzo sul dominio quando ci sarà
   (info@sycomo.it o simile): una casella sul proprio dominio dice che
   c'è una struttura dietro, una gmail dice il contrario. Compare anche
   nel piede di pagina e nell'informativa privacy: vanno cambiati
   insieme, e deve restare la stessa a cui EmailJS consegna. */
const EMAIL = "sycomodigital@gmail.com";

const SOCIAL = [
  { nome: "Instagram", url: "https://www.instagram.com/sycomo.digital" },
  { nome: "TikTok", url: "https://www.tiktok.com/@sycomo.digital" },
];

type Props = {
  /* Due righe: vanno a capo dove lo decide chi scrive, non dove capita. */
  titolo?: [string, string];
  /* la frase da completare nel modulo, che cambia col mestiere */
  frase?: React.ComponentProps<typeof ModuloContatto>["frase"];
};

export default function Contatti({
  titolo = ["Raccontateci", "cosa vi serve"],
  frase,
}: Props) {
  return (
    <section className="cnt" id="contatti" aria-labelledby="cnt-t">
      <h2 id="cnt-t" className="cnt-titolo">
        {titolo[0]}
        <br />
        {titolo[1]}
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

        <ModuloContatto email={EMAIL} frase={frase} />
      </div>
    </section>
  );
}
