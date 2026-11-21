import Link from "next/link";
import ModuloContatto from "./ModuloContatto";
import { EMAIL } from "@/lib/sito";

type Props = {
  /* Due righe: vanno a capo dove lo decide chi scrive, non dove capita. */
  titolo?: [string, string];
  /* la frase da completare nel modulo, che cambia col mestiere */
  frase?: React.ComponentProps<typeof ModuloContatto>["frase"];
  /* quale modello di EmailJS recapita questo modulo */
  modello?: React.ComponentProps<typeof ModuloContatto>["modello"];
  /* Il rimando all'altra metà dello studio. Sta qui, in fondo, e non nel
     piede: chi è arrivato ai contatti ha finito di leggere, ed è il
     momento in cui scoprire che facciamo anche l'altra cosa può servirgli
     davvero. Nel piede l'avrebbe visto solo chi legge i piedi. */
  altra?: { domanda: string; invito: string; href: string };
};

export default function Contatti({
  titolo = ["Raccontateci", "cosa vi serve"],
  frase,
  modello,
  altra,
}: Props) {
  return (
    <section className="cnt" id="contatti" aria-labelledby="cnt-t" data-aggancio>
      <h2 id="cnt-t" className="cnt-titolo">
        {titolo[0]}
        <br />
        {titolo[1]}
        {/* il punto del marchio: quadrato, non tondo */}
        <span className="cnt-dot" aria-hidden="true" />
      </h2>

      {/* Il modulo a destra, i modi diretti a sinistra: chi vuole scrivere
          subito trova la frase da completare, chi preferisce la propria
          posta trova l'indirizzo sull'altro lato senza scorrere. */}
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

          {altra && (
            /* Lastra di vetro nell'angolo, sopra la massa che ci passa
               sotto: è l'unico punto della pagina in cui il vetro fa da
               contenitore invece che da scenografia. */
            <aside className="cnt-altra">
              <p className="cnt-altra-domanda">{altra.domanda}</p>
              <Link className="cnt-altra-vai" href={altra.href}>
                {altra.invito}
                <span className="cnt-altra-freccia" aria-hidden="true" />
              </Link>
            </aside>
          )}
        </div>

        <ModuloContatto email={EMAIL} frase={frase} modello={modello} />
      </div>
    </section>
  );
}
